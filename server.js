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

// UPDATED ENDPOINT: Filter by exact Date instead of Year
app.get('/api/stats', (req, res) => {
    const pitcherId = req.query.player;
    const gameDate = req.query.date; // Changed from 'season'

    // Use DATE() function to ensure we compare date parts only
    const sql = `
        SELECT *
        FROM sample_data
        WHERE PitcherId = ?
          AND DATE(Date) = ? 
    `;

    connection.query(sql, [pitcherId, gameDate], (err, results) => {
        if (err) {
            console.error("Query error:", err);
            return res.status(500).send("Error fetching stats");
        }
        res.json(results);
    });
});

app.get('/api/dates', (req, res) => {
    const pitcherId = req.query.player;
    console.log(`Fetching dates for pitcher ID: ${pitcherId}`);

    // QUERY CHECK: Ensure 'sample_data' is the correct table name
    // and 'Date' is the correct column name.
    const sql = `
        SELECT DISTINCT Date 
        FROM sample_data 
        WHERE PitcherId = ?
        ORDER BY Date DESC
    `;

    connection.query(sql, [pitcherId], (err, results) => {
        if (err) {
            // This will print the EXACT SQL error to your terminal
            console.error(">>> SQL ERROR in /api/dates:", err.sqlMessage); 
            return res.status(500).send("Database error");
        }

        console.log(`Found ${results.length} dates.`);

        // We format the date here in JavaScript instead of SQL 
        // to avoid SQL syntax version issues.
        const formattedResults = results.map(row => {
            // Create a JS Date object
            const d = new Date(row.Date);
            // Convert to YYYY-MM-DD string
            return { 
                date_str: d.toISOString().split('T')[0] 
            };
        });

        res.json(formattedResults);
    });
});
