import { Attributes } from "../loaders/pages";
import { expandSnippet } from "./snippet";
import { ProjectDefinition } from "../loaders/project";
import { extractFileLocation } from "../utils/fileLocation";

const shortCodePattern = /\[(\/?)\s*(\w+)\s*((?:\s*\w+\s*=\s*"[^"]*")*)\s*\]/g;
const attributesPattern = /(\w+)\s*=\s*"([^"]*)"/g;

function expandShortcode(
  codeName: string,
  attributes: Attributes,
  content: string,
  project: ProjectDefinition,
  menuHtml: string
): string {
  if (codeName === "snippet") {
    const snippetName = attributes.name;
    return expandSnippet(snippetName, project, menuHtml);
  }

  try {
    return project.shortCodesTemplate({
      mixin: codeName,
      data: attributes,
      content,
      pages: project.pageRegister,
      config: project.variables,
      menuHtml
    });
  } catch (error) {
    // console.log(error);
    throw new Error(`Shortcode "${codeName}" not defined`);
  }
}

export function expandShortcodes(
  pageContent: string,
  project: ProjectDefinition,
  name: string,
  menuHtml: string
) {
  const expand = (codeName: string, attributes: Attributes, content: string) =>
    expandShortcode(codeName, attributes, content, project, menuHtml);
  const stack: Array<{ string: string } | { tag: string; attributes: Attributes }> = [];
  let lastIndex = 0;

  const reduceStack = (expectedTagName: string) => {
    let content = "";
    let stackItem;
    while ((stackItem = stack.pop())) {
      if ("string" in stackItem) {
        content = stackItem.string + content;
      } else if (stackItem.tag !== expectedTagName) {
        content = expand(stackItem.tag, stackItem.attributes, "") + content;
      } else {
        stack.push({ string: expand(expectedTagName, stackItem.attributes, content) });
        return;
      }
    }
  };

  let shortCodeMatches;
  const shortCodeRegExp = new RegExp(shortCodePattern);

  while ((shortCodeMatches = shortCodeRegExp.exec(pageContent)) !== null) {
    const closingTag = shortCodeMatches[1] === "/";
    const tagName = shortCodeMatches[2];
    const attributes = shortCodeMatches[3];

    const parsedAttributes: Attributes = {};
    let attributeMatches;
    const attributesRegExp = new RegExp(attributesPattern);
    while ((attributeMatches = attributesRegExp.exec(attributes)) !== null) {
      parsedAttributes[attributeMatches[1]] = attributeMatches[2];
    }

    const firstIndex = shortCodeMatches.index;
    stack.push({ string: pageContent.slice(lastIndex, firstIndex) });
    lastIndex = firstIndex + shortCodeMatches[0].length;

    if (closingTag) {
      reduceStack(tagName);
      if (stack.length === 0) {
        const { line, row } = extractFileLocation(pageContent, firstIndex);
        throw new Error(
          `The closing shortcode '${tagName}' at position ${line}:${row} on page/snippet '${name}' has no opening shortcode.`
        );
      }
    } else {
      stack.push({ tag: tagName, attributes: parsedAttributes });
    }
  }

  return stack.reduce((content, stackItem) => {
    const nextHtmlPart =
      "string" in stackItem ? stackItem.string : expand(stackItem.tag, stackItem.attributes, "");
    return content + nextHtmlPart;
  }, "");
}
