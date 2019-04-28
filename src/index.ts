#!/usr/bin/env node

import fs from "fs";
import { join, dirname } from "path";
import util from "util";
import rimraf from "rimraf";

import shelljs from "shelljs";

import { loadProject, TranspiledPageRegister } from "./loaders/project";
import { transpileStyles } from "./transpile/styles";

const path = process.argv[2];
if (!path) {
  console.error("Path command line argument required.");
  process.exit(-1);
}

const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const rimrafAsync = util.promisify(rimraf);

async function storeTranspiledPages(
  projectDirectoryName: string,
  transpiledPageRegister: TranspiledPageRegister
) {
  const pagesDirectoryName = join(projectDirectoryName, "build");
  await Promise.all(
    transpiledPageRegister.map(async page => {
      const htmlFileName = `${join(pagesDirectoryName, page.relativeFileName)}.html`;
      await mkdir(dirname(htmlFileName), { recursive: true });
      return writeFile(htmlFileName, page.html);
    })
  );
}

async function copyStaticFiles(projectDirectoryName: string) {
  const assetDirectoryName = join(projectDirectoryName, "assets");
  const rootAssetDirectoryName = join(projectDirectoryName, "rootAssets");
  const buildDirectoryName = join(projectDirectoryName, "build");
  shelljs.cp("-R", assetDirectoryName, buildDirectoryName);
  shelljs.cp("-R", join(rootAssetDirectoryName, "*"), buildDirectoryName);
}

async function storeRobotsTxt(projectDirectoryName: string, robotsTxt: string) {
  await writeFile(join(projectDirectoryName, "build/robots.txt"), robotsTxt);
}

async function storeSitemap(projectDirectoryName: string, sitemap: string, sitemapName: string) {
  await writeFile(join(projectDirectoryName, "build", sitemapName), sitemap);
}

async function cleanupBuildDirectory(projectDirectoryName: string) {
  const buildDirectoryName = join(projectDirectoryName, "build/*");
  return rimrafAsync(buildDirectoryName);
}

async function buildProject(projectDir: string) {
  await cleanupBuildDirectory(projectDir);
  const { transpiledPages, sitemap, robotsTxt, options } = await loadProject(projectDir);
  await storeTranspiledPages(projectDir, transpiledPages);
  await copyStaticFiles(projectDir);
  await storeRobotsTxt(projectDir, robotsTxt);
  await storeSitemap(projectDir, sitemap, options.sitemapName);
  await transpileStyles(projectDir, Boolean(options.minify));
}

buildProject(path).then(() => console.log("done"));
