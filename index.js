const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xh2az.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    await client.connect();
    const carPartsCollection = client.db('car_parts').collection('parts');

    app.get('/purchase', async(req, res)=>{
      const query = {};
      const cursor = carPartsCollection.find(query);
      const purchase = await cursor.toArray();
      res.send(purchase);
    })
  }
  finally{

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello manufacturer website')
})

app.listen(port, () => {
  console.log(`Manufacturer website app listening on port ${port}`)
})