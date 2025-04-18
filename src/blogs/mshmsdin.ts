import BaseBlogScrapper from "../utils/BaseBlog";

export default class MshmsdinBlogScrapper extends BaseBlogScrapper {
  constructor() {
    super(
      "https://mshmsdin.com/archives/category/%d9%85%d9%82%d8%a7%d9%84%d8%a7%d8%aa",
      {
        listQuery: ".zak-posts .post",
        urlQuery: ".zak-post-content header h2.entry-title a[href]",
        titleQuery: ".zak-post-content header h2.entry-title a[href]",
        nextPageQuery: ".posts-navigation .nav-previous a[href]",
        contentQuery:
          ".entry-content > *:not(#mp_form_below_posts1,.tptn_counter)",
      }
    );
  }

  getContent(document: Element, contentQuery?: string): string {
    if (!contentQuery) return "";
    const content = Array.from(document.querySelectorAll(contentQuery));

    return content.map((c) => c.outerHTML.trim()).join("\n");
  }
}
