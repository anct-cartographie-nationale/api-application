import { OperatorAlias, OperatorAliases, OPERATORS } from './operators';
import { QueryCommandExpression, QueryCommandOperator } from './query-command';

const onlyDefinedExpressions = (filterExpression: string | undefined): filterExpression is string => filterExpression != null;

type FieldsFrom<TTable> = Extract<keyof TTable, string>;

type TTable<TTable, TField extends FieldsFrom<TTable>> = Record<string, TTable[TField]>;

type OperatorConfiguration<T> = {
  value: Partial<T>;
  operator: QueryCommandOperator;
};

type FilterConfiguration<T extends TTable<T, TField>, TField extends FieldsFrom<T> = FieldsFrom<T>> = {
  field: TField;
} & OperatorConfiguration<T[TField]>;

const mergeExpressionAttributeNames = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): Record<string, string> => ({
  ...queryCommandExpression.ExpressionAttributeNames,
  ...nextQueryCommandExpression.ExpressionAttributeNames
});

const mergeExpressionAttributeValues = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): QueryCommandExpression => ({
  ...queryCommandExpression.ExpressionAttributeValues,
  ...nextQueryCommandExpression.ExpressionAttributeValues
});

const mergeFilterExpression = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): string =>
  [queryCommandExpression.FilterExpression, nextQueryCommandExpression.FilterExpression]
    .filter(onlyDefinedExpressions)
    .join(' and ');

const mergeQueryCommandExpression = (
  queryCommandExpression: QueryCommandExpression,
  nextQueryCommandExpression: QueryCommandExpression
): QueryCommandExpression => ({
  ExpressionAttributeNames: mergeExpressionAttributeNames(queryCommandExpression, nextQueryCommandExpression),
  ExpressionAttributeValues: mergeExpressionAttributeValues(queryCommandExpression, nextQueryCommandExpression),
  FilterExpression: mergeFilterExpression(queryCommandExpression, nextQueryCommandExpression)
});

const toQueryCommandExpression = <T extends TTable<T, TField>, TField extends FieldsFrom<T>>(
  queryCommandExpression: QueryCommandExpression,
  filterConfiguration: FilterConfiguration<T, TField>,
  index: number
): QueryCommandExpression =>
  mergeQueryCommandExpression(
    queryCommandExpression,
    filterConfiguration.operator(filterConfiguration.field, filterConfiguration.value, index.toString())
  );

export const filter = <T extends TTable<T, TField>, TField extends FieldsFrom<T> = FieldsFrom<T>>(
  ...filterConfigurations: FilterConfiguration<T, TField>[]
): QueryCommandExpression => filterConfigurations.reduce(toQueryCommandExpression, {});

export const field = <T extends TTable<T, TField>, TField extends FieldsFrom<T>>(
  field: TField,
  operatorConfiguration: OperatorConfiguration<T[TField]>
): FilterConfiguration<T, TField> => ({ field, ...operatorConfiguration });

const isValidOperator = (operator: string): operator is OperatorAlias => OperatorAliases.includes(operator);

const filterConfiguration = <T extends TTable<T, TField>, TField extends FieldsFrom<T>>(
  field: TField,
  value: Partial<T[TField]>,
  operator: QueryCommandOperator
): FilterConfiguration<T, TField> => ({ field, value, operator });

const toFilterConfigurations =
  <T extends TTable<T, TField>, TField extends FieldsFrom<T>>(
    field: TField,
    filterFromQuery: Record<string, Record<OperatorAlias, Partial<T[TField]>>>
  ) =>
  (filterConfigurations: FilterConfiguration<T, TField>[], operatorAlias: OperatorAlias): FilterConfiguration<T, TField>[] => {
    const value: Partial<T[TField]> | undefined = filterFromQuery[field]?.[operatorAlias];
    const operator: QueryCommandOperator | undefined = OPERATORS[operatorAlias];
    return isValidOperator(operatorAlias) && value != null && operator != null
      ? [...filterConfigurations, filterConfiguration(field, value, operator)]
      : [];
  };

const toFilterConfigurationFromParsedQuery =
  <T extends TTable<T, TField>, TField extends FieldsFrom<T>>(
    filterFromQuery: Record<string, Record<OperatorAlias, Partial<T[TField]>>>
  ) =>
  (filterConfigurations: FilterConfiguration<T, TField>[], field: TField): FilterConfiguration<T, TField>[] => [
    ...filterConfigurations,
    ...Object.keys(filterFromQuery[field] ?? {}).reduce(toFilterConfigurations(field, filterFromQuery), [])
  ];

export const filterFromParsedQueryString = <T extends TTable<T, TField>, TField extends FieldsFrom<T> = FieldsFrom<T>>(
  filterFromQuery: Record<string, Record<OperatorAlias, Partial<T[TField]>>>
): QueryCommandExpression => {
  return filter<T, TField>(
    ...(Object.keys(filterFromQuery) as TField[]).reduce(toFilterConfigurationFromParsedQuery(filterFromQuery), [])
  );
};
