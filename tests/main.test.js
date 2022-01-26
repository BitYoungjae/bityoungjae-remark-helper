import { unified } from 'unified'
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { getAllImageUrls, remarkImageUrlReplacer } from '../dist/main'

const markdown = `![image info](./pictures/image1.png)
![image info](./pictures/image2.png)
![image info](./pictures/image3.png)\n`;

const urlMap = {
    "./pictures/image1.png": "https://image.com/image1.jpg",
    "./pictures/image3.png": "https://image.com.image4.png"
}

const result = `![image info](https://image.com/image1.jpg)
![image info](./pictures/image2.png)
![image info](https://image.com.image4.png)\n`;

test('getAllImageUrls', () => {
    const urlList = getAllImageUrls(markdown);
    expect(urlList).toContain("./pictures/image1.png")
    expect(urlList).toContain("./pictures/image2.png")
    expect(urlList).toContain("./pictures/image3.png")
})

test('remarkImageUrlReplacer', async () => {
    expect(String(
        await unified()
            .use(remarkParse)
            .use(remarkImageUrlReplacer(urlMap))
            .use(remarkStringify)
            .process(markdown)))
        .toBe(result);
})