/**
 * @openapi
 * components:
 *   schemas:
 *     Source:
 *       required:
 *         - name
 *         - hash
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nom de la source dont les données ont été récupérées pour constituer la liste des lieux d'inclusion numérique.
 *           example: Hinaura
 *         hash:
 *           type: string
 *           description: Hash correspondant au contenu du dernier ensemble de données tiré de la source originale qui a été intégré dans la liste des lieux d'inclusion numérique.
 *           example: 39839892cbee68669c74545d3e868f04ecc22a19b0e8567410a47661c2464333
 */
export interface SourceTransfer {
  name: string;
  hash: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     SourceHash:
 *       required:
 *         - hash
 *       type: object
 *       properties:
 *         hash:
 *           type: string
 *           description: Hash correspondant au contenu du dernier ensemble de données tiré de la source originale qui a été intégré dans la liste des lieux d'inclusion numérique.
 *           example: 39839892cbee68669c74545d3e868f04ecc22a19b0e8567410a47661c2464333
 */
export interface SourceHashTransfer {
  hash: string;
}
