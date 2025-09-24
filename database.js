require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
// const DBSOURCE = process.env.DB_SOURCE || "movies.db";
// const DBSOURCE2 = process.env.DB_SOURCE || "diretors.db";


//inisiasi database
const db = new sqlite3.Database('./movies.db',(err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database movies.');
        db.run(`CREATE TABLE IF NOT EXISTS movie (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title text NOT NULL,
                director text NOT NULL,
                year INTEGER NOT NULL
              )`,
            (err) => {
                if (err) {
                    console.log('Gagal membuat tabel movie', err.message);
                }
                
                db.get('SELECT COUNT(*) AS count FROM movie', (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }

                    if (row.count === 0) {
                        console.log('menambahkan data awal ke tabel movie');
                        const insert = 'INSERT INTO movie (title, director, year) VALUES (?,?,?)';
                        db.run(insert, ["Inception", "Christopher Nolan", 2010]);
                        db.run(insert, ["The Matrix", "The Wachowskis", 1999]);
                        db.run(insert, ["Interstellar", "Christopher Nolan", 2014]);
                    }
                });
            });
    }
});

//inisiasi database directors
const db2 = new sqlite3.Database('./directors.db',(err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database directors.');
        db2.run(`CREATE TABLE IF NOT EXISTS director (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name text NOT NULL,
                birthYear text NOT NULL
              )`,
            (err) => {
                if (err) {
                    console.log('Gagal membuat tabel director', err.message);
                }
                
                db2.get('SELECT COUNT(*) AS count FROM director', (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }

                    if (row.count === 0) {
                        console.log('menambahkan data awal ke tabel director');
                        const insert = 'INSERT INTO director (name, birthYear) VALUES (?,?)';
                        db2.run(insert, ["Christopher Nolan", 1970]);
                        db2.run(insert, ["The Wachowskis", 1980]);
                        db2.run(insert, ["Herman Febriansah", 1992]);
                    }
                });
            });
    }
});

module.exports = {db,db2};