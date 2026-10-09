const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('./models/order');
const Product = require('./models/product');
const { request } = require('../../app');
const checkAuth = require('../middleware/check-auth.js')

router.get('/', checkAuth, (req, res, next) => {

    Order.find()
        .select('product quantity _id')
        .populate('product', 'name')
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                count: result.length,
                orders: result.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders' + doc._id
                        }
                    }
                })

            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

});

router.post('/', checkAuth, async (req, res, next) => {
    try {

        const product = await Product.findById(req.body.product);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const order = new Order({
            quantity: req.body.quantity,
            product: req.body.product
        });

        const result = await order.save();

        return res.status(201).json({
            message: 'Order created Successfully!!',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result._id
            }
        });
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({
            error: err
        });
    }
});

router.get('/:orderId', checkAuth, (req, res, next) => {

    Order.findById(req.params.orderId)
        .select('product quantity')
        .populate('product')
        .exec()
        .then(order => {

            if (!order) {
                res.status(404).json({
                    message: 'Order not found'
                })
            }

            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

router.patch('/:orderId', checkAuth,  (req, res, next) => {
    res.status(200).json({
        message: 'order Updated!!',
        orderId: req.params.orderId
    })
})

router.delete('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders',
                    body: { product: 'ID', quantity: 'Number' }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
})
module.exports = router;