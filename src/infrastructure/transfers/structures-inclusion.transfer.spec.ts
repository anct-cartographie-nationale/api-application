import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../storage';
import { Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { StructuresInclusionTransfer, toSchemaStructuresDataInclusionWithGroups } from './structures-inclusion.transfer';

describe('structures inclusion transfer', (): void => {
  it('should not add groups and merge ids to structures inclusion transfer when not present in storage', (): void => {
    const lieuxInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage[] = [
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
        services: Services([Service.AccederADuMateriel])
      }
    ];

    const structuresInclusionTransfer: StructuresInclusionTransfer[] =
      toSchemaStructuresDataInclusionWithGroups(lieuxInclusionNumeriqueStorage);

    expect(structuresInclusionTransfer).toStrictEqual([
      {
        adresse: '12 BIS RUE DE LECLERCQ',
        code_postal: '51100',
        commune: 'Reims',
        date_maj: '2022-06-02T00:00:00.000Z',
        id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
        nom: 'Anonymal',
        siret: '43493312300029',
        source: 'Hubik',
        thematiques: ['numerique', 'numerique--acceder-a-du-materiel']
      }
    ]);
  });

  it('should add group to structures inclusion transfer when present in storage', (): void => {
    const lieuxInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage[] = [
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
        group: '5qs4g789s4dh98d4h8s5r44h5sd'
      }
    ];

    const structuresInclusionTransfer: StructuresInclusionTransfer[] =
      toSchemaStructuresDataInclusionWithGroups(lieuxInclusionNumeriqueStorage);

    expect(structuresInclusionTransfer).toStrictEqual([
      {
        adresse: '12 BIS RUE DE LECLERCQ',
        code_postal: '51100',
        commune: 'Reims',
        date_maj: '2022-06-02T00:00:00.000Z',
        id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
        nom: 'Anonymal',
        siret: '43493312300029',
        source: 'Hubik',
        thematiques: ['numerique', 'numerique--acceder-a-du-materiel'],
        group: '5qs4g789s4dh98d4h8s5r44h5sd'
      }
    ]);
  });

  it('should add group and merged ids to structures inclusion transfer when present in storage', (): void => {
    const lieuxInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage[] = [
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
        group: '5qs4g789s4dh98d4h8s5r44h5sd',
        mergedIds: ['e4c9a4fc-a456-5645-4844-65d461ace651', '4acf5a15-44fa-9894-8465-f489f4ac984e']
      }
    ];

    const structuresInclusionTransfer: StructuresInclusionTransfer[] =
      toSchemaStructuresDataInclusionWithGroups(lieuxInclusionNumeriqueStorage);

    expect(structuresInclusionTransfer).toStrictEqual([
      {
        adresse: '12 BIS RUE DE LECLERCQ',
        code_postal: '51100',
        commune: 'Reims',
        date_maj: '2022-06-02T00:00:00.000Z',
        id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
        nom: 'Anonymal',
        siret: '43493312300029',
        source: 'Hubik',
        thematiques: ['numerique', 'numerique--acceder-a-du-materiel'],
        group: '5qs4g789s4dh98d4h8s5r44h5sd',
        mergedIds: ['e4c9a4fc-a456-5645-4844-65d461ace651', '4acf5a15-44fa-9894-8465-f489f4ac984e']
      }
    ]);
  });
});
