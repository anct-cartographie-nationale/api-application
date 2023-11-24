export type Paginated<T> = {
  meta: Page;
  data: T[];
  links: PageLinks;
};

export type Pagination = {
  number: number;
  size: number;
};

type Page = Pagination & {
  totalElements: number;
  totalPages: number;
} & { isPage: true };

type PageLink = `${string}?page[number]=${number}&page[size]=${number}`;

type PageLinks = {
  self: PageLink;
  first: PageLink;
  last: PageLink;
  prev?: PageLink;
  next?: PageLink;
};

const fixPageNumber = (page: Omit<Page, 'isPage'>): number => {
  if (page.number < 0) return 0;
  if (page.number > page.totalPages) return page.totalPages;
  return page.number;
};

const fixPage = (page: Omit<Page, 'isPage'>): Page =>
  Page({
    ...page,
    number: fixPageNumber(page),
    size: page.size <= 0 ? 1 : page.size
  });

const isValidPage = (page: Omit<Page, 'isPage'>): page is Page =>
  page.number != null && page.number >= 0 && page.number <= page.totalPages && page.size != null && page.size > 0;

export const Page = (page: Omit<Page, 'isPage'>): Page => (isValidPage(page) ? page : fixPage(page));

const previousIfExist = (page: Page, url: string): { prev?: PageLink } =>
  page.number == 0 ? {} : { prev: `${url}?page[number]=${page.number - 1}&page[size]=${page.size}` };

const nextIfExist = (page: Page, url: string): { next?: PageLink } =>
  page.number == page.totalPages ? {} : { next: `${url}?page[number]=${page.number + 1}&page[size]=${page.size}` };

const PageLinks = (url: string, page: Page): PageLinks => ({
  self: `${url}?page[number]=${page.number}&page[size]=${page.size}`,
  first: `${url}?page[number]=0&page[size]=${page.size}`,
  last: `${url}?page[number]=${page.totalPages}&page[size]=${page.size}`,
  ...previousIfExist(page, url),
  ...nextIfExist(page, url)
});

export const Paginated =
  (page: Page, url: string) =>
  <T>(result: T[]): Paginated<T> => ({ meta: page, data: result, links: PageLinks(url, page) });

const DEFAULT_PAGINATION: Pagination = {
  number: 0,
  size: 1
};

const setMaxSize = (pagination: Pagination): Pagination => ({
  number: +pagination.number,
  size: +pagination.size > 10000 ? 10000 : +pagination.size
});

export const paginationFromQueryString = ({ page }: Record<string, unknown>): Pagination =>
  setMaxSize(typeof page === 'object' ? { ...DEFAULT_PAGINATION, ...page } : DEFAULT_PAGINATION);
