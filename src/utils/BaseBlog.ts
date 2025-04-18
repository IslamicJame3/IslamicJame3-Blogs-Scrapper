import {
  Article,
  ArticleListQueriesInterface,
  ArticleQueriesInterface,
  BaseBlogScrapperInterface,
  BasicArticleData,
  FetchArticleData,
  FullFetchCallback,
  FullFetchOptions,
} from "./types";
import { parseHTML } from "linkedom";
import fetch from "./fetch";

export default class BaseBlogScrapper implements BaseBlogScrapperInterface {
  constructor(
    public baseArticleListUrl: string,
    public defaultOptions: ArticleListQueriesInterface & ArticleQueriesInterface
  ) {}

  async fetchArticle(
    url: string,
    options?: ArticleQueriesInterface
  ): Promise<FetchArticleData> {
    const { data: html } = await fetch(url, 3);
    const { document } = parseHTML(html);

    const content = this.getContent(
      document.body,
      options?.contentQuery || this.defaultOptions.contentQuery
    );
    const tags = this.getTags(
      document.body,
      options?.tagsQuery || this.defaultOptions.tagsQuery
    );
    const categories = this.getCategories(
      document.body,
      options?.categoriesQuery || this.defaultOptions.categoriesQuery
    );

    return { content, tags, categories };
  }
  async fetchArticleList(
    listURL: string,
    options?: ArticleListQueriesInterface
  ): Promise<{ articles: BasicArticleData[]; nextPageUrl?: string }> {
    if (!this.defaultOptions.urlQuery || options?.urlQuery)
      throw new TypeError("urlQuery is required in fetchArticleList.");
    const { data: html } = await fetch(listURL, 3);
    const { document } = parseHTML(html);
    const articles: BasicArticleData[] = [];
    const articlesElements = Array.from(
      document.querySelectorAll(
        options?.listQuery || this.defaultOptions.listQuery || ""
      ) as NodeListOf<Element>
    );
    const nextPageUrl = this.getNextPageUrl(
      document.body!,
      options?.nextPageQuery || this.defaultOptions.nextPageQuery
    );

    for (let i = 0; i < articlesElements.length; i++) {
      const articleElement = articlesElements[i];
      const title = this.getTitle(
        articleElement,
        options?.titleQuery || this.defaultOptions.titleQuery || ""
      );
      const url = this.getUrl(
        articleElement,
        options?.urlQuery || this.defaultOptions.urlQuery
      );
      const date = this.getDate(
        articleElement,
        options?.dateQuery || this.defaultOptions.dateQuery
      );
      if (url) articles.push({ title, url, date });
    }

    return { articles, nextPageUrl };
  }
  async fetchFullArticles(
    options?: FullFetchOptions,
    cb?: (data: FullFetchCallback) => void
  ): Promise<Array<Article | BasicArticleData>> {
    const { articles, nextPageUrl } = await this.fetchArticleList(
      this.baseArticleListUrl,
      options
    );
    const fullArticlesList: BasicArticleData[] = [...articles];
    const temp = { nextPageUrl };
    while (true) {
      if (!temp.nextPageUrl) break;
      const list = await this.fetchArticleList(temp.nextPageUrl, options);
      fullArticlesList.push(...list.articles);
      temp.nextPageUrl = list.nextPageUrl;
    }
    if (!options?.full) return fullArticlesList;

    const fullArticles: Article[] = [];

    cb?.({ type: "fetch_articles", articlesCount: fullArticlesList.length });

    for (let i = 0; i < fullArticlesList.length; i++) {
      const basicArticle = fullArticlesList[i];

      const article = await this.fetchArticle(basicArticle.url, options);

      fullArticles.push({
        ...basicArticle,
        ...article,
        date: basicArticle.date || new Date(),
      });
      cb?.({
        type: "progress",
        progress: fullArticles.length / fullArticlesList.length,
      });
    }

    return !!(options.dateQuery || this.defaultOptions.dateQuery)
      ? fullArticles.sort(
          (a, b) =>
            (b.date || new Date())?.getTime() -
            (a.date || new Date(Date.now() - 1000))?.getTime()
        )
      : fullArticles;
  }
  getTitle(document: Element, titleQuery?: string): string {
    if (!titleQuery) return "";
    return document.querySelector(titleQuery)?.textContent?.trim() || "";
  }
  getUrl(document: Element, urlQuery?: string): string {
    if (!urlQuery) return "";
    const urlElement = document.querySelector(urlQuery);
    return urlElement ? urlElement.getAttribute("href") || "" : "";
  }
  getDate(document: Element, dateQuery?: string): Date {
    if (!dateQuery) return new Date();
    const dateElement = document.querySelector(dateQuery);
    return dateElement
      ? new Date(dateElement.getAttribute("datetime") || Date.now()) ||
          new Date()
      : new Date();
  }
  getContent(document: Element, contentQuery?: string): string {
    if (!contentQuery) return "";
    const contentElement = document.querySelector(contentQuery);
    return contentElement ? contentElement.innerHTML.trim() : "";
  }
  getTags(document: Element, tagsQuery?: string): string[] {
    if (!tagsQuery) return [];
    const tagsElements = Array.from(document.querySelectorAll(tagsQuery));
    return tagsElements
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);
  }
  getCategories(document: Element, categoriesQuery?: string): string[] {
    if (!categoriesQuery) return [];
    const categoriesElements = Array.from(
      document.querySelectorAll(categoriesQuery)
    );
    return categoriesElements
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);
  }
  getNextPageUrl(
    document: Element,
    nextPageQuery?: string
  ): string | undefined {
    if (!nextPageQuery) return undefined;
    const nextPageElement = document.querySelector(nextPageQuery);
    return nextPageElement
      ? nextPageElement.getAttribute("href") || undefined
      : undefined;
  }
}
