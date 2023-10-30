import { SchemaLieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';

/**
 * @openapi
 * components:
 *   schemas:
 *     MergeGroup:
 *       required:
 *         - groupId
 *         - mergedIds
 *         - lieu
 *       type: object
 *       properties:
 *         groupId:
 *           type: string
 *           description: Cet identifiant du groupe correspond au hash déterminé à partir des identifiants fusionnés ordonnés.
 *           example: 74cc4cdab738fcef5c8d3a35b7dcbee355ec35b88cb4215911bd097f759223e0
 *         mergedIds:
 *           type: array
 *           items:
 *             description: Hash correspondant à la donnée originale associée à l'id dans la source originale.
 *             example: 39839892cbee68669c74545d3e868f04ecc22a19b0e8567410a47661c2464333
 *         lieu:
 *           $ref: '#/components/schemas/LieuInclusionNumerique'
 */
export type MergeGroupTransfer = {
  groupId: string;
  mergedIds: string[];
  lieu: SchemaLieuMediationNumerique;
};
