const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9imp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const productCollection = client.db('uniFilter').collection('products');

    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const searchTerm = req.query.search || '';
    
      const query = {
        productName: { $regex: searchTerm, $options: 'i' }  // Case-insensitive search
      };
    
      const skip = (page - 1) * limit;
    
      const cursor = productCollection.find(query).skip(skip).limit(limit);
      const result = await cursor.toArray();
    
      const totalProducts = await productCollection.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
    
      res.send({
        totalProducts,
        totalPages,
        currentPage: page,
        products: result
      });
    });
    

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("filtering going on");
});

app.listen(port, () => {
  console.log(`filtering is going on ${port}`);
});
