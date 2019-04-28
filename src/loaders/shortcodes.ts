import path from "path";

import pug from "pug";

export async function loadShortcodes(shortcodesDirectoryName: string) {
  const shortCodesDirectoryName = path.join(shortcodesDirectoryName, "shortcodes");
  return pug.compileFile(path.join(shortCodesDirectoryName, "index.pug"));
}
