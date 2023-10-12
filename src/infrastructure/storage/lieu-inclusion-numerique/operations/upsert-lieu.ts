import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { LieuInclusionNumeriqueStorage } from '../lieu-inclusion-numerique.storage';
import { reassignId } from '../../reassign-id/reassign-id';
import { Id } from '@gouvfr-anct/lieux-de-mediation-numerique';
import { v5 as uuid } from 'uuid';

const UUID_NAMESPACE: string = '7dc3d274-abda-57fd-bd45-bf4adfeebcd3';

export const upsertLieu =
  (docClient: DynamoDBDocumentClient) =>
  (lieuInclusionNumerique: LieuInclusionNumeriqueStorage, lieuInclusionNumeriqueFound?: LieuInclusionNumeriqueStorage) =>
    docClient.send(
      new PutCommand({
        TableName: 'cartographie-nationale.lieux-inclusion-numerique',
        Item: reassignId(
          lieuInclusionNumerique,
          Id(
            lieuInclusionNumeriqueFound == undefined
              ? uuid(`${lieuInclusionNumerique.source ?? 'EMPTY_SOURCE'}:${lieuInclusionNumerique.id}`, UUID_NAMESPACE)
              : lieuInclusionNumeriqueFound.id
          )
        )
      })
    );
