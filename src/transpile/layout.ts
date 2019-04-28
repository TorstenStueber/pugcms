import { LayoutDefinition } from "../loaders/layouts";
import { MetaInformation } from "../loaders/meta";

export function expandLayout(
  layouts: LayoutDefinition,
  layout: string,
  contentHtml: string,
  meta: MetaInformation,
  configuration: any,
  menuHtml: string,
  fileName: string,
  pageUrl: string
) {
  return layouts[layout]({
    content: contentHtml,
    title: meta.title || configuration.seo.title,
    description: meta.description || configuration.seo.description,
    config: configuration,
    headerMenu: menuHtml,
    fileName,
    pageUrl
  });
}
