# SecuCom Frontend

Application frontend React/TypeScript pour la gestion sécurisée des données sociales et administratives.

## 🚀 Technologies

- **React 19** - Framework frontend moderne
- **TypeScript** - Typage statique pour JavaScript
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI modernes et accessibles
- **React Router** - Navigation côté client
- **Lucide React** - Icônes SVG optimisées

## 📁 Structure du Projet

```
src/
├── components/          # Composants React organisés par responsabilité
│   ├── ui/             # Composants primitifs (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── index.ts    # Barrel exports
│   ├── common/         # Composants réutilisables métier
│   │   ├── modals/     # Modales de l'application
│   │   ├── status/     # Composants de gestion des statuts
│   │   ├── forms/      # Composants de formulaires
│   │   └── StatusChangeHandler.tsx
│   ├── features/       # Composants par domaine fonctionnel
│   │   ├── notifications/
│   │   └── dashboard/
│   ├── layout/         # Composants de mise en page
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   └── guards/         # Composants de protection/sécurité
│       ├── ProtectedRoute.tsx
│       └── PendingAccountGuard.tsx
├── pages/              # Pages organisées par domaine métier
│   ├── auth/           # Authentification
│   ├── dashboard/      # Tableaux de bord
│   ├── companies/      # Gestion des entreprises
│   ├── collaborators/  # Gestion des collaborateurs
│   ├── dimona/         # Gestion des DIMONA
│   ├── documents/      # Gestion documentaire
│   ├── admin/          # Administration
│   ├── profile/        # Profil utilisateur
│   ├── notifications/  # Notifications
│   └── index.ts        # Barrel exports
├── hooks/              # Hooks personnalisés
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── ...
├── services/           # Services et clients API
│   └── api/
│       ├── authService.ts
│       ├── baseApi.ts
│       └── ...
├── types/              # Définitions TypeScript
│   ├── AdminUserTypes.ts
│   ├── CompanyTypes.ts
│   └── ...
├── utils/              # Fonctions utilitaires
│   ├── dimonaUtils.tsx
│   └── statusColors.ts
├── config/             # Configuration de l'application
│   ├── api.config.ts
│   └── routes.config.ts
├── context/            # Contextes React
│   └── AuthContext.tsx
└── lib/                # Bibliothèques et utilitaires
    └── utils.ts
```

## 🏗️ Architecture

### Principes d'Architecture

#### **1. Architecture en Couches**
- **Présentation** : Components + Pages
- **Logique Métier** : Hooks + Utils
- **Données** : Services + Types
- **Configuration** : Config + Context

#### **2. Organisation par Domaines**
- **Feature-based** pour les composants métier
- **Domain-driven** pour les pages
- **Responsibility-based** pour les services

#### **3. Séparation des Responsabilités**
- **UI Components** : Composants primitifs réutilisables
- **Common Components** : Composants métier partagés
- **Feature Components** : Composants spécifiques à un domaine
- **Layout Components** : Structure et navigation
- **Guards** : Protection et sécurité

### Gestion des Imports

#### **Imports Absolus Uniquement**
```typescript
// ✅ Correct
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { CompanyTypes } from "@/types/CompanyTypes";

// ❌ Éviter
import { Button } from "../../components/ui/button";
import { useAuth } from "../hooks/useAuth";
```

#### **Barrel Exports**
Chaque dossier contient un fichier `index.ts` pour simplifier les imports :

```typescript
// src/components/ui/index.ts
export { Button } from "./button";
export { Card } from "./card";
export { Dialog } from "./dialog";

// Usage
import { Button, Card, Dialog } from "@/components/ui";
```

## 📝 Conventions de Code

### **Nommage**
- **PascalCase** : Composants React, Types, Interfaces
- **camelCase** : Fonctions, variables, hooks
- **kebab-case** : Fichiers utilitaires

### **Exports**
- **Named exports** pour les composants : `export function ComponentName()`
- **Default exports** pour les pages principales et utilitaires
- **Barrel exports** dans chaque dossier via `index.ts`

### **Structure des Composants**
```typescript
// Imports externes
import React from 'react';
import { useState } from 'react';

// Imports internes (par ordre de proximité)
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { UserType } from '@/types/UserTypes';

// Types/Interfaces
interface ComponentProps {
  user: UserType;
  onAction: () => void;
}

// Composant principal
export function ComponentName({ user, onAction }: ComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## 🔧 Scripts de Développement

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

## 🎯 Fonctionnalités Principales

### **Authentification & Autorisation**
- Connexion sécurisée avec JWT
- Gestion des rôles (ROLE_ADMIN, ROLE_COMPANY)
- Protection des routes par rôle
- Gestion des comptes en attente

### **Gestion des Entreprises**
- CRUD complet des entreprises
- Validation des données légales
- Gestion des contacts

### **Gestion des Collaborateurs**
- Ajout/modification des collaborateurs
- Historique des modifications
- Validation des données sociales

### **DIMONA**
- Création et gestion des déclarations
- Workflow de validation
- Historique des statuts
- Envoi vers l'ONSS

### **Notifications**
- Système de notifications en temps réel
- Filtrage par type et statut
- Marquage lu/non lu

### **Administration**
- Gestion des utilisateurs
- Statistiques globales
- Configuration système

## 🔒 Sécurité

- **Protection CSRF** via tokens
- **Validation côté client et serveur**
- **Gestion des sessions sécurisées**
- **Chiffrement des données sensibles**
- **Audit trail** des actions utilisateur

## 📊 Performance

- **Code splitting** automatique par route
- **Lazy loading** des composants
- **Tree shaking** optimisé
- **Bundle analysis** intégré
- **Optimisation des images**

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests e2e
npm run test:e2e
```

## 📦 Build & Déploiement

```bash
# Build de production
npm run build

# Analyse du bundle
npm run analyze

# Déploiement
npm run deploy
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Frontend** : React/TypeScript
- **Backend** : Spring Boot/Java
- **Database** : PostgreSQL
- **Infrastructure** : Docker/Kubernetes

---

**SecuCom v1.0** - Plateforme de gestion sécurisée des données sociales
