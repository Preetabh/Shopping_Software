const StoreSetting = require('../models/StoreSetting');
const ApiResponse = require('../utils/apiResponse');

class SettingsController {
  static async getSettings(req, res, next) {
    try {
      let settings = await StoreSetting.findOne();
      if (!settings) {
        settings = await StoreSetting.create({});
      }
      return ApiResponse.success(res, settings);
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      let settings = await StoreSetting.findOne();
      if (!settings) {
        settings = await StoreSetting.create(req.body);
      } else {
        Object.assign(settings, req.body);
        await settings.save();
      }
      return ApiResponse.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsController;
