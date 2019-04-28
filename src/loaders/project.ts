import { compileTemplate } from "pug";

import { transpilePage } from "../transpile/page";
import { loadAllPages, PageRegister } from "./pages";
import { loadLayoutTemplates, LayoutDefinition } from "./layouts";
import { loadMenus, MenuRegister, MenuTemplateRegister } from "./menus";
import { loadConfiguration, Options } from "./configuration";
import { loadShortcodes } from "./shortcodes";
import { SnippetRegister, loadAllSnippets } from "./snippets";
import { URL } from "url";

export interface ProjectDefinition {
  pageRegister: PageRegister;
  shortCodesTemplate: compileTemplate;
  layouts: LayoutDefinition;
  snippetRegister: SnippetRegister;
  variables: any;
  menus: MenuRegister;
  menuTemplates: MenuTemplateRegister;
}

export type TranspiledPageRegister = Array<{ relativeFileName: string; html: string }>;

function priorityFromPath(path: string) {
  if (path.endsWith("/")) {
    path = path.substring(0, path.length - 1);
  }
  const pathDepth = path.split("/").length - 1;
  return Math.max(0.4, 1 - 0.2 * pathDepth);
}

export function generateSitemap(pageRegister: PageRegister, options: Options) {
  const time = new Date().toISOString();
  const sitemapUrls = Object.values(pageRegister)
    .filter(page => page.meta.excludebots !== "true")
    .map(
      page =>
        "  <url>\n    <loc>" +
        new URL(page.fileName, options.domain as string).href +
        "</loc>\n    <lastmod>" +
        time +
        "</lastmod>\n    <priority>" +
        priorityFromPath(page.fileName).toFixed(2) +
        "</priority>\n  </url>"
    );

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemapUrls.join("\n") +
    "\n</urlset>"
  );
}

export function generateRobobtsTxt(pageRegister: PageRegister, options: Options) {
  return (
    "User-agent: *\n" +
    Object.values(pageRegister)
      .filter(page => page.meta.excludebots === "true")
      .map(page => `Disallow: ${page.fileName}`)
      .join("\n") +
    `\n\nSitemap: ${new URL(options.sitemapName, options.domain as string).href}`
  );
}

export async function loadProject(projectDirectoryName: string) {
  const [
    pageRegister,
    snippetRegister,
    { variables, options },
    shortCodesTemplate
  ] = await Promise.all([
    loadAllPages(projectDirectoryName),
    loadAllSnippets(projectDirectoryName),
    loadConfiguration(projectDirectoryName),
    loadShortcodes(projectDirectoryName)
  ]);
  const [layouts, { menus, menuTemplates }] = await Promise.all([
    loadLayoutTemplates(pageRegister, projectDirectoryName),
    loadMenus(pageRegister, projectDirectoryName)
  ]);

  const project = {
    pageRegister,
    shortCodesTemplate,
    layouts,
    snippetRegister,
    variables,
    menus,
    menuTemplates
  };

  const transpiledPages = Object.values(pageRegister).map(page => ({
    relativeFileName: page.originalFileName,
    html: transpilePage(page, project, options)
  }));

  const sitemap = generateSitemap(pageRegister, options);
  const robotsTxt = generateRobobtsTxt(pageRegister, options);

  return {
    transpiledPages,
    sitemap,
    robotsTxt,
    options
  };
}
