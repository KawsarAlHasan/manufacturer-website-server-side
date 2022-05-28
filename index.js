const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xh2az.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const carPartsCollection = client.db('car_parts').collection('parts');
    const purchaseCollection = client.db('car_parts').collection('purchase');
    const usersCollection = client.db('car_parts').collection('users');

    app.get('/carParts', async (req, res) => {
      const query = {};
      const cursor = carPartsCollection.find(query);
      const carParts = await cursor.toArray();
      res.send(carParts);
    });

    app.get('/carParts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const carParts = await carPartsCollection.findOne(query);
      res.send(carParts);
    });

    app.put('/user/:email', async(req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = {email: email};
      const options = {upsert: true};
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    //my purchase
    app.get('/purchase', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = purchaseCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })

    //delete
    app.delete('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.send(result);
    });

    //post my purchase
    app.post('/purchase', async (req, res) => {
      const purchase = req.body;
      const partsQuantity = purchase.partsQuantity;
      const minimumQuantity = purchase.minimumQuantity;
      const userQuantity = purchase.userQuantity;
      if (partsQuantity >= userQuantity && userQuantity >= minimumQuantity) {
        const result = await purchaseCollection.insertOne(purchase);
        return res.send({ success: true, result });
      }
      else {
        return res.send({ success: false });
      }
    });

  }
  finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello manufacturer website')
})

app.listen(port, () => {
  console.log(`Manufacturer website app listening on port ${port}`)
})