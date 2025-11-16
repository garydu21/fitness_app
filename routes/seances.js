const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Récupérer toutes les séances de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [seances] = await db.query(`
      SELECT s.*, p.nom as programme_nom
      FROM seances s
      LEFT JOIN programmes p ON s.programme_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.date DESC
      LIMIT 50
    `, [req.user.userId]);

    res.json(seances);
  } catch (error) {
    console.error('Erreur récupération séances:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer une séance avec toutes ses performances
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [seances] = await db.query(`
      SELECT s.*, p.nom as programme_nom
      FROM seances s
      LEFT JOIN programmes p ON s.programme_id = p.id
      WHERE s.id = ? AND s.user_id = ?
    `, [req.params.id, req.user.userId]);

    if (seances.length === 0) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    // Récupérer les performances
    const [performances] = await db.query(`
      SELECT p.*, e.nom as exercice_nom, e.groupe_musculaire
      FROM performances p
      JOIN exercices e ON p.exercice_id = e.id
      WHERE p.seance_id = ?
      ORDER BY p.id
    `, [req.params.id]);

    res.json({
      ...seances[0],
      performances: performances
    });

  } catch (error) {
    console.error('Erreur récupération séance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une nouvelle séance
router.post('/', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { programme_id, date, duree, notes, performances } = req.body;

    // Créer la séance
    const [result] = await connection.query(
      'INSERT INTO seances (user_id, programme_id, date, duree, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, programme_id || null, date || new Date(), duree || null, notes || null]
    );

    const seanceId = result.insertId;

    // Ajouter les performances
    if (performances && performances.length > 0) {
      for (const perf of performances) {
        await connection.query(
          'INSERT INTO performances (seance_id, exercice_id, serie_num, reps, poids, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [seanceId, perf.exercice_id, perf.serie_num, perf.reps, perf.poids || 0, perf.notes || null]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Séance créée avec succès',
      seanceId: seanceId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erreur création séance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Ajouter une performance à une séance existante
router.post('/:id/performances', authenticateToken, async (req, res) => {
  try {
    const seanceId = req.params.id;
    const { exercice_id, serie_num, reps, poids, notes } = req.body;

    // Vérifier que la séance appartient à l'utilisateur
    const [seances] = await db.query(
      'SELECT * FROM seances WHERE id = ? AND user_id = ?',
      [seanceId, req.user.userId]
    );

    if (seances.length === 0) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    await db.query(
      'INSERT INTO performances (seance_id, exercice_id, serie_num, reps, poids, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [seanceId, exercice_id, serie_num, reps, poids || 0, notes || null]
    );

    res.status(201).json({ message: 'Performance ajoutée avec succès' });

  } catch (error) {
    console.error('Erreur ajout performance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une séance
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const seanceId = req.params.id;

    const [seances] = await db.query(
      'SELECT * FROM seances WHERE id = ? AND user_id = ?',
      [seanceId, req.user.userId]
    );

    if (seances.length === 0) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }

    await db.query('DELETE FROM seances WHERE id = ?', [seanceId]);

    res.json({ message: 'Séance supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression séance:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
