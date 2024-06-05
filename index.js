// require("dotenv").config();
// const express = require("express");
// const app = express();
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// function createToken(user) {
//   const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
//   return token;
// }

// // function verifyToken(req, res, next) {
// //   try {
// //     const authHeader = req.headers.authorization;
// //     if (!authHeader)
// //       return res.status(401).send("Authorization header missing");

// //     const token = authHeader.split(" ")[1];
// //     if (!token) return res.status(401).send("Token missing");

// //     const verify = jwt.verify(token, process.env.JWT_SECRET);
// //     if (!verify?.email)
// //       return res.status(401).send("Token verification failed");

// //     req.user = verify.email;
// //     next();
// //   } catch (error) {
// //     console.error("Token verification error:", error);
// //     res.status(401).send("You are not authorized");
// //   }
// // }

// const uri =
//   "mongodb+srv://eshansaif1234:kyUAn8yYKL1jWxFJ@cluster0.c9ympil.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();
//     const recipeDB = client.db("recipeDB");
//     const recipeCollection = recipeDB.collection("recipeCollection");
//     const categories = recipeDB.collection("categories");
//     const usersCollection = recipeDB.collection("usersCollection");

//     app.get("/", (req, res) => {
//       res.send("Welcome to the server");
//     });

//     app.post("/user", async (req, res) => {
//       const user = req.body;
//       const token = createToken(user);
//       const isUserExist = await usersCollection.findOne({ email: user?.email });
//       if (isUserExist?._id) {
//         return res.send({ status: "success", message: "Login success", token });
//       }
//       await usersCollection.insertOne(user);
//       return res.send({ token });
//     });

//     app.get("/user/get/:id", async (req, res) => {
//       const id = req.params.id;
//       const result = await usersCollection.findOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });

//     app.get("/user/:email", async (req, res) => {
//       const email = req.params.email;
//       const result = await usersCollection.findOne({ email });
//       res.send(result);
//     });

//     app.patch("/user/:email", async (req, res) => {
//       const email = req.params.email;
//       const userData = req.body;
//       const result = await usersCollection.updateOne(
//         { email },
//         { $set: userData },
//         { upsert: true }
//       );
//       res.send(result);
//     });

//     app.post("/recipes", async (req, res) => {
//       try {
//         const recipeData = req.body;
//         console.log("Adding recipe:", recipeData);
//         const result = await recipeCollection.insertOne(recipeData);
//         res.send(result);
//       } catch (error) {
//         console.error("Error adding recipe:", error);
//         res.status(500).send("An error occurred while adding the recipe");
//       }
//     });

//     app.get("/recipes", async (req, res) => {
//       try {
//         const data = recipeCollection.find();
//         const result = await data.toArray();
//         res.send(result);
//       } catch (error) {
//         console.log(error.message);
//       }
//     });

//     app.get("/recipes/:id", async (req, res) => {
//       const id = req.params.id;
//       console.log(id);
//       try {
//         const result = await recipeCollection.findOne({
//           _id: new ObjectId(id),
//         });
//         res.send(result);
//       } catch (error) {
//         console.error("Error finding recipe:", error);
//         res
//           .status(500)
//           .json({ error: "An error occurred while fetching the recipe" });
//       }
//     });

//     app.patch("/recipes/:id", async (req, res) => {
//       const id = req.params.id;
//       const updatedData = req.body;
//       const result = await recipeCollection.updateOne(
//         { _id: new ObjectId(id) },
//         { $set: updatedData }
//       );
//       res.send(result);
//     });

//     app.delete("/recipes/:id", async (req, res) => {
//       const id = req.params.id;
//       const result = await recipeCollection.deleteOne({
//         _id: new ObjectId(id),
//       });
//       res.send(result);
//     });

//     app.get("/categories", async (req, res) => {
//       try {
//         const data = categories.find();
//         const result = await data.toArray();
//         res.send(result);
//       } catch (error) {
//         console.log(error.message);
//       }
//     });

