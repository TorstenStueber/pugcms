import { join, relative } from "path";

import pug from "pug";

import { recursiveReadDir } from "../utils/directory";

const PUG_FILE_NAME_ENDING = ".pug";

export async function loadShortcodes(projectDirectoryName: string) {
  const shortCodesDirectoryName = join(projectDirectoryName, "shortcodes");
  const shortCodeFileNames = await recursiveReadDir(shortCodesDirectoryName);

  const includeNames = shortCodeFileNames
    .filter(shortCodeFileName => shortCodeFileName.endsWith(PUG_FILE_NAME_ENDING))
    .map(shortCodeFileName => {
      const relativeFileName = relative(shortCodesDirectoryName, shortCodeFileName);
      return `include ${relativeFileName.slice(0, -PUG_FILE_NAME_ENDING.length)}`;
    });

  const pugIndexFile = `${includeNames.join(
    "\n"
  )}\n+#{mixin}(data, content, pages, config, menuHtml)`;

  return pug.compile(pugIndexFile, {
    filename: join(shortCodesDirectoryName, "index.pug"),
    basedir: shortCodesDirectoryName
  });
}
