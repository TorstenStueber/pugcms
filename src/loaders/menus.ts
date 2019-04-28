import fs from "fs";
import { join } from "path";
import { promisify } from "util";
import { compileFile, compileTemplate } from "pug";

import { PageRegister, PageId } from "./pages";

const readFile = promisify(fs.readFile);

export interface MenuDefinition {
  template: string;
  content: MenuContentDefinition;
}

export type MenuContentDefinition = Array<{
  name: string;
  id: PageId;
  sub?: MenuContentDefinition;
}>;

export type MenuRegister = Record<string, MenuDefinition>;
export type MenuTemplateRegister = Record<string, compileTemplate>;

export async function loadMenus(pageRegister: PageRegister, projectDirectoryName: string) {
  const menusDirectoryName = join(projectDirectoryName, "menus");
  const usedMenus: Record<string, boolean> = {};

  Object.values(pageRegister).forEach(page => {
    usedMenus[page.meta.menu] = true;
  });

  const menus: MenuRegister = {};
  const usedMenuTemplates: Record<string, boolean> = {};
  await Promise.all(
    Object.keys(usedMenus).map(async menuFileName => {
      const absoluteMenuFileName = join(menusDirectoryName, menuFileName);
      const fileContent = await readFile(absoluteMenuFileName);
      const menuDefinition = JSON.parse(fileContent.toString());
      menus[menuFileName] = menuDefinition;
      usedMenuTemplates[menuDefinition.template] = true;
    })
  );

  const menuTemplates: MenuTemplateRegister = {};
  Object.keys(usedMenuTemplates).forEach(menuTemplateFileName => {
    const absoluteMenuTemplateFileName = join(menusDirectoryName, menuTemplateFileName);
    menuTemplates[menuTemplateFileName] = compileFile(absoluteMenuTemplateFileName);
  });

  return { menus, menuTemplates };
}
