import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { LieuxMediationNumeriqueTransfer } from '../../transfers';

/**
 * @openapi
 * /lieux-mediation-numerique:
 *   get:
 *     summary: Récupère la liste des lieux de médiation numérique.
 *     description: La liste des lieux de médiation numérique décrit les lieux où un médiateur numérique est présent pour proposer des services de médiation numérique, elle est définie par le schéma des données de médiation numérique.
 *     responses:
 *       200:
 *         description: La liste des lieux de médiation numérique.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LieuMediationNumerique'
 */
export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  const lieuxMediationNumerique: LieuxMediationNumeriqueTransfer[] = [
    {
      id: '43493312300029',
      nom: 'Anonymal',
      commune: 'Reims',
      code_postal: '51100',
      code_insee: '51454',
      adresse: '12 BIS RUE DE LECLERCQ',
      complement_adresse: 'Le patio du bois de l’Aulne',
      latitude: 43.52609,
      longitude: 5.41423,
      typologie: 'ACIPHC',
      telephone: '01 80 05 98 80',
      courriel: 'contact@laquincaillerie.tl',
      site_web: 'https://www.laquincaillerie.tl/',
      horaires: 'Mo-Fr 09:00-12:00,14:00-18:30; Sa 08:30-13:30',
      presentation_resumee: 'Notre association propose des formations aux outils numériques à destination des personnes âgées.',
      presentation_detail:
        'Notre parcours d’initiation permet l’acquisition de compétences numériques de base. Nous proposons également un accompagnement à destination des personnes déjà initiées qui souhaiteraient approfondir leurs connaissances. Du matériel informatique est en libre accès pour nos adhérents tous les après-midis. En plus de d’accueillir les personnes dans notre lieu en semaine (sur rendez-vous), nous assurons une permanence le samedi matin dans la médiathèque XX.',
      source: 'Hubik',
      structure_parente: '130005481',
      date_maj: '2022-06-02',
      services:
        'Gagner en autonomie dans les démarches administratives, Etre accompagné dans les démarches administratives, Prendre en main un smartphone ou une tablette, Prendre en main un ordinateur, Utiliser le numérique au quotidien, Approfondir ma culture numérique',
      publics: 'Familles/enfants, Adultes, Déficience visuelle',
      modalites_access: 'Payant, Gratuit',
      labels_nationaux: 'France Services, APTIC, Point relais CAF',
      labels_autres: 'SudLabs, Nièvre médiation numérique',
      types_accompagnement: 'Seul, Avec de l’aide',
      accessibilite: 'https://acceslibre.beta.gouv.fr/app/29-lampaul-plouarzel/a/bibliotheque-mediatheque/erp/mediatheque-13/',
      prise_rdv: 'https://www.rdv-solidarites.fr/'
    }
  ];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(lieuxMediationNumerique)
  };
};
