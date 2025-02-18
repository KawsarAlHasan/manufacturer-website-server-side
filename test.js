async function run() {
  try {
    await client.connect();
    const carPartsCollection = client.db("car_parts").collection("products"); // working
    const addToCardCollection = client.db("car_parts").collection("addtocard"); // 7
    const ordersCollection = client.db("car_parts").collection("orders"); // 8

    // Start
    //Start add to card for user
    app.get("/addToCard", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = addToCardCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/addToCard/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await addToCardCollection.deleteOne(query);
      res.send(result);
    });

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
    //end add to card for user
    // End

    // Start
    // orders start user
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
    // orders end user
    // End

    // Start
    // manage orders start admin
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
    // manage orders end admin
    // End
  } finally {
  }
}
run().catch(console.dir);
