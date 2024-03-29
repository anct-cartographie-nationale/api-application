import { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';

export const toISOStringDateMaj = (lieuInclusionNumerique: LieuMediationNumerique): LieuInclusionNumeriqueStorage => ({
  ...lieuInclusionNumerique,
  date_maj: lieuInclusionNumerique.date_maj.toISOString()
});

export const toStringDateMaj = (lieuInclusionNumeriqueStorage: LieuInclusionNumeriqueStorage): LieuMediationNumerique => ({
  ...lieuInclusionNumeriqueStorage,
  date_maj: new Date(lieuInclusionNumeriqueStorage.date_maj)
});
