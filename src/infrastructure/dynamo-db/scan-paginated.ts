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

  return Paginated(
    Page({ totalElements: result.length, totalPages: Math.ceil(result.length / pagination.size), ...pagination }),
    url
  )(result.slice(pagination.size * pagination.number, pagination.size * (pagination.number + 1)));
};
