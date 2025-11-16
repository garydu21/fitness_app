const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Récupérer tous les exercices (publics + ceux de l'utilisateur)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [exercices] = await db.query(
      'SELECT * FROM exercices WHERE created_by_user_id IS NULL OR created_by_user_id = ? ORDER BY nom',
      [req.user.userId]
    );
    res.json(exercices);
  } catch (error) {
    console.error('Erreur récupération exercices:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un exercice par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [exercices] = await db.query(
      'SELECT * FROM exercices WHERE id = ?',
      [req.params.id]
    );
    
    if (exercices.length === 0) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    res.json(exercices[0]);
  } catch (error) {
    console.error('Erreur récupération exercice:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouvel exercice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nom, groupe_musculaire, description, image_url } = req.body;

    if (!nom || !groupe_musculaire) {
      return res.status(400).json({ error: 'Nom et groupe musculaire requis' });
    }

    const [result] = await db.query(
      'INSERT INTO exercices (nom, groupe_musculaire, description, image_url, created_by_user_id) VALUES (?, ?, ?, ?, ?)',
      [nom, groupe_musculaire, description || null, image_url || null, req.user.userId]
    );

    res.status(201).json({
      message: 'Exercice créé avec succès',
      exerciceId: result.insertId
    });

  } catch (error) {
    console.error('Erreur création exercice:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modifier un exercice
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { nom, groupe_musculaire, description, image_url } = req.body;
    const exerciceId = req.params.id;

    // Vérifier que l'exercice appartient à l'utilisateur
    const [exercices] = await db.query(
      'SELECT * FROM exercices WHERE id = ? AND created_by_user_id = ?',
      [exerciceId, req.user.userId]
    );

    if (exercices.length === 0) {
      return res.status(404).json({ error: 'Exercice non trouvé ou non autorisé' });
    }

    await db.query(
      'UPDATE exercices SET nom = ?, groupe_musculaire = ?, description = ?, image_url = ? WHERE id = ?',
      [nom, groupe_musculaire, description, image_url, exerciceId]
    );

    res.json({ message: 'Exercice modifié avec succès' });

  } catch (error) {
    console.error('Erreur modification exercice:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer un exercice
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exerciceId = req.params.id;

    // Vérifier que l'exercice appartient à l'utilisateur
    const [exercices] = await db.query(
      'SELECT * FROM exercices WHERE id = ? AND created_by_user_id = ?',
      [exerciceId, req.user.userId]
    );

    if (exercices.length === 0) {
      return res.status(404).json({ error: 'Exercice non trouvé ou non autorisé' });
    }

    await db.query('DELETE FROM exercices WHERE id = ?', [exerciceId]);

    res.json({ message: 'Exercice supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression exercice:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
