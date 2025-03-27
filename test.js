import { App, Octokit } from "octokit";
import fs from "fs";
// import type { Webhooks } from '@octokit/webhooks';

import axios from "axios";
import { PRWebhookPayload } from "../utils/types.js";
import { extractCleanCodeFromDiff } from "../utils/utils.js";
import { config } from "../config/index.js";
import { parseCode } from "./code-parser-service.js";

// Read the private key for GitHub App authentication.
const privateKey = fs.readFileSync(config.privateKeyPath!, "utf8");
// const SCHEMA = require("@octokit/webhooks-schemas");

// Create an instance of the GitHub App. Authentication using JWT is handled behind-the-scenes.
const app: App = new App({
  appId: config.appId!,
  privateKey: privateKey,
  webhooks: {
    secret: config.webhookSecret,
  },
});

/**
 * Fetches the diff of a pull request.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param pull_number - Pull request number.
 * @returns The pull request diff as a string.
 */
async function fetchPullRequestDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<string> {
  //GET rquest to fetch the associated resource information for a specified pull request
  const { data: diffText } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  console.log(diffText);
  const formattedDiff = extractCleanCodeFromDiff(String(diffText));
  console.log(formattedDiff);
  return formattedDiff;
}

/**
 * Fetches the full content of a given file in a repository.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param path - File path within the repository.
 * @returns The file's raw content as a string.
 */
export async function fetchFullFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  // Request the file content from GitHub using raw media type.
  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    mediaType: {
      format: "raw",
    },
  });

  // If the response data is a string, return it directly.
  if (typeof response.data === "string") {
    return response.data;
  }

  // If the response data is an array, it means a directory was returned.
  if (Array.isArray(response.data)) {
    throw new Error(
      `Expected a file but received a directory for path: ${path}`
    );
  }

  // If the response data is an object representing a file, check if it has a 'content' property.
  if (response.data.type === "file" && response.data.content) {
    // Decode the Base64 encoded content to a UTF-8 string.
    return Buffer.from(response.data.content, "base64").toString("utf8");
  }

  // If none of the above conditions are met, throw an error.
  throw new Error(`Unable to fetch file content as string for path: ${path}`);
}

/**
 * Fetches the list of changed files in a pull request and returns an object
 * with filenames as keys and their full content as values.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param pull_number - Pull request number.
 * @returns An object mapping filenames to their full file content.
 */
export async function fetchPRFilesContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
): Promise<{ [filename: string]: string }> {
  // Retrieve the list of changed files in the PR.
  const { data: changedFiles } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  const filesContent: { [filename: string]: string } = {};

  // Loop through each file and fetch its full content.
  for (const file of changedFiles) {
    try {
      const content = await fetchFullFileContent(
        octokit,
        owner,
        repo,
        file.filename
      );
      filesContent[file.filename] = content;
    } catch (error) {
      console.error(`Error fetching content for file ${file.filename}:`, error);
    }
  }

  return filesContent;
}

/**
 * Posts a comment on a pull request.
 * @param octokit - Authenticated Octokit instance.
 * @param owner - Repository owner.
 * @param repo - Repository name.
 * @param issue_number - Issue or pull request number.
 * @param body - Comment body.
 */
async function postComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issue_number: number,
  body: string
): Promise<void> {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body,
    headers: {
      "x-github-api-version": "2022-11-28",
    },
  });
}

/**
 * Handles a pull request event: fetches the full content of changed files,
 * parses each file using Tree-sitter to generate an AST, and posts the ASTs
 * as a comment on the PR.
 * @param payload - The pull request webhook payload.
 */
export async function handlePullRequestEvent(
  payload: PRWebhookPayload
): Promise<void> {
  const octokit = await app.getInstallationOctokit(payload.installation.id);
  const owner: string = payload.repository.owner.login;
  const repo: string = payload.repository.name;
  const pull_number: number = payload.pull_request.number;

  try {
    // Fetch the full content of all changed files in the PR.
    const filesContent = await fetchPRFilesContent(
      octokit,
      owner,
      repo,
      pull_number
    );

    // Aggregate the AST for each file into a single report.
    let astReport = "";
    for (const [filename, code] of Object.entries(filesContent)) {
      const tree = parseCode(code);
      const astString = tree.rootNode.toString();
      astReport += `### ${filename}\n\`\`\`\n${astString}\n\`\`\`\n\n`;
    }

    // Use the aggregated AST report as the feedback.
    const feedback = astReport;

    // Post the AST feedback as a comment on the pull request.
    await postComment(octokit, owner, repo, pull_number, feedback);
    console.log(`Posted AST feedback comment on PR #${pull_number}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error handling PR event: ${error.message}`);
    }
    throw error;
  }
}
