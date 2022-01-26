import {Plugin, unified} from 'unified';
import remarkParse from 'remark-parse';
import {selectAll} from 'unist-util-select';
import {Node, visit} from 'unist-util-visit';
import {Image} from 'mdast';

const isImageNode = (node: Node): node is Image => node.type === 'image';

export const getAllImageUrls = (markdown: string) => {
  const root = unified().use(remarkParse).parse(markdown);
  const imageNodes = selectAll('image', root) as Image[];

  return imageNodes.map(node => node.url);
};

interface IURLMap {
  [key: string]: string;
}

export const remarkImageUrlReplacer =
  (urlMap: IURLMap): Plugin =>
  () => {
    return root => {
      visit(root, node => {
        if (isImageNode(node) && urlMap[node.url]) {
          node.url = urlMap[node.url];
        }
      });
    };
  };
