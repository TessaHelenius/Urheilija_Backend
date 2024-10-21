const mysql = require("mysql");
const express = require("express");

var app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));

// Palvelimen käynnistys portissa 3000
const server = app.listen(3000, () =>
  console.log("Palvelin toimii portissa 3000")
);

// Yhteyden muodostaminen tietokantaan
const conn = mysql.createConnection({
  host: "localhost",
  user: "kt", // Käyttäjätunnus
  password: "kt123456", // Salasana
  database: "urheilijat_db", // Oikea tietokannan nimi
  multipleStatements: true,
});

conn.connect((err) => {
  if (err) {
    console.log("Tapahtui virhe yhdistettäessä tietokantaan");
    return;
  }
  console.log("Yhteys muodostettu tietokantaan");
});

/* CORS-asetukset, jotta frontend voi tehdä pyyntöjä backendille */
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-type", "application/json");
  next();
});

// Hae kaikki urheilijat
app.get("/urheilijat", (req, res) => {
  conn.query("SELECT * FROM urheilijat", (err, rows) => {
    if (err) throw err;
    return res.status(200).json(rows); // Palautetaan kaikki urheilijat
  });
});

// Hae urheilija ID:n perusteella
app.get("/urheilijat/:id", (req, res) => {
  const id = Number(req.params.id);
  conn.query("SELECT * FROM urheilijat WHERE id=?", id, (err, rows) => {
    if (err) throw err;
    res.end(JSON.stringify(rows[0])); // Palautetaan yksittäinen urheilija
  });
});

// Lisää uusi urheilija
app.post("/urheilijat", (req, res) => {
  let urheilija = req.body; // Urheilijatiedot requestin bodyssä
  if (!urheilija) {
    return res
      .status(400)
      .send({ error: true, message: "Urheilija-objektia ei muodostunut" });
  }
  conn.query("INSERT INTO urheilijat SET ?", urheilija, (error, results) => {
    if (error) throw error;
    return res.send(
      JSON.stringify({ id: results.insertId, ...urheilija }) // Palautetaan lisätty urheilija
    );
  });
});

// Päivitä urheilija
app.put("/urheilijat/:id", (req, res) => {
  const id = Number(req.params.id);
  const updatedUrheilija = req.body;
  conn.query(
    "UPDATE urheilijat SET ? WHERE id = ?;",
    [updatedUrheilija, id],
    (error, results) => {
      if (error) throw error;
      conn.query("SELECT * FROM urheilijat WHERE id=?", id, (err, rows) => {
        if (err) throw err;
        res.end(JSON.stringify(rows[0])); // Palautetaan päivitetty urheilija
      });
    }
  );
});

// Poista urheilija
app.delete("/urheilijat/:id", (req, res) => {
  const id = Number(req.params.id);
  conn.query("DELETE FROM urheilijat WHERE id = ?", id, (error, results) => {
    if (error) throw error;
    return res.send({ message: "Urheilija poistettu onnistuneesti" });
  });
});

module.exports = app;
