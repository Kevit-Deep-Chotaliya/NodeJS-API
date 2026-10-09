const express = require('express');
const router = express.Router();
const Product = require('./models/product.js');
const { default: mongoose } = require('mongoose');
const { request } = require('../../app.js');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth.js')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
})
const upload = multer({

    storage: storage, limits: { fileSize: 2 * 1024 * 1024 },

    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('only JPEG or PNG images are allowed'))
        }
    }
});

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        productImage : doc.productImage,
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

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {

    if (!req.file) {
        return res.status(400).json({
            message: 'Please upload a product image'
        });
    }

    req.body.productImage = req.file.path;

    Product.insertMany(req.body)
        .then(result => {
            res.status(201).json({
                message: 'products created successfully',
                createdProducts: result.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
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
        .select('name price _id productImage')
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

router.patch('/:productId', checkAuth, (req, res, next) => {
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

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    body: { name: 'String', price: 'Number' }
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