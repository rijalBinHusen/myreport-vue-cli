
<!-- 
- [ ] Halaman edit dokumen, sebelumnya dokumen sudah ditandai sebagai MP Tidak masuk, tetapi terdapat kesalahan dalam penulisan nama kepala bagian, ketika kita update kepala bagian, maka status dokumen dari tidak masuk menjadi dikumpulkan dan diparaf pada tanggal saat itu 
- [ ] Import summary dokumen juga
- [ ] periksa cases dan complain import is_inserted tidak terdeteksi
-->


export base report

1. cari document dengan criteria { isFinished: false }
2. looping cari baseReportFile dengan criteria { periode: document.periode, imported: true }
3. looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
4. looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
5. gunakan getter untuk mendapatkan data seperti berikut :
document {
    id: idrecord, 
    name: spvrecord, 
    periode: perioderecord, 
    shift: shiftrecord, 
    head: headrecord, 
    collected: collectedrecord, 
    approval: approvalrecord, 
    status: statusrecord
    shared: false, 
    finished: false, 
    totaldo: false, 
    totalkendaraan: false, 
    totalwaktu: false, 
    standartwaktu: false, 
    basereportfile: false, 
    isfinished: false, 
}
stock {
    id, 
    parent, 
    parentdocument, 
    periode, 
    gudang, 
    shift, 
    item, 
    namaitem, 
    awal, 
    in, 
    datein, 
    out, 
    dateout, 
    real, 
    dateend, 
    problem
}

6. Export ke excel dengan sheet terpisah document dan stock
7. 

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

## Applying subscribe mutation feature from vuex ( Report page)
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
- [x] Import base laporan
2. Export laporan yang belum finished berupa excel
    - export menjadi 2 sheet
    - sheet 1 berisi record basereport stock ( id, parent, parent document, periode, gudang, shift, item, nama item, awal, in, date in, out, date out, real, daateend, problem )
    - sheet 2 berisi record document ( id, periode, collected, shared, approval, finished, shift, spv, head, totaldo, total kendaraan, totalwaktu, standartwaktu, basereportfile, isfinished, status)
3. kerjakan laporan diexcel
    - jika ada yang perlu dikonfirmasi ke spv, tulis disampingnya (confirm)
4. jika selesai, import file excel ke aplikasi
    - import import normal seperti biasa
    - cari setiap yang ada problem, atau yang memiliki selisih, atau yang memiliki value confirm
    - sisipkan detail problem
    - tampilkan item yang bermasalah
    - konfirmasi jika ada yang perlu dikonfirmasi
5. export sesuai dengan format laporan yang ditentukan

## Alur menampilkan base report
1. User memilih periode yang akan ditampilkan
2. Ambil periode dari basefile report dari database
3. setelah didapatkan, kemudian lanjut ambil basereport clock, dan basereport stock dari database

## bug to fix
- [x] nama supervisor tidak berubah pada /Uncollected/UncollectedEditForm
- [x] tidak bisa update record dari emit ag-grid dibase report 2022-06-07

## 2022-06-03 Todo
- [x] Tampilkan problem pada base report 2022-06-04
- [x] Perlu periksa kembali document details (totalDO etc, etc) 2022-06-04
- [x] Excel mode, tambahkan column plan output 2022-06-04
