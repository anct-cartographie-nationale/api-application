import { MergeGroupTransfer } from './merge-group.transfer';

/**
 * @openapi
 * components:
 *   schemas:
 *     MergeGroupsUpdate:
 *       required:
 *         - mergeGroups
 *         - groupIdsToDelete
 *       type: object
 *       properties:
 *         mergeGroups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MergeGroupsUpdate'
 *         groupIdsToDelete:
 *           type: array
 *           items:
 *             description: Identifiant d'un groupe à supprimer.
 *             type: string
 *             example: 2abb32679ec9a9e60f7d4288c761aa58d0c35efcac21713e1445adc8d8bba7ab
 */
export type MergeGroupsUpdateTransfer = {
  mergeGroups: MergeGroupTransfer[];
  groupIdsToDelete: string[];
};
