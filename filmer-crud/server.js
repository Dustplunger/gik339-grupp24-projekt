const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./filmer.db', err => {
  if (err) console.error(err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS filmer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titel TEXT NOT NULL,
  år INTEGER,
  genre TEXT,
  betyg INTEGER
)`);

app.get('/filmer', (req, res) => {
  db.all('SELECT * FROM filmer', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/filmer/:id', (req, res) => {
  db.get('SELECT * FROM filmer WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Film ej hittad' });
    res.json(row);
  });
});

app.post('/filmer', (req, res) => {
  const { titel, år, genre, betyg } = req.body;
  db.run('INSERT INTO filmer (titel, år, genre, betyg) VALUES (?, ?, ?, ?)', [titel, år, genre, betyg], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Film skapad', id: this.lastID });
  });
});

app.put('/filmer', (req, res) => {
  const { id, titel, år, genre, betyg } = req.body;
  db.run('UPDATE filmer SET titel = ?, år = ?, genre = ?, betyg = ? WHERE id = ?', [titel, år, genre, betyg, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Film ej hittad' });
    res.json({ message: 'Film uppdaterad' });
  });
});

app.delete('/filmer/:id', (req, res) => {
  db.run('DELETE FROM filmer WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Film ej hittad' });
    res.json({ message: 'Film borttagen' });
  });
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});