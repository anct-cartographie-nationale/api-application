/* eslint-disable @typescript-eslint/ban-types */

import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../../../storage';
import {
  and,
  Condition,
  ConditionalNestedJson,
  nestedJsonToAST,
  or,
  QueryNode,
  renderConditionalQueryExpression
} from './abstract-syntax-tree';
import { attribute } from '../attribute';
import { Filter } from '../filter';
import { equals } from '../operators';

describe('abstract syntax tree', (): void => {
  it('should render a single condition without operator', (): void => {
    const ast: QueryNode<String> = and(Condition('A'));

    const queryExpression: string = renderConditionalQueryExpression(ast);

    expect(queryExpression).toBe('A');
  });

  it('should render a conditional query expression with a single AND condition', (): void => {
    const ast: QueryNode<String> = and(Condition('A'), Condition('B'));

    const queryExpression: string = renderConditionalQueryExpression(ast);

    expect(queryExpression).toBe('A and B');
  });

  it('should render a conditional query expression with a single OR condition', (): void => {
    const ast: QueryNode<String> = or(Condition('A'), Condition('B'));

    const queryExpression: string = renderConditionalQueryExpression(ast);

    expect(queryExpression).toBe('A or B');
  });

  it('should render a conditional query expression with multiple nested conditions', (): void => {
    const ast: QueryNode<String> = or(
      and(Condition('A'), Condition('B')),
      and(Condition('C'), and(Condition('D'), Condition('E')))
    );

    const queryExpression: string = renderConditionalQueryExpression(ast);

    expect(queryExpression).toBe('(A and B) or (C and (D and E))');
  });

  it('should render a conditional query expression with more than two children in a node', (): void => {
    const ast: QueryNode<String> = or(and(Condition('A'), Condition('B')), and(Condition('C'), Condition('D'), Condition('E')));

    const queryExpression: string = renderConditionalQueryExpression(ast);

    expect(queryExpression).toBe('(A and B) or (C and D and E)');
  });

  it('should convert nested JSON objects to ast', (): void => {
    const conditionalNestedJson: ConditionalNestedJson<string> = {
      or: [{ and: ['A', 'B'] }, { and: ['C', 'D', 'E'] }]
    };

    const ast: QueryNode<String> | QueryNode<String>[] = nestedJsonToAST<String>()(conditionalNestedJson);

    expect(ast).toStrictEqual([or(and(Condition('A'), Condition('B')), and(Condition('C'), Condition('D'), Condition('E')))]);
  });

  it('should convert nested JSON objects to ast with and AND or in same node', (): void => {
    const conditionalNestedJson: ConditionalNestedJson<string> = {
      or: [{ and: ['A', 'B'] }, { and: ['C', 'D', 'E'], or: ['F', 'G'] }]
    };

    const ast: QueryNode<String>[] = nestedJsonToAST<String>()(conditionalNestedJson);

    expect(ast).toStrictEqual([
      {
        operator: 'or',
        children: [
          { operator: 'and', children: [{ condition: 'A' }, { condition: 'B' }] },
          {
            operator: 'and',
            children: [
              { operator: 'and', children: [{ condition: 'C' }, { condition: 'D' }, { condition: 'E' }] },
              { operator: 'or', children: [{ condition: 'F' }, { condition: 'G' }] }
            ]
          }
        ]
      }
    ]);
  });

  it('should build ast containing filter condition attribute', (): void => {
    const ast: QueryNode<Filter<LieuInclusionNumeriqueStorage>> = or(
      attribute('source', equals('Angers')),
      attribute('adresse', equals({ commune: 'Paris' }))
    );

    expect(ast).toStrictEqual({
      children: [
        {
          condition: {
            attribute: 'source',
            comparison: 'eq',
            value: 'Angers'
          }
        },
        {
          condition: {
            attribute: 'adresse',
            comparison: 'eq',
            value: { commune: 'Paris' }
          }
        }
      ],
      operator: 'or'
    });
  });

  it('should convert nested JSON objects to ast with and AND or in same node with filter condition attribute', (): void => {
    const conditionalNestedJson: ConditionalNestedJson<Filter<LieuInclusionNumeriqueStorage>> = {
      or: [
        {
          and: [
            { attribute: 'deduplicated', comparison: 'exists', value: true },
            { attribute: 'source', comparison: 'eq', value: 'Angers' }
          ]
        },
        {
          and: [
            { attribute: 'publics_accueillis', comparison: 'exists', value: true },
            { attribute: 'conditions_acces', comparison: 'exists', value: true },
            { attribute: 'labels_nationaux', comparison: 'exists', value: true }
          ],
          or: [
            { attribute: 'source', comparison: 'beginsWith', value: 'A' },
            { attribute: 'source', comparison: 'beginsWith', value: 'B' }
          ]
        }
      ]
    };

    const ast: QueryNode<Filter<LieuInclusionNumeriqueStorage>> | QueryNode<Filter<LieuInclusionNumeriqueStorage>>[] =
      nestedJsonToAST<Filter<LieuInclusionNumeriqueStorage>>()(conditionalNestedJson);

    expect(ast).toStrictEqual([
      {
        operator: 'or',
        children: [
          {
            operator: 'and',
            children: [
              { condition: { attribute: 'deduplicated', comparison: 'exists', value: true } },
              { condition: { attribute: 'source', comparison: 'eq', value: 'Angers' } }
            ]
          },
          {
            operator: 'and',
            children: [
              {
                operator: 'and',
                children: [
                  { condition: { attribute: 'publics_accueillis', comparison: 'exists', value: true } },
                  { condition: { attribute: 'conditions_acces', comparison: 'exists', value: true } },
                  { condition: { attribute: 'labels_nationaux', comparison: 'exists', value: true } }
                ]
              },
              {
                operator: 'or',
                children: [
                  { condition: { attribute: 'source', comparison: 'beginsWith', value: 'A' } },
                  { condition: { attribute: 'source', comparison: 'beginsWith', value: 'B' } }
                ]
              }
            ]
          }
        ]
      }
    ]);
  });
});
