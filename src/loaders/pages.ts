import fs from "fs";
import { join, relative } from "path";
import { promisify } from "util";

import { recursiveReadDir } from "../utils/directory";
import { extractMetaInformation, MetaInformation } from "./meta";

export type Attributes = Record<string, string>;

const readFile = promisify(fs.readFile);

export interface PageInformation {
  meta: MetaInformation;
  content: string;
  fileName: string;
  originalFileName: string;
}

export type PageId = string;
export type PageRegister = Record<PageId, PageInformation>;

export async function loadAllPages(projectDirectoryName: string): Promise<PageRegister> {
  const pageDirectoryName = join(projectDirectoryName, "pages");
  const pageFileNames = await recursiveReadDir(pageDirectoryName);

  const pages = await Promise.all(
    pageFileNames.map(async pageFileName => {
      const fileContent = (await readFile(pageFileName)).toString();
      const originalFileName = `/${relative(pageDirectoryName, pageFileName)}`;
      const fileName = originalFileName.replace(/index$/, "");
      return {
        ...extractMetaInformation(fileContent),
        fileName,
        originalFileName
      };
    })
  );

  const pageRegister: PageRegister = {};
  pages.forEach(page => {
    const pageId = page.meta.id;
    if (!pageId) {
      throw new Error(`File '${page.fileName}' has no id meta information`);
    }

    const idIsDuplicate = pageRegister.hasOwnProperty(pageId);
    if (idIsDuplicate) {
      throw new Error(`File '${page.fileName}' has same id as '${pageRegister[pageId].fileName}'`);
    }

    pageRegister[pageId] = page;
  });

  return pageRegister;
}
