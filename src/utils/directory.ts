import fs from "fs";
import path from "path";
import util from "util";

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

export async function recursiveReadDir(directoryName: string) {
  let results: string[] = [];

  const entries = await readdir(directoryName);

  await Promise.all(
    entries.map(async entry => {
      const fullFileName = path.resolve(directoryName, entry);
      const fileStats = await stat(fullFileName);

      if (fileStats.isDirectory()) {
        const subResults = await recursiveReadDir(fullFileName);
        results = results.concat(subResults);
      } else {
        results.push(fullFileName);
      }
    })
  );

  return results;
}
