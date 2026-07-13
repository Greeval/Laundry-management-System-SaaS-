// controllers/settingController.js
// Laundry settings management — singleton config (owner only)

const db = require('../models');
const whatsappService = require('../services/whatsappService');

const settingController = {
  /**
   * GET /settings — show settings form with current values
   */
  async edit(req, res) {
    try {
      let settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);

      // (LaundrySetting.getCurrent automatically creates default if none exists)

      res.render('settings/edit', {
        title: 'Pengaturan',
        settings,
        waStatus: whatsappService.getStatus(),
        waQrCode: whatsappService.getQrCode(),
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[SettingController] Edit error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat pengaturan.');
      res.redirect('/');
    }
  },

  /**
   * POST /settings — update settings, handle QRIS image upload
   */
  async update(req, res) {
    try {
      let settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);



      const {
        business_name,
        price_per_kg,
        express_price_per_kg,
        cuci_price_per_kg,
        cuci_kering_price_per_kg,
        cuci_setrika_price_per_kg,
        bank_name,
        bank_account_number,
        bank_account_name,
        fonnte_token,
      } = req.body;

      const updateData = {
        business_name: business_name || settings.business_name,
        price_per_kg: parseFloat(price_per_kg) || settings.price_per_kg,
        express_price_per_kg: express_price_per_kg ? parseFloat(express_price_per_kg) : null,
        cuci_price_per_kg: cuci_price_per_kg ? parseFloat(cuci_price_per_kg) : 0,
        cuci_kering_price_per_kg: cuci_kering_price_per_kg ? parseFloat(cuci_kering_price_per_kg) : 0,
        cuci_setrika_price_per_kg: cuci_setrika_price_per_kg ? parseFloat(cuci_setrika_price_per_kg) : 0,
        bank_name: bank_name || null,
        bank_account_number: bank_account_number || null,
        bank_account_name: bank_account_name || null,
        fonnte_token: fonnte_token || null,
      };

      // Handle QRIS image upload if file was provided
      if (req.file) {
        updateData.qris_image_url = '/uploads/qris/' + req.file.filename;
      }

      await settings.update(updateData);
      
      // Update session cache
      req.session.laundrySetting = settings;

      req.flash('success', 'Pengaturan berhasil disimpan.');
      return res.redirect('/settings');
    } catch (error) {
      console.error('[SettingController] Update error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat menyimpan pengaturan.');
      return res.redirect('/settings');
    }
  },
};

module.exports = settingController;
