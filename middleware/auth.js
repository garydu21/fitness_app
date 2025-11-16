const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Token manquant - Accès refusé' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user; // Ajoute les infos de l'utilisateur à la requête
    next();
  });
};

module.exports = authenticateToken;
