import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript"; // Add more languages as needed

const parser = new Parser();
// Select the corresponding language for the parser
parser.setLanguage(JavaScript);

/**
 * Parses the given code string and returns the AST.
 * @param code - The full source code of a file.
 * @returns The AST (tree-sitter Tree object).
 */
export function parseCode(code: string) {
  try {
    const tree = parser.parse(code);
    return tree;
  } catch (error) {
    console.error("Error parsing code:", error);
    throw error;
  }
}
//Add

/////
