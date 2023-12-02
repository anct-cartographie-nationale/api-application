import { OperatorFilterExpression, OperatorWithValue } from './operators';

export const equalFilterExpression: OperatorFilterExpression = (left: string, right: string): string =>
  [left, right].join(' = ');

export const equals = <T, TAttribute extends keyof T = keyof T>(
  value: Partial<T[TAttribute]>
): OperatorWithValue<T, TAttribute> => ({
  comparison: 'eq',
  value
});
