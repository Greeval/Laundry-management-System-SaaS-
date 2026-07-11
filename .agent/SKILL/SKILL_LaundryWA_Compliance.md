# SKILL: Laundry WA — PRD/ERD Compliance

## Kapan skill ini dipakai
Rujuk skill ini setiap kali menulis atau mengubah kode untuk project "Sistem Laundry dengan Notifikasi WhatsApp". Trigger: permintaan apapun yang menyentuh pesanan, status laundry, notifikasi WA, pembayaran, atau skema database project ini.

## Sumber kebenaran (source of truth)
- `PRD_SistemLaundryWA.md` — definisi fitur & scope
- `ERD_SistemLaundryWA.md` — skema database & relasi

Agent TIDAK BOLEH menambah fitur, tabel, kolom, atau status baru yang tidak ada di kedua dokumen ini tanpa konfirmasi eksplisit dari user.

## Aturan ketat

1. **Status pesanan** hanya 4 nilai: `menunggu`, `diproses`, `selesai`, `diambil`. Jangan tambah status lain (mis. "dibatalkan") tanpa update PRD & ERD dulu.
2. **Skema tabel** persis mengikuti ERD: 6 tabel (`users`, `customers`, `laundry_settings`, `orders`, `payments`, `wa_message_log`). Jangan buat tabel tambahan kecuali diminta eksplisit dan dokumen di-update.
3. **Customer tidak pernah punya akun/login.** Semua interaksi customer lewat WA saja. Jangan generate fitur register/login untuk customer.
4. **Trigger WA hanya di 2 titik:** status → `diproses`, dan status → `selesai` (invoice). Jangan tambah trigger lain (mis. reminder H-1) kecuali sudah dikonfirmasi sebagai bagian Fase 2.
5. **Perhitungan harga** = `weight_kg * price_per_kg` (atau `express_price_per_kg` bila `service_type = express`), dengan opsi override manual oleh owner. Jangan tambah logic diskon/membership yang tidak ada di PRD.
6. **Integrasi WA default Fase 1:** library unofficial (Baileys/whatsapp-web.js). Jangan switch ke WhatsApp Business API resmi kecuali diminta eksplisit sebagai migrasi Fase 2.
7. **`payments` tetap terpisah dari `orders`** — jangan gabungkan status bayar ke kolom `orders`, ini demi audit trail.
8. **Verifikasi pembayaran transfer Fase 1 wajib manual-approve, dibantu kode unik nominal — bukan otomatis lewat API bank.** `unique_code`/`expected_amount` di `payments` cuma alat bantu owner mencocokkan mutasi sendiri. Status `paid` HANYA boleh berubah lewat aksi eksplisit owner/staf menekan tombol approve (`approved_by` terisi). Screenshot bukti transfer boleh disimpan (`proof_image_url`) sebagai referensi, tapi TIDAK BOLEH memicu `status = paid` secara otomatis. Jangan bangun integrasi API mutasi bank (Moota dkk) kecuali diminta eksplisit sebagai upgrade Fase 2.
9. Setiap perubahan yang keluar dari PRD/ERD harus ditandai eksplisit ke user sebagai "di luar scope dokumen — konfirmasi dulu?" sebelum dieksekusi, bukan langsung diasumsikan boleh.

## Alur yang harus diikuti persis
Customer taruh laundry → owner input pesanan → WA notif "diproses" → owner input selesai (berat + harga) → WA notif invoice → customer bayar → owner konfirmasi lunas.

## Checklist sebelum generate/commit kode
- [ ] Fitur ini ada di FR-1 s.d. FR-9 pada PRD?
- [ ] Skema tabel yang dipakai sesuai ERD (nama tabel, kolom, tipe data)?
- [ ] Enum/status yang dipakai persis sama dengan definisi?
- [ ] Ada fitur customer-facing yang butuh login? Jika ya — STOP, di luar scope.
- [ ] Kalau menyentuh logic pembayaran: apakah `status = paid` cuma berubah lewat aksi approve eksplisit owner/staf (bukan otomatis dari screenshot atau API eksternal)?
