# Pemilihan Kursi Bus — Family Gathering SPPG

Aplikasi sederhana untuk relawan memilih kursi bus. Tidak ada login peserta.

## Cara deploy ke Netlify
1. Buat repository GitHub baru dan upload seluruh isi folder ini.
2. Di Netlify pilih **Add new site → Import an existing project**, lalu hubungkan repository.
3. Netlify akan mendeteksi `netlify.toml`. Deploy project.
4. Di Netlify: **Site configuration → Environment variables**, tambahkan `ADMIN_PIN` dengan PIN rahasia pilihan admin (misalnya jangan gunakan PIN yang mudah ditebak).
5. Redeploy setelah menambahkan variable. Netlify Blobs akan menyimpan pemesanan secara online.

## Penggunaan
- Bagikan link situs kepada relawan.
- Peserta mengisi nama, memilih kursi, lalu menekan Simpan.
- Admin membuka bagian **Admin / Lihat daftar kursi**, memasukkan PIN, lalu dapat melihat daftar dan mengunduh CSV.
- Tombol kosongkan kursi hanya untuk admin.

## Penyesuaian
- Denah mengikuti bus 60 seat konfigurasi 2-3: kursi 60 di bagian depan, 1-50 pada baris 2+3, 51-53 di sisi kanan menjelang belakang, dan 54-59 pada bangku belakang.
- Susunan kursi dibuat 2-2 dengan lorong tengah.

Catatan: pemesanan sederhana ini cocok untuk penggunaan kecil. Jika banyak orang menekan tombol pada waktu yang persis bersamaan, Netlify Blobs tidak menyediakan transaksi atomik untuk operasi ini; untuk sistem booking dengan jaminan kuat perlu database transaksi.
