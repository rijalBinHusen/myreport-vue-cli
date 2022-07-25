import func from "../myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";

export default async function (baseReport) {
  // baseReport must be a group, e.g = [baseReport, baseReport]
  let details = detailsDocument(baseReport);
  // console.log(details);
  let fileName = `${details?.periode2} ${details?.warehouseName} Shift ${details.shift} ${details.spvName} `;
  // tunggu
  let tunggu = [];
  let result = [];
  //   lists base report stock
  let reportPromise = await Promise.all(
    baseReport.map((val) =>
      func.findData({
        store: "BaseReportStock",
        criteria: {
          parent: val.baseReportFile,
          shift: Number(val.shift),
        },
      })
    )
  );
  // console.log(reportData.flat());
  let reportData = reportPromise.flat();

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
          namaItem: item?.length ? item[0]?.name : "Item tidak ditemukan",
          awal: reportData[i].awal,
          Masuk: reportData[i].in,
          TanggalMasuk: reportData[i].dateIn ? reportData[i].dateIn : "-",
          planKeluar: 0,
          Keluar: reportData[i].out,
          TanggalKeluar: reportData[i].dateOut ? reportData[i].dateOut : "-",
          real: reportData[i].real,
          TanggalAkhir: reportData[i].dateEnd ? reportData[i].dateEnd : "-",
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

function detailsDocument(arrayOfDocumentDetails) {
  // { object of all key }
  let resultTemp = {};
  // iterate all document details
  arrayOfDocumentDetails.forEach((val) => {
    // iterate all key of current document detail
    Object.keys(val).forEach((val2) => {
      // save to result temprorary
      resultTemp[val2]
        ? (resultTemp[val2] += val[val2])
        : (resultTemp[val2] = val[val2]);
    });
  });
  // console.log(resultTemp);

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
    headName,
    parentDocument,
    periode2,
    shift,
    spvName,
    warehouseName,
    totalItemMoving,
    totalQTYIn,
    totalQTYOut,
    totalItemKeluar,
    standartWaktu,
    generateReport,
    parent,
    planOut,
    ...details
  } = resultTemp;

  return Object.assign(details, {
    shift: arrayOfDocumentDetails[0]?.shift,
    spvName: arrayOfDocumentDetails[0]?.spvName,
    warehouseName: arrayOfDocumentDetails[0]?.warehouseName,
    periode2: arrayOfDocumentDetails[0]?.periode2,
    headName: arrayOfDocumentDetails[0]?.headName,
  });
}