//     app.get("/users/chefs", async (req, res) => {
//       try {
//         const chefs = await usersCollection.find({ role: "chef" }).toArray();
//         res.json(chefs);
//       } catch (error) {
//         console.error("Error fetching chefs:", error);
//         res
//           .status(500)
//           .json({ error: "An error occurred while fetching chefs" });
//       }
//     });

//     app.get("/recipes/chef/:email", async (req, res) => {
//       try {
//         const { email } = req.params;
//         console.log(email);
//         const recipes = await recipeCollection.find({ email: email }).toArray();
//         res.json(recipes);
//       } catch (error) {
//         console.error("Error fetching recipes by chef:", error);
//         res
//           .status(500)
//           .json({ error: "An error occurred while fetching recipes" });
//       }
//     });

//     app.get("/stats", async (req, res) => {
//       try {
//         const totalUsers = await usersCollection.countDocuments();
//         const totalChefs = await usersCollection.countDocuments({
//           role: "chef",
//         });
//         const totalRecipes = await recipeCollection.countDocuments();
//         const totalCategories = await categories.countDocuments();

//         const categoryWiseRecipes = await categories
//           .aggregate([
//             {
//               $lookup: {
//                 from: "recipeCollection",
//                 localField: "title",
//                 foreignField: "category",
//                 as: "recipes",
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 category: "$title",
//                 recipeCount: { $size: "$recipes" },
//               },
//             },
//           ])
//           .toArray();

//         res.json({
//           totalUsers,
//           totalChefs,
//           totalRecipes,
//           totalCategories,
//           categoryWiseRecipes,
//         });
//       } catch (error) {
//         console.error("Error fetching stats:", error);
//         res
//           .status(500)
//           .json({ error: "An error occurred while fetching stats" });
//       }
//     });

//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// }
// run().catch(console.dir);

// app.listen(port, () => {
//   console.log(`Server is listening at ${port}`);
// });

// ----------------------------------------------------------

require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let recipeCollection, categories, usersCollection;

// Connect to MongoDB
client
  .connect()
  .then(() => {
    const recipeDB = client.db("recipeDB");
    recipeCollection = recipeDB.collection("recipeCollection");
    categories = recipeDB.collection("categories");
    usersCollection = recipeDB.collection("usersCollection");

    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.post("/user", async (req, res) => {
  const user = req.body;
  const token = createToken(user);
  const isUserExist = await usersCollection.findOne({ email: user?.email });
  if (isUserExist?._id) {
    return res.send({ status: "success", message: "Login success", token });
  }
  await usersCollection.insertOne(user);
  return res.send({ token });
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

app.post("/recipes", async (req, res) => {
  try {
    const recipeData = req.body;
    console.log("Adding recipe:", recipeData);
    const result = await recipeCollection.insertOne(recipeData);
    res.send(result);
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.status(500).send("An error occurred while adding the recipe");
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

app.get("/categories", async (req, res) => {
  try {
    const data = categories.find();
    const result = await data.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/users/chefs", async (req, res) => {
  try {
    const chefs = await usersCollection.find({ role: "chef" }).toArray();
    res.json(chefs);
  } catch (error) {
    console.error("Error fetching chefs:", error);
    res.status(500).json({ error: "An error occurred while fetching chefs" });
  }
});

app.get("/recipes/chef/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log(email);
    const recipes = await recipeCollection.find({ email: email }).toArray();
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes by chef:", error);
    res.status(500).json({ error: "An error occurred while fetching recipes" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const totalUsers = await usersCollection.countDocuments();
    const totalChefs = await usersCollection.countDocuments({ role: "chef" });
    const totalRecipes = await recipeCollection.countDocuments();
    const totalCategories = await categories.countDocuments();

    const categoryWiseRecipes = await categories
      .aggregate([
        {
          $lookup: {
            from: "recipeCollection",
            localField: "title",
            foreignField: "category",
            as: "recipes",
          },
        },
        {
          $project: {
            _id: 0,
            category: "$title",
            recipeCount: { $size: "$recipes" },
          },
        },
      ])
      .toArray();

    res.json({
      totalUsers,
      totalChefs,
      totalRecipes,
      totalCategories,
      categoryWiseRecipes,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "An error occurred while fetching stats" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
