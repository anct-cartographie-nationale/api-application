import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../../storage';
import { QueryCommandExpression } from './query-command';
import { attributeNotExists, attribute, filter, filterFromParsedQueryString, attributeExists } from './filter';
import { beginWith, equals } from './operators';

describe('filter configuration for dynamodb scan command', (): void => {
  it('should filter nothing', (): void => {
    const filterSource: QueryCommandExpression = filter<LieuInclusionNumeriqueStorage>();

    expect(filterSource).toStrictEqual({});
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
      FilterExpression: 'begins_with(#0.code_insee, :00) and begins_with(#0.code_postal, :01)'
    });
  });

  it('should generate filter from JSON:API query string with eq and startswith from query string', (): void => {
    const filterSourceAndCodeInsee: QueryCommandExpression = filterFromParsedQueryString<LieuInclusionNumeriqueStorage>({
      source: { eq: 'Angers' },
      adresse: { startswith: { code_insee: '49' } }
    });

    expect(filterSourceAndCodeInsee).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source', '#1': 'adresse' },
      ExpressionAttributeValues: { ':0': 'Angers', ':10': '49' },
      FilterExpression: '#0 = :0 and begins_with(#1.code_insee, :10)'
    });
  });

  it('should generate filter from JSON:API query string with exists from query string set to false', (): void => {
    const filterSource: QueryCommandExpression = filterFromParsedQueryString<LieuInclusionNumeriqueStorage>({
      source: { exists: false }
    });

    expect(filterSource).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source' },
      FilterExpression: `attribute_not_exists(#0)`
    });
  });

  it('should generate filter from JSON:API query string with exists from query string set to true', (): void => {
    const filterSource: QueryCommandExpression = filterFromParsedQueryString<LieuInclusionNumeriqueStorage>({
      source: { exists: true }
    });

    expect(filterSource).toStrictEqual({
      ExpressionAttributeNames: { '#0': 'source' },
      FilterExpression: `attribute_exists(#0)`
    });
  });
});
