import { OperatorFilterExpression, OperatorWithValue } from './operators';

export const notEqualFilterExpression: OperatorFilterExpression = (left: string, right: string): string =>
  `NOT ${[left, right].join(' = ')}`;

export const notEquals = <T, TAttribute extends keyof T = keyof T>(
  value: Partial<T[TAttribute]>
): OperatorWithValue<T, TAttribute> => ({
  comparison: 'neq',
  value
});
