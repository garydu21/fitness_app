-- Création de la base de données
CREATE DATABASE IF NOT EXISTS fitness_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fitness_app;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Table des exercices
CREATE TABLE exercices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    groupe_musculaire VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_by_user_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_groupe (groupe_musculaire),
    INDEX idx_created_by (created_by_user_id)
) ENGINE=InnoDB;

-- Table des programmes
CREATE TABLE programmes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- Table de liaison programme-exercices
CREATE TABLE programme_exercices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    programme_id INT NOT NULL,
    exercice_id INT NOT NULL,
    ordre INT NOT NULL,
    series INT DEFAULT 3,
    reps_cible INT DEFAULT 10,
    FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE CASCADE,
    FOREIGN KEY (exercice_id) REFERENCES exercices(id) ON DELETE CASCADE,
    INDEX idx_programme (programme_id)
) ENGINE=InnoDB;

-- Table des séances d'entraînement
CREATE TABLE seances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    programme_id INT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    duree INT, -- en minutes
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, date),
    INDEX idx_programme (programme_id)
) ENGINE=InnoDB;

-- Table des performances (séries effectuées)
CREATE TABLE performances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seance_id INT NOT NULL,
    exercice_id INT NOT NULL,
    serie_num INT NOT NULL,
    reps INT NOT NULL,
    poids DECIMAL(6,2) DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
    FOREIGN KEY (exercice_id) REFERENCES exercices(id) ON DELETE CASCADE,
    INDEX idx_seance (seance_id),
    INDEX idx_exercice (exercice_id)
) ENGINE=InnoDB;

-- Insertion d'exercices de base (publics)
INSERT INTO exercices (nom, groupe_musculaire, description, created_by_user_id) VALUES
('Développé couché', 'Pectoraux', 'Exercice de base pour les pectoraux', NULL),
('Squat', 'Jambes', 'Exercice de base pour les cuisses et fessiers', NULL),
('Soulevé de terre', 'Dos', 'Exercice polyarticulaire pour le dos et les jambes', NULL),
('Développé militaire', 'Épaules', 'Exercice pour les épaules avec barre', NULL),
('Traction', 'Dos', 'Exercice au poids du corps pour le dos', NULL),
('Curl biceps', 'Biceps', 'Exercice d\'isolation pour les biceps', NULL),
('Extension triceps', 'Triceps', 'Exercice d\'isolation pour les triceps', NULL),
('Leg press', 'Jambes', 'Exercice guidé pour les cuisses', NULL),
('Rowing barre', 'Dos', 'Exercice pour l\'épaisseur du dos', NULL),
('Dips', 'Pectoraux', 'Exercice au poids du corps pour pectoraux et triceps', NULL),
('Fentes', 'Jambes', 'Exercice pour les cuisses et fessiers', NULL),
('Élévations latérales', 'Épaules', 'Exercice d\'isolation pour les épaules', NULL);

-- Affichage de confirmation
SELECT 'Base de données créée avec succès !' as message;
SELECT CONCAT('Nombre d\'exercices de base insérés: ', COUNT(*)) as message FROM exercices;
