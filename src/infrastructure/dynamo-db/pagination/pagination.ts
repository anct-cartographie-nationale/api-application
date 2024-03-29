export type Paginated<T> = {
  meta: Page;
  data: T[];
  links: PageLinks;
};

export type Pagination = {
  number: number;
  size: number;
};

export type Page = Pagination & {
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

const fixPaginationNumber = (number: number, totalPages: number): number => {
  if (number < 0) return 0;
  if (number >= totalPages) return totalPages - 1;
  return number;
};

const fixPagination = ({ number, size }: Pagination, totalPages: number): Pagination => ({
  number: fixPaginationNumber(number, totalPages),
  size: size <= 0 ? 1 : size
});

const isEmptyPage = (page: Omit<Page, 'isPage'>) => page.totalPages === 0 && page.totalElements === 0;

const isValidPage = (page: Omit<Page, 'isPage'>): page is Page =>
  (page.number != null && page.number >= 0 && page.number < page.totalPages && page.size != null && page.size > 0) ||
  isEmptyPage(page);

const emptyPage = (pagination: Pagination): Omit<Page, 'isPage'> => ({
  totalPages: 0,
  totalElements: 0,
  ...pagination
});

const pageMetadata = <T>(result: T[], pagination: Pagination): Omit<Page, 'isPage'> => ({
  totalPages: Math.ceil(result.length / pagination.size),
  totalElements: result.length,
  ...pagination
});

export const Page = <T>(result: T[], pagination: Pagination): Page => {
  const page: Omit<Page, 'isPage'> = result.length === 0 ? emptyPage(pagination) : pageMetadata(result, pagination);
  return isValidPage(page) ? page : Page(result, fixPagination(pagination, page.totalPages));
};

const previousIfExist = (page: Page, url: string): { prev?: PageLink } =>
  page.number == 0 ? {} : { prev: `${url}?page[number]=${page.number - 1}&page[size]=${page.size}` };

const nextIfExist = (page: Page, url: string): { next?: PageLink } =>
  page.number === page.totalPages - 1 ? {} : { next: `${url}?page[number]=${page.number + 1}&page[size]=${page.size}` };

const PageLinks = (page: Page, url: string): PageLinks => ({
  self: `${url}?page[number]=${page.number}&page[size]=${page.size}`,
  first: `${url}?page[number]=0&page[size]=${page.size}`,
  last: `${url}?page[number]=${page.totalPages - 1}&page[size]=${page.size}`,
  ...previousIfExist(page, url),
  ...nextIfExist(page, url)
});

const emptyPageLinks = (url: string): PageLinks => ({
  first: `${url}?page[number]=0&page[size]=0`,
  last: `${url}?page[number]=0&page[size]=0`,
  self: `${url}?page[number]=0&page[size]=0`
});

export const Paginated =
  (page: Page, url: string) =>
  <T>(result: T[]): Paginated<T> => ({
    meta: page,
    data: result,
    links: result.length === 0 ? emptyPageLinks(url) : PageLinks(page, url)
  });

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
