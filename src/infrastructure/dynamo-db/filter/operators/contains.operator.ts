import { OperatorFilterExpression, OperatorWithValue } from './operators';

export const containsFilterExpression: OperatorFilterExpression = (left: string, right: string): string =>
  `contains(${left}, ${right})`;

export const contains = <T, TAttribute extends keyof T = keyof T>(
  value: Partial<T[TAttribute]>
): OperatorWithValue<T, TAttribute> => ({
  comparison: 'contains',
  value
});
