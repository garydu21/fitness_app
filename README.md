# 🏋️ Guide d'Installation - Fitness App Backend

## 📋 Prérequis

Avant de commencer, tu dois installer :

1. **Node.js** (version 16 ou supérieure)
   - Télécharge depuis : https://nodejs.org/
   - Vérifie l'installation : `node --version`

2. **MySQL** (version 8.0 ou supérieure)
   - Windows : https://dev.mysql.com/downloads/installer/
   - Mac : `brew install mysql`
   - Linux : `sudo apt install mysql-server`

3. **Un éditeur de code** (VS Code recommandé)
   - Télécharge depuis : https://code.visualstudio.com/

---

## 🚀 Installation étape par étape

### Étape 1 : Configuration MySQL

1. Démarre MySQL :
   ```bash
   # Windows : MySQL démarre automatiquement après installation
   # Mac :
   brew services start mysql
   # Linux :
   sudo systemctl start mysql
   ```

2. Connecte-toi à MySQL :
   ```bash
   mysql -u root -p
   ```
   (Si pas de mot de passe configuré, appuie juste sur Entrée)

3. Exécute le script SQL pour créer la base de données :
   ```sql
   source /chemin/vers/fitness-app-backend/database/schema.sql
   ```
   
   Ou copie-colle le contenu du fichier `database/schema.sql` dans ton terminal MySQL.

4. Quitte MySQL :
   ```sql
   exit;
   ```

### Étape 2 : Configuration du Backend

1. Ouvre un terminal et navigue vers le dossier du projet :
   ```bash
   cd fitness-app-backend
   ```

2. Installe les dépendances Node.js :
   ```bash
   npm install
   ```

3. Crée le fichier `.env` (copie depuis `.env.example`) :
   ```bash
   cp .env.example .env
   ```

4. Édite le fichier `.env` avec tes informations MySQL :
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=ton_mot_de_passe_mysql
   DB_NAME=fitness_app
   JWT_SECRET=change_moi_par_une_chaine_aleatoire_longue
   ```

### Étape 3 : Démarrage du serveur

1. Lance le serveur en mode développement :
   ```bash
   npm run dev
   ```

2. Tu devrais voir :
   ```
   ✅ Connecté à la base de données MySQL
   ✅ Serveur démarré sur le port 3000
   ```

3. Teste que ça fonctionne en allant sur : http://localhost:3000
   Tu devrais voir : `{"message":"Fitness App API - Serveur en ligne !"}`

---

## 🔥 Tester l'API avec Postman/Insomnia

### 1. Inscription d'un utilisateur

**POST** `http://localhost:3000/api/auth/register`

Body (JSON) :
```json
{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

Réponse :
```json
{
  "message": "Utilisateur créé avec succès",
  "userId": 1
}
```

### 2. Connexion

**POST** `http://localhost:3000/api/auth/login`

Body (JSON) :
```json
{
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

Réponse :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Jean Dupont",
    "email": "jean@example.com"
  }
}
```

**⚠️ IMPORTANT : Copie le token, tu en auras besoin pour les requêtes suivantes !**

### 3. Récupérer les exercices

**GET** `http://localhost:3000/api/exercices`

Headers :
```
Authorization: Bearer TON_TOKEN_ICI
```

Réponse :
```json
[
  {
    "id": 1,
    "nom": "Développé couché",
    "groupe_musculaire": "Pectoraux",
    "description": "Exercice de base pour les pectoraux",
    ...
  },
  ...
]
```

### 4. Créer un exercice personnalisé

**POST** `http://localhost:3000/api/exercices`

Headers :
```
Authorization: Bearer TON_TOKEN_ICI
```

Body (JSON) :
```json
{
  "nom": "Presse inclinée",
  "groupe_musculaire": "Pectoraux",
  "description": "Variante du développé couché sur banc incliné"
}
```

### 5. Créer un programme

**POST** `http://localhost:3000/api/programmes`

Headers :
```
Authorization: Bearer TON_TOKEN_ICI
```

Body (JSON) :
```json
{
  "nom": "Push Day",
  "description": "Programme pour pectoraux, épaules et triceps",
  "exercices": [
    {
      "exercice_id": 1,
      "series": 4,
      "reps_cible": 10
    },
    {
      "exercice_id": 4,
      "series": 3,
      "reps_cible": 12
    }
  ]
}
```

