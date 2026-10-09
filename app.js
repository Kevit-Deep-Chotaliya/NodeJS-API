const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// const MONGOURL = process.env.MONGO_URL;

// mongoose.connect(MONGOURL).then(() => {
//     console.log('Database is connected successfully')
// }).catch((error) => console.log(error))

// const personSchema = new mongoose.Schema({
//     person_id : Number,
//     firstname : String,
//     lastname : String
// })

// const personModel = mongoose.model("persons", personSchema);

// app.get('/getPerson', async (req, res) => {
//     const personData = await personModel.find();
//     res.json(personData);
// })

mongoose.connect("mongodb+srv://" + process.env.MONGO_ATLAS_UNAME + ":" + process.env.MONGO_ATLAS_PW + "@cluster0.ffj0xhh.mongodb.net/?appName=Cluster0")

mongoose.Promise = global.Promise;
//Routes which should handle requests
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users')

app.use(morgan('dev'));
app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, PATCH, GET")
        return res.status(200).json({});
    }
    next();
})

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;