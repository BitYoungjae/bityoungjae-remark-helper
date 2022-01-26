# 마크다운 헬퍼

## 설치

```sh
npm i bityoungjae-remark-helper
```

## 사용

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify';
import { getAllImageUrls, remarkImageUrlReplacer } from 'bityoungjae-remark-helper'

const markdown = `
# 마크다운 게시물

- 안녕
- 반가워

![이건 이미지야](./img/img1.jpg)

하이하이

![두번째 이미지야](./img/img2.jpg)

---

바이바이
`

getAllImageUrls(markdown)
// [ './img/img1.jpg', './img/img2.jpg' ]

unified()
.use(remarkParse)
.use(remarkImageUrlReplacer({ './img/img2.jpg': "https://image.com/111.jpg" }))
.use(remarkStringify)
.process(markdown)
.then(vFile => vFile.toString())
.then(console.log)
/*
# 마크다운 게시물

*   안녕
*   반가워

![이건 이미지야](./img/img1.jpg)

하이하이

![두번째 이미지야](https://image.com/111.jpg)

***

바이바이
*/
```