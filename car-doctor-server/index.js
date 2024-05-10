const express = require('express')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://cars-doctor-fda06.web.app',
        'https://cars-doctor-fda06.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())


//self meddleware
const logger = (req, res, next) => {
    console.log(req.method, req.url);
    next();
}
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized Access' })
        }
        req.user = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gphdl2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const serviceCollection = client.db('carDoctor').collection('servicesDB');
        const bookingsCollection = client.db('carDoctor').collection('bookings');

        //auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict'
                })
                .send({ token })
        })

        app.post('/logout', async (req, res) => {
            const user = req.body;
            res
                .clearCookie('token', { maxAge: 0 })
                .send({ seccuss: true })
        })


        //service related api
        app.get('/servicesDB', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })

        app.get('/servicesDB/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: {
                    title: 1, price: 1,
                    service_id: 1, img: 1
                },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result)
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateInfo = req.body;
            console.log(updateInfo);
            const updateDoc = {
                $set: {
                    status: updateInfo.status
                },
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.get('/bookings', logger, verifyToken, async (req, res) => {
            // console.log(req.query.email);
            // console.log('cook cookies: ', req.cookies);
            if (req?.query.email !== req?.user.email) {
                return res.status(403).send({message: 'Forbidden Access'})
            }
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email };
            }
            // const query = { email: req.query?.email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Doctor is Running.')
})

app.listen(port, () => {
    console.log(`Car Doctor is Running on port: ${port}`);
})


