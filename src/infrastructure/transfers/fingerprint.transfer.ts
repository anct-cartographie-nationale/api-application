/**
 * @openapi
 * components:
 *   schemas:
 *     Fingerprint:
 *       required:
 *         - sourceId
 *         - source
 *         - hash
 *       type: object
 *       properties:
 *         sourceId:
 *           type: string
 *           description: Identifiant original dans la source.
 *           example: 42
 *         source:
 *           type: string
 *           description: Nom de la source associée à l'id.
 *           example: Hinaura
 *         hash:
 *           type: string
 *           description: Hash correspondant à la donnée originale associée à l'id dans la source originale.
 *           example: 39839892cbee68669c74545d3e868f04ecc22a19b0e8567410a47661c2464333
 */
export interface FingerprintTransfer {
  sourceId: string;
  source: string;
  hash: string;
}
