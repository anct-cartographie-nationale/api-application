import { describe, expect, it } from 'vitest';
import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique/lib/cjs/models';
import { Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';
import { toISOStringDateMaj } from './to-iso-string-date-maj';

describe('lieu inclusion numerique storage', (): void => {
  it('should make a lieu inclusion numerique ready for storage', (): void => {
    const lieuInclusionNumerique: LieuMediationNumerique = {
      id: Id('42'),
      nom: Nom('Anonymal'),
      pivot: Pivot('55217862900132'),
      adresse: Adresse({
        commune: 'Reims',
        code_postal: '51100',
        voie: '12 BIS RUE DE LECLERCQ'
      }),
      date_maj: new Date('2022-06-02'),
      services: Services([Service.CreerAvecLeNumerique])
    };

    const lieuInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage = toISOStringDateMaj(lieuInclusionNumerique);

    expect(lieuInclusionNumeriqueStorage).toStrictEqual({
      ...lieuInclusionNumerique,
      date_maj: '2022-06-02T00:00:00.000Z'
    });
  });
});
