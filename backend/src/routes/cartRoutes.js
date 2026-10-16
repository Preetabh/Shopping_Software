const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/items/:itemId', CartController.updateQuantity);
router.delete('/items/:itemId', CartController.removeFromCart);
router.post('/apply-coupon', CartController.applyCoupon);
router.delete('/coupon', CartController.removeCoupon);
router.delete('/clear', CartController.clearCart);

module.exports = router;
