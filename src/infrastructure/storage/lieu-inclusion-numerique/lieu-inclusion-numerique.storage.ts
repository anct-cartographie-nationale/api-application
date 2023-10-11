import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { ReassignedId } from '../reassign-id/reassign-id';

export type ISOStringDateMaj<T> = Omit<T, 'date_maj'> & { date_maj: string };

export type LieuInclusionNumeriqueStorage = ReassignedId<ISOStringDateMaj<LieuMediationNumerique>>;

export const toISOStringDateMaj = (lieuInclusionNumerique: LieuMediationNumerique): LieuInclusionNumeriqueStorage => ({
  ...lieuInclusionNumerique,
  date_maj: lieuInclusionNumerique.date_maj.toISOString()
});