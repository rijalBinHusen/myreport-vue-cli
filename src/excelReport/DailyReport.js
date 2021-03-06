import func from "../myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";

export default async function (baseReport) {
  // delete unneeded property
  const {
    id,
    periode,
    warehouse,
    collected,
    approval,
    status,
    shared,
    finished,
    finished2,
    baseReportFile,
    isfinished,
    name,
    head,
    collected2,
    approval2,
    parentDocument,
    totalItemMoving,
    totalQTYIn,
    totalQTYOut,
    totalItemKeluar,
    standartWaktu,
    generateReport,
    parent,
    planOut,
    ...details
  } = baseReport;
  //   console.log(baseReport);
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
          "Nama item": item[0]?.name,
          "Stock awal": +reportData[i].awal,
          "Produk masuk": +reportData[i].in,
          "Tanggal produk masuk": reportData[i]?.dateIn
            ? reportData[i].dateIn
            : "-",
          "Coret DO": +reportData[i]?.planOut ? reportData[i].planOut : 0,
          "Produk keluar": +reportData[i].out,
          "Tanggal produk keluar": reportData[i]?.dateOut
            ? reportData[i].dateOut
            : "-",
          "Real stock": +reportData[i].real,
          "Tanggal produk akhir": reportData[i]?.dateEnd
            ? reportData[i].dateEnd
            : "-",
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
    },
    fileName
  );
}
