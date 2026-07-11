/**
 * Laundry Management System — Client-Side JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
  initSidebar();
  initFlashMessages();
  initPriceCalculation();
  initManualOverride();
  initConfirmDialogs();
  initFormLoading();
  initPasswordToggle();
  initNewCustomerToggle();
  initImagePreview();
});

/* =====================
   1. Sidebar Toggle
   ===================== */
function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', function () {
    sidebar.classList.toggle('show');
    if (overlay) overlay.classList.toggle('show');
  });

  if (overlay) {
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
  }

  // Close sidebar on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('show')) {
      sidebar.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
    }
  });
}

/* =====================
   2. Flash Messages Auto-Dismiss
   ===================== */
function initFlashMessages() {
  const alerts = document.querySelectorAll('.flash-alert');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      alert.classList.add('fade-out');
      setTimeout(function () {
        alert.remove();
      }, 400);
    }, 5000);
  });
}

/* =====================
   3. Price Calculation (Complete Form)
   ===================== */
function initPriceCalculation() {
  const weightInput = document.getElementById('weight_kg');
  const tarifDisplay = document.getElementById('tarifPerKg');
  const manualCheckbox = document.getElementById('manualOverride');

  if (!weightInput || !tarifDisplay) return;

  const tarif = parseFloat(tarifDisplay.dataset.tarif) || 0;

  weightInput.addEventListener('input', function () {
    if (manualCheckbox && manualCheckbox.checked) return;
    calculatePrice(tarif);
  });

  // Initial calculation
  if (weightInput.value) {
    calculatePrice(tarif);
  }
}

function calculatePrice(tarif) {
  const weight = parseFloat(document.getElementById('weight_kg').value) || 0;
  const total = Math.ceil(weight * tarif);

  const displayWeight = document.getElementById('previewWeight');
  const displayTotal = document.getElementById('previewTotal');
  const displayUniqueCode = document.getElementById('previewUniqueCode');
  const displayExpected = document.getElementById('previewExpected');
  const priceInput = document.getElementById('price_total');

  if (displayWeight) displayWeight.textContent = weight.toFixed(1) + ' kg';
  if (displayTotal) displayTotal.textContent = formatRupiah(total);
  if (priceInput) priceInput.value = total;

  // Unique code (random 3-digit for preview)
  const uniqueCode = parseInt(document.getElementById('unique_code_value')?.value) || 0;
  const expected = total + uniqueCode;

  if (displayUniqueCode) displayUniqueCode.textContent = '+' + formatRupiah(uniqueCode);
  if (displayExpected) displayExpected.textContent = formatRupiah(expected);
}

/* =====================
   4. Manual Override Toggle
   ===================== */
function initManualOverride() {
  const checkbox = document.getElementById('manualOverride');
  const manualInput = document.getElementById('manualPriceGroup');
  const tarifDisplay = document.getElementById('tarifPerKg');

  if (!checkbox || !manualInput) return;

  checkbox.addEventListener('change', function () {
    if (this.checked) {
      manualInput.style.display = 'block';
      manualInput.querySelector('input')?.focus();
    } else {
      manualInput.style.display = 'none';
      // Recalculate
      const tarif = parseFloat(tarifDisplay?.dataset.tarif) || 0;
      calculatePrice(tarif);
    }
  });

  // Manual price input → update preview
  const manualPriceInput = document.getElementById('manual_price');
  if (manualPriceInput) {
    manualPriceInput.addEventListener('input', function () {
      const total = parseInt(this.value) || 0;
      const displayTotal = document.getElementById('previewTotal');
      const displayExpected = document.getElementById('previewExpected');
      const priceInput = document.getElementById('price_total');
      const uniqueCode = parseInt(document.getElementById('unique_code_value')?.value) || 0;

      if (displayTotal) displayTotal.textContent = formatRupiah(total);
      if (displayExpected) displayExpected.textContent = formatRupiah(total + uniqueCode);
      if (priceInput) priceInput.value = total;
    });
  }
}

/* =====================
   5. Confirm Dialogs
   ===================== */
function initConfirmDialogs() {
  document.querySelectorAll('[data-confirm]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      const message = this.dataset.confirm || 'Apakah Anda yakin?';
      if (!confirm(message)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  });
}

/* =====================
   6. Form Loading Spinner
   ===================== */
function initFormLoading() {
  document.querySelectorAll('form[data-loading]').forEach(function (form) {
    form.addEventListener('submit', function () {
      const btn = form.querySelector('button[type="submit"]');
      if (!btn || btn.classList.contains('btn-loading')) return;

      // Basic validation check
      if (!form.checkValidity()) return;

      btn.classList.add('btn-loading');
      const textSpan = btn.querySelector('.btn-text');
      if (textSpan) {
        textSpan.style.visibility = 'hidden';
      }
      btn.disabled = true;
    });
  });
}

/* =====================
   7. Password Toggle
   ===================== */
function initPasswordToggle() {
  const toggleBtns = document.querySelectorAll('.btn-toggle-password');
  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const input = this.closest('.input-icon-wrapper').querySelector('input');
      const icon = this.querySelector('i');
      if (!input || !icon) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
      } else {
        input.type = 'password';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
      }
    });
  });
}

/* =====================
   8. New Customer Toggle
   ===================== */
function initNewCustomerToggle() {
  const toggle = document.getElementById('newCustomerToggle');
  const newFields = document.getElementById('newCustomerFields');
  const existingField = document.getElementById('existingCustomerField');

  if (!toggle || !newFields) return;

  toggle.addEventListener('change', function () {
    if (this.checked) {
      newFields.style.display = 'block';
      if (existingField) existingField.style.display = 'none';
    } else {
      newFields.style.display = 'none';
      if (existingField) existingField.style.display = 'block';
    }
  });
}

/* =====================
   9. Image Preview (QRIS upload)
   ===================== */
function initImagePreview() {
  const fileInputs = document.querySelectorAll('input[type="file"][data-preview]');
  fileInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      const previewEl = document.getElementById(this.dataset.preview);
      if (!previewEl || !this.files[0]) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        previewEl.src = e.target.result;
        previewEl.style.display = 'block';
      };
      reader.readAsDataURL(this.files[0]);
    });
  });
}

/* =====================
   Helpers
   ===================== */

/**
 * Format number to Rupiah string
 */
function formatRupiah(number) {
  if (isNaN(number)) return 'Rp 0';
  return 'Rp ' + Number(number).toLocaleString('id-ID');
}

/**
 * Format Rupiah input (live formatting while typing)
 */
function formatRupiahInput(input) {
  let value = input.value.replace(/\D/g, '');
  input.value = value ? Number(value).toLocaleString('id-ID') : '';
}
