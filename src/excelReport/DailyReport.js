import func from "../myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";
import GetFieldProblemByPeriodeBySpv from "./GetFieldProblemByPeriodeBySpv";

export default async function (baseReport) {
  // console.log(baseReport)
  const { totalDo, totalKendaraan, totalWaktu, shift, totalProductNotFIFO, spvName, warehouseName, periode2, headName } = baseReport
  const details = { totalDo, totalKendaraan, totalWaktu, totalProductNotFIFO, shift, spvName, warehouseName, periode2, headName }

  let fieldProblem = await GetFieldProblemByPeriodeBySpv(baseReport?.periode, baseReport?.name)

  let fileName = `${baseReport?.periode2} ${baseReport?.warehouseName} Shift ${baseReport.shift} ${baseReport.spvName} `;
  // tunggu
  let tunggu = [];
  let result = [];
  //   lists base report stock
  let reportData = await func.findData({
    store: "BaseReportStock",
    criteria: {
      parent: baseReport.baseReportFile,
      shift: Number(baseReport.shift),
    },
  });

  for (let i = 0; i < reportData.length; i++) {
    //  add new promise
    tunggu.push(func.tunggu(1000));
    //   item name
    let item = await func.findData({
      store: "Baseitem",
      criteria: { kode: reportData[i].item },
    });
    //   problem info
    let problem = await getProblem(reportData[i].problem);
    result.push(
      Object.assign(
        {
          row: i + 1,
          "Nama item": item?.length ? item[0]?.name : "Item tidak ditemukan",
          "Stock awal": +reportData[i].awal,
          "Produk masuk": +reportData[i].in,
          "Tanggal produk masuk": reportData[i].dateIn || "-",
          "Coret DO": reportData[i].planOut || 0,
          "Produk keluar": +reportData[i].out,
          "Tanggal produk keluar": reportData[i].dateOut || "-",
          "Real stock": +reportData[i].real,
          "Tanggal produk akhir": reportData[i].dateEnd || "-",
        },
        problem
      )
    );
  }

  await Promise.all(tunggu);
  exportToXlsSeperateSheet(
    {
      result: [{ id: "Bismillah" }],
      base: result,
      notes: [details],
      kendalaLapangan: fieldProblem || [{ periode: '',	masalah: '',	sumberMasalah: '',	solusi: '',	pic: '',	dl: '' }],
    },
    fileName
  );
}