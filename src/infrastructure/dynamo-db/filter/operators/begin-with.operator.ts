import { QueryCommandExpression, QueryCommandOperator } from '../query-command';

const toExpressionAttributeValues =
  (alias: string) =>
  (queryCommandExpression: QueryCommandExpression, value: unknown, index: number): QueryCommandExpression => ({
    ...queryCommandExpression,
    [`:${alias}${index}`]: value
  });

const expressionAttributeValuesFromObject = <T, TField extends Extract<keyof T, string>>(
  alias: string,
  values: Partial<T[TField]>
): QueryCommandExpression => Object.values(values).reduce(toExpressionAttributeValues(alias), {});

const beginWithFilterExpression = (field: string, value: string = field): string => `begins_with(#${field}, :${value})`;

const toFilterExpression =
  (alias: string) =>
  (filterExpression: string, value: unknown, index: number): string =>
    filterExpression === ''
      ? beginWithFilterExpression(`${alias}.${value}`, `${alias}${index}`)
      : [filterExpression, beginWithFilterExpression(`${alias}.${value}`, `${alias}${index}`)].join(' and ');

const filterExpressionFromObject = <T, TField extends Extract<keyof T, string>>(
  alias: string,
  values: Partial<T[TField]>
): string => Object.keys(values).reduce(toFilterExpression(alias), '');

export const beginWithOperator: QueryCommandOperator = <
  T extends Record<string, unknown>,
  TField extends Extract<keyof T, string> = Extract<keyof T, string>
>(
  field: TField,
  value: Partial<T[TField]>,
  alias: string
): QueryCommandExpression => ({
  ExpressionAttributeNames: { [`#${alias}`]: field },
  ExpressionAttributeValues:
    typeof value === 'object' ? expressionAttributeValuesFromObject(alias, value) : { [`:${alias}`]: value },
  FilterExpression: typeof value === 'object' ? filterExpressionFromObject(alias, value) : beginWithFilterExpression(alias)
});

export const beginWith = <TValue>(value: TValue): { value: TValue; operator: QueryCommandOperator } => ({
  value,
  operator: beginWithOperator
});
