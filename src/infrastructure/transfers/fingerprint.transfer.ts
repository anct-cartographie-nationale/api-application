import { LieuInclusionNumeriqueStorage } from '../storage';

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
export interface WriteFingerprintTransfer {
  sourceId: string;
  source: string;
  hash: string;
}

export interface ReadFingerprintTransfer {
  sourceId: string;
  hash: string;
}

const onlyCompeteFingerprintTransfer = (
  fingerprint: Partial<ReadFingerprintTransfer>
): fingerprint is ReadFingerprintTransfer => fingerprint.hash != null && fingerprint.sourceId != null;

export const fromLieuxInclusionNumeriqueStorage = (lieux: LieuInclusionNumeriqueStorage[]): ReadFingerprintTransfer[] =>
  lieux
    .map(
      (lieu: LieuInclusionNumeriqueStorage): Partial<ReadFingerprintTransfer> => ({
        ...(lieu.hash ? { hash: lieu.hash } : {}),
        ...(lieu.sourceId ? { sourceId: lieu.sourceId } : {})
      })
    )
    .filter(onlyCompeteFingerprintTransfer);
