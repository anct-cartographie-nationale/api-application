import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommandExpression } from './filter';
import { Page, Paginated, Pagination } from './pagination';
import { scanAll } from './scan-all';

export const scanPaginated = async <T>(
  TableName: string,
  pagination: Pagination,
  url: string,
  filter: QueryCommandExpression = {},
  docClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient())
): Promise<Paginated<T>> => {
  const result: T[] = await scanAll<T>(TableName, filter, docClient);
  const page: Page = Page(result, pagination);

  return Paginated(page, url)(result.slice(page.size * page.number, page.size * (page.number + 1)));
};
