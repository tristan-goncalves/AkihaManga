const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    router.get("/", (req, res) => {
        const query = `
            SELECT mangas.id, mangas.titre, mangas.tome, mangas.résumé, mangas.prix, mangas.stock,
                   mangas.image, categories.nom AS categorie
            FROM mangas
            JOIN categories ON mangas.categorie_id = categories.id
            ORDER BY mangas.titre ASC, mangas.tome ASC; -- Tri par titre, puis par numéro de tome
        `;
        db.all(query, [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                const mangas = rows.map((manga) => ({
                    ...manga,
                    image: `http://localhost:3000/images/${manga.image}`
                }));
                res.json(mangas);
            }
        });
    });

    router.get("/:id", (req, res) => {
        const id = req.params.id;
        const query = `
            SELECT mangas.id, mangas.titre, mangas.tome, mangas.résumé, mangas.prix, mangas.stock,
                   mangas.image, categories.nom AS categorie
            FROM mangas
            JOIN categories ON mangas.categorie_id = categories.id
            WHERE mangas.id = ?;
        `;
        db.get(query, [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (!row) {
                res.status(404).json({ error: "Manga non trouvé." });
            } else {
                row.image = `http://localhost:3000/images/${row.image}`;
                res.json(row);
            }
        });
    });

    router.post("/", (req, res) => {
        const { titre, tome, résumé, prix, stock, image, categorie_id } = req.body;
        const query = `
            INSERT INTO mangas (titre, tome, résumé, prix, stock, image, categorie_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [titre, tome, résumé, prix, stock, image, categorie_id];

        db.run(query, params, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID });
            }
        });
    });

    router.put("/:id", (req, res) => {
        const id = req.params.id;
        const { titre, tome, résumé, prix, stock, image, categorie_id } = req.body;

        const query = `
            UPDATE mangas
            SET titre = ?, tome = ?, résumé = ?, prix = ?, stock = ?, image = ?, categorie_id = ?
            WHERE id = ?;
        `;
        const params = [titre, tome, résumé, prix, stock, image, categorie_id, id];

        db.run(query, params, function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: "Manga non trouvé." });
            } else {
                res.json({ message: "Manga mis à jour avec succès." });
            }
        });
    });

    return router;
};
