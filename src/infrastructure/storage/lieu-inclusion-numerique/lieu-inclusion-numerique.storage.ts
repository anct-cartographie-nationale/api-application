import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { ReassignedId } from '../reassign-id/reassign-id';

export type ISOStringDateMaj<T> = Omit<T, 'date_maj'> & { date_maj: string };

type MergeInfo = {
  group: string;
  mergedIds: string[];
  deduplicated: boolean;
};

export type LieuInclusionNumeriqueStorage = ReassignedId<ISOStringDateMaj<LieuMediationNumerique>> &
  Partial<MergeInfo> & { hash?: string };

export type MergedLieuInclusionNumeriqueStorage = ReassignedId<ISOStringDateMaj<LieuMediationNumerique>> &
  MergeInfo & { hash?: string };
