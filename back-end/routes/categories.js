const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    router.get("/", (req, res) => {
        const query = `SELECT * FROM categories`;
        db.all(query, [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    });

    router.post("/", (req, res) => {
        const { nom } = req.body;
        const query = `INSERT INTO categories (nom) VALUES (?)`;

        db.run(query, [nom], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID });
            }
        });
    });
    return router;
};
