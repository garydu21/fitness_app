const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Récupérer tous les programmes de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [programmes] = await db.query(
      'SELECT * FROM programmes WHERE user_id = ? ORDER BY date_creation DESC',
      [req.user.userId]
    );
    res.json(programmes);
  } catch (error) {
    console.error('Erreur récupération programmes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un programme avec ses exercices
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Récupérer le programme
    const [programmes] = await db.query(
      'SELECT * FROM programmes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (programmes.length === 0) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    // Récupérer les exercices du programme
    const [exercices] = await db.query(`
      SELECT pe.*, e.nom, e.groupe_musculaire, e.description
      FROM programme_exercices pe
      JOIN exercices e ON pe.exercice_id = e.id
      WHERE pe.programme_id = ?
      ORDER BY pe.ordre
    `, [req.params.id]);

    res.json({
      ...programmes[0],
      exercices: exercices
    });

  } catch (error) {
    console.error('Erreur récupération programme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer un nouveau programme
router.post('/', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { nom, description, exercices } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Nom du programme requis' });
    }

    // Créer le programme
    const [result] = await connection.query(
      'INSERT INTO programmes (user_id, nom, description) VALUES (?, ?, ?)',
      [req.user.userId, nom, description || null]
    );

    const programmeId = result.insertId;

    // Ajouter les exercices au programme
    if (exercices && exercices.length > 0) {
      for (let i = 0; i < exercices.length; i++) {
        const ex = exercices[i];
        await connection.query(
          'INSERT INTO programme_exercices (programme_id, exercice_id, ordre, series, reps_cible) VALUES (?, ?, ?, ?, ?)',
          [programmeId, ex.exercice_id, i + 1, ex.series || 3, ex.reps_cible || 10]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Programme créé avec succès',
      programmeId: programmeId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur création programme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Modifier un programme
router.put('/:id', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const programmeId = req.params.id;
    const { nom, description, exercices } = req.body;

    // Vérifier que le programme appartient à l'utilisateur
    const [programmes] = await connection.query(
      'SELECT * FROM programmes WHERE id = ? AND user_id = ?',
      [programmeId, req.user.userId]
    );

    if (programmes.length === 0) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    // Mettre à jour les infos du programme
    await connection.query(
      'UPDATE programmes SET nom = ?, description = ? WHERE id = ?',
      [nom, description, programmeId]
    );

    // Si des exercices sont fournis, remplacer la liste
    if (exercices) {
      // Supprimer les anciens exercices
      await connection.query('DELETE FROM programme_exercices WHERE programme_id = ?', [programmeId]);

      // Ajouter les nouveaux
      for (let i = 0; i < exercices.length; i++) {
        const ex = exercices[i];
        await connection.query(
          'INSERT INTO programme_exercices (programme_id, exercice_id, ordre, series, reps_cible) VALUES (?, ?, ?, ?, ?)',
          [programmeId, ex.exercice_id, i + 1, ex.series || 3, ex.reps_cible || 10]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Programme modifié avec succès' });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur modification programme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Supprimer un programme
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const programmeId = req.params.id;

    const [programmes] = await db.query(
      'SELECT * FROM programmes WHERE id = ? AND user_id = ?',
      [programmeId, req.user.userId]
    );

    if (programmes.length === 0) {
      return res.status(404).json({ error: 'Programme non trouvé' });
    }

    await db.query('DELETE FROM programmes WHERE id = ?', [programmeId]);

    res.json({ message: 'Programme supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression programme:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
