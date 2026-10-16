const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/addressController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', AddressController.getAddresses);
router.post('/', AddressController.addAddress);
router.put('/:id', AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);
router.put('/:id/default', AddressController.setDefault);

module.exports = router;
