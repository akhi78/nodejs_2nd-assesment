const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const InitilizeDbToServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`Database Error is ${e.message}`);
    process.exit(1);
  }
};

InitilizeDbToServer();

//Get details from Movie Table

app.get("/movies/", async (request, response) => {
  const query = `SELECT movie_name FROM movie`;
  const GetMovieResponse = await db.all(query);
  response.send(
    GetMovieResponse.map((eachitem) => {
      return {
        movieName: eachitem.movie_name,
      };
    })
  );
});

//Post method

app.post("/movies/", async (request, response) => {
  //   const { movie_Id } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const AddQuery = `INSERT INTO movie 
  (director_id,movie_name,lead_actor)
  VALUES('${directorId}','${movieName}','${leadActor}')`;
  const AddMovieResponse = await db.run(AddQuery);
  response.send("Movie Successfully Added");
});

// Get the movie detail on moviesID

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const Query = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const GetMovieRes = await db.get(Query);
  response.send(GetMovieRes);
});

//update the value
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateQuery = `UPDATE movie
  SET director_id = '${directorId}',movie_name ='${movieName}',lead_actor ='${leadActor}'
  WHERE movie_id=${movieId}`;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//DELETE Method

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const DelQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const DelResponse = await db.run(DelQuery);
  response.send("Movie Removed");
});

//director table
app.get("/directors/", async (request, response) => {
  const Query = `SELECT * FROM director`;
  const allDirector = await db.all(Query);
  response.send(
    allDirector.map((eachitem) => {
      return {
        directorId: eachitem.director_id,
        directorName: eachitem.director_name,
      };
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const Query = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const GetmovieName = await db.get(Query);
  response.send(
    GetmovieName.map((eachitem) => {
      return {
        movieName: eachitem.movie_name,
      };
    })
  );
});

module.exports = app;
