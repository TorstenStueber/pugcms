import fs from "fs";
import { join, relative } from "path";
import { promisify } from "util";

import { recursiveReadDir } from "../utils/directory";

const readFile = promisify(fs.readFile);

export type SnippetName = string;
export type SnippetRegister = Record<SnippetName, string>;

export async function loadAllSnippets(projectDirectoryName: string): Promise<SnippetRegister> {
  const snippetsDirectoryName = join(projectDirectoryName, "snippets");
  const snippetsFileNames = await recursiveReadDir(snippetsDirectoryName);

  const snippetRegister: SnippetRegister = {};
  await Promise.all(
    snippetsFileNames.map(async snippetsFileName => {
      const fileContent = (await readFile(snippetsFileName)).toString();
      const snippetName = `${relative(snippetsDirectoryName, snippetsFileName)}`;
      snippetRegister[snippetName] = fileContent;
    })
  );

  return snippetRegister;
}
