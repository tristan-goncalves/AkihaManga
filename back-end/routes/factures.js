const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // Route GET : récupérer toutes les factures
    router.get("/", (req, res) => {
        const query = `SELECT * FROM factures`;
        db.all(query, [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });

    // Route GET : récupérer une facture par ID
    router.get("/:id", (req, res) => {
        const factureId = req.params.id;
        console.log("Récupération de la facture ID :", factureId); // Debug

        const queryFacture = `
            SELECT * FROM factures WHERE id = ?
        `;
        const queryArticles = `
            SELECT fa.quantity, m.titre, m.prix, m.image
            FROM facture_articles fa
            JOIN mangas m ON fa.article_id = m.id
            WHERE fa.facture_id = ?
        `;

        db.get(queryFacture, [factureId], (err, facture) => {
            if (err) {
                console.error("Erreur lors de la récupération de la facture :", err.message);
                return res.status(500).json({ error: err.message });
            }
            if (!facture) {
                console.error("Facture non trouvée pour ID :", factureId);
                return res.status(404).json({ error: "Facture non trouvée" });
            }

            db.all(queryArticles, [factureId], (err, articles) => {
                if (err) {
                    console.error("Erreur lors de la récupération des articles :", err.message);
                    return res.status(500).json({ error: err.message });
                }

                const formattedArticles = articles.map((article) => ({
                    titre: article.titre,
                    prix: article.prix,
                    image: `http://localhost:3000/images/${article.image}`, // URL complète
                    quantity: article.quantity,
                }));

                res.json({
                    id: facture.id,
                    utilisateur: JSON.parse(facture.utilisateur), // Convertir JSON en objet
                    total: facture.total,
                    articles: formattedArticles,
                });
            });
        });
    });

    // Route POST : créer une facture
    router.post("/", (req, res) => {
        const { utilisateur, articles, total } = req.body;

        console.log("Données reçues pour la facture :", req.body); // Debug

        // Étape 1 : Insérer la facture dans la table "factures"
        const queryFacture = `
            INSERT INTO factures (utilisateur, total)
            VALUES (?, ?)
        `;

        db.run(queryFacture, [JSON.stringify(utilisateur), total], function (err) {
            if (err) {
                console.error("Erreur lors de l'insertion de la facture :", err.message);
                return res.status(500).json({ error: err.message });
            }

            const factureId = this.lastID;
            console.log("Facture ID généré :", factureId);

            if (!factureId) {
                console.error("Erreur : ID de la facture non généré.");
                return res.status(500).json({ error: "Erreur lors de la création de la facture : ID non généré." });
            }

            // Étape 2 : Insérer les articles dans la table "facture_articles"
            const queryArticles = `
                INSERT INTO facture_articles (facture_id, article_id, quantity)
                VALUES (?, ?, ?)
            `;

            const articleInserts = articles.map((article) => {
                return new Promise((resolve, reject) => {
                    db.run(
                        queryArticles,
                        [factureId, article.id, article.quantity],
                        function (err) {
                            if (err) {
                                console.error("Erreur lors de l'insertion de l'article :", article.id, err.message);
                                reject(err);
                            } else {
                                console.log(`Article ID ${article.id} ajouté pour la facture ID ${factureId}`);
                                resolve();
                            }
                        }
                    );
                });
            });

            Promise.all(articleInserts)
                .then(() => {
                    console.log("Facture et articles insérés avec succès !");
                    res.status(201).json({ message: "Facture créée avec succès !", factureId });
                })
                .catch((err) => {
                    console.error("Erreur lors de l'insertion des articles :", err.message);
                    // Supprimer la facture si une erreur survient
                    db.run(`DELETE FROM factures WHERE id = ?`, [factureId], (deleteErr) => {
                        if (deleteErr) {
                            console.error("Erreur lors de la suppression de la facture incomplète :", deleteErr.message);
                        } else {
                            console.log("Facture incomplète supprimée avec succès :", factureId);
                        }
                    });
                    res.status(500).json({ error: "Erreur lors de l'insertion des articles." });
                });
        });
    });

    return router;
};
