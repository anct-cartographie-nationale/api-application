import { QueryCommandExpression, QueryCommandOperator } from '../query-command';

const toExpressionAttributeValues =
  (alias: string) =>
  (queryCommandExpression: QueryCommandExpression, value: unknown, index: number): QueryCommandExpression => ({
    ...queryCommandExpression,
    [`:${alias}${index}`]: value
  });

const expressionAttributeValuesFromObject = <
  T,
  TField extends Extract<keyof T, string>,
  TValue extends object = Partial<T[TField]>
>(
  alias: string,
  values: TValue
): QueryCommandExpression => Object.values(values).reduce(toExpressionAttributeValues(alias), {});

const beginWithFilterExpression = (field: string, value: string = field): string => `begins_with(#${field}, :${value})`;

const toFilterExpression =
  (alias: string) =>
  (filterExpression: string, value: unknown, index: number): string =>
    filterExpression === ''
      ? beginWithFilterExpression(`${alias}.${value}`, `${alias}${index}`)
      : [filterExpression, beginWithFilterExpression(`${alias}.${value}`, `${alias}${index}`)].join(' and ');

const filterExpressionFromObject = <T, TField extends Extract<keyof T, string>, TValue extends object = Partial<T[TField]>>(
  alias: string,
  values: TValue
): string => Object.keys(values).reduce(toFilterExpression(alias), '');

const isObject = <TValue>(value: TValue | object): value is object => typeof value === 'object';

export const beginWithOperator: QueryCommandOperator = <
  T extends Record<string, unknown>,
  TField extends Extract<keyof T, string> = Extract<keyof T, string>,
  TValue = Partial<T[TField]>
>(
  field: TField,
  alias: string,
  value: TValue
): QueryCommandExpression => ({
  ExpressionAttributeNames: { [`#${alias}`]: field },
  ExpressionAttributeValues: isObject(value) ? expressionAttributeValuesFromObject(alias, value) : { [`:${alias}`]: value },
  FilterExpression: isObject(value) ? filterExpressionFromObject(alias, value) : beginWithFilterExpression(alias)
});

export const beginWith = <TValue>(value: TValue): { value: TValue; operator: QueryCommandOperator } => ({
  value,
  operator: beginWithOperator
});
