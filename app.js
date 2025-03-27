const express = require("express");
const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "variable.env" });

// Set the view engine to EJS
app.use(cors());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images) from the "public" directory
app.use(express.static("public"));
const filepath = path.join(__dirname, "./public", "./index.html");

const apikey = process.env.apikey;

// Home page route
app.get("/", (req, res) => {
  res.render("index");
});

// Fetch weather and redirect to /finddata
app.post("/find", (req, res) => {
  const location = req.body.place;
  if (!location) {
    return res.status(400).send("Location is required");
  }

  superagent
    .get(process.env.endpoint)
    .query({ q: location, appid: apikey, units: "metric" })
    .then((response) => {
      fs.writeFile("weather.txt", JSON.stringify(response.body), (err) => {
        if (err) {
          console.error("Error writing file");
          return res.status(500).send("Server error");
        }
        console.log("Weather data saved!");

        //edirect to /finddata after saving data
        res.redirect("/finddata");
      });
    })
    .catch((error) => {
      res.status(500).send("Failed to fetch weather data");
    });
});

// Fetch weather from file and render it
app.get("/finddata", (req, res) => {
  try {
    const weatherdata = JSON.parse(fs.readFileSync("./weather.txt", "utf-8"));
    res.render("index", { weather: weatherdata });
  } catch (err) {
    res.status(500).send("Error reading weather data");
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server started on http://localhost:${process.env.PORT}`);
});
