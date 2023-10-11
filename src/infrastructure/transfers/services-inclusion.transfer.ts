import { SchemaServiceDataInclusion } from '@gouvfr-anct/lieux-de-mediation-numerique';

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
 *           example : "Accompagnement dans les démarches administratives"
 */
export type ServicesInclusionTransfer = SchemaServiceDataInclusion;
