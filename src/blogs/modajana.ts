import BaseBlogScrapper from "../utils/BaseBlog";

export default class ModajanaBlogScrapper extends BaseBlogScrapper {
  constructor() {
    super("https://modajana.com/archives/category/all", {
      listQuery: ".zak-posts .post",
      urlQuery: ".zak-post-content header h2.entry-title a[href]",
      titleQuery: ".zak-post-content header h2.entry-title a[href]",
      nextPageQuery: ".posts-navigation .nav-previous a[href]",
      contentQuery:
        ".entry-content > *:not(#mp_form_below_posts1,.tptn_counter,.crp_related)",
      tagsQuery: '.zak-tags-links a[rel="tag"]',
      categoriesQuery: '.zak-cat-links a[rel="category tag"]',
    });
  }

  getContent(document: Element, contentQuery?: string): string {
    if (!contentQuery) return "";
    const content = Array.from(document.querySelectorAll(contentQuery));

    return content.map((c) => c.outerHTML.trim()).join("\n");
  }
}
