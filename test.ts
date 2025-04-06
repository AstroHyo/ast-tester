import { Octokit } from "octokit";
import { analyzeAST } from "./code-parser-service.js";

/**
 * Fetches the changed files data of a pull request.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param pull_number - Pull request number.
 * @returns Array of changed files data.
 */
export async function fetchChangedFilesData(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<any[]> {
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
    per_page: 100,
  });

  return files.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch, // patch may be undefined for binary files
  }));
}

/**
 * Fetches the merged file content for 1 singular file from a pull request for a modified file.
 * Skips files that were added or removed.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param path - File path.
 * @param fileStatus - Status of the file (e.g., "added", "modified", "removed").
 * @param mergeRef - Merge commit SHA from the pull request.
 * @returns Merged file content as a string.
 */
export async function fetchMergedFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  fileStatus: string,
  mergeRef: string
): Promise<string> {
  // Skip fetching if the file was added or deleted.
  if (fileStatus === "removed" || fileStatus === "deleted") {
    throw new Error(
      `Skipping file with status "${fileStatus}" for path: ${path}`
    );
  }

  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref: mergeRef,
    mediaType: { format: "raw" },
  });

  if (typeof response.data === "string") {
    return response.data;
  }
  if (Array.isArray(response.data)) {
    throw new Error(
      `Expected a file but received a directory for path: ${path}`
    );
  }
  if (response.data.type === "file" && response.data.content) {
    return Buffer.from(response.data.content, "base64").toString("utf8");
  }
  throw new Error(`Unable to fetch file content as string for path: ${path}`);
}

/**
 * Aggregates the AST and raw code for each changed file.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param changedFilesData - Array of changed files data.
 * @returns An object containing both the aggregated raw code and AST report.
 */
export async function aggregateASTReport(
  octokit: Octokit,
  owner: string,
  repo: string,
  changedFilesData: any[]
): Promise<{ rawCode: string; astReport: string }> {
  let rawCode = "";
  let astReport = "";

  for (const file of changedFilesData) {
    try {
      // Use the file's status and mergeRef to fetch its content.
      const content = await fetchMergedFileContent(
        octokit,
        owner,
        repo,
        file.filename,
        file.status,
        file.mergeRef
      );

      rawCode += `### ${file.filename}\n\`\`\`\n${content}\n\`\`\`\n\n`;

      // Use analyzeAST to get AST, metrics, and any parse error.
      const analysisResult = await analyzeAST(content);
      if (analysisResult.parseError) {
        astReport += `### ${file.filename}\n\`\`\`\nError parsing file: ${analysisResult.parseError}\n\`\`\`\n\n`;
        continue;
      }

      const astString = JSON.stringify(analysisResult.ast, null, 2);
      const metrics = analysisResult.astMetrics;

      astReport += `### ${
        file.filename
      }\n\`\`\`\nAST:\n${astString}\n\nMetrics:\n${JSON.stringify(
        metrics,
        null,
        2
      )}\n\`\`\`\n\n`;
    } catch (error) {
      console.error(`Error processing file ${file.filename}:`, error);
    }
  }

  return { rawCode, astReport };
}
