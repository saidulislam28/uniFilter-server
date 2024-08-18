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
      const { page = 1, limit = 10, search = "", category = "", priceRange = "", sort = "" } = req.query;
    
      const query = {
        productName: { $regex: search, $options: 'i' },
        ...(category && { category }),
        ...(priceRange && { 
          price: { 
            $gte: Number(priceRange.split('-')[0]), 
            $lte: Number(priceRange.split('-')[1]) 
          } 
        }),
      };
    
      const sortOptions = {};
      if (sort === "priceAsc") {
        sortOptions.price = 1;
      } else if (sort === "priceDesc") {
        sortOptions.price = -1;
      } else if (sort === "dateDesc") {
        sortOptions.createdAt = -1;
      }
    
      const products = await productCollection
        .find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .toArray();
    
      const totalProducts = await productCollection.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
    
      res.send({ products, totalPages });
    });
    
    

    console.log("Pinged your deployment. MongoDB!");
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
