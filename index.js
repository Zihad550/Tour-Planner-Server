const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhmov.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("tourPlanner");
    const toursCollection = database.collection("tours");
    const exploreItemCollection = database.collection("exploreItems");
    const orderDetailsCollection = database.collection("orderDetails");
    const reviewCollection = database.collection("reviews");

    // get all the tours
    app.get("/tours", async (req, res) => {
      const cursor = toursCollection.find({});
      let tours = await cursor.toArray();
      res.send(tours);
    });
    // get all the explore items
    app.get("/exploreitems", async (req, res) => {
      const cursor = exploreItemCollection.find({});
      let result = await cursor.toArray();
      res.send(result);
    });
    // get all the reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      let result = await cursor.toArray();
      res.send(result);
    });
    // get all the orders
    app.get("/orders", async (req, res) => {
      const cursor = orderDetailsCollection.find({});
      console.log(req.query);
      let result = await cursor.toArray();
      res.send(result);
    });

    // get single tour
    app.get("/tours/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await toursCollection.findOne(query);
      res.send(product);
    });

    // add order
    app.post("/orderDetails", async (req, res) => {
      const order = req.body;
      const result = await orderDetailsCollection.insertOne(order);
      res.json(result);
    });

    // add tour
    app.post("/tours", async (req, res) => {
      const tour = req.body;
      const result = await toursCollection.insertOne(tour);
      res.json(result);
    });

    // update tour status
    app.put("/orderDetails/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrderDetail = req.body;
      console.log(updatedOrderDetail);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          orderStatus: "Approved",
        },
      };
      const result = await orderDetailsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
      console.log("updateing user with", id);
      res.json(result);
    });

    // delete product
    app.delete("/orderDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderDetailsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to emma john server");
});

app.listen(port, () => {
  console.log("running on port", port);
});
