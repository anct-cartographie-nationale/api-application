import { describe, expect, it } from 'vitest';
import { LieuMediationNumerique, Adresse, Id, Nom, Pivot, Service, Services } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { ReassignedId, reassignId } from './reassign-id';

describe('reassign id', (): void => {
  it('should backup existing id as sourceId and reassign id', (): void => {
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

    const lieuInclusionNumeriqueUpdated: ReassignedId<LieuMediationNumerique> = reassignId(
      lieuInclusionNumerique,
      Id('00d1854b-9235-4867-bdec-2414664d7ec7')
    );

    expect(lieuInclusionNumeriqueUpdated).toStrictEqual<ReassignedId<LieuMediationNumerique>>({
      id: Id('00d1854b-9235-4867-bdec-2414664d7ec7'),
      nom: Nom('Anonymal'),
      pivot: Pivot('55217862900132'),
      adresse: Adresse({
        commune: 'Reims',
        code_postal: '51100',
        voie: '12 BIS RUE DE LECLERCQ'
      }),
      date_maj: new Date('2022-06-02'),
      services: Services([Service.CreerAvecLeNumerique]),
      sourceId: Id('42')
    });
  });
});
