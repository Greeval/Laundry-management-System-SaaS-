# PRD — Sistem Manajemen Laundry dengan Notifikasi WhatsApp

## 1. Ringkasan Produk
Sistem berbasis web yang digunakan secara eksklusif oleh pemilik/staf laundry untuk mengelola siklus pesanan cuci, dari penerimaan barang hingga pembayaran selesai. Customer tidak mengakses sistem secara langsung — seluruh komunikasi dengan customer terjadi melalui notifikasi WhatsApp otomatis.

## 2. Latar Belakang & Masalah
- Pencatatan pesanan laundry umumnya masih manual (buku/nota kertas), rawan hilang dan sulit dilacak.
- Customer tidak mendapat info status real-time, sering menelepon/chat manual menanyakan status laundry.
- Penagihan pembayaran (terutama transfer/QRIS) memerlukan komunikasi manual berulang antara owner dan customer.
- Tidak ada riwayat transaksi terpusat untuk keperluan rekap harian/bulanan.

## 3. Tujuan
1. Mendigitalkan pencatatan pesanan laundry tanpa membebani customer dengan aplikasi/akun baru.
2. Mengotomasi notifikasi status pesanan via WhatsApp.
3. Mempercepat proses penagihan dengan invoice dan info pembayaran otomatis.
4. Menyediakan riwayat transaksi dan ringkasan harian untuk owner.

## 4. Target Pengguna
| Peran | Deskripsi | Akses Sistem |
|---|---|---|
| Owner/Admin | Pemilik atau staf laundry | Penuh — input, update, lihat laporan |
| Customer | Pelanggan laundry | Tidak ada akses web, hanya menerima WA |

## 5. Ruang Lingkup

**In scope (MVP):**
- Input pesanan baru
- Update status pesanan (diproses → selesai)
- Kalkulasi harga berdasarkan berat
- Notifikasi WA otomatis (2 tahap: diproses, invoice selesai)
- Konfirmasi pembayaran (cash manual / transfer-QRIS manual)
- Verifikasi pembayaran transfer dengan bantuan kode unik nominal (owner cek manual, lalu approve di sistem)
- Riwayat transaksi per customer
- Dashboard ringkasan harian

**Out of scope (fase berikutnya):**
- Akun/login untuk customer
- Multi-cabang / multi-tenant (SaaS penuh)
- Pembayaran otomatis terverifikasi (payment gateway webhook)
- Aplikasi mobile native

## 6. Functional Requirements

**FR-1 Input Pesanan Baru**
Owner menginput nama customer, nomor WA, jenis layanan (reguler/express), estimasi berat awal (opsional), dan catatan. Sistem generate kode pesanan unik.

**FR-2 Update Status: Diproses**
Owner mengubah status pesanan menjadi "diproses". Sistem otomatis mengirim WA ke customer: konfirmasi laundry diterima dan sedang dikerjakan.

**FR-3 Input Selesai**
Owner menginput berat aktual (kg); sistem menghitung total harga berdasarkan tarif per kg yang sudah diatur (atau override manual untuk kasus khusus).

**FR-4 Notifikasi Invoice**
Setelah status "selesai", sistem otomatis mengirim WA berisi total harga, berat, dan instruksi pembayaran (rekening/QRIS) — atau opsi "bayar cash di tempat".

**FR-5 Konfirmasi Pembayaran**
Owner menandai pesanan sebagai "lunas", baik karena customer sudah transfer (dicek manual) atau bayar cash saat pengambilan.

**FR-6 Riwayat Transaksi**
Owner dapat mencari riwayat pesanan berdasarkan nama/nomor customer, melihat status dan total transaksi sebelumnya.

**FR-7 Dashboard Harian**
Menampilkan jumlah pesanan masuk hari ini, pesanan yang belum diambil, dan total omzet harian.

**FR-8 Pengaturan Tarif & Info Pembayaran**
Owner dapat mengatur tarif per kg, nama usaha, nomor rekening, dan gambar QRIS yang disertakan dalam invoice WA.

**FR-9 Verifikasi Pembayaran Transfer (Kode Unik + Approve Manual)**
Setiap invoice transfer diberi kode unik pada nominal (mis. total Rp45.000 menjadi Rp45.003) supaya owner mudah mencocokkan mutasi masuk ke pesanan yang tepat tanpa harus membaca nama pengirim satu per satu. Owner mengecek mutasi rekening sendiri lewat aplikasi mobile banking, lalu menekan tombol "Approve Pembayaran" di sistem untuk menandai pesanan sebagai lunas. Tidak ada pengecekan otomatis ke rekening di Fase 1 — status lunas hanya berubah lewat aksi eksplisit owner.

