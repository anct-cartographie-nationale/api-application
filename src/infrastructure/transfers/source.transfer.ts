/**
 * @openapi
 * components:
 *   schemas:
 *     Source:
 *       required:
 *         - hash
 *       type: object
 *       properties:
 *         hash:
 *           type: string
 *           description: Hash correspondant au contenu du dernier ensemble de données tiré de la source originale qui a été intégré dans la liste des lieux d'inclusion numérique.
 *           example: 39839892cbee68669c74545d3e868f04ecc22a19b0e8567410a47661c2464333
 */
export interface SourceTransfer {
  hash: string;
}
