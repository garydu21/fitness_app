const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import des routes
const authRoutes = require('./routes/auth');
const exerciceRoutes = require('./routes/exercices');
const programmeRoutes = require('./routes/programmes');
const seanceRoutes = require('./routes/seances');
const statsRoutes = require('./routes/stats');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/exercices', exerciceRoutes);
app.use('/api/programmes', programmeRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/stats', statsRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Fitness App API - Serveur en ligne !' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
