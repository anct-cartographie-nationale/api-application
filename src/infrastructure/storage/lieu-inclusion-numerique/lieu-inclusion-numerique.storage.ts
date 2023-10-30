import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { ReassignedId } from '../reassign-id/reassign-id';

export type ISOStringDateMaj<T> = Omit<T, 'date_maj'> & { date_maj: string };

type MergeGroup = {
  group?: string;
  mergedIds?: string[];
};

export type LieuInclusionNumeriqueStorage = ReassignedId<ISOStringDateMaj<LieuMediationNumerique>> &
  MergeGroup & { hash?: string };
