import { OperatorFilterExpression, OperatorWithValue } from './operators';

export const beginsWithFilterExpression: OperatorFilterExpression = (left: string, right: string): string =>
  `begins_with(${left}, ${right})`;

export const beginWith = <T, TAttribute extends keyof T = keyof T>(
  value: Partial<T[TAttribute]>
): OperatorWithValue<T, TAttribute> => ({
  comparison: 'beginsWith',
  value
});
