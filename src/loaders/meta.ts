const metaPattern = /((?:\s*\w+\s*:\s*(?:[^"][^\n]*\n|"[^"]*")\s*)*)=+\n/;
const metaComponentPattern = /(\w+)\s*:\s*(?:([^"][^\n]*)\n|"([^"]*)")/g;

export type MandatoryMetaKeys = "id" | "menu" | "layout";
export type OptionalMetaKeys = "title" | "description" | "excludebots";
export type MetaInformation = Partial<Record<OptionalMetaKeys, string>> &
  Record<MandatoryMetaKeys, string>;

export function extractMetaInformation(
  pageDefinition: string
): { meta: MetaInformation; content: string } {
  const metaMatch = metaPattern.exec(pageDefinition);
  if (!metaMatch) {
    throw new Error("No meta information provided at beginning of page");
  }

  const metaString = metaMatch[1];
  const content = pageDefinition.slice(metaMatch[0].length);

  const meta = parseMetaString(metaString);

  return {
    meta,
    content
  };
}

function parseMetaString(metaString: string) {
  const metaComponentRegexp = new RegExp(metaComponentPattern);
  const metaInformation: Partial<Record<string, string>> = {};
  let match;
  while ((match = metaComponentRegexp.exec(metaString)) !== null) {
    metaInformation[match[1]] = match[2] || match[3];
  }

  if (!metaInformation.id) {
    throw new Error("Meta information does not contain id");
  }

  if (!metaInformation.menu) {
    metaInformation.menu = "default.json";
  } else if (!metaInformation.menu.endsWith(".json")) {
    metaInformation.menu += ".json";
  }

  if (!metaInformation.layout) {
    metaInformation.layout = "default.pug";
  } else if (!metaInformation.layout.endsWith(".pug")) {
    metaInformation.layout += ".pug";
  }

  return metaInformation as MetaInformation;
}
