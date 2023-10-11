import { Id } from '@gouvfr-anct/lieux-de-mediation-numerique';

export type ReassignedId<T> = T & { sourceId: Id };

export const reassignId = <T extends { id: Id }>(source: T, id: Id): ReassignedId<T> => ({
  ...source,
  id: Id(id),
  sourceId: Id(source.id)
});
