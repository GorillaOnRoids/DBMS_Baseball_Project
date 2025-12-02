const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.static(__dirname));
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'KtPfw05gs67!',
    database: 'pitchers_data'
});

connection.connect(err => {
    if (err) {
        console.error("Error connecting:", err);
        return;
    }
    console.log("Connected to MySQL!");
});

app.get('/api/data', (req, res) => {
    const sql = "SELECT * FROM magil_test";
    console.log("Executing:", sql);

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).send("Error fetching data");
        }

        console.log("Results:", results);
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/api/players', (req, res) => {
    const sql = `
        SELECT 
            MIN(PitcherId) AS id,
            TRIM(Pitcher) AS name
        FROM sample_data
        GROUP BY TRIM(Pitcher)
        ORDER BY TRIM(Pitcher);
    `;

    console.log("Executing:", sql);

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).send("Error fetching players");
        }

        res.json(results);
    });
});

app.get('/api/stats', (req, res) => {
    const pitcherId = req.query.player;
    const season = req.query.season;

    const sql = `
        SELECT *
        FROM sample_data
        WHERE PitcherId = ?
          AND YEAR(Date) = ?
    `;

    connection.query(sql, [pitcherId, season], (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).send("Error fetching stats");
        }

        res.json(results);
    });
});

app.get('/api/seasons', (req, res) => {
    const sql = `
        SELECT DISTINCT YEAR(Date) AS season_year
        FROM sample_data
        ORDER BY season_year DESC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching seasons");
        }
        res.json(results);
    });
});
