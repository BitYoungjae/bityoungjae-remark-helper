import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import {
  getAllImageUrls,
  remarkImageUrlReplacer,
  getAllMediaUrls,
  getAllMediaUrlInfos,
  rehypeMediaUrlReplacer,
  replaceAllMediaUrlsInHTML,
  remarkMediaUrlReplacer,
  replaceAllMediaUrlsInMarkdown,
} from "../dist/main";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";

const normalizeSpaces = (str) => str.replaceAll(/\s{2,}/g, " ");

test("getAllImageUrls", () => {
  const markdown = `![image info](./pictures/image1.png)
    ![image info](./pictures/image2.png)
    ![image info](./pictures/image3.png)\n`;

  const urlList = getAllImageUrls(markdown);
  expect(urlList).toContain("./pictures/image1.png");
  expect(urlList).toContain("./pictures/image2.png");
  expect(urlList).toContain("./pictures/image3.png");
});

test("remarkImageUrlReplacer", async () => {
  const markdown = normalizeSpaces(`![image info](./pictures/image1.png) 
    ![image info](./pictures/image2.png) 
    ![image info](./pictures/image3.png)\n`);

  const urlMap = {
    "./pictures/image1.png": "https://image.com/image1.jpg",
    "./pictures/image3.png": "https://image.com.image4.png",
  };

  const result = normalizeSpaces(`![image info](https://image.com/image1.jpg) 
    ![image info](./pictures/image2.png) 
    ![image info](https://image.com.image4.png)\n`);

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

test("getAllMediaUrlInfos", () => {
  const markdown = normalizeSpaces(`
    # 테스트용 마크다운
    
    ## 마크다운 미디어
    
    ![하이하이](abc.jpg)

    ## 여러개 미디어 태그

    <video src="images/img_5.mp4" style="width:100%" muted autoplay loop playsinline></video>
    <img src="images/img_3.png" />
    
    ## 개행이 난무하는 비디오
    
    <video 
    src="images/img_6.mp4" 
    style="width:100%" muted autoplay loop playsinline>
    </video>

    ## 잘 못된 태그

    <video>

    ## 불필요한 태그

    <invisible></invisible>\n`);

  const mediaUrlInfos = getAllMediaUrlInfos(markdown);
  expect(mediaUrlInfos.length).toBe(4);
  expect(mediaUrlInfos[0]).toEqual({ type: "image", url: "abc.jpg" });
  expect(mediaUrlInfos[1]).toEqual({ type: "video", url: "images/img_5.mp4" });
  expect(mediaUrlInfos[2]).toEqual({ type: "image", url: "images/img_3.png" });
  expect(mediaUrlInfos[3]).toEqual({ type: "video", url: "images/img_6.mp4" });
});

test("getAllMediaUrls", () => {
  const markdown = normalizeSpaces(`
    # 테스트용 마크다운
    
    ## 마크다운 미디어
    
    ![하이하이](abc.jpg)

    ## 여러개 미디어 태그

    <video src="images/img_5.mp4" style="width:100%" muted autoplay loop playsinline></video>
    <img src="images/img_3.png" />
    
    ## 개행이 난무하는 비디오
    
    <video 
    src="images/img_6.mp4" 
    style="width:100%" muted autoplay loop playsinline>
    </video>

    ## 잘 못된 태그

    <video>

    ## 불필요한 태그

    <invisible></invisible>\n`);

  const urlList = getAllMediaUrls(markdown);
  expect(urlList.length).toBe(4);
  expect(urlList).toContain("abc.jpg");
  expect(urlList).toContain("images/img_5.mp4");
  expect(urlList).toContain("images/img_3.png");
  expect(urlList).toContain("images/img_6.mp4");
});

test("rehypeMediaUrlReplacer", async () => {
  const html = `<video src="videos/old.mp4"></video>\n<img src="images/old.png" alt="old image">`;
  const result = `<video src="videos/new.mp4"></video>\n<img src="images/new.png" alt="old image">`;

  expect(
    String(
      await unified()
        .use(rehypeParse, { fragment: true })
        .use(
          rehypeMediaUrlReplacer({
            "videos/old.mp4": "videos/new.mp4",
            "images/old.png": "images/new.png",
          }),
        )
        .use(rehypeStringify)
        .process(html),
    ),
  ).toBe(result);
});

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

test("remarkMediaUrlReplacer", async () => {
  const markdown = normalizeSpaces(`
    # 테스트용 마크다운
    
    ## 마크다운 미디어
    
    ![하이하이](images/1.jpg)

    ## 여러개 미디어 태그

    <video src="videos/1.mp4" style="width:100%" muted autoplay loop playsinline></video>
    <img src="images/2.png" />
    
    ## 개행이 난무하는 비디오
    
    <video 
    src="videos/2.mp4" 
    style="width:100%" muted autoplay loop playsinline>
    </video>

    ## 잘 못된 태그

    <video>

    ## 불필요한 태그

    <invisible></invisible>\n`);

  const result = normalizeSpaces(`# 테스트용 마크다운
    
    ## 마크다운 미디어
    
    ![하이하이](images/new-1.jpg)

    ## 여러개 미디어 태그

    <video src="videos/new-1.mp4" style="width:100%" muted autoplay loop playsinline></video>
    <img src="images/new-2.png">
    
    ## 개행이 난무하는 비디오
    
    <video 
    src="videos/new-2.mp4" 
    style="width:100%" muted autoplay loop playsinline></video> 
    
    ## 잘 못된 태그

    <video></video>

    ## 불필요한 태그

    <invisible></invisible>\n`);

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

test("remarkMediaUrlReplacer", () => {
  const markdown = normalizeSpaces(`
    # 테스트용 마크다운
    
    ## 마크다운 미디어
    
    ![하이하이](images/1.jpg)

    ## 여러개 미디어 태그

    <video src="videos/1.mp4" style="width:100%" muted autoplay loop playsinline></video>
    <img src="images/2.png" />
    
    ## 개행이 난무하는 비디오
    
    <video 
    src="videos/2.mp4" 
    style="width:100%" muted autoplay loop playsinline>
    </video>

    ## 잘 못된 태그

    <video>

    ## 불필요한 태그

    <invisible></invisible>\n`);

  const result = normalizeSpaces(`# 테스트용 마크다운
    
    ## 마크다운 미디어
    
    ![하이하이](images/new-1.jpg)

    ## 여러개 미디어 태그

    <video src="videos/new-1.mp4" style="width:100%" muted autoplay loop playsinline></video>
    <img src="images/new-2.png">
    
    ## 개행이 난무하는 비디오
    
    <video 
    src="videos/new-2.mp4" 
    style="width:100%" muted autoplay loop playsinline></video> 
    
    ## 잘 못된 태그

    <video></video>

    ## 불필요한 태그

    <invisible></invisible>\n`);

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
