import fs from "fs";
import { join } from "path";
import { promisify } from "util";
import { object, string, boolean } from "fefe";

const readFile = promisify(fs.readFile);

const validateOptions = object({
  domain: string(),
  sitemapName: string(),
  minify: { validator: boolean(), optional: true }
});
export type Options = ReturnType<typeof validateOptions>;

export async function loadConfiguration(projectDirectoryName: string) {
  const variableFileName = join(projectDirectoryName, "/config/variables.json");
  const optionsFileName = join(projectDirectoryName, "/config/options.json");
  try {
    const [variableFileContent, optionsFileContent] = await Promise.all([
      readFile(variableFileName),
      readFile(optionsFileName)
    ]);

    const variables = JSON.parse(variableFileContent.toString());
    const options = JSON.parse(optionsFileContent.toString());

    try {
      validateOptions(options);
    } catch (error) {
      throw new Error(`Invalid options.json: ${error.message}`);
    }

    return { variables, options: options as Options };
  } catch (error) {
    throw new Error(`Cannot load configuration: ${error.message}`);
  }
}
