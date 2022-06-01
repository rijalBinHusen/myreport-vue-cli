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