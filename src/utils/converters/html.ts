import fs from "node:fs";
import path from "node:path";
import { parseHTML } from "linkedom";
import { Article } from "../types";

export default async function createHTML(articles: Array<Article>) {
  const html = fs.readFileSync(
    path.join(__dirname, "..", "index.html"),
    "utf-8"
  );
  const { document } = parseHTML(html);
  const ArticlesLength = articles.length;
  for (let i = 0; i < ArticlesLength; i++) {
    const article = articles[i];
    const li = document.createElement("li");
    li.classList.add("tree-content");
    li.innerHTML = `<a href="#a${i}">${article.title}</a>`;
    document.querySelector(".home ul.tree")?.appendChild(li);
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
  }
  for (const element of document.querySelectorAll(
    "div.article div.article-content *:not(a,img,iframe,video,picture)"
  )) {
    for (const attribute of element.attributes) {
      element.removeAttribute(attribute.name);
    }
  }

  for (const element of document.querySelectorAll("div.article h1")) {
    element.outerHTML = `<strong>${element.innerHTML}</strong>`;
  }

  return document.documentElement.outerHTML;
}
