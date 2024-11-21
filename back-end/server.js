const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier public/images
app.use("/images", express.static("public/images"));

// Connexion à la base de données
const db = new sqlite3.Database("./db/database.sqlite", (err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err.message);
    } else {
        console.log("Connecté à la base de données SQLite");
    }
});

// Routes
app.get("/", (req, res) => {
    res.send("Bienvenue sur l'API du site d'e-commerce de mangas !");
});

// Import des routes
const mangasRoutes = require("./routes/mangas");
const categoriesRoutes = require("./routes/categories");
const facturesRoutes = require("./routes/factures");

app.use("/mangas", mangasRoutes(db));
app.use("/categories", categoriesRoutes(db));
app.use("/factures", facturesRoutes(db));

// Gestion des erreurs 404 pour les routes non définies
app.use((req, res, next) => {
    res.status(404).send("Route non trouvée !");
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error("Erreur : ", err.stack);
    res.status(500).send("Erreur interne du serveur !");
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Les fichiers statiques sont accessibles sur http://localhost:${PORT}/images`);
});
