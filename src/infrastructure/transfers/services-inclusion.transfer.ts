import { SchemaServiceDataInclusion, toSchemaServiceDataInclusion } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuInclusionNumeriqueStorage, toStringDateMaj } from '../storage';

/**
 * @openapi
 * components:
 *   schemas:
 *     ServiceDataInclusion:
 *       required:
 *         - id
 *         - source
 *         - nom
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Ce champ renseigne un identifiant local pour la service dans le jeu de donnée considéré. La valeur de ce champ est relative à l'endroit où la donnée est stockée (fichier, base de donnée, etc.) et permet d'identifier de manière unique au sein de cette source.
 *         structure_id:
 *           type: string
 *           description: Ce champ contient l'identifiant local (`id`) de la structure proposant le service.
 *         source:
 *           type: string
 *           description: La valeur de ce champ indique la source de données où les données de ce service ont été saisies. Le couple `structure_id` + `source` permet de retrouver la structure.
 *         nom:
 *           type: string
 *           description: un nom pour le service considéré rendu par la structure. Il n'est pas nécessaire d'indiquer à nouveau le nom de la structure.
 *           example: "Accompagnement dans les démarches administratives"
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
export type ServicesInclusionTransfer = SchemaServiceDataInclusion & { group?: string; mergedIds?: string[] };

export const toSchemaServicesDataInclusionWithGroups = (lieux: LieuInclusionNumeriqueStorage[]) =>
  lieux.map(
    (lieu: LieuInclusionNumeriqueStorage): ServicesInclusionTransfer => ({
      ...toSchemaServiceDataInclusion(toStringDateMaj(lieu)),
      ...(lieu.group == null ? {} : { group: lieu.group }),
      ...(lieu.mergedIds == null ? {} : { mergedIds: lieu.mergedIds })
    })
  );
