/**
 * @openapi
 * components:
 *   schemas:
 *     LieuMediationNumerique:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: L'identifiant unique du lieu de médiation numérique.
 *           example: 6001a35f16b08100062e415f
 *         nom:
 *           type: string
 *           description: Le nom du lieu de médiation numérique.
 *           example: Centre social du quartier de la Croix-Rousse
 *         latitude:
 *           type: number
 *           description: Latitude des coordonnés GPS du lieu de médiation numérique.
 *           example: 45.7689958
 *         longitude:
 *           type: number
 *           description: Longitude des coordonnés GPS du lieu de médiation numérique.
 *           example: 4.8343466
 */
export interface LieuxMediationNumeriqueTransfer {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
}
