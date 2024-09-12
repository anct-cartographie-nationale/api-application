import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../storage';
import { Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { ServicesInclusionTransfer, toSchemaServicesDataInclusionWithGroups } from './services-inclusion.transfer';

describe('services inclusion transfer', (): void => {
  it('should not add groups and merge ids to services inclusion transfer when not present in storage', (): void => {
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
        services: Services([Service.AccesInternetEtMaterielInformatique])
      }
    ];

    const servicesInclusionTransfer: ServicesInclusionTransfer[] =
      toSchemaServicesDataInclusionWithGroups(lieuxInclusionNumeriqueStorage);

    expect(servicesInclusionTransfer).toStrictEqual([
      {
        id: '75535fc4-981d-4320-9548-494ea6e4e7f7-mediation-numerique',
        nom: 'Médiation numérique',
        source: 'Hubik',
        structure_id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
        thematiques: ['numerique', 'numerique--acceder-a-une-connexion-internet', 'numerique--acceder-a-du-materiel']
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
        services: Services([Service.AccesInternetEtMaterielInformatique]),
        group: '7fccf16ccd9d0d3ca7e9ddae7a0d378ea8699725b1f81e3ae20ccdc3d7883e3c'
      }
    ];

    const servicesInclusionTransfer: ServicesInclusionTransfer[] =
      toSchemaServicesDataInclusionWithGroups(lieuxInclusionNumeriqueStorage);

    expect(servicesInclusionTransfer).toStrictEqual([
      {
        id: '75535fc4-981d-4320-9548-494ea6e4e7f7-mediation-numerique',
        nom: 'Médiation numérique',
        source: 'Hubik',
        structure_id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
        thematiques: ['numerique', 'numerique--acceder-a-une-connexion-internet', 'numerique--acceder-a-du-materiel'],
        group: '7fccf16ccd9d0d3ca7e9ddae7a0d378ea8699725b1f81e3ae20ccdc3d7883e3c'
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
        services: Services([Service.AccesInternetEtMaterielInformatique]),
        group: '7fccf16ccd9d0d3ca7e9ddae7a0d378ea8699725b1f81e3ae20ccdc3d7883e3c',
        mergedIds: ['e4c9a4fc-a456-5645-4844-65d461ace651', '4acf5a15-44fa-9894-8465-f489f4ac984e']
      }
    ];

    const servicesInclusionTransfer: ServicesInclusionTransfer[] =
      toSchemaServicesDataInclusionWithGroups(lieuxInclusionNumeriqueStorage);

    expect(servicesInclusionTransfer).toStrictEqual([
      {
        id: '75535fc4-981d-4320-9548-494ea6e4e7f7-mediation-numerique',
        nom: 'Médiation numérique',
        source: 'Hubik',
        structure_id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
        thematiques: ['numerique', 'numerique--acceder-a-une-connexion-internet', 'numerique--acceder-a-du-materiel'],
        group: '7fccf16ccd9d0d3ca7e9ddae7a0d378ea8699725b1f81e3ae20ccdc3d7883e3c',
        mergedIds: ['e4c9a4fc-a456-5645-4844-65d461ace651', '4acf5a15-44fa-9894-8465-f489f4ac984e']
      }
    ]);
  });
});
