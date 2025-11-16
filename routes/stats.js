const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Récupérer l'historique de progression pour un exercice
router.get('/exercice/:exerciceId', authenticateToken, async (req, res) => {
  try {
    const exerciceId = req.params.exerciceId;

    const [progression] = await db.query(`
      SELECT 
        s.date,
        p.serie_num,
        p.reps,
        p.poids,
        p.notes
      FROM performances p
      JOIN seances s ON p.seance_id = s.id
      WHERE p.exercice_id = ? AND s.user_id = ?
      ORDER BY s.date DESC, p.serie_num ASC
      LIMIT 100
    `, [exerciceId, req.user.userId]);

    res.json(progression);

  } catch (error) {
    console.error('Erreur récupération progression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les statistiques d'un exercice (meilleur poids, volume total, etc.)
router.get('/exercice/:exerciceId/summary', authenticateToken, async (req, res) => {
  try {
    const exerciceId = req.params.exerciceId;

    // Récupérer les stats
    const [stats] = await db.query(`
      SELECT 
        MAX(p.poids) as meilleur_poids,
        MAX(p.reps) as meilleur_reps,
        COUNT(DISTINCT s.id) as nombre_seances,
        SUM(p.poids * p.reps) as volume_total
      FROM performances p
      JOIN seances s ON p.seance_id = s.id
      WHERE p.exercice_id = ? AND s.user_id = ?
    `, [exerciceId, req.user.userId]);

    // Dernière performance
    const [dernierePerf] = await db.query(`
      SELECT s.date, p.poids, p.reps, p.serie_num
      FROM performances p
      JOIN seances s ON p.seance_id = s.id
      WHERE p.exercice_id = ? AND s.user_id = ?
      ORDER BY s.date DESC
      LIMIT 1
    `, [exerciceId, req.user.userId]);

    res.json({
      stats: stats[0],
      derniere_performance: dernierePerf[0] || null
    });

  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les statistiques globales de l'utilisateur
router.get('/global', authenticateToken, async (req, res) => {
  try {
    // Nombre de séances
    const [nbSeances] = await db.query(`
      SELECT COUNT(*) as total
      FROM seances
      WHERE user_id = ?
    `, [req.user.userId]);

    // Volume total levé
    const [volumeTotal] = await db.query(`
      SELECT SUM(p.poids * p.reps) as volume
      FROM performances p
      JOIN seances s ON p.seance_id = s.id
      WHERE s.user_id = ?
    `, [req.user.userId]);

    // Séances par mois (12 derniers mois)
    const [seancesParMois] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as mois,
        COUNT(*) as nombre_seances
      FROM seances
      WHERE user_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY mois DESC
    `, [req.user.userId]);

    // Exercices les plus pratiqués
    const [exercicesPratiques] = await db.query(`
      SELECT 
        e.nom,
        e.groupe_musculaire,
        COUNT(DISTINCT s.id) as nombre_seances
      FROM performances p
      JOIN seances s ON p.seance_id = s.id
      JOIN exercices e ON p.exercice_id = e.id
      WHERE s.user_id = ?
      GROUP BY e.id, e.nom, e.groupe_musculaire
      ORDER BY nombre_seances DESC
      LIMIT 10
    `, [req.user.userId]);

    res.json({
      nombre_seances: nbSeances[0].total,
      volume_total: volumeTotal[0].volume || 0,
      seances_par_mois: seancesParMois,
      exercices_les_plus_pratiques: exercicesPratiques
    });

  } catch (error) {
    console.error('Erreur récupération stats globales:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer la progression du poids moyen pour un exercice (pour graphique)
router.get('/exercice/:exerciceId/chart', authenticateToken, async (req, res) => {
  try {
    const exerciceId = req.params.exerciceId;

    const [data] = await db.query(`
      SELECT 
        DATE(s.date) as date,
        AVG(p.poids) as poids_moyen,
        MAX(p.poids) as poids_max
      FROM performances p
      JOIN seances s ON p.seance_id = s.id
      WHERE p.exercice_id = ? AND s.user_id = ?
      GROUP BY DATE(s.date)
      ORDER BY date ASC
      LIMIT 50
    `, [exerciceId, req.user.userId]);

    res.json(data);

  } catch (error) {
    console.error('Erreur récupération données chart:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
