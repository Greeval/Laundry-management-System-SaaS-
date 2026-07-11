# Instruksi Awal — AI Agent Proyek "Sistem Laundry WA"

## 0. Peran Kamu
Kamu adalah AI coding agent yang membangun & memelihara **Sistem Manajemen Laundry dengan Notifikasi WhatsApp**. Baca instruksi ini di awal setiap sesi kerja, sebelum menulis atau mengubah satu baris kode pun di proyek ini.

## 1. Dokumen Sumber Kebenaran (WAJIB dibaca dulu, urutan ini)
1. `PRD_SistemLaundryWA.md` — definisi fitur, scope, requirement
2. `ERD_SistemLaundryWA.md` — skema database & relasi
3. `SKILL_LaundryWA_Compliance.md` — aturan compliance ketat

**Jangan mulai coding sebelum ketiganya dipahami.** Kalau ada konflik: PRD menang untuk urusan fitur/scope, ERD menang untuk urusan struktur data — kecuali user bilang lain secara eksplisit.

## 2. Ringkasan Cepat Proyek
- Web app **internal**, dipakai owner/staf laundry saja. Customer **tidak pernah** punya akun/login.
- Semua komunikasi ke customer lewat **WA otomatis**, di 2 titik saja: status → `diproses`, dan status → `selesai` (invoice).
- Alur baku: terima laundry → owner input pesanan → status `diproses` (kirim WA) → input berat & harga saat `selesai` (kirim WA invoice) → customer bayar → **owner approve manual** → `paid`/lunas.
- Verifikasi pembayaran transfer: **kode unik nominal + tombol approve manual oleh owner** — bukan otomatis via API bank atau baca screenshot.
- Fase 1 = single-tenant, WA pakai library unofficial (Baileys/whatsapp-web.js), stack rekomendasi PHP (native/Laravel) + MySQL, frontend mobile-friendly non-SPA.

## 3. Batasan Keras (Non-Negotiable)
Jangan dilanggar tanpa konfirmasi eksplisit dari user:

1. **Status pesanan hanya 4 nilai**: `menunggu`, `diproses`, `selesai`, `diambil`. Tidak boleh menambah status lain (mis. "dibatalkan") tanpa update PRD & ERD dulu.
2. **Skema tabel persis mengikuti ERD** — 6 tabel: `users`, `customers`, `laundry_settings`, `orders`, `payments`, `wa_message_log`. Jangan buat tabel tambahan kecuali diminta eksplisit dan dokumen sudah di-update.
3. **Customer tidak pernah punya akun/login.** Jangan generate fitur register/login untuk customer.
4. **Trigger WA hanya di 2 titik**: `diproses` dan `selesai`. Jangan tambah trigger lain (mis. reminder H-1) kecuali sudah dikonfirmasi sebagai bagian Fase 2.
5. **Kalkulasi harga** = `weight_kg * price_per_kg` (atau `express_price_per_kg` jika `service_type = express`), dengan opsi override manual owner. Jangan tambah logic diskon/membership yang tidak ada di PRD.
6. **Integrasi WA default Fase 1**: library unofficial. Jangan switch ke WhatsApp Business API resmi kecuali diminta eksplisit sebagai migrasi Fase 2.
7. **`payments` tetap terpisah dari `orders`** — jangan gabungkan status bayar ke kolom `orders`, ini demi audit trail.
8. **Verifikasi pembayaran Fase 1 wajib manual-approve.** `unique_code`/`expected_amount` di tabel `payments` cuma alat bantu owner mencocokkan mutasi sendiri. Status `paid` HANYA boleh berubah lewat aksi eksplisit owner/staf menekan tombol approve (`approved_by` terisi). `proof_image_url` boleh disimpan sebagai referensi, tapi **tidak boleh** memicu `status = paid` otomatis. Jangan bangun integrasi API mutasi bank (Moota dkk) kecuali diminta eksplisit sebagai upgrade Fase 2.
9. **Setiap permintaan yang keluar dari PRD/ERD wajib ditandai eksplisit** ke user sebagai "di luar scope dokumen" sebelum dieksekusi — jangan langsung diasumsikan boleh (lihat format di bagian 6).

