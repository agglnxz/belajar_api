
const express = require('express');
const app = express();
const port = 3820;


// Middleware 
app.use(express.json());

let director = [
  { id: 1, name: 'Christopher Nolan', birthYear: 1970 },
  { id: 2, name: 'The Wachowskis', birthYear: 1965 },
  { id: 3, name: 'Steven Spielberg', birthYear: 1946 }
]

let movies = [
  { id: 1, title: 'Inception', director: 'Christopher Nolan', year: 2010 },
  { id: 2, title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
  { id: 3, title: 'Interstellar', director: 'Christopher Nolan', year: 2014 }
];


// -- Routes --
app.get('/', (req, res) => {
  res.send('Selamat datang belajar API films!');
});

//movie routes
app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find(m => m.id === id);
  if (!movie) return res.status(404).json({ error: "Movie tidak,→ ditemukan" });
  res.json(movie);
});

app.post("/movies", (req, res) => {
  const { title, director, year } = req.body || {};
  if (!title || !director || !year) {
    return res.status(400).json({ error: "title, director, year,→ wajib diisi"});
    }
  const newMovie = { id:movies.length + 1, title, director, year };
  movies.push(newMovie); res.status(201).json(newMovie);

});

app.put("/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movieIndex = movies.findIndex(m => m.id === id);
  if (movieIndex === -1) {
    return res.status(404).json({ error: "Movie tidak ditemukan" });
  
}
  const { title, director, year } = req.body || {};
    const updatedMovie = { id, title, director, year };
    movies[movieIndex] = updatedMovie;
     res.json(updatedMovie);
 });

 app.delete("/movies/:id", (req, res) => {
   const id = Number(req.params.id);
   const movieIndex = movies.findIndex(m => m.id === id);
 if (movieIndex === -1) {
     return res.status(404).json({ error: "Movie tidak ditemukan"
 });
 
 }
 movies.splice(movieIndex, 1);
 res.status(204).send();
 });


//director routes
app.get('/directors', (req, res) => {
  res.json(director);
});

app.get("/directors/:id", (req, res) => {
  const id = Number(req.params.id);
  const directorItem = director.find(d => d.id === id);
  if (!directorItem) return res.status(404).json({ error: "Director tidak ditemukan" });
  res.json(directorItem);
});

app.post("/directors", (req, res) => {
  const { name, birthYear } = req.body || {};
  if (!name || !birthYear) {
    return res.status(400).json({ error: "name, birthYear, wajib diisi" });
  } 
  const newDirector = { id: director.length + 1, name, birthYear };
  director.push(newDirector);
  res.status(201).json(newDirector);
});

app.put("/directors/:id", (req, res) => {
  const id = Number(req.params.id);
  const directorIndex = director.findIndex(d => d.id === id);   
  if (directorIndex === -1) {
    return res.status(404).json({ error: "Director tidak ditemukan" });
  }
  const { name, birthYear } = req.body || {};
  const updatedDirector = { id, name, birthYear };
  director[directorIndex] = updatedDirector;
  res.json(updatedDirector);
});

app.delete("/directors/:id", (req, res) => {
  const id = Number(req.params.id);
  const directorIndex = director.findIndex(d => d.id === id); 
  if (directorIndex === -1) {
    return res.status(404).json({ error: "Director tidak ditemukan" });
  }
  director.splice(directorIndex, 1);
  res.status(204).send();
});



app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Terjadi kesalahan pada server'
  });
});


//start the server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
