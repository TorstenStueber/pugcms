import { PageId } from "../loaders/pages";
import { MenuContentDefinition } from "../loaders/menus";
import { ProjectDefinition } from "../loaders/project";

export function createMenuHtml(id: PageId, menuName: string, project: ProjectDefinition) {
  const menu = project.menus[menuName];
  const menuTempate = project.menuTemplates[menu.template];

  const currentIds: Record<PageId, boolean> = {};
  function markMenu(subMenu: MenuContentDefinition) {
    let containsId = false;
    subMenu.forEach(entry => {
      if (entry.id === id || (entry.sub && markMenu(entry.sub))) {
        containsId = true;
        currentIds[entry.id] = true;
      }
    });

    return containsId;
  }

  markMenu(menu.content);
  return menuTempate({ menu: menu.content, pages: project.pageRegister, currentIds });
}
