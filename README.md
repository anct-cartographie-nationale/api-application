# API pour la cartographie nationale de l’offre de médiation numérique

## À propos

Cette API donne accès aux données de l'offre de médiation numérique destinée à un affichage dans la [cartographie nationale de l’offre de médiation numérique](https://d2pzn8br7bs1l.cloudfront.net/).

## Table des matières

- 🪧 [À propos](#à-propos)
- 📦 [Prérequis](#prérequis)
- 🚀 [Installation](#installation)
- 🛠️ [Utilisation](#utilisation)
- 🤝 [Contribution](#contribution)
- 🏗️ [Construit avec](#construit-avec)
- 🏷️ [Gestion des versions](#gestion-des-versions)
- 📝 [Licence](#licence)

## Prérequis

- [Git](https://git-scm.com/) : Système de contrôle de versions distribué d'un ensemble de fichiers
- [Node](https://nodejs.org/) : Environnement d'exécution pour Javascript
- [Yarn](https://yarnpkg.com/) : Gestionnaire de paquets pour les produits développés dans des environnements Node

> Node et Yarn peuvent être installés via [nvm](https://github.com/nvm-sh/nvm) qui permet d'obtenir et d'utiliser rapidement différentes versions de Node via la ligne de commande.

## Installation

### Installer Husky

[Husky](https://typicode.github.io/husky) est un outil de gestion des hooks git pour effectuer des tâches automatiques

Mise en place de Husky :

```bash
npx husky install
```

Rendre exécutable les fichiers qui contiennent les hooks :

```bash
chmod a+x .husky/commit-msg
chmod a+x .husky/pre-commit
```

## Utilisation

Ces commandes servent dans un contexte de développement de l'application et doivent être exécutées depuis la racine du projet.

### Construction

Exécuter `yarn build` pour construire le projet. Les fichiers de sortie sont écrits dans le dossier `dist/`.

### Test

Exécuter `yarn test` pour tester le projet.

### ESLint

Exécuter `yarn lint` pour une analyse statique des fichiers `.ts` du projet.

### Commit lint

Exécuter `yarn commitlint --from HEAD~1` pour valider la syntaxe du dernier commit.

### Prettier

Exécuter `yarn prettier-fix` pour mettre à niveau la syntaxe de l'ensemble des fichiers du projet.

### OpenAPI

Exécuter `yarn openapi` pour générer le schéma OpenAPI de l'application au format JSON.

## Contribution

### Nommage des branches

- Avant de créer une nouvelle branche de travail, récupérer les dernières modifications disponibles sur la branche `main`
- La nouvelle branche de travail doit ête préfixée par `build/`, `chore/`, `ci/`, `docs/`, `feat/`, `fix/`, `perf/`, `refactor/`, `revert/`, `style/` ou `test/` en fonction du type de modification prévu, pour plus de détails à ce sujet, consulter [Conventional Commits cheat sheet](https://kapeli.com/cheat_sheets/Conventional_Commits.docset/Contents/Resources/Documents/index)
- Une branche portant une version à publier doit être de la forme `release/X.Y` avec `X.Y` égal au numéro de majeur et de mineur de la release, cela signifie donc que tous les patches sont à appliquer sur la même branche pour chaque version mineure. Cette organisation permet de gérer plusieurs versions de la bibliothèque en parallèle sans mettre en péril la rétrocompatibilité.

### Commits

#### Convention

Les commits de ce repository doivent respecter la syntaxe décrite par la spécification des [Commits Conventionnels](https://www.conventionalcommits.org/fr)

#### Signature

La branche `main`, ainsi que l'ensemble des branches de travail avec un préfixe valide requièrent que les commits soient signés :

- La documentation de GitHub indique comment [configurer la signature des commits](https://docs.github.com/en/enterprise-server@3.5/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- Les utilisateurs de [keybase](https://keybase.io/) peuvent [signer leurs commits avec leur clé GPG sur Keybase](https://stephenreescarter.net/signing-git-commits-with-a-keybase-gpg-key/)

### Publier sur la branche principale

- La branche principale est `main`, il n'est pas possible de publier en faisant un `push` depuis un dépôt local
- Il faut forcément créer une nouvelle branche de travail avec l'un préfixe autorisé
- À chaque publication sur une branche de travail, le workflow `Validate feature` sur [github actions](https://github.com/anct-cartographie-nationale/api-application/actions) vérifie
  - Qu'il est possible de créer un build sans erreur
  - Que la syntaxe correspond bien à ce qui est [défini par Prettier](.prettierrc.json)
  - Que le code écrit en TypeScript respecte les conventions décrites par les [règles ESLint](.eslintrc.json)
  - Que les messages des commits suivent le standard établi par [Conventional Commits](https://www.conventionalcommits.org/fr)
- Une fois les développements terminés, il faut créer une [pull request](https://github.com/anct-cartographie-nationale/api-application/pulls) avec la banche de travail comme origin et la branche `main` comme destination.
- La pull request ne peut être fusionné que si :
  - Les étapes du workflow `Validate feature` sont valides
  - Les fichiers modifiés ont été revus par au moins une personne
  - Les commits ajoutés sont signés
- La branche de travail est supprimée automatiquement une fois qu'elle a été fusionnée

### Déployer

#### Sur l'environnement de production

Lorsqu'une branche est fusionnée avec `main`, cela déclenche automatiquement la publication du build sur l'espace dédié à la production ainsi que la mise à jour du schéma de l'api.

## Construit avec

### langages & Frameworks

- [TypeScript](https://www.typescriptlang.org/) est un langage open source construit à partir de JavaScript

### Outils

#### CLI

- [Jest](https://jestjs.io/) est une boîte à outils pour écrire des tests automatisés en JavaScript
- [Eslint](https://eslint.org/) est un analyseur statique de JavaScript avec les plugins suivants :
- [Prettier](https://prettier.io/) est un magnificateur de code source en JavaScript

#### CI

- [Github Actions](https://docs.github.com/en/actions) est l'outil d'intégration et de déploiement continu intégré à GitHub
  - L'historique des déploiements est disponible [sous l'onglet Actions](https://github.com/anct-cartographie-nationale/api-application/actions/)
- Secrets du dépôt :
  - `AWS_ACCESS_KEY_ID` : Clé d'accès AWS du compte `cartographie-nationale.api.ci`
  - `AWS_SECRET_ACCESS_KEY` : Secret associé à la clé d'accès à AWS du compte `cartographie-nationale.api.ci`
  - `AWS_S3_BUCKET` : Identifiant de l'espace sur AWS S3 dans lequel est publié le build des fonctions et le schéma de l'api

#### Déploiement

##### Sur l'environnement de production

- L'infrastructure de déploiement est décrite avec Terraform dans les dépôts :
  - [Api Infrastructure](https://github.com/anct-cartographie-nationale/api-infrastructure)
  - [Network Infrastructure](https://github.com/anct-cartographie-nationale/network-infrastructure)
- [AWS](https://aws.amazon.com/) est la plateforme de services Cloud proposée par Amazon.
  - Compte de déploiement : `cartographie-nationale.api.ci`
  - Groupe : `publisher.api`
  - Environnement cible : https://d2pzn8br7bs1l.cloudfront.net/api/

## Gestion des versions

Afin de maintenir un cycle de publication clair et de favoriser la rétrocompatibilité, la dénomination des versions suit la spécification décrite par la [Gestion sémantique de version](https://semver.org/lang/fr/)

Les versions disponibles ainsi que les journaux décrivant les changements apportés sont disponibles depuis [la page des Releases](https://github.com/anct-cartographie-nationale/api-application/releases).

## Licence

Voir le fichier [LICENSE.md](./LICENSE.md) du dépôt.
