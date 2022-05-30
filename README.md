# myreport

I build this to replace my excel job

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Todolists
Ini hanyalah sebuah daftar, tempat saya menulis apa yang akan saya lakukan sebelum 
saya melupakanya.

### Base report
- [x] Perhitungan waktu pada base clock jika mulai 23:00, dan selesai 03:00

### Problem report
- [x] Form untuk input problem
- Gudang
- Nama supervisors
- Nama head supervisors
- kode item
- Tanggal masalah dimulai
- shift masalah dimulai
- Tanggal masalah selesai (Disable)
- shift masalah selesai
- masalah
- sumber masalah
- Solusi jangka pendek
- PIC
- Dead line
- Solusi jangka panjang
- Dead line
- PIC
- [ ] Daftar problem
- nama item
- nama gudang
- tanggal masalah dimulai
- masalah
- status
- tombol edit
  

### Finished report
- [ ] tampilkan daftar finished report
- [ ] kasih tombol edit, excelMode, share(+counter sharenya)
- [ ] edit data untuk finished report
- [ ] buat excel like editor untuk finished report stock
- [ ] share report

## AG-grid todo lists
- [x] select multiple row and copy row as csv string
- [ ] select each cell // only available in enterprise edition
- [ ] copy each cell // only available in enterprise edition

## Component Periode picker
- [ ] Ubah agar periode1 dan periode2 ambil dari props

## Applying subscibe mutation feature from vuex ( Report page)
ketika komponen created
- subscribe mutation yang ada divuex ( dalam kasus saya, vuex dimodal dan mutationya bernama active )

ketika mutation modal active di picu  ( dalam kasus saya diaktifkan dengan merender component periode picker )
- kirim object ke mutation [ dalam kasus saya seperti ini Modal.mustation({ judul, namaComponent yang ditampilkan}) ]
- push namaComponen ke state di komponen
- jika user melakukan itu melakukan pecarian, maka satate yang ada dikomponen menjadi ["picker", "Loader", undefined ]
- jika state dikomponent === ["picker", "Loader", undefined ], lakukan apa yang diinginkan

ketika sudah selesai pilih periode
- tekan tombol show
- cari dokumen didalam db
-  setelah selesai tutup modal

ketika modal ditutup ( lewat vuex mutation modal.active )
- subscribe akan mengiri data ke komponen
- komponen akan membaca data dari subscribe
- jika data dari subscribe yaitu modal.active === false, lakukan apa yang diinginkan
  
Im following this [Source](https://dev.to/viniciuskneves/watch-for-vuex-state-changes-2mgj).

## Problem / cari problem dari base report page
// cari problem berdasarkan gudang
	// diharapkan hasilnya berupa object e.g kodeItem: {  key:val, key: val  }
// pada lists base report, foreach item, dari setiap item harap mengecek problem
	// jika tidak ada silahkan lanjut
	// jika ada, pastikan :
		//jika tanggal report === tanggalmulai problem 
			// jika shift report >= shiftmulai problem
			tampilkan problem
		//jika tanggal report > tanggal mulai problem && tanggal report < tanggal selesai problem
			// jika tanggal report < tanggal selesai problem
			tampilkan problem
		//jika tanggal report === tanggalselesai problem
			//jika shift report < shift selesai problem
			tampilkan problem

## Pengerjaan laporan
1. Import base laporan
2. Export laporan yang belum finished berupa excel
3. kerjakan laporan diexcel
4. jika selesai, import file excel ke aplikasi
5. export sesuai dengan format laporan yang ditentukan

## Alur menampilkan base report
1. User memilih periode yang akan ditampilkan
2. Ambil periode dari basefile report dari database
3. setelah didapatkan, kemudian lanjut ambil basereport clock, dan basereport stock dari database

## bug to fix
- [ ] nama supervisor tidak berubah pada /Uncollected/UncollectedEditForm
