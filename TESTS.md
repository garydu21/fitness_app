# 🧪 Tests API avec CURL

Ce fichier contient des commandes curl pour tester ton API directement depuis le terminal.

## 1. Tester que le serveur fonctionne

```bash
curl http://localhost:3000/
```

## 2. S'inscrire

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 3. Se connecter et récupérer le token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**⚠️ COPIE LE TOKEN DE LA RÉPONSE et remplace TOKEN_ICI dans les commandes suivantes**

## 4. Récupérer les exercices

```bash
curl http://localhost:3000/api/exercices \
  -H "Authorization: Bearer TOKEN_ICI"
```

## 5. Créer un exercice

```bash
curl -X POST http://localhost:3000/api/exercices \
  -H "Authorization: Bearer TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Hip Thrust",
    "groupe_musculaire": "Fessiers",
    "description": "Exercice pour les fessiers avec barre"
  }'
```

## 6. Créer un programme

```bash
curl -X POST http://localhost:3000/api/programmes \
  -H "Authorization: Bearer TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Full Body",
    "description": "Programme complet du corps",
    "exercices": [
      {
        "exercice_id": 2,
        "series": 4,
        "reps_cible": 8
      },
      {
        "exercice_id": 1,
        "series": 4,
        "reps_cible": 10
      }
    ]
  }'
```

## 7. Récupérer ses programmes

```bash
curl http://localhost:3000/api/programmes \
  -H "Authorization: Bearer TOKEN_ICI"
```

## 8. Logger une séance

```bash
curl -X POST http://localhost:3000/api/seances \
  -H "Authorization: Bearer TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "programme_id": 1,
    "duree": 75,
    "notes": "Excellente séance",
    "performances": [
      {
        "exercice_id": 2,
        "serie_num": 1,
        "reps": 8,
        "poids": 100
      },
      {
        "exercice_id": 2,
        "serie_num": 2,
        "reps": 8,
        "poids": 100
      },
      {
        "exercice_id": 2,
        "serie_num": 3,
        "reps": 7,
        "poids": 105
      }
    ]
  }'
```

## 9. Voir ses séances

```bash
curl http://localhost:3000/api/seances \
  -H "Authorization: Bearer TOKEN_ICI"
```

## 10. Voir les stats d'un exercice

```bash
curl http://localhost:3000/api/stats/exercice/2/summary \
  -H "Authorization: Bearer TOKEN_ICI"
```

## 11. Voir la progression d'un exercice

```bash
curl http://localhost:3000/api/stats/exercice/2/chart \
  -H "Authorization: Bearer TOKEN_ICI"
```

## 12. Voir les stats globales

```bash
curl http://localhost:3000/api/stats/global \
  -H "Authorization: Bearer TOKEN_ICI"
```

---

## 💡 Astuce pour Windows PowerShell

Si tu es sur Windows PowerShell, remplace les `\` par des `` ` `` (backtick)
et les simples quotes par des doubles quotes.

Exemple :
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"nom\": \"Test User\", \"email\": \"test@example.com\", \"password\": \"password123\"}"
```
