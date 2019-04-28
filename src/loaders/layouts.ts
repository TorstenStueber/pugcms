import { join } from "path";
import { compileFile, compileTemplate } from "pug";

import { PageRegister } from "./pages";

export type LayoutDefinition = Record<string, compileTemplate>;

export async function loadLayoutTemplates(
  pageRegister: PageRegister,
  projectDirectoryName: string
) {
  const layoutsDirectoryName = join(projectDirectoryName, "layouts");
  const usedLayoutNames: Record<string, boolean> = {};

  Object.values(pageRegister).forEach(page => {
    usedLayoutNames[page.meta.layout] = true;
  });

  const layouts: LayoutDefinition = {};
  Object.keys(usedLayoutNames).forEach(layoutFileName => {
    layouts[layoutFileName] = compileFile(join(layoutsDirectoryName, layoutFileName));
  });

  return layouts;
}
