import { Plugin, unified } from "unified";
import remarkParse from "remark-parse";
import rehypeParse from "rehype-parse";
import { selectAll } from "unist-util-select";
import { Node, visit } from "unist-util-visit";
import { HTML, Image } from "mdast";
import { Element } from "hast";
import rehypeStringify from "rehype-stringify";
import remarkStringify from "remark-stringify";

const markdown2Root = (markdown: string) =>
  unified().use(remarkParse).parse(markdown);

const html2Root = (html: string) =>
  unified().use(rehypeParse, { emitParseErrors: true }).parse(html);

const isRemarkImageNode = (node: Node): node is Image => node.type === "image";
const isRemarkHTMLNode = (node: Node): node is HTML => node.type === "html";
const isRehypeElementNode = (node: Node): node is Element =>
  node.type === "element";

interface IRehypeMediaNode extends Element {
  properties: {
    src: string;
  };
}

const isRehypeMediaTagName = (tagName: string) =>
  ["video", "img"].includes(tagName);

const isRehypeMediaNode = (node: Node): node is IRehypeMediaNode =>
  !!(
    isRehypeElementNode(node) &&
    isRehypeMediaTagName(node.tagName) &&
    node.properties &&
    node.properties.src
  );

interface IMediaUrlInfo {
  type: "video" | "image" | "unknown";
  url: string;
}

const genGeneralMediaUrlInfo = (
  type: IMediaUrlInfo["type"],
  url: IMediaUrlInfo["url"],
): IMediaUrlInfo => ({ type, url });

const tagName2MediaType = (tagName: string): IMediaUrlInfo["type"] => {
  switch (tagName) {
    case "video":
      return "video";
    case "img":
      return "image";
    default:
      return "unknown";
  }
};

export const genAllMediaUrlInfosFromHTML = (html: string): IMediaUrlInfo[] => {
  const root = html2Root(html);
  const htmlNodes = selectAll(
    "element[tagName=video], element[tagName=img]",
    root,
  ) as Element[];

  return (
    htmlNodes.filter((element) =>
      isRehypeMediaNode(element),
    ) as IRehypeMediaNode[]
  ).map((mediaElm) =>
    genGeneralMediaUrlInfo(
      tagName2MediaType(mediaElm.tagName),
      mediaElm.properties.src,
    ),
  );
};

export const getAllImageUrls = (markdown: string) => {
  const root = markdown2Root(markdown);
  const imageNodes = selectAll("image[url]", root) as Image[];

  return imageNodes.map((node) => node.url);
};

export const getAllMediaUrlInfos = (markdown: string): IMediaUrlInfo[] => {
  const root = markdown2Root(markdown);
  const imgUrls = getAllImageUrls(markdown);
  const htmlNodes = selectAll("html", root) as HTML[];

  const fromMarkdownNodes = imgUrls.map((url) =>
    genGeneralMediaUrlInfo("image", url),
  );
  const mediaInfosFromHtml = htmlNodes.flatMap(({ value }) =>
    genAllMediaUrlInfosFromHTML(value),
  );

  return [...fromMarkdownNodes, ...mediaInfosFromHtml];
};

export const getAllMediaUrls = (markdown: string) =>
  getAllMediaUrlInfos(markdown).map(({ url }) => url);

interface IURLMap {
  [key: string]: string;
}

export const remarkImageUrlReplacer =
  (urlMap: IURLMap): Plugin =>
  () => {
    return (root) => {
      visit(root, (node) => {
        if (isRemarkImageNode(node) && urlMap[node.url]) {
          node.url = urlMap[node.url];
        }
      });
    };
  };

export const rehypeMediaUrlReplacer =
  (urlMap: IURLMap): Plugin =>
  () => {
    return (root) => {
      visit(root, (node) => {
        if (isRehypeMediaNode(node) && urlMap[node.properties.src]) {
          node.properties.src = urlMap[node.properties.src];
        }
      });
    };
  };

export const replaceAllMediaUrlsInHTML = (urlMap: IURLMap, html: string) => {
  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeMediaUrlReplacer(urlMap))
    .use(rehypeStringify, { allowParseErrors: true })
    .processSync(html)
    .toString();
};

export const remarkMediaUrlReplacer =
  (urlMap: IURLMap): Plugin =>
  () => {
    return (root) => {
      visit(root, (node) => {
        if (isRemarkImageNode(node) && urlMap[node.url]) {
          node.url = urlMap[node.url];
          return;
        }

        if (isRemarkHTMLNode(node)) {
          node.value = replaceAllMediaUrlsInHTML(urlMap, node.value);
        }
      });
    };
  };

export const replaceAllMediaUrlsInMarkdown = (
  urlMap: IURLMap,
  markdown: string,
) => {
  return unified()
    .use(remarkParse)
    .use(remarkMediaUrlReplacer(urlMap))
    .use(remarkStringify, { bullet: "-" })
    .processSync(markdown)
    .toString();
};
