import { LieuInclusionNumeriqueStorage } from '../storage';

/**
 * @openapi
 * components:
 *   schemas:
 *     Fingerprint:
 *       required:
 *         - sourceId
 *         - source
 *       type: object
 *       properties:
 *         sourceId:
 *           type: string
 *           description: Identifiant original dans la source.
 *           example: 42
 *         hash:
 *           type: string
 *           description: Hash correspondant à la donnée originale associée à l'id dans la source originale.
 *           example: 39839892cbee68669c74545d3e868f04ecc22a19b0e8567410a47661c2464333
 */
export interface FingerprintTransfer {
  sourceId: string;
  hash?: string;
}

const onlyCompeteFingerprintTransfer = (fingerprint: Partial<FingerprintTransfer>): fingerprint is FingerprintTransfer =>
  fingerprint.sourceId != null;

export const fromLieuxInclusionNumeriqueStorage = (lieux: LieuInclusionNumeriqueStorage[]): FingerprintTransfer[] =>
  lieux
    .map(
      (lieu: LieuInclusionNumeriqueStorage): Partial<FingerprintTransfer> => ({
        ...(lieu.hash ? { hash: lieu.hash } : {}),
        ...(lieu.sourceId ? { sourceId: lieu.sourceId } : {})
      })
    )
    .filter(onlyCompeteFingerprintTransfer);
