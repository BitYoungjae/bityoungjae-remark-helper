# bityoungjae-remark-helper

Useful tools for `remark` and `rehype`.

## Install

```sh
npm i bityoungjae-remark-helper
```

## How to use

## getAllImageUrls

Extract all image URLs from markdown content.

```ts
type getAllImageUrls = (markdown: string) => string[];
```

```js
import { getAllImageUrls } from "bityoungjae-remark-helper";

const markdown = `![image info](./pictures/image1.png)
![image info](./pictures/image2.png)
![image info](./pictures/image3.png)\n`;

test("getAllImageUrls", () => {
  const urlList = getAllImageUrls(markdown);
  expect(urlList).toContain("./pictures/image1.png");
  expect(urlList).toContain("./pictures/image2.png");
  expect(urlList).toContain("./pictures/image3.png");
});
```

## remarkImageUrlReplacer

Remark plugin for replacing image URLs in markdown

```ts
interface IURLMap {
  [key: string]: string;
}

type remarkImageUrlReplacer = (urlMap: IURLMap) => Plugin;
```

```js
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { remarkImageUrlReplacer } from "bityoungjae-remark-helper";

const markdown = `![image info](./pictures/image1.png)
![image info](./pictures/image2.png)
![image info](./pictures/image3.png)\n`;

const urlMap = {
  "./pictures/image1.png": "https://image.com/image1.jpg",
  "./pictures/image3.png": "https://image.com.image4.png",
};

const result = `![image info](https://image.com/image1.jpg)
![image info](./pictures/image2.png)
![image info](https://image.com.image4.png)\n`;

test("remarkImageUrlReplacer", async () => {
  expect(
    String(
      await unified()
        .use(remarkParse)
        .use(remarkImageUrlReplacer(urlMap))
        .use(remarkStringify)
        .process(markdown),
    ),
  ).toBe(result);
});
```

## getAllMediaUrlInfos

Extract all MediaUrlInfo from markdown content.
MediaUrlInfo data has more specific pieces of information than just URL

```ts
interface IMediaUrlInfo {
  type: "video" | "image" | "unknown";
  url: string;
}

type getAllMediaUrlInfos = (markdown: string) => IMediaUrlInfo[];
```

```js
import { getAllMediaUrlInfos } from "bityoungjae-remark-helper";

const markdown = `
![alt](abc.jpg)

<video src="images/img_5.mp4" style="width:100%" muted autoplay loop playsinline></video>
<img src="images/img_3.png" />

<video 
src="images/img_6.mp4" 
style="width:100%" muted autoplay loop playsinline>
</video>

<video>

<unknownTag></unknownTag>\n`;

test("getAllMediaUrlInfos", () => {
  const mediaUrlInfos = getAllMediaUrlInfos(markdown);
  expect(mediaUrlInfos.length).toBe(4);
  expect(mediaUrlInfos[0]).toEqual({ type: "image", url: "abc.jpg" });
  expect(mediaUrlInfos[1]).toEqual({ type: "video", url: "images/img_5.mp4" });
  expect(mediaUrlInfos[2]).toEqual({ type: "image", url: "images/img_3.png" });
  expect(mediaUrlInfos[3]).toEqual({ type: "video", url: "images/img_6.mp4" });
});
```

## getAllMediaUrls

Similar to `getAllImageUrls`, but `getAllMediaUrls` extracts html `<image>` `<video>` urls as well as markdown image urls.

```ts
type getAllMediaUrls = (markdown: string) => string[];
```

```js
import { getAllMediaUrls } from "bityoungjae-remark-helper";

const markdown = `
![alt](abc.jpg)

<video src="images/img_5.mp4" style="width:100%" muted autoplay loop playsinline></video>
<img src="images/img_3.png" />

<video 
src="images/img_6.mp4" 
style="width:100%" muted autoplay loop playsinline>
</video>

<video>

<unknownTag></unknownTag>\n`;

test("getAllMediaUrls", () => {
  const urlList = getAllMediaUrls(markdown);
  expect(urlList.length).toBe(4);
  expect(urlList).toContain("abc.jpg");
  expect(urlList).toContain("images/img_5.mp4");
  expect(urlList).toContain("images/img_3.png");
  expect(urlList).toContain("images/img_6.mp4");
});
```

## replaceAllMediaUrlsInHTML

```ts
interface IURLMap {
  [key: string]: string;
}

type replaceAllMediaUrlsFromHTML = (urlMap: IURLMap, html: string) => string;
```

```js
test("replaceAllMediaUrlsFromHTML", () => {
  const html = `<video src="videos/old.mp4"></video>\n<img src="images/old.png" alt="old image">`;
  const result = `<video src="videos/new.mp4"></video>\n<img src="images/new.png" alt="old image">`;
  expect(
    replaceAllMediaUrlsInHTML(
      {
        "videos/old.mp4": "videos/new.mp4",
        "images/old.png": "images/new.png",
      },
      html,
    ),
  ).toBe(result);
});
```

## remarkMediaUrlReplacer

Similar to `remarkImageUrlReplacer`, but `remarkMediaUrlReplacer` replace html `<image>` `<video>` urls as well as markdown image urls.

```ts
interface IURLMap {
  [key: string]: string;
}

type remarkMediaUrlReplacer = (urlMap: IURLMap) => Plugin;
```

```js
test("remarkMediaUrlReplacer", async () => {
  const markdown = `
 ![alt text](images/old-1.jpg)
 <video src="videos/old-1.mp4" autoplay></video>
 <img src="images/old-2.png">
 <video src="videos/old-2.mp4"></video>`;

  const result = `
 ![alt text](images/new-1.jpg)
 <video src="videos/new-1.mp4" autoplay></video>
 <img src="images/new-2.png">
 <video src="videos/new-2.mp4"></video>`;

  expect(
    normalizeSpaces(
      String(
        await unified()
          .use(remarkParse)
          .use(
            remarkMediaUrlReplacer({
              "images/1.jpg": "images/new-1.jpg",
              "images/2.png": "images/new-2.png",
              "videos/1.mp4": "videos/new-1.mp4",
              "videos/2.mp4": "videos/new-2.mp4",
            }),
          )
          .use(remarkStringify)
          .process(markdown),
      ),
    ),
  ).toBe(result);
});
```

## replaceAllMediaUrlsInMarkdown

```ts
interface IURLMap {
  [key: string]: string;
}

type replaceAllMediaUrlsInMarkdown = (
  urlMap: IURLMap,
  markdown: string,
) => string;
```

```js
test("replaceAllMediaUrlsInMarkdown", async () => {
  const markdown = `
 ![alt text](images/old-1.jpg)
 <video src="videos/old-1.mp4" autoplay></video>
 <img src="images/old-2.png">
 <video src="videos/old-2.mp4"></video>`;

  const result = `
 ![alt text](images/new-1.jpg)
 <video src="videos/new-1.mp4" autoplay></video>
 <img src="images/new-2.png">
 <video src="videos/new-2.mp4"></video>`;

  expect(
    normalizeSpaces(
      replaceAllMediaUrlsInMarkdown(
        {
          "images/1.jpg": "images/new-1.jpg",
          "images/2.png": "images/new-2.png",
          "videos/1.mp4": "videos/new-1.mp4",
          "videos/2.mp4": "videos/new-2.mp4",
        },
        markdown,
      ),
    ),
  ).toBe(result);
});
```
