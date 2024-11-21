const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db/database.sqlite", (err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err.message);
    } else {
        console.log("Connexion à la base de données réussie !");
    }
});

db.serialize(() => {
    
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom VARCHAR(50) NOT NULL
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS mangas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titre VARCHAR(100) NOT NULL,
            tome INTEGER NOT NULL,
            résumé TEXT,
            prix DECIMAL(10, 2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            image VARCHAR(255),
            categorie_id INTEGER NOT NULL,
            FOREIGN KEY (categorie_id) REFERENCES categories (id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS factures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur TEXT NOT NULL,
            total DECIMAL(10, 2) NOT NULL
        );
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS facture_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facture_id INTEGER NOT NULL,
            article_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (facture_id) REFERENCES factures(id),
            FOREIGN KEY (article_id) REFERENCES mangas(id)
        );
    `);

    console.log("Table facture_articles ajoutée si elle n'existait pas !");
});

db.close();
