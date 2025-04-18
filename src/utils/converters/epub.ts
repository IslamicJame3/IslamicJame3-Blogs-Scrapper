import fs from "node:fs";
import path from "node:path";
import epub, { Content } from "epub-gen-memory";
import { parseHTML } from "linkedom";
import { Article } from "../types";

export default async function createEpub(
  title: string,
  articles: Array<Article>
): Promise<Buffer> {
  const sections: Content = articles.map((article, index) => {
    const { document } = parseHTML(
      fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf-8")
    );

    // remove toc for epub.
    document.querySelector(".list")?.remove();

    const AnchorArticle = document.createElement("div");
    AnchorArticle.classList.add("article");
    AnchorArticle.innerHTML = `
<center>
  <h2 class="article-title">
    <a href="${article.url}">${article.title}</a>
  </h2>
</center>
<div class="article-content">
  ${article.content};
</div>
${
  (article.tags || []).length > 0
    ? `
<div style="flex:1;gap:20px;flex-wrap:wrap;direction:rtl">
${article.tags.map((tag) => {
  return `<a href="#tag:${tag}">وسم:${tag}</a>`;
})}
</div>
      `.trim()
    : ""
}
`.trim();

    document.querySelector(".articles")?.appendChild(AnchorArticle);

    for (const element of document.querySelectorAll(
      "div.article div.article-content *:not(a,img,iframe,video,picture,source)"
    )) {
      for (const attribute of element.attributes) {
        element.removeAttribute(attribute.name);
      }
    }

    return {
      title: article.title,
      content: document.body.innerHTML,
      filename: `article-${index + 1}.xhtml`,
    };
  });

  const EpubFile = await epub(
    {
      title,
      author: title.split(" ").slice(1).join(" "),
      css: "* { direction: rtl; }",
      ignoreFailedDownloads: true,
      numberChaptersInTOC: false,
      tocInTOC: false,
      verbose: false,
      tocTitle: "فهرس المقالات",
      prependChapterTitles: false,
      lang: "ar",
    },
    sections
  );

  return EpubFile as Buffer;
}
