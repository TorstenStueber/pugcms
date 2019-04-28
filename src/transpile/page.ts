import postProcessor from "./postprocessing/postProcessor";
import { PageInformation } from "../loaders/pages";
import { ProjectDefinition } from "../loaders/project";
import { createMenuHtml } from "./menu";
import { expandShortcodes } from "./shortcode";
import { expandLayout } from "./layout";
import { URL } from "url";
import { Options } from "../loaders/configuration";

export function transpilePage(
  { meta, content, fileName }: PageInformation,
  project: ProjectDefinition,
  options: Options
) {
  const menuHtml = createMenuHtml(meta.id, meta.menu, project);
  const contentHtml = expandShortcodes(content, project, meta.id, menuHtml);
  const pageHtml = expandLayout(
    project.layouts,
    meta.layout,
    contentHtml,
    meta,
    project.variables,
    menuHtml,
    fileName,
    new URL(fileName, options.domain).href
  );

  return postProcessor(pageHtml);
}
