import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../storage';
import { fromLieuxInclusionNumeriqueStorage, ReadFingerprintTransfer } from './fingerprint.transfer';
import { Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';

describe('fingerprint transfer', (): void => {
  it('should not map lieux inclusion numerique storage to fingerprints to transfer when hash is missing', (): void => {
    const lieux: LieuInclusionNumeriqueStorage[] = [
      {
        id: Id('75535fc4-981d-4320-9548-494ea6e4e7f7'),
        pivot: Pivot('43493312300029'),
        nom: Nom('Anonymal'),
        adresse: Adresse({
          commune: 'Reims',
          code_postal: '51100',
          voie: '12 BIS RUE DE LECLERCQ'
        }),
        source: 'Hubik',
        date_maj: new Date('2022-06-02').toISOString(),
        services: Services([Service.AccederADuMateriel]),
        sourceId: Id('structure-1')
      }
    ];

    const fingerprints: ReadFingerprintTransfer[] = fromLieuxInclusionNumeriqueStorage(lieux);

    expect(fingerprints).toStrictEqual<ReadFingerprintTransfer[]>([]);
  });

  it('should not map lieux inclusion numerique storage to fingerprints to transfer when sourceId is missing', (): void => {
    const lieux: LieuInclusionNumeriqueStorage[] = [
      {
        id: Id('75535fc4-981d-4320-9548-494ea6e4e7f7'),
        pivot: Pivot('43493312300029'),
        nom: Nom('Anonymal'),
        adresse: Adresse({
          commune: 'Reims',
          code_postal: '51100',
          voie: '12 BIS RUE DE LECLERCQ'
        }),
        source: 'Hubik',
        date_maj: new Date('2022-06-02').toISOString(),
        services: Services([Service.AccederADuMateriel]),
        hash: '08433db27ca44fffae7e47fc81ca33ad'
      }
    ];

    const fingerprints: ReadFingerprintTransfer[] = fromLieuxInclusionNumeriqueStorage(lieux);

    expect(fingerprints).toStrictEqual<ReadFingerprintTransfer[]>([]);
  });

  it('should map lieux inclusion numerique storage to fingerprints to transfer', (): void => {
    const lieux: LieuInclusionNumeriqueStorage[] = [
      {
        id: Id('75535fc4-981d-4320-9548-494ea6e4e7f7'),
        pivot: Pivot('43493312300029'),
        nom: Nom('Anonymal'),
        adresse: Adresse({
          commune: 'Reims',
          code_postal: '51100',
          voie: '12 BIS RUE DE LECLERCQ'
        }),
        source: 'Hubik',
        date_maj: new Date('2022-06-02').toISOString(),
        services: Services([Service.AccederADuMateriel]),
        hash: '08433db27ca44fffae7e47fc81ca33ad',
        sourceId: Id('structure-1')
      }
    ];

    const fingerprints: ReadFingerprintTransfer[] = fromLieuxInclusionNumeriqueStorage(lieux);

    expect(fingerprints).toStrictEqual<ReadFingerprintTransfer[]>([
      {
        hash: '08433db27ca44fffae7e47fc81ca33ad',
        sourceId: 'structure-1'
      }
    ]);
  });
});