## 7. Non-Functional Requirements
- Notifikasi WA harus terkirim dalam <30 detik setelah perubahan status.
- Sistem mencatat log pengiriman WA (berhasil/gagal) untuk audit.
- Data nomor WA dan histori transaksi customer disimpan aman, tidak diekspos ke pihak luar.
- Antarmuka tetap dapat dioperasikan dari HP (owner sering di depan mesin cuci, bukan di depan laptop).

## 8. Integrasi WhatsApp
| Opsi | Kelebihan | Risiko |
|---|---|---|
| WhatsApp Business API resmi (mis. via provider seperti Fonnte/Twilio) | Stabil, tidak berisiko banned, mendukung skala banyak klien | Berbayar per pesan/bulan |
| Library unofficial (Baileys/whatsapp-web.js) | Gratis, cepat untuk MVP | Berisiko nomor kena banned jika volume tinggi |

**Rekomendasi:** mulai dengan opsi unofficial untuk MVP/pilot ke 1–2 klien pertama, migrasi ke API resmi begitu produk mulai dijual ke banyak laundry sekaligus.

## 8A. Verifikasi Pembayaran (Manual dengan Kode Unik)

Dipilih pendekatan **kode unik nominal + approve manual oleh owner**, bukan verifikasi otomatis via API mutasi bank atau OCR screenshot, karena:
- Tidak butuh integrasi API pihak ketiga (biaya nol, tidak ada dependensi ke layanan luar)
- Owner sudah rutin cek mutasi lewat app mobile banking-nya sendiri — sistem cukup mempermudah proses matching, bukan menggantikannya
- Lebih aman: status lunas tidak pernah berubah otomatis dari data yang bisa dipalsukan (screenshot) atau bergantung pada uptime API luar

**Cara kerja:**
1. Saat invoice dibuat, sistem menambahkan kode unik 3 digit ke nominal (mis. Rp45.000 → Rp45.003)
2. Owner mengecek mutasi masuk di app bank miliknya sendiri, mencocokkan nominal unik ke daftar pesanan yang berstatus "menunggu pembayaran" di dashboard
3. Owner menekan tombol "Approve Pembayaran" pada pesanan yang cocok → status berubah jadi `paid`, trigger WA konfirmasi ke customer
4. Bukti transfer dari customer (jika dikirim) boleh dilampirkan sebagai referensi, tapi tidak pernah jadi trigger otomatis

**Upgrade opsional Fase 2:** jika volume transaksi sudah besar dan approve manual mulai memberatkan, baru pertimbangkan otomasi lewat API mutasi rekening (mis. Moota) atau QRIS dinamis dari payment gateway (Midtrans/Xendit, webhook-based, ada biaya ~0,7% per transaksi).

## 9. Rekomendasi Tech Stack
- Backend: PHP (native atau Laravel) + MySQL
- Frontend: Blade/HTML sederhana, prioritas mobile-friendly (bukan SPA kompleks)
- WA Gateway: Baileys (MVP) → WhatsApp Business API (scale)
- Hosting: VPS kecil, cukup untuk beban single-tenant

## 10. Metrik Keberhasilan
- Persentase notifikasi WA terkirim sukses (target >95%)
- Rata-rata waktu owner input pesanan (target <1 menit/pesanan)
- Pengurangan komplain terkait status/pembayaran laundry

## 11. Risiko & Mitigasi
| Risiko | Mitigasi |
|---|---|
| Nomor WA bot ke-banned (opsi unofficial) | Rate limit pengiriman, siapkan nomor cadangan |
| Owner salah input berat/harga | Tambahkan layar konfirmasi sebelum kirim invoice |
| Customer ganti nomor WA | Field edit nomor WA di data customer |
| Kode unik nominal bentrok antar pesanan aktif | Generate kode unik dari pool yang belum dipakai pesanan lain yang masih pending |
| Owner lupa approve pembayaran yang sudah masuk | Badge/reminder di dashboard untuk pesanan berstatus "menunggu pembayaran" lebih dari X jam |

## 12. Roadmap
- **Fase 1 (MVP):** FR-1 s.d. FR-9, WA unofficial, verifikasi pembayaran manual dengan kode unik, single laundry
- **Fase 2:** Migrasi ke WA API resmi, multi-tenant (jual ke banyak laundry), otomasi verifikasi pembayaran (API mutasi bank atau payment gateway)
