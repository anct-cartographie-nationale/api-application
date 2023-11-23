import { SchemaStructureDataInclusion, toSchemaStructureDataInclusion } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuInclusionNumeriqueStorage, toStringDateMaj } from '../storage';

/**
 * @openapi
 * components:
 *   schemas:
 *     StructureDataInclusion:
 *       required:
 *         - id
 *         - nom
 *         - commune
 *         - code_postal
 *         - adresse
 *         - antenne
 *         - date_maj
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Ce champ renseigne un identifiant pour la structure dans le jeu de donnée considéré. La valeur de ce champ est relative à l'endroit où la donnée est stockée (sa valeur peut être différente d'une base à l'autre).
 *           example: c96d4cd8-afa6-4f66-ad2a-f76a60173b38
 *         siret:
 *           type: string
 *           description: Ce champ contient le code SIRET de la structure, issu de la base SIRENE des entreprises et récupérable via [https://annuaire-entreprises.data.gouv.fr/](https://annuaire-entreprises.data.gouv.fr/)
 *         rna:
 *           type: string
 *           description: Ce champ contient le numéro RNA (Répertoire National des Associations [cf](https://www.journal-officiel.gouv.fr/pages/associations-recherche/)) de la structure.
 *         nom:
 *           type: string
 *           description: Ce champ contient le nom de la structure.
 *         commune:
 *           type: string
 *           description: Ce champ contient le nom de la commune rattachée à l'adresse de la structure.
 *         code_postal:
 *           type: string
 *           description: Ce champ contient le code postale rattaché à l'adresse de la structure.
 *         adresse:
 *           type: string
 *           description: Ce champ contient les éléments de l'adresse de la structure relatifs à la voie.
 *           example: 20 Avenue de Ségur
 *         antenne:
 *           type: boolean
 *           description:  La valeur de ce champs indique si la structure est une antenne. Il peut exister plusieurs antennes pour un même siret (ou rna), contrairement à une structure "classique" qui devrait être unique pour une source donnée.
 *         date_maj:
 *           type: string
 *           description: Ce champ contient la date, et optionnellement l'heure, à laquelle la donnée a été mise à jour.
 *           example: 2022-04-28
 *         group:
 *           type: string
 *           description: l'identifiant de groupe de fusion, il est unique pour chaque groupe de lieux impliqués dans une même fusion, les lieux résultants d'une fusion portent également cet identifiant.
 *           example: "7fccf16ccd9d0d3ca7e9ddae7a0d378ea8699725b1f81e3ae20ccdc3d7883e3c"
 *         mergedIds:
 *           type: array
 *           items:
 *             description: Identifiants des lieux impliqués dans la fusion qui a conduit à la création de ce lieu.
 *             type: string
 *             example: "2abb32679ec9a9e60f7d4288c761aa58d0c35efcac21713e1445adc8d8bba7ab"
 */
export type StructuresInclusionTransfer = SchemaStructureDataInclusion;

export const toSchemaStructuresDataInclusionWithGroups = (
  lieux: LieuInclusionNumeriqueStorage[]
): StructuresInclusionTransfer[] =>
  lieux.map(
    (lieu: LieuInclusionNumeriqueStorage): StructuresInclusionTransfer => ({
      ...toSchemaStructureDataInclusion(toStringDateMaj(lieu)),
      ...(lieu.group == null ? {} : { group: lieu.group }),
      ...(lieu.mergedIds == null ? {} : { mergedIds: lieu.mergedIds })
    })
  );
