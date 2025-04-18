import BaseBlogScrapper from "../utils/BaseBlog";

export default class AboMusaBlogScrapper extends BaseBlogScrapper {
  constructor() {
    super("https://abo-musa.blogspot.com/", {
      listQuery: "div#main .blog-posts .post-outer",
      nextPageQuery: "div#blog-pager a#Blog1_blog-pager-older-link",
      urlQuery: ".post-title a",
      titleQuery: ".post-title a",
      dateQuery: ".post-timestamp abbr[title]",
      categoriesQuery: ".post-labels > a",
      contentQuery: "div.post-body",
    });
  }

  getDate(document: Element, dateQuery?: string): Date {
    if (!dateQuery) return new Date();
    const date = document.getAttribute("title");
    return date ? new Date(date) : new Date();
  }

  getTags(document: Element, tagsQuery?: string): string[] {
    return [];
  }
}
