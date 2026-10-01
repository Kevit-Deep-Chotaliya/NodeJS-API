const express = require('express')
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message : 'Orders were fetched!'
    });
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message : 'Order was created!'
    });
});

router.get('/:orderId', (req, res, next) => {
    res.status(200).json({
        message : 'Order Details',
        orderId : req.params.orderId
    });
});

router.patch('/:orderId', (req, res, next) => {
    res.status(200).json({
        message : 'order Updated!!',
        orderId : req.params.orderId
    })
})

router.delete('/:orderId', (req, res, next) => {
    res.status(200).json({
        message : 'order Deleted!!',
        orderId : req.params.orderId
    })
})
module.exports = router;