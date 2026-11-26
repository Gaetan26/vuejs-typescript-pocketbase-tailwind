# Vue.js + TypeScript + PocketBase + Tailwind

Modèle de projet prêt à l'emploi : application Vue 3 en TypeScript, stylée avec Tailwind CSS, connectée à PocketBase, avec un routeur et un store Pinia. Il sert de base pour démarrer de nouveaux projets sans refaire la configuration à chaque fois.

## Stack

| Rôle | Technologie |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup lang="ts">`) |
| Langage | TypeScript |
| Build et serveur de dev | Vite |
| Style | Tailwind CSS v4 (plugin `@tailwindcss/vite`) |
| Routage | Vue Router |
| État global | Pinia |
| Backend | PocketBase (SDK `pocketbase`) |

## Arborescence

```
.
├── public/                     # Fichiers statiques servis tels quels
├── scripts/
│   └── generate-models.mjs     # Génère les types TypeScript depuis PocketBase
├── src/
│   ├── api/
│   │   └── pocketbase.ts       # Client PocketBase partagé (instance unique)
│   ├── assets/                 # Images, polices, icônes
│   ├── components/
│   │   ├── layout/             # En-têtes, pieds de page, structure des pages
│   │   └── ui/                 # Composants réutilisables (boutons, champs...)
│   ├── composables/            # Logique réutilisable (hooks Vue)
│   ├── layouts/                # Gabarits de pages
│   ├── pages/                  # Une page = une route
│   │   ├── HomePage.vue
│   │   ├── NotFoundPage.vue
│   │   ├── connexion/
│   │   │   └── ConnexionPage.vue
│   │   └── inscription/        # Parcours d'inscription en plusieurs étapes
│   ├── router/
│   │   └── index.ts            # Déclaration des routes
│   ├── stores/                 # Stores Pinia, un par domaine
│   ├── types/
│   │   └── pocketbase-models.ts  # Généré par `npm run models`, ne pas éditer
│   ├── utils/                  # Fonctions et constantes utilitaires
│   ├── App.vue
│   ├── main.ts
│   ├── style.css               # Import de Tailwind et palette du projet
│   └── vite-env.d.ts          # Types des variables d'environnement
├── .env.example                # Modèle de configuration (à copier en .env)
├── tsconfig.json               # Racine : pointe vers app et node
├── tsconfig.app.json           # Configuration du code de l'application (alias @)
├── tsconfig.node.json          # Configuration des fichiers Node (Vite, scripts)
└── vite.config.ts              # Plugins et alias
```

## Prérequis

- Node.js 20.6 ou plus récent (`node -v`), requis par `node --env-file`
- npm
- PocketBase, téléchargé depuis [pocketbase.io](https://pocketbase.io)

## Installation

```bash
git clone <url-du-depot> mon-projet
cd mon-projet
npm install
cp .env.example .env
```

Puis renseigne les valeurs dans `.env` (voir la section Configuration).

## Configuration

Le fichier `.env.example` liste les variables attendues :

```
VITE_POCKETBASE_URL=http://localhost:8090
PB_ADMIN_EMAIL=
PB_ADMIN_PASSWORD=
```

| Variable | Utilisation |
|---|---|
| `VITE_POCKETBASE_URL` | URL de PocketBase, lue par l'application. Le préfixe `VITE_` est obligatoire pour que Vite l'expose au code. |
| `PB_ADMIN_EMAIL` | Email d'un compte **superuser** PocketBase, utilisé par le script de génération des types uniquement. |
| `PB_ADMIN_PASSWORD` | Mot de passe de ce compte superuser. |

**Important :** les variables `PB_ADMIN_*` n'ont **pas** de préfixe `VITE_`, pour ne pas être intégrées dans le code envoyé au navigateur. Ne mets jamais `.env` dans Git (il est déjà listé dans `.gitignore`).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur de développement sur `http://localhost:5173` |
| `npm run build` | Vérifie les types puis génère la version de production dans `dist/` |
| `npm run preview` | Prévisualise la version de production |
| `npm run models` | Se connecte à PocketBase et régénère `src/types/pocketbase-models.ts` |

## Démarrer PocketBase

Dans un terminal séparé, depuis le dossier qui contient l'exécutable :

```bash
./pocketbase serve
```

L'interface d'administration est disponible sur `http://localhost:8090/_/`. Crée-y un compte superuser (c'est ce compte que `PB_ADMIN_EMAIL` doit référencer).

## Générer les types depuis PocketBase

Après chaque création ou modification de collection dans PocketBase :

```bash
npm run models
```

Le script se connecte en tant que superuser, lit les collections (sans les tables internes commençant par `_`) et écrit une interface TypeScript par collection, ainsi qu'un type `CollectionRecords`.

Utilisation dans le code :

```ts
import { pb } from '@/api/pocketbase'
import type { UsersRecord } from '@/types/pocketbase-models'

const user = await pb.collection<UsersRecord>('users').getOne('abc123')
```

## Alias de chemins

`@` pointe vers `src/`. Il est déclaré à deux endroits, qui doivent rester cohérents :

- `tsconfig.app.json` (`paths`, pour TypeScript)
- `vite.config.ts` (`resolve.alias`, pour le navigateur)

Exemple : `import HomePage from '@/pages/HomePage.vue'`.

## Routage

Toutes les routes sont déclarées dans `src/router/index.ts`. Chaque page est chargée à la demande (`import()` dynamique), ce qui allège le chargement initial.

Pour ajouter une page :

1. Crée le fichier `.vue` dans `src/pages/`.
2. Ajoute une entrée dans le tableau `routes` avec son `path`, son `name` et son `component`.

La route `/:pathMatch(.*)*` affiche la page 404 et doit rester en dernier.

## Pinia

Les stores sont dans `src/stores/`, un fichier par domaine. Chaque store exporte une fonction `useXxxStore` :

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExempleStore = defineStore('exemple', () => {
  const valeur = ref('')
  return { valeur }
})
```

## Règles d'architecture

- **Une seule instance PocketBase** : importe toujours `pb` depuis `src/api/pocketbase.ts`. Ne crée jamais de nouveau client dans un composant.
- **Les pages n'appellent pas directement l'API** : passe par un store ou un composable, qui centralise les appels et les erreurs.
- **Types générés, jamais édités à la main** : `src/types/pocketbase-models.ts` est écrasé à chaque `npm run models`.
- **Secrets hors du dépôt** : seul `.env.example` est versionné.

## Ajouter Tailwind et la palette

Le fichier `src/style.css` importe Tailwind et déclare les couleurs du projet dans le bloc `@theme`. Chaque couleur devient alors une classe utilisable directement (`bg-…`, `text-…`, `border-…`).

## Nouveau projet à partir de ce modèle

1. Sur GitHub, utilise **Use this template** (si le dépôt est marqué comme modèle) ou clone-le.
2. Renomme le dossier et le nom dans `package.json`.
3. Remplace le contenu de `README.md` par celui de ton projet.