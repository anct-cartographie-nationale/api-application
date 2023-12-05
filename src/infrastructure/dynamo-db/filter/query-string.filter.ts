import qs from 'qs';
import { Condition, ConditionNode, isConditionalNestedJsonLeaf, nestedJsonToAST, QueryNode } from './abstract-syntax-tree';
import { Filter, filter, QueryCommandExpression } from './filter';
import { attributeExists, attributeNotExists, Comparison } from './operators';

type Value<T> = Partial<T[keyof T]>;

type QueryBoolean = 'true' | 'false';

type Comparisons<T> = Record<Comparison, Value<T>>;

type ObjectQueryString<T> = Record<keyof T, Partial<Comparisons<T>>>;

type ConditionSelector<T> = { matchConditionNode: () => boolean; conditionNode: ConditionNode<Filter<T>> };

const isValidAttributeValue = <T>(value: Value<T> | QueryBoolean): value is QueryBoolean =>
  value === 'true' || value === 'false';

const toConditionNode =
  <T>(attribute: [keyof T][0]) =>
  ([comparison, value]: [Comparison, Value<T>]): ConditionNode<Filter<T>> =>
    [
      {
        matchConditionNode: () => comparison === 'exists' && isValidAttributeValue(value) && value === 'true',
        conditionNode: attributeExists<T>(attribute)
      },
      {
        matchConditionNode: () => comparison === 'exists' && isValidAttributeValue(value) && value === 'false',
        conditionNode: attributeNotExists<T>(attribute)
      }
    ].reduce(
      (conditionNode: ConditionNode<Filter<T>>, conditionSelector: ConditionSelector<T>): ConditionNode<Filter<T>> =>
        conditionSelector.matchConditionNode() ? conditionSelector.conditionNode : conditionNode,
      Condition({ attribute, comparison, value })
    );

const queryStringEntries = <T>(queryStringToObject: ObjectQueryString<T>) =>
  Object.entries(queryStringToObject) as [keyof T, Comparisons<T>][];

const toQueryNodeFilters = <T>([attribute, comparisons]: [keyof T, Comparisons<T>]): ConditionNode<Filter<T>>[] =>
  (Object.entries(comparisons) as [Comparison, Value<T>][]).map(toConditionNode(attribute));

const transformToQueryNodeFilter = <T>(leaf: ObjectQueryString<T>): Filter<T>[] =>
  queryStringEntries(leaf)
    .flatMap(toQueryNodeFilters)
    .flatMap((queryNode: ConditionNode<Filter<T>>): Filter<T>[] => {
      if (Array.isArray(queryNode.condition.value)) {
        return queryNode.condition.value.map((value: Value<T>): Filter<T> => ({ ...queryNode.condition, value }));
      }

      if (typeof queryNode.condition.value === 'object') {
        return (Object.entries(queryNode.condition.value) as [string, Value<T>][]).flatMap(
          ([key, value]: [string, Value<T>]): Filter<T>[] => {
            if (Array.isArray(value)) {
              return value.map(
                (valueA: Value<T>): Filter<T> => ({
                  ...queryNode.condition,
                  ...({ value: { [key]: valueA } } as unknown as Partial<T[keyof T]>)
                })
              );
            }
            return [queryNode.condition];
          }
        );
      }

      return [queryNode.condition];
    });

const parsedQueryStringFilter = <T>(queryStringToObject: ObjectQueryString<T>): QueryCommandExpression =>
  filter<T>(...queryStringEntries(queryStringToObject).flatMap(toQueryNodeFilters));

const filterQueryNodes = <T>(queryNodes: QueryNode<Filter<T>> | QueryNode<Filter<T>>[]): QueryCommandExpression =>
  Array.isArray(queryNodes) ? filter<T>(...queryNodes) : filter<T>(queryNodes);

const fromNestedParsedObject = <T>(parsed: never): QueryCommandExpression =>
  filterQueryNodes(nestedJsonToAST<Filter<T>>(transformToQueryNodeFilter)(parsed));

const transformNestedEntry = (previousValue: qs.ParsedQs, [key, child]: [string, unknown]): qs.ParsedQs => ({
  ...previousValue,
  [key]: transformJSONTree(child as qs.ParsedQs)
});

const transformJSONTree = (tree: qs.ParsedQs | string): qs.ParsedQs | string[] => {
  if (Array.isArray(tree)) return tree;
  if (typeof tree === 'string' && tree.includes(',')) return tree.split(',');
  if (typeof tree === 'object') return Object.entries(tree).reduce(transformNestedEntry, {});
  return tree as unknown as qs.ParsedQs;
};

const toQueryCommandExpression = <T>(parsed: qs.ParsedQs | string[]): QueryCommandExpression =>
  isConditionalNestedJsonLeaf(parsed)
    ? parsedQueryStringFilter<T>(parsed as ObjectQueryString<T>)
    : fromNestedParsedObject(parsed);

const hasOperatorAttribute = (attributes: string[]): boolean => attributes.includes('or') || attributes.includes('and');

const isSingle = <T>(elements: T[]): elements is [T] => elements.length == 1;

const shouldAppendOr = (attributes: string[], transformed: qs.ParsedQs | string[]): boolean =>
  isSingle(attributes) && !hasOperatorAttribute(attributes) && Object.keys(transformed[attributes[0]]).length === 1;

export const queryStringFilter = (queryString: string): QueryCommandExpression => {
  const transformed = transformJSONTree(qs.parse(queryString));
  return toQueryCommandExpression(shouldAppendOr(Object.keys(transformed), transformed) ? { or: transformed } : transformed);
};
