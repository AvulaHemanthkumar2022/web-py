const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./user_data.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, age INTEGER, dob DATE)');
});

// Routes
app.post('/submit', (req, res) => {
    const { name, email, age, dob } = req.body;

    // Validate inputs
    if (!email.includes('@') || isNaN(age) || parseInt(age) <= 0) {
        return res.status(400).send('Invalid input data.');
    }

    // Insert data into database
    db.run('INSERT INTO users (name, email, age, dob) VALUES (?, ?, ?, ?)', [name, email, age, dob], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error storing data.');
        }
        res.redirect('/users');
    });
});

app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error retrieving data.');
        }
        res.send(`<html><body><table border="1"><tr><th>ID</th><th>Name</th><th>Email</th><th>Age</th><th>Date of Birth</th></tr>${rows.map(row => `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.email}</td><td>${row.age}</td><td>${row.dob}</td></tr>`).join('')}</table></body></html>`);
    });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));