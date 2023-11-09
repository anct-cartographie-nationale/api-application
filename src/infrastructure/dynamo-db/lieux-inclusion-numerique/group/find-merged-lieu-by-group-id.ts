import { MergedLieuInclusionNumeriqueStorage } from '../../../storage';
import { scanAll } from '../../scan-all';
import { attribute, attributeExists, equals, filter } from '../../filter';

export const findMergedLieuByGroupId = async (groupId: string): Promise<MergedLieuInclusionNumeriqueStorage | undefined> =>
  (
    await scanAll<MergedLieuInclusionNumeriqueStorage>(
      'cartographie-nationale.lieux-inclusion-numerique',
      filter<MergedLieuInclusionNumeriqueStorage>(attributeExists('mergedIds'), attribute('group', equals(groupId)))
    )
  ).at(0);
