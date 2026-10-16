const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleWishlist);

module.exports = router;
