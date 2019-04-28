import { expandShortcodes } from "./shortcode";
import { ProjectDefinition } from "../loaders/project";

const snippetCache: Record<string, string> = {};

export function expandSnippet(
  snippetName: string,
  project: ProjectDefinition,
  menuHtml: string
): string {
  if (snippetName in snippetCache) {
    return snippetCache[snippetName];
  }

  const snippetContent = project.snippetRegister[snippetName];
  if (!snippetContent) {
    throw new Error(`Snippet ${snippetName} is not defined`);
  }

  const contentHtml = expandShortcodes(snippetContent, project, snippetName, menuHtml);

  snippetCache[snippetName] = contentHtml;
  return contentHtml;
}
