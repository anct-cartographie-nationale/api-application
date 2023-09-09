type Typologie =
  | 'ACI'
  | 'ACIPHC'
  | 'AFPA'
  | 'AI'
  | 'ASE'
  | 'ASSO'
  | 'ASSO_CHOMEUR'
  | 'Autre'
  | 'BIB'
  | 'CAARUD'
  | 'CADA'
  | 'CAF'
  | 'CAP_EMPLOI'
  | 'CAVA'
  | 'CC'
  | 'CCAS'
  | 'CCONS'
  | 'CD'
  | 'CHRS'
  | 'CHU';

/**
 * @openapi
 * components:
 *   schemas:
 *     LieuMediationNumerique:
 *       required:
 *         - id
 *         - nom
 *         - commune
 *         - code_postal
 *         - code_insee
 *         - adresse
 *         - services
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: |
 *             Identifiant unique du lieu dans une des deux bases de référence : \
 *             - le répertoire SIRENE des entreprises et de leurs établissements de l’Insee \
 *             - le Répertoire national des associations du ministère de l’intérieur (RNA) \
 *             Pour chaque lieu est indiqué soit le code SIRET du lieu récupérable via https://annuaire-entreprises.data.gouv.fr soit le numéro RNA (Répertoire National des Associations) du lieu récupérable via https://journal-officiel.gouv.fr/pages/associations-recherche/.
 *           example: 43493312300029
 *         nom:
 *           type: string
 *           description: nom du lieu de médiation numérique.
 *           example: Anonymal
 *         commune:
 *           type: string
 *           description: nom de la commune rattachée à l’adresse du lieu.
 *           example: Reims
 *         code_postal:
 *           type: string
 *           description: code postale rattaché à l’adresse du lieu.
 *           example: 51100
 *         code_insee:
 *           type: string
 *           description: code officiel géographique de la commune rattachée à l’adresse du lieu.
 *           example: 51454
 *         adresse:
 *           type: string
 *           description: Éléments de l’adresse du lieu relatifs à la voie. Typiquement, <numero_voie> <indice_de_repetition> <type_voie> <libelle_voie>.
 *           example: 12 BIS RUE DE LECLERCQ
 *         complement_adresse:
 *           type: string
 *           description: Précision de l’adresse et la situation exactes du lieu, afin d’en permettre l’accès aux usagers. Cela peut être un numéro d’appartement, un étage, un lieu-dit, etc.
 *           example: Le patio du bois de l’Aulne
 *         latitude:
 *           type: number
 *           description: Latitude du lieu, dans le système WGS84 (GPS), typiquement issue du géocodage de son adresse et pouvant servir à la localiser.
 *           example: 43.52609
 *         longitude:
 *           type: number
 *           description: Longitude du lieu, dans le système WGS84 (GPS), typiquement issue du géocodage de son adresse et pouvant servir à la localiser.
 *           example: 5.41423
 *         typologie:
 *           type: string
 *           enum: [ACI, ACIPHC, AFPA, AI, ASE, ASSO, ASSO_CHOMEUR, Autre, BIB, CAARUD, CADA, CAF, CAP_EMPLOI, CAVA, CC, CCAS, CCONS, CD, CHRS, CHU]
 *           description: Type du lieu, les valeurs possibles sont restreintes au vocabulaire décrivant les types de structures (https://www.data.inclusion.beta.gouv.fr/schemas-de-donnees-de-loffre/schema-des-structures-dinsertion/typologies-de-structure).
 *           example: ACIPHC
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone du lieu.
 *           example: 01 80 05 98 80
 *         courriel:
 *           type: string
 *           description: Adresse email générique de contact du lieu.
 *           example: contact@laquincaillerie.tl
 *         site_web:
 *           type: string
 *           description: URL vers le site internet du lieu.
 *           example: https://www.laquincaillerie.tl/
 *         horaires:
 *           type: string
 *           description: Les jours et horaires d’ouverture du lieu, en respectant le format proposé par OpenStreetMap (https://wiki.openstreetmap.org/wiki/FR:Key:opening_hours).
 *           example: Mo-Fr 09:00-12:00,14:00-18:30; Sa 08:30-12:00
 *         presentation_resume:
 *           type: string
 *           description: Courte description du lieu.
 *           example: Notre association propose des formations aux outils numériques à destination des personnes âgées.
 *         presentation_detail:
 *           type: string
 *           description: Description détaillée du lieu. Il est par exemple possible de préciser si des aidants sont itinérants.
 *           example: Notre parcours d’initiation permet l’acquisition de compétences numériques de base. Nous proposons également un accompagnement à destination des personnes déjà initiées qui souhaiteraient approfondir leurs connaissances. Du matériel informatique est en libre accès pour nos adhérents tous les après-midis. En plus de d’accueillir les personnes dans notre lieu en semaine (sur rendez-vous), nous assurons une permanence le samedi matin dans la médiathèque XX.
 *         source:
 *           type: string
 *           description: Indique la structure qui a collecté les données sur le lieu. Cela peut être la structure elle-même ou une structure tierce (une collectivité territoriale, un réseau de médiation numérique…).
 *           example: Hubik
 *         structure_parente:
 *           type: string
 *           description: Décrit le réseau/la structure auquel le lieu appartient. Pour le remplir, indiquer le SIREN de cette entité, qui permet de décrire l’entité juridique plutôt que l’établissement.
 *           example: 130005481
 *         date_maj:
 *           type: string
 *           format: date
 *           description: Date à laquelle la donnée considérée a été mise à jour. Il respecte le format ISO 8601 (année-mois-jour).
 *           example: 2022-06-02
 *         services:
 *           type: string
 *           description: |
 *             Types d’accompagnement proposés dans l’offre du lieu. \
 *             Valeurs possibles : \
 *             - Gagner en autonomie dans les démarches administratives \
 *             - Etre accompagné dans les démarches administratives \
 *             - Prendre en main un smartphone ou une tablette \
 *             - Prendre en main un ordinateur \
 *             - Utiliser le numérique au quotidien \
 *             - Approfondir ma culture numérique \
 *             - Favoriser mon insertion professionnelle \
 *             - Accéder à une connexion internet \
 *             - Accéder à du matériel \
 *             - Créer et développer mon entreprise
 *           example: Gagner en autonomie dans les démarches administratives, Etre accompagné dans les démarches administratives, Prendre en main un smartphone ou une tablette, Prendre en main un ordinateur, Utiliser le numérique au quotidien, Approfondir ma culture numérique
 *         publics_accueillis:
 *           type: string
 *           description: |
 *             Les types de publics que le lieu est en mesure d’accueillir. \
 *             Valeurs possibles : \
 *             - Seniors (+ 65 ans) \
 *             - Familles/enfants \
 *             - Adultes \
 *             - Jeunes (16-26 ans) \
 *             - Public langues étrangères \
 *             - Déficience visuelle \
 *             - Surdité \
 *             - Handicaps psychiques : troubles psychiatriques donnant lieu à des atteintes comportementales \
 *             - Handicaps mentaux : déficiences limitant les activités d’une personne \
 *             - Uniquement femmes \
 *             - Personnes en situation d’illettrisme
 *           example: Familles/enfants, Adultes, Déficience visuelle
 *         conditions_acces:
 *           type: string
 *           description: |
 *             Conditions d’accès au lieu. \
 *             Valeurs possibles : \
 *             - Gratuit \
 *             - Gratuit sous condition \
 *             - Payant \
 *             - Adhésion
 *           example: Payant, Gratuit sous condition
 *         labels_nationaux:
 *           type: string
 *           description: |
 *             Le ou les labels nationaux obtenus par le lieu. \
 *             Valeurs possibles : \
 *             - France Services \
 *             - APTIC \
 *             - Aidants Connect \
 *             - Fabriques de Territoire
 *             - Grandes écoles du numérique
 *             - Point relais CAF
 *             - Relais pôle emploi
 *             - French Tech
 *             - Campus connecté
 *           example: France Services, APTIC, Point relais CAF
 *         labels_autres:
 *           type: string
 *           description: |
 *             Types d’accompagnement proposés par le lieu. \
 *             Valeurs possibles : \
 *             - Seul \
 *             - Avec de l’aide \
 *             - Dans un atelier \
 *             - A ma place
 *           example: SudLabs, Nièvre médiation numérique
 *         modalites_accompagnement:
 *           type: string
 *           description: Le ou les autres labels (régionaux, locaux…) obtenus par le lieu.
 *           example: Seul, Avec de l’aide
 *         accessibilite:
 *           type: string
 *           description: URL renvoyant vers le profil Acceslibre du lieu (https://acceslibre.beta.gouv.fr/).
 *           example: https://acceslibre.beta.gouv.fr/app/29-lampaul-plouarzel/a/bibliotheque-mediatheque/erp/mediatheque-13/
 *         prise_rdv:
 *           type: string
 *           description: URL renvoyant vers le site de prise de rendez-vous en ligne avec les aidants du lieu.
 *           example: https://www.rdv-solidarites.fr/
 */
export interface LieuxMediationNumeriqueTransfer {
  id: string;
  nom: string;
  commune: string;
  code_postal: string;
  code_insee: string;
  adresse: string;
  complement_adresse?: string;
  latitude?: number;
  longitude?: number;
  typologie?: Typologie;
  telephone?: string;
  courriel?: string;
  site_web?: string;
  horaires?: string;
  presentation_resume?: string;
  presentation_detail?: string;
  source?: string;
  structure_parente?: string;
  date_maj?: string;
  services: string;
  publics_accueillis?: string;
  conditions_acces?: string;
  labels_nationaux?: string;
  labels_autres?: string;
  modalites_accompagnement?: string;
  accessibilite?: string;
  prise_rdv?: string;
}
