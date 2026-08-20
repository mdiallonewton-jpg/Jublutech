# Site JubluTech

Site vitrine statique — HTML / CSS / JS pur, sans framework, prêt à ouvrir dans VS Code.

## Structure

```
jublutech/
├── index.html   → structure et contenu de la page
├── style.css    → identité visuelle (tokens en haut du fichier)
└── script.js    → menu mobile + validation du formulaire de contact
```

## Lancer le projet

1. Ouvre le dossier `jublutech/` dans VS Code.
2. Installe l'extension **Live Server** (Ritwick Dey) si tu ne l'as pas.
3. Clic droit sur `index.html` → **Open with Live Server**.
   (Ou double-clique simplement sur `index.html` pour l'ouvrir dans ton navigateur.)

## Ce qui est déjà fait

- Header sticky avec menu mobile fonctionnel, zone de connexion dynamique.
- Hero, 9 services, section "Approche" (avec le schéma de matching bon service → bon client → bon prix → bonne techno), section Afrique, Vision, Fondateur.
- Responsive complet (mobile / tablette / desktop).
- **Backend Supabase complet** : comptes clients, formulaire de demande connecté à une vraie base de données, espace admin pour consulter et traiter les demandes.

## Mise en place du backend Supabase

### 1. Créer le projet
1. Va sur [supabase.com](https://supabase.com) → crée un compte → **New project**.
2. Choisis un nom (ex. `jublutech`), un mot de passe de base de données, une région proche (Europe recommandée).

### 2. Créer les tables
1. Dans le dashboard, ouvre **SQL Editor** → **New query**.
2. Copie-colle tout le contenu de `supabase-schema.sql` fourni dans ce dossier.
3. Clique **Run**. Cela crée les tables `profiles` et `demandes`, avec la sécurité (RLS) déjà configurée.

### 3. Récupérer tes clés
1. Va dans **Project Settings → API**.
2. Copie l'**URL du projet** et la clé **anon public**.
3. Ouvre `supabase-client.js` et remplace `SUPABASE_URL` et `SUPABASE_ANON_KEY` par tes valeurs.

### 4. Créer ton compte admin
1. Ouvre `auth.html` en local (Live Server) → onglet **Créer un compte** → inscris-toi avec ton email.
2. Confirme ton email si Supabase te le demande (mail de confirmation).
3. Retourne dans **SQL Editor** sur Supabase et exécute, en remplaçant l'email :
   ```sql
   update public.profiles set is_admin = true where email = 'ton-email@exemple.com';
   ```
4. Reconnecte-toi sur `auth.html` → tu verras désormais un bouton **Admin** dans le header, menant à `admin.html`.

### 5. Tester le circuit complet
1. Crée un 2ᵉ compte "client test" (email différent).
2. Connecte-toi avec ce compte → va dans **Contact** sur `index.html` → envoie une demande.
3. Reconnecte-toi avec ton compte admin → ouvre `admin.html` → la demande apparaît, tu peux changer son statut (Nouveau / En cours / Terminé).

## Fichiers liés au backend

```
supabase-schema.sql   → à coller dans Supabase (une seule fois)
supabase-client.js    → tes clés de connexion (URL + clé anon)
auth.html / auth.js   → connexion / inscription client
admin.html / admin.js → tableau des demandes, réservé aux admins
```

## Personnalisation rapide

Toutes les couleurs et polices sont centralisées dans `:root` en haut de
`style.css` — change les valeurs de `--gold`, `--ink-deep`, `--rust`, etc.
pour ajuster l'identité sans toucher au reste du fichier.
