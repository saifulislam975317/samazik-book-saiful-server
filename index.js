const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
// middleware

app.use(cors());
app.use(express.json());

// mongodb connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stpdj.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // collection name

    const PostsCollection = client.db("samazikBookDb").collection("usersPosts");
    const usersCollection = client.db("samazikBookDb").collection("users");

    app.post("/usersPost", async (req, res) => {
      const newPost = req.body;
      const result = await PostsCollection.insertOne(newPost);
      res.send(result);
    });

    app.get("/usersPost", async (req, res) => {
      const result = await PostsCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/postDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await PostsCollection.findOne(query);
      res.send(result);
    });

    app.put("/usersPost/:id", async (req, res) => {
      const id = req.params.id;
      const newLike = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          totalLikes: newLike.countLikes,
        },
      };
      const result = await PostsCollection.updateOne(query, updateDoc, options);

      res.send(result);
    });

    // users api

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exit" });
      }

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          name: updateUser.name,
          university: updateUser.university,
          address: updateUser.address,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);

      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("connected. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("samazik book server is running");
});

app.listen(port, () => {
  console.log(`samazik book server is running at ${port}`);
});
