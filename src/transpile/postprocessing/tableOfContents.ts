const tocMarker = "<!--TOC-->";
const numberedTocMarker = "<!--TOC-->";
const headingPattern = /(<(h[1-6]|div)[^>]*toc-heading[^>]*>)((?:.|\n)*?)(<\/\2>)/gmu;
const htmlTagPattern = /<\/?[a-zA-Z0-9]+(\s+[^\s\x00"'>\/=]+\s*(=\s*"[^"]*"|=\s*'[^"]*'|=\s*[^\s"'=<>`]+)?)*\s*\/?>/g;

const tocRegexp = new RegExp(tocMarker, "g");
const numberedTocRegexp = new RegExp(numberedTocMarker, "g");

export default function(html: string) {
  if (html.indexOf(tocMarker) === -1 && html.indexOf(numberedTocMarker) === -1) {
    return html;
  }

  const headingRegexp = new RegExp(headingPattern);
  let match;
  const collisionCollector = {};
  let tocHtml = "";
  let numberedTocHtml = "";
  const records: Array<{ position: number; length: number; replacement: string }> = [];
  while ((match = headingRegexp.exec(html)) !== null) {
    const title = removeHtmlTags(match[3]);
    if (!title) {
      continue;
    }

    const anchor = deriveUrlAnchorName(title, collisionCollector);
    records.push({
      position: match.index,
      length: match[0].length,
      replacement: `${match[1]}<span id="${anchor}">${match[3]}</span>${match[4]}`
    });

    tocHtml += `<li><a href="#${anchor}">${title}</a></li>`;
    numberedTocHtml += `<li><a href="#${anchor}">${records.length}. ${title}</a></li>`;
  }

  let record;
  while ((record = records.pop())) {
    const { position, length, replacement } = record;
    html = html.substring(0, position) + replacement + html.substring(position + length);
  }

  tocHtml = `<ul>${tocHtml}</ul>\n`;
  numberedTocHtml = `<ul>${numberedTocHtml}</ul>\n`;

  return html.replace(tocRegexp, tocHtml).replace(numberedTocRegexp, numberedTocHtml);
}

const removeHtmlTags = (str: string) => str.replace(htmlTagPattern, "").trim();
const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const replaceNewlines = (str: string) => str.replace(/\n|\r|\r\n|\n\r/g, " ");
const removeAmpEntity = (str: string) => str.replace(/&amp;/g, "");
const removeNonalphaNum = (str: string) => str.replace(/[^a-zA-Z0-9 \-_]/g, "");
const replaceSpaces = (str: string) => str.replace(/  /g, "_").replace(/ /g, "_");
const replaceTrailingDashesAndDigits = (str: string) => str.replace(/[-_\d]*$/, "");
const lowerCaseString = (str: string) => str.toLowerCase();
const shortenString = (str: string) =>
  str
    .split("-")
    .slice(0, 4)
    .join("-");

const normalizationFunctions = [
  removeAccents,
  replaceNewlines,
  removeAmpEntity,
  removeNonalphaNum,
  replaceSpaces,
  replaceTrailingDashesAndDigits,
  lowerCaseString,
  shortenString
];

function deriveUrlAnchorName(title: string, collisionCollector: Record<string, number>) {
  let normalizedTitle = normalizationFunctions.reduce((t, f) => f(t), title);

  if (!normalizedTitle) {
    normalizedTitle = "_";
  }

  if (collisionCollector[normalizedTitle]) {
    collisionCollector[normalizedTitle]++;
    normalizedTitle += `-${collisionCollector[normalizedTitle]}`;
  } else {
    collisionCollector[normalizedTitle] = 1;
  }

  return normalizedTitle;
}
