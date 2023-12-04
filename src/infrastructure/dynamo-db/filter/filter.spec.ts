import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../../storage';
import { and, or } from './abstract-syntax-tree';
import { attribute } from './attribute';
import { QueryCommandExpression, filter } from './filter';
import { attributeExists, attributeNotExists, beginWith, equals } from './operators';

describe('filter configuration for dynamodb scan command', (): void => {
  it('should filter nothing', (): void => {
    const filterSource: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>();

    expect(filterSource).toStrictEqual({});
  });

  it('should filter on source equals Francil-in and deduplicated is true', (): void => {
    const filterSource: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('source', equals('Francil-in')),
      attribute('deduplicated', equals(true))
    );

    expect(filterSource).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source', '#1': 'deduplicated' },
      ExpressionAttributeValues: { ':0': 'Francil-in', ':1': 'true' },
      FilterExpression: '#0 = :0 and #1 = :1'
    });
  });

  it('should convert filter query node with single filter containing multiple attributes to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('source', equals('Francil-in'))
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source' },
      ExpressionAttributeValues: { ':0': 'Francil-in' },
      FilterExpression: '#0 = :0'
    });
  });

  it('should convert filter query node with OR operator between two filters to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      or(attribute('source', equals('Francil-in')), attribute('deduplicated', equals(true)))
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source', '#01': 'deduplicated' },
      ExpressionAttributeValues: { ':00': 'Francil-in', ':01': 'true' },
      FilterExpression: '#00 = :00 or #01 = :01'
    });
  });

  it('should convert filter query node with filter containing object with single attribute to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('adresse', equals({ commune: 'Paris' }))
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'adresse' },
      ExpressionAttributeValues: { ':00': 'Paris' },
      FilterExpression: '#0.commune = :00'
    });
  });

  it('should convert filter query node with filter containing object with multiple attribute to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('adresse', equals({ commune: 'Paris', code_postal: '75002' }))
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'adresse' },
      ExpressionAttributeValues: { ':00': 'Paris', ':01': '75002' },
      FilterExpression: '(#0.commune = :00 and #0.code_postal = :01)'
    });
  });

  it('should convert filter query node with OR operator between a single attribute filter and a multiple attribute filter to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      or(
        attribute('source', equals('Francil-in')),
        attribute('deduplicated', equals(true)),
        attribute('adresse', equals({ commune: 'Paris', code_postal: '75002' }))
      )
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source', '#01': 'deduplicated', '#02': 'adresse' },
      ExpressionAttributeValues: { ':00': 'Francil-in', ':01': 'true', ':020': 'Paris', ':021': '75002' },
      FilterExpression: '#00 = :00 or #01 = :01 or (#02.commune = :020 and #02.code_postal = :021)'
    });
  });

  it('should convert filter query node with OR operator between a single attribute filter and a nested AND operator to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      or(
        attribute('source', equals('Francil-in')),
        and(attribute('adresse', equals({ commune: 'Paris' })), attribute('adresse', equals({ code_postal: '75002' }))),
        attribute('deduplicated', equals(true))
      )
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source', '#010': 'adresse', '#011': 'adresse', '#02': 'deduplicated' },
      ExpressionAttributeValues: { ':00': 'Francil-in', ':0100': 'Paris', ':0110': '75002', ':02': 'true' },
      FilterExpression: '#00 = :00 or (#010.commune = :0100 and #011.code_postal = :0110) or #02 = :02'
    });
  });

  it('should convert filter query node with AND operator between a single attribute filter and a nested OR operator to dynamo query command expression', (): void => {
    const queryCommandExpression: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      and(
        attribute('source', equals('Francil-in')),
        or(attribute('adresse', equals({ commune: 'Paris' })), attribute('adresse', equals({ code_postal: '75002' }))),
        attribute('deduplicated', equals(true))
      )
    );

    expect(queryCommandExpression).toStrictEqual({
      ExpressionAttributeNames: { '#00': 'source', '#010': 'adresse', '#011': 'adresse', '#02': 'deduplicated' },
      ExpressionAttributeValues: { ':00': 'Francil-in', ':0100': 'Paris', ':0110': '75002', ':02': 'true' },
      FilterExpression: '#00 = :00 and (#010.commune = :0100 or #011.code_postal = :0110) and #02 = :02'
    });
  });

  it('should create a filter for a field equality', (): void => {
    const filterSource: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(attribute('source', equals('Angers')));

    expect(filterSource).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source' },
      ExpressionAttributeValues: { ':0': 'Angers' },
      FilterExpression: '#0 = :0'
    });
  });

  it('should create a filter for a field that do not exists', (): void => {
    const filterSource: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(attributeNotExists('source'));

    expect(filterSource).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source' },
      FilterExpression: `attribute_not_exists(#0)`
    });
  });

  it('should create a filter for a field that exists', (): void => {
    const filterSource: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(attributeExists('source'));

    expect(filterSource).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source' },
      FilterExpression: `attribute_exists(#0)`
    });
  });

  it('should create a filter for a field that begins with a substring', (): void => {
    const filterCodeInsee: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('adresse', beginWith({ code_insee: '49' }))
    );

    expect(filterCodeInsee).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'adresse' },
      ExpressionAttributeValues: { ':00': '49' },
      FilterExpression: 'begins_with(#0.code_insee, :00)'
    });
  });

  it('should create a filter for a field that combines equality and begins with a substring', (): void => {
    const filterSourceAndCodeInsee: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('source', equals('Angers')),
      attribute('adresse', beginWith({ code_insee: '49' }))
    );

    expect(filterSourceAndCodeInsee).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source', '#1': 'adresse' },
      ExpressionAttributeValues: { ':0': 'Angers', ':10': '49' },
      FilterExpression: '#0 = :0 and begins_with(#1.code_insee, :10)'
    });
  });

  it('should create a filter for a field that combines multiple begins with for the same object', (): void => {
    const filterSourceAndCodeInsee: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>(
      attribute('adresse', beginWith({ code_insee: '49', code_postal: '76' }))
    );

    expect(filterSourceAndCodeInsee).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'adresse' },
      ExpressionAttributeValues: { ':00': '49', ':01': '76' },
      FilterExpression: '(begins_with(#0.code_insee, :00) and begins_with(#0.code_postal, :01))'
    });
  });
});
