require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;
  next();
}

const uri =
  "mongodb+srv://eshansaif1234:kyUAn8yYKL1jWxFJ@cluster0.c9ympil.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const recipeDB = client.db("recipeDB");
    const recipeCollection = recipeDB.collection("recipeCollection");
    const categories = recipeDB.collection("categories");
    const usersCollection = recipeDB.collection("usersCollection");

    app.get("/", (req, res) => {
      res.send("Welcome to the server");
    });

    // user
    // User routes
    app.post("/user", async (req, res) => {
      const user = req.body;
      const isUserExist = await usersCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          status: "success",
          message: "Login success",
        });
      }
      const result = await usersCollection.insertOne(user);
      return res.send(result);
    });

    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await usersCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });
    // Recipes
    app.post("/recipes", async (req, res) => {
      try {
        const recipeData = req.body;
        const result = await recipeCollection.insertOne(recipeData);
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    });

    app.get("/recipes", async (req, res) => {
      try {
        const data = recipeCollection.find();
        const result = await data.toArray();
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    });

    // view details

    app.get("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      try {
        const result = await recipeCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("Error finding recipe:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching the recipe" });
      }
    });

    app.patch("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await recipeCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });
    app.delete("/recipes/:id", async (req, res) => {
      const id = req.params.id;
      const result = await recipeCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Categories;
    app.get("/categories", async (req, res) => {
      try {
        const data = categories.find();
        const result = await data.toArray();
        res.send(result);
      } catch (error) {
        console.log(error.message);
      }
    });

    // get all chefs
    app.get("/users/chefs", async (req, res) => {
      try {
        const chefs = await usersCollection.find({ role: "chef" }).toArray();
        res.json(chefs);
      } catch (error) {
        console.error("Error fetching chefs:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching chefs" });
      }
    });
    // Recipe by chef

    app.get("/recipes/chef/:email", async (req, res) => {
      try {
        const { email } = req.params;
        console.log(email);
        const recipes = await recipeCollection.find({ email: email }).toArray();
        res.json(recipes);
      } catch (error) {
        console.error("Error fetching recipes by chef:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching recipes" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
