import BaseBlogScrapper from "../utils/BaseBlog";

export default class Altameme1BlogScrapper extends BaseBlogScrapper {
  constructor() {
    super(
      "https://alkulify.com/%D9%83%D9%84-%D8%A7%D9%84%D9%85%D9%82%D8%A7%D9%84%D8%A7%D8%AA/",
      {
        listQuery: "div#main div.blog-posts .mobile-post-outer",
        urlQuery: "a[href]",
        titleQuery: "a h3.mobile-index-title span",
        dateQuery: "a[href]",
        nextPageQuery:
          "div#blog-pager #blog-pager-older-link a#blog-pager-older-link",
        contentQuery: ".post-body",
      }
    );
  }

  getCategories(document: Element, categoriesQuery?: string): string[] {
    return [];
  }

  getTags(document: Element, tagsQuery?: string): string[] {
    return [];
  }

  getDate(document: Element, dateQuery?: string): Date {
    if (!dateQuery) return new Date();
    const date = document.getAttribute("href");

    try {
      if (!date) throw new Error();
      const [_, year, month, dayStr] = new URL(date!).pathname.split("/");
      const day = dayStr.match(/blog-post_(\d+).html/)?.[1] || "01";
      return new Date(+year, +month - 1, +day);
    } catch (error) {
      return new Date();
    }
  }
}
