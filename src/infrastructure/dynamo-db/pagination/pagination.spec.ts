import { describe, expect, it } from 'vitest';
import { Page, Paginated, Pagination, paginationFromQueryString } from './pagination';

describe('pagination', (): void => {
  it('should get paginated result for page 4 with a total of 976 items and 100 items by page', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 3, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=2',
        last: 'https://example.com?page[number]=4&page[size]=2',
        next: 'https://example.com?page[number]=4&page[size]=2',
        prev: 'https://example.com?page[number]=2&page[size]=2',
        self: 'https://example.com?page[number]=3&page[size]=2'
      },
      meta: { number: 3, size: 2, totalElements: 10, totalPages: 5 }
    });
  });

  it('should not have previous page in pagination result when curent page is first page', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 0, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=2',
        last: 'https://example.com?page[number]=4&page[size]=2',
        next: 'https://example.com?page[number]=1&page[size]=2',
        self: 'https://example.com?page[number]=0&page[size]=2'
      },
      meta: { number: 0, size: 2, totalElements: 10, totalPages: 5 }
    });
  });

  it('should not have next page in pagination result when curent page is last page', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 4, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=2',
        last: 'https://example.com?page[number]=4&page[size]=2',
        prev: 'https://example.com?page[number]=3&page[size]=2',
        self: 'https://example.com?page[number]=4&page[size]=2'
      },
      meta: { number: 4, size: 2, totalElements: 10, totalPages: 5 }
    });
  });

  it('should interpret negative page index as first page', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: -1, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=2',
        last: 'https://example.com?page[number]=4&page[size]=2',
        next: 'https://example.com?page[number]=1&page[size]=2',
        self: 'https://example.com?page[number]=0&page[size]=2'
      },
      meta: { number: 0, size: 2, totalElements: 10, totalPages: 5 }
    });
  });

  it('should interpret negative or null size as size of 1', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 1, size: 0 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=1',
        last: 'https://example.com?page[number]=9&page[size]=1',
        next: 'https://example.com?page[number]=2&page[size]=1',
        prev: 'https://example.com?page[number]=0&page[size]=1',
        self: 'https://example.com?page[number]=1&page[size]=1'
      },
      meta: { number: 1, size: 1, totalElements: 10, totalPages: 10 }
    });
  });

  it('should interpret page index equals to total pages as last page', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 5, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=2',
        last: 'https://example.com?page[number]=4&page[size]=2',
        prev: 'https://example.com?page[number]=3&page[size]=2',
        self: 'https://example.com?page[number]=4&page[size]=2'
      },
      meta: { number: 4, size: 2, totalElements: 10, totalPages: 5 }
    });
  });

  it('should interpret page index greater than total pages as last page', (): void => {
    const result: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 100, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=2',
        last: 'https://example.com?page[number]=4&page[size]=2',
        prev: 'https://example.com?page[number]=3&page[size]=2',
        self: 'https://example.com?page[number]=4&page[size]=2'
      },
      meta: { number: 4, size: 2, totalElements: 10, totalPages: 5 }
    });
  });

  it('should handle no results', (): void => {
    const result: number[] = [];

    const paginated: Paginated<number> = Paginated(Page(result, { number: 100, size: 2 }), 'https://example.com')(result);

    expect(paginated).toStrictEqual({
      data: result,
      links: {
        first: 'https://example.com?page[number]=0&page[size]=0',
        last: 'https://example.com?page[number]=0&page[size]=0',
        self: 'https://example.com?page[number]=0&page[size]=0'
      },
      meta: { number: 100, size: 2, totalElements: 0, totalPages: 0 }
    });
  });

  it('should get default pagination when there is no page', (): void => {
    const queryString: Record<string, unknown> = {};

    const pagination: Pagination = paginationFromQueryString(queryString);

    expect(pagination).toStrictEqual({
      number: 0,
      size: 1
    });
  });

  it('should get default pagination from empty page', (): void => {
    const queryString: Record<string, unknown> = { page: {} };

    const pagination: Pagination = paginationFromQueryString(queryString);

    expect(pagination).toStrictEqual({
      number: 0,
      size: 1
    });
  });

  it('should get default pagination size from empty page', (): void => {
    const queryString: Record<string, unknown> = { page: { number: 1 } };

    const pagination: Pagination = paginationFromQueryString(queryString);

    expect(pagination).toStrictEqual({
      number: 1,
      size: 1
    });
  });

  it('should get default pagination number from empty page', (): void => {
    const queryString: Record<string, unknown> = { page: { size: 100 } };

    const pagination: Pagination = paginationFromQueryString(queryString);

    expect(pagination).toStrictEqual({
      number: 0,
      size: 100
    });
  });

  it('should not have a pagination with a size greater than 10000', (): void => {
    const queryString: Record<string, unknown> = { page: { size: 20000 } };

    const pagination: Pagination = paginationFromQueryString(queryString);

    expect(pagination).toStrictEqual({
      number: 0,
      size: 10000
    });
  });
});
