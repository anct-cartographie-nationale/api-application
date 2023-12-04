import { Condition, ConditionNode } from './abstract-syntax-tree';
import { Filter } from './filter';
import { OperatorWithValue } from './operators';

export const attribute = <T, TAttribute extends keyof T = keyof T>(
  attribute: TAttribute,
  operatorWithValue: OperatorWithValue<T, TAttribute>
): ConditionNode<Filter<T>> => Condition({ attribute, ...operatorWithValue });
