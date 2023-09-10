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
 *         - adresse
 *         - date_maj
 *         - services
 *         - pivot
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Identifiant unique local. Le producteur de donnée le génère librement selon sa méthode. Il peut par exemple s’agir d’une suite de lettres et/ou de chiffres, ou d’un [UUID (universal unique identifier) produit aléatoirement](https://www.uuidgenerator.net/)
 *           example: 105c8bcd-e977-4180-a895-96b6a6c688c0
 *         nom:
 *           type: string
 *           description: Nom du lieu d'inclusion numérique.
 *           example: Anonymal
 *         commune:
 *           type: string
 *           description: Nom de la commune rattachée à l’adresse du lieu.
 *           example: Reims
 *         code_postal:
 *           type: string
 *           description: Code postal rattaché à l’adresse du lieu.
 *           example: 51100
 *         code_insee:
 *           type: string
 *           description: Code officiel géographique de la commune rattachée à l’adresse du lieu.
 *           example: 51454
 *         adresse:
 *           type: string
 *           description: Éléments de l’adresse du lieu relatifs à la voie. Typiquement, <numero_voie> <indice_de_repetition> <type_voie> <libelle_voie>.
 *           example: 12 BIS RUE DE LECLERCQ
 *         complement_adresse:
 *           type: string
 *           description: Précision de l’adresse et la situation exacte du lieu, afin d’en permettre l’accès aux usagers. Cela peut être un numéro d’appartement, un étage, un lieu-dit, etc.
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
 *           description: Type du lieu, les valeurs possibles (il est possible d’en renseigner plusieurs) sont restreintes au [vocabulaire décrivant les types de structures défini par data.inclusion](https://www.data.inclusion.beta.gouv.fr/schemas-de-donnees-de-loffre/schema-des-structures-dinsertion/typologies-de-structure).
 *           example: CCAS;RFS
 *         telephone:
 *           type: string
 *           description: Numéro de téléphone du lieu.
 *           example: +33180059880
 *         courriel:
 *           type: string
 *           description: Adresse email générique de contact du lieu.
 *           example: contact@laquincaillerie.tl
 *         site_web:
 *           type: string
 *           description: Une ou plusieurs URL vers le site internet du lieu et/ou les réseaux sociaux.
 *           example: https://www.laquincaillerie.tl/;https://m.facebook.com/laquincaillerienumerique/
 *         horaires:
 *           type: string
 *           description: Les jours et horaires d’ouverture du lieu, en respectant le format proposé par [OpenStreetMap](https://wiki.openstreetmap.org/wiki/FR:Key:opening_hours).
 *           example: Mo-Fr 09:00-12:00,14:00-18:30; Sa 08:30-12:00
 *         presentation_resume:
 *           type: string
 *           description: Courte description du lieu (500 caractères maximum).
 *           example: Notre association propose des formations aux outils numériques à destination des personnes âgées.
 *         presentation_detail:
 *           type: string
 *           description: Description plus détaillée du lieu. Il est par exemple possible de préciser si des aidants sont itinérants.
 *           example: Notre parcours d’initiation permet l’acquisition de compétences numériques de base. Nous proposons également un accompagnement à destination des personnes déjà initiées qui souhaiteraient approfondir leurs connaissances. Du matériel informatique est en libre accès pour nos adhérents tous les après-midis. En plus de d’accueillir les personnes dans notre lieu en semaine (sur rendez-vous), nous assurons une permanence le samedi matin dans la médiathèque XX.
 *         source:
 *           type: string
 *           description: Indique la structure qui a collecté les données sur le lieu. Cela peut être la structure elle-même ou une structure tierce (une collectivité territoriale, un réseau de médiation numérique…)
 *           example: Hubikoop
 *         structure_parente:
 *           type: string
 *           description: Décrit le réseau/la structure auquel le lieu appartient. Pour le remplir, indiquer le nom de cette entité.
 *           example: Pôle emploi
 *         date_maj:
 *           type: string
 *           format: date
 *           description: Date à laquelle la donnée considérée a été mise à jour. Il respecte le format ISO 8601 (année-mois-jour).
 *           example: 2022-06-02
 *         services:
 *           type: string
 *           description: |
 *             Types d’accompagnement proposés dans l’offre du lieu.
 *             Valeurs possibles :
 *             - Devenir autonome dans les démarches administratives
 *             - Réaliser des démarches administratives avec un accompagnement
 *             - Prendre en main un smartphone ou une tablette
 *             - Prendre en main un ordinateur
 *             - Utiliser le numérique au quotidien
 *             - Approfondir ma culture numérique
 *             - Favoriser mon insertion professionnelle
 *             - Accéder à une connexion internet
 *             - Accéder à du matériel
 *             - S’équiper en matériel informatique
 *             - Créer et développer mon entreprise
 *             - Créer avec le numérique
 *             - Accompagner les démarches de santé
 *             - Promouvoir la citoyenneté numérique
 *             - Soutenir la parentalité et l’éducation avec le numérique
 *           example: Devenir autonome dans les démarches administratives;Réaliser des démarches administratives avec un accompagnement;Prendre en main un smartphone ou une tablette;Prendre en main un ordinateur;Utiliser le numérique au quotidien;Approfondir ma culture numérique;Favoriser mon insertion professionnelle;Accéder à une connexion internet;Accéder à du matériel
 *         publics_accueillis:
 *           type: string
 *           description: |
 *             Les types de publics que le lieu est en mesure d’accueillir.
 *             Valeurs possibles :
 *             - Seniors (+ 65 ans)
 *             - Familles/enfants
 *             - Adultes
 *             - Jeunes (16-26 ans)
 *             - Public langues étrangères
 *             - Déficience visuelle
 *             - Surdité
 *             - Handicaps psychiques : troubles psychiatriques donnant lieu à des atteintes comportementales
 *             - Handicaps mentaux : déficiences limitant les activités d’une personne
 *             - Uniquement femmes
 *             - Personnes en situation d’illettrisme
 *           example: Familles/enfants;Adultes;Déficience visuelle
 *         conditions_acces:
 *           type: string
 *           description: |
 *             Conditions financières d’accès au lieu.
 *             Valeurs possibles :
 *             - Gratuit
 *             - Gratuit sous condition
 *             - Payant
 *             - Adhésion
 *             - Accepte le Pass numérique
 *           example: Payant;Accepte le Pass numérique
 *         labels_nationaux:
 *           type: string
 *           description: |
 *             Labels nationaux obtenus par le lieu.
 *             Valeurs possibles :
 *             - France Services
 *             - CNFS
 *             - APTIC
 *             - Aidants Connect
 *             - Fabriques de Territoire
 *             - Grandes écoles du numérique
 *             - Point relais CAF
 *             - Point numérique CAF
 *             - Relais pôle emploi
 *             - French Tech
 *             - Campus connecté
 *           example: France Services;APTIC;Point relais CAF
 *         labels_autres:
 *           type: string
 *           description: AAutres labels associés au lieu.
 *           example: SudLabs;Nièvre médiation numérique
 *         modalites_accompagnement:
 *           type: string
 *           description: |
 *             Types d’accompagnement proposés par le lieu.
 *             Valeurs possibles :
 *             - Seul
 *             - Avec de l’aide
 *             - Dans un atelier
 *             - A ma place
 *           example: Avec de l’aide;Seul
 *         accessibilite:
 *           type: string
 *           description: URL renvoyant vers le profil [Acceslibre](https://acceslibre.beta.gouv.fr/) du lieu.
 *           example: https://acceslibre.beta.gouv.fr/app/29-lampaul-plouarzel/a/bibliotheque-mediatheque/erp/mediatheque-13/
 *         prise_rdv:
 *           type: string
 *           description: URL renvoyant vers le site de prise de rendez-vous en ligne avec les aidants du lieu.
 *           example: https://www.rdv-solidarites.fr/
 *         pivot:
 *            type: string
 *            description: Donnée pivot provenant d’une des deux bases de référence - le répertoire SIRENE des entreprises et de leurs établissements de l’Insee ou le Répertoire national des associations du ministère de l’intérieur (RNA).
 *            example: 55217862900132
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
  pivot: string;
}
