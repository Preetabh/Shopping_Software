const Address = require('../models/Address');
const ApiResponse = require('../utils/apiResponse');

class AddressController {
  static async getAddresses(req, res, next) {
    try {
      const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
      return ApiResponse.success(res, addresses);
    } catch (error) {
      next(error);
    }
  }

  static async addAddress(req, res, next) {
    try {
      const { fullName, phone, alternatePhone, pincode, locality, addressLine, city, state, landmark, addressType, isDefault } = req.body;

      if (isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
      }

      // Check if this is user's first address
      const count = await Address.countDocuments({ user: req.user._id });
      const address = await Address.create({
        user: req.user._id,
        fullName,
        phone,
        alternatePhone,
        pincode,
        locality,
        addressLine,
        city,
        state,
        landmark,
        addressType,
        isDefault: count === 0 ? true : !!isDefault
      });

      return ApiResponse.created(res, address, 'Address added successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      const { isDefault } = req.body;

      if (isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
      }

      const address = await Address.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true });
      if (!address) return ApiResponse.notFound(res, 'Address not found');

      return ApiResponse.success(res, address, 'Address updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
      if (!address) return ApiResponse.notFound(res, 'Address not found');

      // If deleted address was default, set another address as default
      if (address.isDefault) {
        const first = await Address.findOne({ user: req.user._id });
        if (first) {
          first.isDefault = true;
          await first.save();
        }
      }

      return ApiResponse.success(res, null, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async setDefault(req, res, next) {
    try {
      const { id } = req.params;
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
      const address = await Address.findOneAndUpdate({ _id: id, user: req.user._id }, { isDefault: true }, { new: true });
      if (!address) return ApiResponse.notFound(res, 'Address not found');

      return ApiResponse.success(res, address, 'Default address updated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AddressController;
