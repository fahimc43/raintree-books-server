const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
var bodyParser = require('body-parser');
require('dotenv').config()


const port = process.env.PORT || 5050;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6zppx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookCollection = client.db("raintreeBooks").collection("books");
  const orderCollection = client.db("raintreeBooks").collection("orders");

  app.get('/books', (req, res) => {
    bookCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.get('/book/:id', (req, res) => {
    bookCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })

  app.post('/addBook', (req, res) => {
    const newBook = req.body;
    bookCollection.insertOne(newBook)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addOrders', (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/orders', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //   client.close();
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})