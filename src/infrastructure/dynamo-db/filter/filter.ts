import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { ConditionNode, QueryNode, Operator, isOperatorNode } from './abstract-syntax-tree';
import { Comparison, operatorFilterExpression, OperatorWithValue } from './operators';

export type QueryCommandExpression = Omit<QueryCommandInput, 'TableName'>;

export type Filter<T, TAttribute extends keyof T = keyof T> = { attribute: TAttribute } & OperatorWithValue<T, TAttribute>;

const mergeExpressionAttributeNames = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): Record<string, string> => ({
  ...queryCommandExpression.ExpressionAttributeNames,
  ...nextQueryCommandExpression.ExpressionAttributeNames
});

const onlyDefinedExpressions = (filterExpression: string | undefined): filterExpression is string => filterExpression != null;

const needParenthesis = (operands: string[], isRoot: boolean) => operands.length > 1 && !isRoot;

const applyParenthesis =
  (isRoot: boolean, operator: Operator) =>
  (operands: string[]): string =>
    needParenthesis(operands, isRoot) ? `(${operands.join(` ${operator} `)})` : operands.join(` ${operator} `);

const mergeFilterExpression =
  (isRoot: boolean, operator: Operator) =>
  ({ FilterExpression }: QueryCommandExpression, { FilterExpression: nextFilterExpression }: QueryCommandExpression): string =>
    applyParenthesis(isRoot, operator)([FilterExpression, nextFilterExpression].filter(onlyDefinedExpressions));

const mergeExpressionAttributeValues = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): QueryCommandExpression => ({
  ...queryCommandExpression.ExpressionAttributeValues,
  ...nextQueryCommandExpression.ExpressionAttributeValues
});

const addExpressionAttributeValuesIfExist = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): QueryCommandExpression =>
  [queryCommandExpression, nextQueryCommandExpression].every(
    ({ ExpressionAttributeValues }: QueryCommandExpression): boolean => ExpressionAttributeValues == null
  )
    ? {}
    : { ExpressionAttributeValues: mergeExpressionAttributeValues(queryCommandExpression, nextQueryCommandExpression) };

const mergeQueryCommandExpression = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression,
  operator: Operator,
  isRoot: boolean
): QueryCommandExpression => ({
  ExpressionAttributeNames: mergeExpressionAttributeNames(queryCommandExpression, nextQueryCommandExpression),
  FilterExpression: mergeFilterExpression(isRoot, operator)(queryCommandExpression, nextQueryCommandExpression),
  ...addExpressionAttributeValuesIfExist(queryCommandExpression, nextQueryCommandExpression)
});

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

const comparisonPart =
  (alias: string, comparison: Comparison) =>
  <T>(value: T, index: number): string =>
    operatorFilterExpression[comparison](`#${alias}.${value}`, `:${alias}${index}`);

const mergeWithPreviousFilterExpression =
  (alias: string, comparison: Comparison) =>
  <T>(filterExpression: string, value: T, index: number): string =>
    [filterExpression, comparisonPart(alias, comparison)(value, index)].join(' and ');

const toFilterExpression =
  (alias: string, comparison: Comparison) =>
  <T>(filterExpression: string, value: T, index: number): string =>
    filterExpression === ''
      ? comparisonPart(alias, comparison)(value, index)
      : `(${mergeWithPreviousFilterExpression(alias, comparison)(filterExpression, value, index)})`;

const filterExpressionFromObject = <T, TField extends Extract<keyof T, string>, TValue extends object = Partial<T[TField]>>(
  alias: string,
  comparison: Comparison,
  values: TValue
): string => Object.keys(values).reduce(toFilterExpression(alias, comparison), '');

const fromNestedQueryCommandExpression =
  <T>(operator: Operator, isRoot: boolean, index: string = '') =>
  (
    queryCommandExpression: QueryCommandExpression,
    childFilter: QueryNode<Filter<T>>,
    childIndex: number
  ): QueryCommandExpression =>
    mergeQueryCommandExpression(
      queryCommandExpression,
      toQueryCommandExpression(childFilter, `${index}${childIndex}`, false),
      operator,
      isRoot
    );

const QueryCommandExpression = <T>(index: string, filter: ConditionNode<Filter<T>>): QueryCommandExpression => {
  if (typeof filter.condition.value === 'object') {
    return {
      ExpressionAttributeNames: { [`#${index}`]: `${filter.condition.attribute.toString()}` },
      ExpressionAttributeValues: expressionAttributeValuesFromObject(index, filter.condition.value),
      FilterExpression: filterExpressionFromObject(index, filter.condition.comparison, filter.condition.value)
    };
  }

  return {
    ExpressionAttributeNames: { [`#${index}`]: `${filter.condition.attribute.toString()}` },
    ...(filter.condition.value == null ? {} : { ExpressionAttributeValues: { [`:${index}`]: `${filter.condition.value}` } }),
    FilterExpression: operatorFilterExpression[filter.condition.comparison](`#${index}`, `:${index}`)
  };
};

const toQueryCommandExpression = <T>(
  filter: QueryNode<Filter<T>>,
  index: string = '0',
  isRoot: boolean = true
): QueryCommandExpression =>
  isOperatorNode(filter)
    ? filter.children.reduce(fromNestedQueryCommandExpression(filter.operator, isRoot, index), {})
    : QueryCommandExpression(index, filter);

const isSingle = <T>(elements: T[]): elements is [T] => elements.length == 1;

const innerFilter = <T>(queryNodes: QueryNode<Filter<T>>[], operator: Operator): QueryCommandExpression =>
  isSingle(queryNodes)
    ? toQueryCommandExpression(queryNodes[0])
    : queryNodes.reduce(fromNestedQueryCommandExpression(operator, true), {});

export const filter = <T>(...queryNodes: QueryNode<Filter<T>>[]): QueryCommandExpression => innerFilter(queryNodes, 'and');
