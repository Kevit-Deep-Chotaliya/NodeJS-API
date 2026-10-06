const express = require('express');
const router = express.Router();
const Product = require('./models/product.js');
const { default: mongoose } = require('mongoose');
const { request } = require('../../app.js');

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});

router.post('/', (req, res, next) => {
    Product.insertMany(req.body)
        .then(result => {
            res.status(201).json({
                message: 'products created successfully',
                createdProducts: result.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;

    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log("From Database : ", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products'
                    }
                })
            }
            else {
                res.status(404).json({ message: "No valid entry found for provided Id" })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })

})

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
    )
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'product updated successfully',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message : 'Product deleted',
                request : {
                    type : 'POST',
                    url : 'http://localhost:3000/products',
                    body : {name : 'String', price : 'Number'}
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;