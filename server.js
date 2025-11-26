// import env
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const {authenticateToken,authorizeRole} = require('./middleware/auth.js');
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
app.post("/auth/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("error hashing:", err);
        return res.status(500).json({ error: "gagal memproses pendaftaran" });
      }
      const sql = "INSERT INTO users (username, password, role) VALUES (?,?,?)";
      const params = [username.toLowerCase(), hashedPassword, 'user'];
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
app.post("/auth/login", (req, res) => {
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
      const payload = { user: { id: user.id, username: user.username , role: user.role } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          return res.status(500).json({ error: "Failed to generate token" });
        }
        res.json({ message: "Login successful", token: token });
      });
    });
  });
  });

  // auth register
app.post("/auth/register-admin", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("error hashing:", err);
        return res.status(500).json({ error: "gagal memproses pendaftaran" });
      }
      const sql = "INSERT INTO users (username, password, role) VALUES (?,?,?)";
      const params = [username.toLowerCase(), hashedPassword, 'admin'];
      db.run(sql, params, function (err) {
        if (err) {
          if (err.message.includes(`UNIQUE constraint`)) {
            return res.status(409).json({ error: "Username admin already exists" });
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



//movies routes
app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movies ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message });
    }
    res.json({
      "message": "success", "data": rows });
  });
});

app.get("/movies/:id", (req, res) => {
   const sql = "SELECT * FROM movies WHERE id = ?";
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
   const sql = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
    db.run(sql, [title, director, year], function(err) {
      if (err) {
        return res.status(500).json({ "error": err.message });
      }
      res.status(201).json({ "message": "success", "data": { id: this.lastID, title, director, year } });
    });

 });

app.put("/movies/:id", authenticateToken ,authorizeRole("admin"), (req, res) => {
  const {title, director, year} =req.body;
  const sql = 'UPDATE movies SET title = ?, director = ?, year = ?  WHERE id = ?';
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

app.delete("/movies/:id", authenticateToken,authorizeRole("admin"), (req, res) => {
  const sql = 'DELETE FROM movies WHERE id = ?'; 
  db.run(sql, req.params.id, function(err) {
    if (err) {
      return res.status(500).json({ "error": err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Movie tidak ditemukan" });
    }
    res.status(204).end();
  });
});



// ===== DIRECTORS ROUTES =====

// GET all directors
app.get('/directors', (req, res) => {
  const sql = "SELECT * FROM directors ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "success", data: rows });
  });
});

// GET director by ID
app.get("/directors/:id", (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Director tidak ditemukan" });

    res.json({ message: "success", data: row });
  });
});

// CREATE director
app.post("/directors", authenticateToken , (req, res) => {
  const { name, birth_date, country } = req.body;

  if (!name || !birth_date) {
    return res.status(400).json({ error: "name & birth_date wajib diisi" });
  }

  const sql = `INSERT INTO directors (name, birth_date, country) VALUES (?,?,?)`;
  db.run(sql, [name, birth_date, country || null], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Director created successfully",
      data: { id: this.lastID, name, birth_date, country }
    });
  });
});

// UPDATE director
app.put("/directors/:id", authenticateToken,authorizeRole("admin"), (req, res) => {
  const { name, birth_date, country } = req.body;

  const sql = `UPDATE directors SET name=?, birth_date=?, country=? WHERE id=?`;
  db.run(sql, [name, birth_date, country, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Director tidak ditemukan" });

    res.json({
      message: "Director updated",
      data: { id: req.params.id, name, birth_date, country }
    });
  });
});

// DELETE director
app.delete("/directors/:id", authenticateToken,authorizeRole("admin"), (req, res) => {
  const sql = `DELETE FROM directors WHERE id = ?`;
  db.run(sql, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Director tidak ditemukan" });

    res.status(200).json({ message: "Director deleted successfully" });
  });
});



//start the server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
