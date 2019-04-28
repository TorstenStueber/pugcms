import fs from "fs";
import mkdirp from "mkdirp";
import { join, dirname } from "path";
import { promisify } from "util";

import nodeSass from "node-sass";

const render = promisify(nodeSass.render);
const writeFile = promisify(fs.writeFile);
const mkdirpPromise = promisify(mkdirp);

export async function transpileStyles(projectDirectoryName: string, minify: boolean) {
  const mainStylesFile = join(projectDirectoryName, "styles/main.scss");
  const renderResult = await render({
    file: mainStylesFile,
    outputStyle: minify ? "compressed" : "nested"
  });
  const css = renderResult.css;

  const outputFile = join(projectDirectoryName, "build/assets/css/main.css");

  await mkdirpPromise(dirname(outputFile));
  await writeFile(outputFile, css);
}
