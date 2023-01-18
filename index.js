const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
var bodyParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8l38tqf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("raintreeBooks").collection("books");
    const orderCollection = client.db("raintreeBooks").collection("orders");

    //Get all books item
    app.get("/books", async (req, res) => {
      const query = {};
      const books = await bookCollection.find(query).toArray();
      res.send(books);
    });

    //Ordered book save database
    app.post("/ordered-book", async (req, res) => {
      const order = req.body;
      const query = {
        bookName: order.bookName,
        authorName: order.authorName,
      };

      const exists = await orderCollection.findOne(query);
      const updateDoc = {
        $set: {
          quantity: exists?.quantity + 1,
          sum: (exists?.quantity + 1) * order.sum,
        },
      };
      if (exists) {
        const update = await orderCollection.updateOne(query, updateDoc);
        return res.send({ add: true, exists: exists, update });
      }
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
    });

    // Get All ordered books
    app.get("/orders", async (req, res) => {
      const query = {};
      const books = await orderCollection.find(query).toArray();
      res.send(books);
    });

    console.log("database connected");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Rain Tree Books!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
