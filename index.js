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

    // users
    app.post("/user", async (req, res) => {
      try {
        const userData = req.body;
        console.log(userData);
        const isUserExist = await usersCollection.findOne({
          email: userData?.email,
        });
        console.log(isUserExist);
        return;
        const result = await usersCollection.insertOne(userData);
        res.send({
          code: 200,
          message: "User created successfully",
          data: result,
        });
      } catch (error) {
        console.log(error.message);
      }
    });

    // login

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

// kyUAn8yYKL1jWxFJ
