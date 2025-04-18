export interface ArticleQueriesInterface {
  contentQuery?: string;
  tagsQuery?: string;
  categoriesQuery?: string;
}

export interface BasicArticleData {
  title: string;
  url: string;
  date: Date;
}

export interface FetchArticleData {
  content: string;
  tags: string[];
  categories: string[];
}

export type Article = BasicArticleData & FetchArticleData;

export interface ArticleListQueriesInterface {
  listQuery?: string;
  titleQuery?: string;
  urlQuery?: string;
  dateQuery?: string;
  nextPageQuery?: string;
}

export type FullFetchOptions =
  | ({
      full: true;
    } & ArticleListQueriesInterface &
      ArticleQueriesInterface)
  | ({
      full?: false;
    } & ArticleListQueriesInterface);

export type FullFetchCallback =
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "fetch_articles";
      articlesCount: number;
    };

export interface BaseBlogScrapperInterface {
  baseArticleListUrl: string;
  defaultOptions: ArticleListQueriesInterface & ArticleQueriesInterface;
  fetchArticle(
    url: string,
    options?: ArticleQueriesInterface
  ): Promise<FetchArticleData>;
  fetchArticleList(
    listURL: string,
    options?: ArticleListQueriesInterface
  ): Promise<{
    articles: BasicArticleData[];
    nextPageUrl?: string;
  }>;
  fetchFullArticles(
    options?: FullFetchOptions,
    cb?: (data: FullFetchCallback) => void
  ): Promise<(Article | BasicArticleData)[]>;
  getTitle(document: Element, titleQuery?: string): string;
  getUrl(document: Element, urlQuery?: string): string;
  getDate(document: Element, dateQuery?: string): Date;
  getContent(document: Element, contentQuery?: string): string;
  getTags(document: Element, tagsQuery?: string): string[];
  getCategories(document: Element, categoriesQuery?: string): string[];
  getNextPageUrl(document: Element, nextPageQuery?: string): string | undefined;
}
