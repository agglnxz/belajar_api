// import env
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateToken = require('./middleware/middleware.js');
//import database
const db = require('./database.js');


const app = express();
const PORT = process.env.PORT || 3200;

// Middleware 
app.use(cors());
app.use(express.json());



// let director = [
//   { id: 1, name: 'Christopher Nolan', birthYear: 1970 },
//   { id: 2, name: 'The Wachowskis', birthYear: 1965 },
//   { id: 3, name: 'Steven Spielberg', birthYear: 1946 }
// ]

// let movies = [
//   { id: 1, title: 'Inception', director: 'Christopher Nolan', year: 2010 },
//   { id: 2, title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
//   { id: 3, title: 'Interstellar', director: 'Christopher Nolan', year: 2014 }
// ];


// -- Routes --
app.get('/status', (req, res) => {
  res.json({ok: true, status: 'server is running', service: 'Movie API'});
});

// auth register
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("error hashing:", err);
        return res.status(500).json({ error: "gagal memproses pendaftaran" });
      }
      const sql = "INSERT INTO users (username, password) VALUES (?,?)";
      const params = [username.toLowerCase(), hashedPassword];
      db.run(sql, params, function (err) {
        if (err) {
          if (err.message.includes(`UNIQUE constraint`)) {
            return res.status(409).json({ error: "Username already exists" });
          }
          console.error("Error inserting user :", err);
          return res.status(500).json({ error: "gagal memproses pendaftaran" });
        }
        res
          .status(201)
          .json({ message: "User registered successfully", userId: this.lastID });
      });
    });
});  
//login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username or password is missing" });
  }
  const sql = " SELECT * FROM users WHERE username = ?";
  db.get(sql, [username.toLowerCase()], (err, user) => {
    if (err || !user) {
      return res
        .status(401)
        .json({ error: "Username or password is incorrect" });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: "Username or password is incorrect" });
      }
      const payload = { user: { id: user.id, username: user.username } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          return res.status(500).json({ error: "Failed to generate token" });
        }
        res.json({ message: "Login successful", token: token });
      });
    });
  });
  });


//movie routes
app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movie ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message });
    }
    res.json({
      "message": "success", "data": rows });
  });
});

app.get("/movies/:id", (req, res) => {
   const sql = "SELECT * FROM movie WHERE id = ?";
   db.get(sql, [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ "error": err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "movies tidak ditemukan" });
      }
      res.json({ "message": "success", "data": row });
    });
 });

 app.post("/movies", authenticateToken, (req, res) => {
   const { title, director, year } = req.body;
   if (!title || !director || !year) {
     return res.status(400).json({ error: "title, director, year,→ wajib diisi"});
     }
   const sql = 'INSERT INTO movie (title, director, year) VALUES (?,?,?)';
    db.run(sql, [title, director, year], function(err) {
      if (err) {
        return res.status(500).json({ "error": err.message });
      }
      res.status(201).json({ "message": "success", "data": { id: this.lastID, title, director, year } });
    });

 });

app.put("/movies/:id", authenticateToken , (req, res) => {
  const {title, director, year} =req.body;
  const sql = 'UPDATE movie SET title = ?, director = ?, year = ?  WHERE id = ?';
  db.run(sql, [title, director, year, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ "error": err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Movie tidak ditemukan" });
    }
    res.json({ "message": "success", "data": { id: req.params.id, title, director, year } });
  });
});

app.delete("/movies/:id", authenticateToken, (req, res) => {
  const sql = 'DELETE FROM movie WHERE id = ?'; 
  db.run(sql, req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ "error": err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Movie tidak ditemukan" });
    }
    res.status(204).send();
  });
});



//director routes
// app.get('/directors', (req, res) => {
//   const sql = "SELECT * FROM director ORDER BY id ASC";
//   db2.all(sql, [], (err, rows) => {
//     if (err) {
//       return res.status(400).json({ "error": err.message });
//     }
//     res.json({
//       "message": "success", "data": rows });
//   });
// });

// app.get("/directors/:id", (req, res) => {
//    const sql = "SELECT * FROM director WHERE id = ?";
//    db2.get(sql, [req.params.id], (err, row) => {
//       if (err) {
//         return res.status(500).json({ "error": err.message });
//       }
//       if (!row) {
//         return res.status(404).json({ error: "Director tidak ditemukan" });
//       }
//       res.json({ "message": "success", "data": row });
//     });
//  });

//  app.post("/directors", (req, res) => {
//    const { name, birthYear } = req.body;
//    if (!name || !birthYear) {
//      return res.status(400).json({ error: "name, birthYear,→ wajib diisi"});
//      }
//    const sql = 'INSERT INTO director (name, birthYear) VALUES (?,?)';
//     db2.run(sql, [name, birthYear], function(err) {
//       if (err) {
//         return res.status(500).json({ "error": err.message });
//       }
//       res.status(201).json({ "message": "success", "data": { id: this.lastID, name, birthYear} });
//     });

//  });

// app.put("/directors/:id", (req, res) => {
//   const { name, birthYear} = req.body;
//   const sql = 'UPDATE director SET name = ?, birthYear = ? WHERE id = ?';
//   db2.run(sql, [name, birthYear, req.params.id], function(err) {
//     if (err) {
//       return res.status(500).json({ "error": err.message });
//     }
//     if (this.changes === 0) {
//       return res.status(404).json({ error: "Director tidak ditemukan" });
//     }
//     res.json({ "message": "success", "data": { id: req.params.id, name, birthYear} });
//   });
// });

// app.delete("/directors/:id", (req, res) => {
//   const sql = 'DELETE FROM Director WHERE id = ?'; 
//   db2.run(sql, req.params.id, function(err) {
//     if (err) {
//       return res.status(500).json({ "error": err.message });
//     }
//     if (this.changes === 0) {
//       return res.status(404).json({ error: "director tidak ditemukan" });
//     }
//     res.status(204).send();
//   });
// });


//start the server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
