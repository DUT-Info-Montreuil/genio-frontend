# GenioService

> **Version :** 1.0.0-release
> **Auteur :** Elsa HADJADJ
> **Email :** <elsa.simha.hadjadj@gmail.com>
> **GitHub Repository :** [https://github.com/DUT-Info-Montreuil/genio-backend](https://github.com/DUT-Info-Montreuil/genio-backend)

---

## Projet académique

Ce projet a été développé dans le cadre de la troisième année du Bachelor Universitaire de Technologie (BUT Informatique) à l’IUT de Montreuil.

**GenioService** est une application de gestion de conventions de stage permettant la génération, l’historisation, la validation et le suivi documentaire.

---

> ⚠️ **Note à l’attention des développeurs**
>
> Pour faciliter le déploiement local et le développement, **les mots de passe sont externalisés** :
>
> - Pour les applications Java : dans un fichier `application-external.properties` externe.
> - Pour les environnements Docker : dans les fichiers de configuration (`docker-compose.yml`, fichiers `.env`, `.sql`, etc.).
> - Des fichiers modèles avec des mots de passe de test sont fournis avec l’extension `.template` (par exemple : `application-external.properties.template`, `.env.template`).
>
> Ces fichiers `.template` contiennent des **valeurs de test** à adapter. Ils sont accompagnés de **commentaires `TODO`** pour aider les développeurs à repérer rapidement les paramètres sensibles à modifier.
>
> **Important** : tous les mots de passe et identifiants présents dans ces fichiers doivent impérativement être **remplacés avant tout déploiement en production**. Ne laissez jamais de secrets ou d’identifiants en clair dans le code ou les fichiers versionnés.

## Audit qualité SonarQube

<!-- markdownlint-disable MD033 -->
<div>
  <img src="docs/assets/images/sonar-audit.png" alt="Audit SonarCube" width="600"/>
</div>

> **Résultat : Quality Gate – Passed  ✅**

- Sécurité : 0 vulnérabilité
- Fiabilité : 0 bug
- Maintenabilité : 0 code smell
- Couverture de tests : 87.8% (295 tests unitaires)
- Duplication : 0.7% (3 blocs dupliqués)

> OWASP Dependency-Check : 0 failles
---

## Sommaire

- [00 - Introduction](docs/00-introduction.md)
- [01 - Architecture technique](docs/01-architecture.md)
- [02 - Installation & prérequis](docs/02-installation.md)
- [03 - Déploiement (dev & prod)](docs/03-deploiement.md)
- [04 - Documentation fonctionnelle](docs/04-doc-fonctionnelle.md)
- [05 - Design UX & Parcours utilisateur](docs/05-ux.md)
- [06 - Sécurité & RGPD](docs/06-rgpd.md)
- [Changelog](CHANGELOG.md)
- [Licence (CC BY-NC-SA 4.0)](licence.md)
