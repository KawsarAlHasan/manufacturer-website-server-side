const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xh2az.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthrized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "fobidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const carPartsCollection = client.db("car_parts").collection("parts");
    const addToCardCollection = client.db("car_parts").collection("addtocard");
    const ordersCollection = client.db("car_parts").collection("orders");
    const usersCollection = client.db("car_parts").collection("users");
    const categoryCollection = client.db("car_parts").collection("category");
    const subCategoryCollection = client
      .db("car_parts")
      .collection("subcategory");

    // get all products
    app.get("/carParts", async (req, res) => {
      const query = {};
      const cursor = carPartsCollection.find(query);
      const carParts = await cursor.toArray();
      res.send(carParts);
    });

    // clothes category
    app.get("/clothes", async (req, res) => {
      const subCategoryname = req.query.subCategory;
      const cursor = carPartsCollection.find({ category: subCategoryname });
      const carParts = await cursor.toArray();
      res.send(carParts);
    });

    // get product id
    app.get("/carParts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const carParts = await carPartsCollection.findOne(query);
      res.send(carParts);
    });

    //parts Delete
    app.delete("/carParts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carPartsCollection.deleteOne(query);
      res.send(result);
    });

    // parts post
    app.post("/carParts", async (req, res) => {
      const newParts = req.body;
      const result = await carPartsCollection.insertOne(newParts);
      res.send(result);
    });

    app.get("/productscategory", async (req, res) => {
      const query = {};
      const result = await carPartsCollection
        .find(query)
        .project({ category: 1 })
        .toArray();
      res.send(result);
    });

    // temporary to update field on Products
    // app.get("/addselPrice", async (req, res) => {
    //   const filter = {};
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       selPrice: 9999,
    //     },
    //   };
    //   const result = await carPartsCollection.updateMany(
    //     filter,
    //     updatedDoc,
    //     options
    //   );
    //   res.send(result);
    // });

    // Product update only admin

    app.put("/carParts/:id", async (req, res) => {
      const id = req.params.id;
      const updateParts = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updateParts.name,
          price: updateParts.price,
          quantity: updateParts.quantity,
          orderQuantity: updateParts.orderQuantity,
          description: updateParts.description,
        },
      };
      const result = await carPartsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // categoryCollection start for admin
    app.get("/category", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await categoryCollection.findOne(query);
      res.send(result);
    });

    app.post("/category", async (req, res) => {
      const newCategory = req.body;
      const result = await categoryCollection.insertOne(newCategory);
      res.send(result);
    });

    app.delete("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await categoryCollection.deleteOne(query);
      res.send(result);
    });
    // categoryCollection end for admin

    // sub category start for admin
    app.get("/subcategory", async (req, res) => {
      const result = await subCategoryCollection.find().toArray();
      res.send(result);
    });

    app.get("/subcategory/search", async (req, res) => {
      const subCategoryname = req.query.category;
      const cursor = subCategoryCollection.find({ category: subCategoryname });
      const carParts = await cursor.toArray();
      res.send(carParts);
    });

    app.post("/subcategory", async (req, res) => {
      const newCategory = req.body;
      const result = await subCategoryCollection.insertOne(newCategory);
      res.send(result);
    });

    app.delete("/subcategory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await subCategoryCollection.deleteOne(query);
      res.send(result);
    });
    // sub category end for admin

    // get users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // users create
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // make a admin
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    //get add to card
    app.get("/addToCard", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = addToCardCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //delete add to card
    app.delete("/addToCard/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await addToCardCollection.deleteOne(query);
      res.send(result);
    });

    //post add to card
    app.post("/addToCard", async (req, res) => {
      const purchase = req.body;
      const partsQuantity = purchase.partsQuantity;
      const minimumQuantity = purchase.minimumQuantity;
      const userQuantity = purchase.userQuantity;
      if (partsQuantity >= userQuantity && userQuantity >= minimumQuantity) {
        const result = await addToCardCollection.insertOne(purchase);
        return res.send({ success: true, result });
      } else {
        return res.send({ success: false });
      }
    });

    // orders start
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result);
    });
    // orders end

    // manage orders start
    app.get("/manageOrders", async (req, res) => {
      const result = await ordersCollection.find().toArray();
      res.send(result);
    });

    app.get("/manageOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    app.put("/manageOrders/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: updateStatus.status,
        },
      };
      const result = await ordersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // manage orders end
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Two Start Fashion website");
});

app.listen(port, () => {
  console.log(`Two Star Fashion website app listening on port ${port}`);
});
