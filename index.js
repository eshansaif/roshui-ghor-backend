const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;
app.use(cors());

const chefData = require("./data/chef.json");

app.get("/", (req, res) => {
  res.send("Baburchi King is running");
});

app.get("/chefs", (req, res) => {
  res.send(chefData);
});

app.get("/chefs/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  const individualChef = chefData.chefs.filter((chef) => chef.id == id);
  res.send(individualChef);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
