# Website Bitts Coffee

Landing page Bitts Coffee (Ciwasiat dan Cigadung, Pandeglang). Website statis: HTML, CSS, dan JavaScript biasa, tanpa proses build.

## Isi folder

| File / folder | Isi |
| --- | --- |
| `index.html` | Halaman utama: promo, menu, suasana, testimoni, reservasi, biji kopi, lokasi, Bitts Club |
| `syarat-ketentuan.html` | S&K promo Bitts Bike, Bitts Tumbler, dan Bitts Club |
| `kebijakan-privasi.html` | Kebijakan privasi (UU No. 27 Tahun 2022 tentang PDP) |
| `style.css`, `script.js` | Tampilan dan interaksi untuk semua halaman |
| `assets/img/` | Foto (WebP), gambar share `og-image.jpg`, pola siluet `village.svg` |
| `favicon.svg`, `apple-touch-icon.png` | Ikon tab browser dan layar HP |
| `robots.txt`, `sitemap.xml` | Untuk Google |
| `apps-script/bitts-club.gs` | Penerima pendaftaran Bitts Club ke Google Sheets (cara deploy ada di dalam file) |

`reference/` dan `assets/*.png` (foto asli resolusi besar) tidak perlu ikut di-upload ke hosting.

## Desain

Tampilan mengikuti story Instagram @bittscoffee (contohnya ada di folder `reference/`).

| Elemen | Dipakai untuk | Sumber di story |
| --- | --- | --- |
| Delicious Handrawn (ditebalkan dengan stroke) | Judul dan nama menu | Tulisan tangan "BELI KOPI PAKE TUMBLER", "WE ARE OPEN" |
| Arimo Bold | Label, tombol, harga | "DAPAT POTONGAN 10%" |
| Open Sans | Teks isi, alamat bold italic | "Jl. Ciwasiat - Pandeglang" |
| Titan One (hanya angka) | Angka diskon "10%" 3D | Angka "10%" di story Bitts Bike |
| `#141414`, putih, gradasi abu-abu | Warna dasar | Latar story |
| `#f2d106` | Aksen kuning | Badge Bitts Bike |
| `#754328` | Banner jam buka | Story "WE ARE OPEN" |

Motif yang dipakai ulang: logo dua batu (di-trace dari foto profil IG), garis setelah teks, siluet rumah dan pohon di dasar panel, badge Bitts Bike, dan sensor putih di mata untuk foto orang.

## Sebelum go-live

Semua isian di bawah masih contoh. Ganti dulu, lalu jalankan perintah cek di bagian akhir.

| Isian contoh | Ganti dengan | Lokasi |
| --- | --- | --- |
| `bittscoffee.example` | Domain asli Bitts | 3 file HTML, `robots.txt`, `sitemap.xml` |
| `6281234567890` | Nomor WhatsApp admin (format 62...) | `index.html`, `script.js` (`WA_NUMBER`), 2 halaman legal |
| `G-XXXXXXXXXX` | Measurement ID Google Analytics 4 | `index.html` (2 tempat) |
| `CLARITY_ID` | Project ID Microsoft Clarity | `index.html` |
| `APPS_SCRIPT_DEPLOYMENT_ID` | URL Web App dari `apps-script/bitts-club.gs` | `script.js` (`CLUB_SHEET_URL`) |
| Link `gofood.link/...` dan `food.grab.com/...` | Link toko asli tiap cabang | `index.html`, modal Pesan Online |
| 3 testimoni | Ulasan asli (dengan izin pemberi ulasan) | `index.html`, bagian bertanda `WAJIB DIGANTI` |
| Menu, harga, deskripsi | Data dari Bitts | `index.html`, harga di `data-price` dan `data-original-price` |
| Foto | Foto asli Bitts | `assets/img/`, lalu buat ulang `og-image.jpg` (1200 x 630). `bitts-bar.webp` dan `bitts-latte.webp` dipotong dari story Instagram (resolusi rendah), ganti dengan file aslinya. `atmosphere`, `latte`, `people` masih foto contoh. |

Hal yang perlu disetujui pemilik Bitts:

- **Isi S&K promo dan Kebijakan Privasi.** Keduanya masih draf.
- **Diskon digabung atau tidak.** Sekarang tidak bisa digabung (maksimal 10%). Kalau boleh digabung, ubah `PROMO_STACKABLE` di `script.js` menjadi `true`, lalu hapus poin "tidak bisa digabung" di `syarat-ketentuan.html`.

Perintah cek, hasilnya harus kosong:

```bash
grep -rn "bittscoffee.example\|6281234567890\|G-XXXXXXXXXX\|CLARITY_ID\|APPS_SCRIPT_DEPLOYMENT_ID" --include=*.html --include=*.js --include=*.txt --include=*.xml .
```

Foto baru dikonversi ke WebP dengan Python dan Pillow:

```bash
python -c "from PIL import Image; Image.open('foto.jpg').convert('RGB').save('assets/img/foto.webp', 'WEBP', quality=78)"
```

## Event yang tercatat di GA4 dan Clarity

Tandai 6 event teratas sebagai **Key event** di GA4 (Admin > Events).

| Event | Kapan terjadi | Label |
| --- | --- | --- |
| `click_whatsapp` | Klik tombol WhatsApp | header, mobile_nav, footer, sticky_bar, voucher |
| `claim_voucher` | Klik Klaim Voucher | bike, tumbler |
| `order_delivery` | Klik GoFood/GrabFood | platform dan cabang, ditambah nama menu (`item_name`) |
| `booking_request` | Klik reservasi tempat | ciwasiat, cigadung |
| `get_directions` | Klik rute Google Maps | ciwasiat, cigadung |
| `join_club` | Pendaftaran Bitts Club berhasil | sumber kunjungan (`utm_source`) |
| `select_menu` | Klik Pesan Online di kartu menu | nama menu |
| `sticky_cta` | Klik Pesan/Rute di bar bawah HP | pesan, rute |
| `read_reviews` | Klik Lihat Semua Ulasan | google_maps |

## Link dengan UTM

Pakai link berikut di bio Instagram, QR code, dan Google Business Profile. Dengan begitu GA4 dan Sheet Bitts Club bisa menunjukkan dari mana pengunjung datang.

| Dipasang di | Link |
| --- | --- |
| Bio Instagram | `https://bittscoffee.example/?utm_source=instagram&utm_medium=bio` |
| QR meja Ciwasiat | `https://bittscoffee.example/?utm_source=qr_meja_ciwasiat&utm_medium=qr` |
| QR meja Cigadung | `https://bittscoffee.example/?utm_source=qr_meja_cigadung&utm_medium=qr` |
| QR kasir | `https://bittscoffee.example/?utm_source=qr_kasir&utm_medium=qr` |
| Google Business Profile | `https://bittscoffee.example/?utm_source=google_maps&utm_medium=gbp` |

## Deploy

Website ini cukup di-upload apa adanya ke hosting statis apa pun, misalnya Netlify, Cloudflare Pages, GitHub Pages, atau hosting cPanel. Setelah online:

1. Buka website di HP, klik tiap tombol, lalu pastikan event muncul di GA4 > Reports > Realtime.
2. Daftar Bitts Club dengan nomor sendiri, lalu pastikan barisnya masuk ke Google Sheet.
3. Daftarkan `sitemap.xml` di Google Search Console.