## 4. Skema Database (ringkasan kerja)
| Tabel | Fungsi utama | Relasi kunci |
|---|---|---|
| `users` | Owner/staf yang login | 1—N `orders` (created_by), 1—N `payments` (approved_by) |
| `customers` | Data pelanggan, wajib ada `phone_number` | 1—N `orders`, 1—N `wa_message_log` |
| `laundry_settings` | Konfigurasi tunggal (tarif, rekening, QRIS) | Tidak berelasi FK, dipakai aplikatif |
| `orders` | Pesanan laundry, status siklus hidup | 1—1 `payments`, 1—N `wa_message_log` |
| `payments` | Detail & status pembayaran per order | FK `order_id`, `approved_by` |
| `wa_message_log` | Audit log semua pengiriman WA | FK `order_id`, `customer_id` |

Detail tipe kolom lengkap: rujuk langsung ke `ERD_SistemLaundryWA.md` — jangan menghafal/mengasumsikan, cek ulang filenya tiap kali menyentuh skema.

## 5. Alur Sistem yang Harus Diikuti Persis
```
Customer taruh laundry
  → owner input pesanan (status: menunggu)
  → owner ubah status: diproses → sistem kirim WA "diterima & dikerjakan"
  → owner input berat aktual saat selesai → sistem hitung harga (status: selesai)
  → sistem kirim WA invoice (harga + instruksi bayar / opsi cash)
  → customer bayar (transfer dgn kode unik, atau cash)
  → owner cek mutasi manual / terima cash → tekan "Approve Pembayaran"
  → payments.status = paid, trigger WA konfirmasi ke customer
```

## 6. Format Respons untuk Permintaan di Luar Scope
Kalau user minta sesuatu yang tidak ada di PRD/ERD (fitur baru, tabel baru, status baru, trigger WA baru, dsb), **jangan langsung eksekusi**. Balas dengan pola:

> "Ini di luar scope PRD/ERD saat ini karena [alasan singkat]. Mau saya:
> (a) lanjutkan sebagai fitur baru dan update dokumennya dulu, atau
> (b) skip dulu, simpan sebagai catatan untuk Fase 2?"

## 7. Checklist Wajib Sebelum Generate/Commit Kode
- [ ] Fitur ini ada di FR-1 s.d. FR-9 pada PRD?
- [ ] Skema tabel yang dipakai sesuai ERD (nama tabel, kolom, tipe data)?
- [ ] Enum/status yang dipakai persis sama dengan definisi (lihat bagian 3.1)?
- [ ] Ada fitur customer-facing yang butuh login? Jika ya → **STOP**, di luar scope.
- [ ] Kalau menyentuh logic pembayaran: apakah `status = paid` cuma berubah lewat aksi approve eksplisit owner/staf (bukan otomatis dari screenshot/API eksternal)?
- [ ] Kalau menyentuh WA: apakah ada logging ke `wa_message_log` (status sent/failed)?
- [ ] Fitur ini termasuk scope Fase 1, atau sebenarnya Fase 2 (lihat bagian 8)?

## 8. Kesadaran Roadmap (jangan bangun fase 2 di fase 1)
- **Fase 1 (MVP — kerjakan ini)**: FR-1 s.d. FR-9, WA unofficial, verifikasi pembayaran manual + kode unik, single laundry.
- **Fase 2 (jangan sentuh kecuali diminta eksplisit)**: migrasi ke WA Business API resmi, multi-tenant/SaaS (butuh tabel `businesses` + kolom `business_id`), otomasi verifikasi pembayaran (API mutasi bank/payment gateway).

## 9. Non-Functional yang Perlu Diperhatikan Saat Implementasi
- Notifikasi WA harus terkirim <30 detik setelah perubahan status.
- Semua pengiriman WA (berhasil/gagal) wajib tercatat di `wa_message_log` untuk audit.
- Data nomor WA & histori transaksi customer harus aman, tidak diekspos ke pihak luar.
- UI harus tetap nyaman dipakai dari HP (owner sering di depan mesin cuci, bukan laptop).

## 10. Kalau Ragu
Rujuk balik ke `SKILL_LaundryWA_Compliance.md` sebagai aturan operasional harian, dan ke PRD/ERD sebagai definisi resmi. Kalau ketiganya tidak menjawab, tanyakan ke user — jangan berasumsi.
