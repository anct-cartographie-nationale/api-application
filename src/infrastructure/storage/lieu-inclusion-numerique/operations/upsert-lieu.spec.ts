import { describe, expect, it } from 'vitest';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';
import { Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { idForLieu } from './upsert-lieu';

describe('upsert lieu', (): void => {
  it('should build id form source and source id', (): void => {
    const lieu: LieuInclusionNumeriqueStorage = {
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
    };

    const id: string = idForLieu(lieu);

    expect(id).toBe('Hubik@75535fc4-981d-4320-9548-494ea6e4e7f7');
  });

  it('should use original id for merged lieux', (): void => {
    const lieu: LieuInclusionNumeriqueStorage = {
      id: Id('Hubik@75535fc4-981d-4320-9548-494ea6e4e7f7|Aidants-Connect@fa1565af16a51'),
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
      group: 'dcc68ccf2633cb238db21d87ddb9607309d34e091de992b63766c26886f764de',
      mergedIds: ['c2616e75-a870-5432-84e1-9242541d980c', 'dba6f39f-1cc2-58d4-8e5a-c784a998aac6']
    };

    const id: string = idForLieu(lieu);

    expect(id).toBe('Hubik@75535fc4-981d-4320-9548-494ea6e4e7f7|Aidants-Connect@fa1565af16a51');
  });

  it('should keep id when lieu has merged ids', (): void => {
    const lieu: LieuInclusionNumeriqueStorage = {
      id: Id('merge between A and B'),
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
      mergedIds: ['A', 'B']
    };

    const id: string = idForLieu(lieu);

    expect(id).toBe('merge between A and B');
  });
});
