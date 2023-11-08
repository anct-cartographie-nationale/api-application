import { describe, expect, it } from 'vitest';
import { MergeGroupTransfer, mergeGroupTransferFormLieux } from './merge-group.transfer';
import { MergedLieuInclusionNumeriqueStorage } from '../storage';
import { Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';

describe('merge group transfer', (): void => {
  it('should get merge group transfer form lieux', (): void => {
    const lieux: MergedLieuInclusionNumeriqueStorage[] = [
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
        sourceId: Id('structure-1'),
        group: 'dcc68ccf2633cb238db21d87ddb9607309d34e091de992b63766c26886f764de',
        mergedIds: ['c2616e75-a870-5432-84e1-9242541d980c', 'dba6f39f-1cc2-58d4-8e5a-c784a998aac6'],
        deduplicated: true
      }
    ];

    const mergeGroupTransfer: MergeGroupTransfer[] = mergeGroupTransferFormLieux(lieux);

    expect<MergeGroupTransfer[]>(mergeGroupTransfer).toStrictEqual([
      {
        groupId: 'dcc68ccf2633cb238db21d87ddb9607309d34e091de992b63766c26886f764de',
        mergedIds: ['c2616e75-a870-5432-84e1-9242541d980c', 'dba6f39f-1cc2-58d4-8e5a-c784a998aac6'],
        lieu: {
          adresse: '12 BIS RUE DE LECLERCQ',
          code_postal: '51100',
          commune: 'Reims',
          date_maj: '2022-06-02',
          id: '75535fc4-981d-4320-9548-494ea6e4e7f7',
          nom: 'Anonymal',
          pivot: '43493312300029',
          services: 'Accéder à du matériel',
          source: 'Hubik'
        }
      }
    ]);
  });
});
