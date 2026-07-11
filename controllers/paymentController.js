// controllers/paymentController.js
// Payment management: list pending, approve (ONLY way to mark paid), upload proof

const db = require('../models');
const whatsappService = require('../services/whatsappService');

const paymentController = {
  /**
   * GET /payments/pending — list all pending payments
   */
  async pending(req, res) {
    try {
      const payments = await db.Payment.findAll({
        where: { tenant_id: req.session.user.tenant_id, status: 'pending' },
        include: [{
          model: db.Order,
          as: 'order',
          include: [{ model: db.Customer, as: 'customer' }],
        }],
        order: [[{ model: db.Order, as: 'order' }, 'createdAt', 'ASC']],
      });

      res.render('payments/pending', {
        title: 'Pembayaran Menunggu',
        pendingPayments: payments,
        messages: {
          success: req.flash('success'),
          error: req.flash('error'),
        },
      });
    } catch (error) {
      console.error('[PaymentController] Pending error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat memuat daftar pembayaran.');
      res.redirect('/');
    }
  },

  /**
   * POST /payments/:id/approve — ONLY way to mark payment as paid
   * CRITICAL: status=paid ONLY through this explicit action.
   * approved_by MUST be set to the current session user.
   */
  async approve(req, res) {
    try {
      const payment = await db.Payment.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [{
          model: db.Order,
          as: 'order',
          include: [{ model: db.Customer, as: 'customer' }],
        }],
      });

      if (!payment) {
        req.flash('error', 'Pembayaran tidak ditemukan.');
        return res.redirect('/payments/pending');
      }

      if (payment.status !== 'pending') {
        req.flash('error', 'Pembayaran ini sudah disetujui sebelumnya.');
        return res.redirect('/payments/pending');
      }

      // CRITICAL: This is the ONLY place where status becomes 'paid'
      await payment.update({
        status: 'paid',
        approved_by: req.session.user.id,
        paid_at: new Date(),
      });

      // Send payment receipt via WhatsApp
      const settings = await db.LaundrySetting.getCurrent(req.session.user.tenant_id);
      await whatsappService.sendPaymentReceiptNotification(payment.order, payment.order.customer, payment, settings);

      const orderCode = payment.order ? payment.order.order_code : '(unknown)';
      req.flash('success', `Pembayaran untuk pesanan ${orderCode} berhasil disetujui. Notifikasi WA telah dikirim.`);
      return res.redirect('/payments/pending');
    } catch (error) {
      console.error('[PaymentController] Approve error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat menyetujui pembayaran.');
      return res.redirect('/payments/pending');
    }
  },

  /**
   * POST /payments/:id/upload-proof — upload proof image (reference only)
   * DOES NOT change payment status — proof_image_url is reference only.
   */
  async uploadProof(req, res) {
    try {
      const payment = await db.Payment.findOne({
        where: { id: req.params.id, tenant_id: req.session.user.tenant_id },
        include: [{
          model: db.Order,
          as: 'order',
        }],
      });

      if (!payment) {
        req.flash('error', 'Pembayaran tidak ditemukan.');
        return res.redirect('/payments/pending');
      }

      if (!req.file) {
        req.flash('error', 'File bukti pembayaran harus diupload.');
        return res.redirect(`/orders/${payment.order_id}`);
      }

      // Save proof image URL — relative to public directory
      const proofUrl = '/uploads/proofs/' + req.file.filename;

      // IMPORTANT: Only update proof_image_url, NEVER change status here
      await payment.update({ proof_image_url: proofUrl });

      req.flash('success', 'Bukti pembayaran berhasil diupload. (Status pembayaran tidak berubah — perlu approve manual)');
      return res.redirect(`/orders/${payment.order_id}`);
    } catch (error) {
      console.error('[PaymentController] Upload proof error:', error.message);
      req.flash('error', 'Terjadi kesalahan saat mengupload bukti pembayaran.');
      return res.redirect('/payments/pending');
    }
  },
};

module.exports = paymentController;
