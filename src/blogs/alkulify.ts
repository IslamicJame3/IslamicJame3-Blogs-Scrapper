import BaseBlogScrapper from "../utils/BaseBlog";

export default class AlkulifyBlogScrapper extends BaseBlogScrapper {
  constructor() {
    super(
      "https://alkulify.com/%D9%83%D9%84-%D8%A7%D9%84%D9%85%D9%82%D8%A7%D9%84%D8%A7%D8%AA/",
      {
        listQuery: "main div div ul li",
        urlQuery: "h2.wp-block-post-title a",
        nextPageQuery: "main div nav a.wp-block-query-pagination-next",
        titleQuery: "h2.wp-block-post-title a",
        dateQuery: "div.wp-block-post-date time[datetime]",
        categoriesQuery: "h1 + div a[rel=tag] span",
        tagsQuery: "main .wp-block-post-terms a",
        contentQuery: "main > div:not(:first-child,:last-child)",
      }
    );
  }
}