### 6. Créer une séance (logger ton entraînement)

**POST** `http://localhost:3000/api/seances`

Headers :
```
Authorization: Bearer TON_TOKEN_ICI
```

Body (JSON) :
```json
{
  "programme_id": 1,
  "date": "2024-03-15T10:30:00",
  "duree": 60,
  "notes": "Bonne séance, j'ai progressé !",
  "performances": [
    {
      "exercice_id": 1,
      "serie_num": 1,
      "reps": 10,
      "poids": 80
    },
    {
      "exercice_id": 1,
      "serie_num": 2,
      "reps": 10,
      "poids": 80
    },
    {
      "exercice_id": 1,
      "serie_num": 3,
      "reps": 8,
      "poids": 85
    }
  ]
}
```

### 7. Voir tes stats pour un exercice

**GET** `http://localhost:3000/api/stats/exercice/1/summary`

Headers :
```
Authorization: Bearer TON_TOKEN_ICI
```

Réponse :
```json
{
  "stats": {
    "meilleur_poids": 85,
    "meilleur_reps": 10,
    "nombre_seances": 5,
    "volume_total": 4800
  },
  "derniere_performance": {
    "date": "2024-03-15T10:30:00",
    "poids": 85,
    "reps": 8,
    "serie_num": 3
  }
}
```

---

## 📱 Intégration Android (à venir)

Pour connecter ton app Android à ce backend, tu utiliseras **Retrofit** avec ces endpoints :

```kotlin
interface FitnessApi {
    @POST("auth/register")
    suspend fun register(@Body user: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/login")
    suspend fun login(@Body credentials: LoginRequest): Response<AuthResponse>
    
    @GET("exercices")
    suspend fun getExercices(@Header("Authorization") token: String): Response<List<Exercice>>
    
    @POST("seances")
    suspend fun createSeance(
        @Header("Authorization") token: String,
        @Body seance: SeanceRequest
    ): Response<SeanceResponse>
    
    // ... autres endpoints
}
```

---

## 🛠️ Commandes utiles

```bash
# Démarrer en mode développement (redémarre automatiquement)
npm run dev

# Démarrer en mode production
npm start

# Installer une nouvelle dépendance
npm install nom-du-package

# Vérifier les logs MySQL
# MySQL logs sont généralement dans /var/log/mysql/ (Linux)
```

---

## 🐛 Résolution de problèmes

### Erreur : "Access denied for user"
- Vérifie ton mot de passe MySQL dans le fichier `.env`
- Assure-toi que l'utilisateur a les bonnes permissions

### Erreur : "ECONNREFUSED"
- MySQL n'est pas démarré : `sudo systemctl start mysql` (Linux)
- Vérifie que le port 3306 est bien celui de MySQL

### Erreur : "Port 3000 already in use"
- Change le port dans `.env` : `PORT=3001`
- Ou tue le processus : `lsof -ti:3000 | xargs kill` (Mac/Linux)

---

## 📚 Structure du projet

```
fitness-app-backend/
├── config/
│   └── database.js          # Configuration MySQL
├── middleware/
│   └── auth.js              # Middleware JWT
├── routes/
│   ├── auth.js              # Routes authentification
│   ├── exercices.js         # Routes exercices
│   ├── programmes.js        # Routes programmes
│   ├── seances.js           # Routes séances
│   └── stats.js             # Routes statistiques
├── database/
│   └── schema.sql           # Schéma de la base de données
├── .env.example             # Template des variables d'environnement
├── .gitignore
├── package.json
└── server.js                # Point d'entrée
```

---

## 🚀 Prochaines étapes

1. ✅ Backend fonctionnel
2. 📱 Développer l'app Android avec Kotlin
3. 🎨 Créer l'interface avec Jetpack Compose
4. 📊 Ajouter des graphiques de progression
5. ☁️ Déployer le backend (Railway, Render, etc.)

---

## 💪 Besoin d'aide ?

Si tu bloques quelque part, dis-moi où tu en es et je t'aiderai !

Bon code ! 🚀
