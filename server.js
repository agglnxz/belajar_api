
const express = require('express');
const app = express();
const port = 3820;


// Middleware 
app.use(express.json());



let movies = [
  { id: 1, title: 'Inception', director: 'Christopher Nolan', year: 2010 },
  { id: 2, title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
  { id: 3, title: 'Interstellar', director: 'Christopher Nolan', year: 2014 }
];


// -- Routes --
app.get('/', (req, res) => {
  res.send('Selamat datang belajar API films!');
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get("/movies/:id1", (req, res) => {
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



app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

//start the server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
