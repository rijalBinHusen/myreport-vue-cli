import func from "../myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";

export default async function (baseReport) {
  // baseReport must be a group, e.g = [baseReport, baseReport]
  let details = detailsDocument(baseReport);
  //   console.log(baseReport);
  let fileName = `${details?.periode2} ${details?.warehouseName} Shift ${details.shift} ${details.spvName} `;
  // tunggu
  let tunggu = [];
  let result = [];
  //   lists base report stock
  let reportData = await Promise.all(
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
          namaItem: item[0]?.name,
          awal: reportData[i].awal,
          Masuk: reportData[i].in,
          TanggalMasuk: reportData[i].dateIn ? reportData[i].dateIn : 0,
          planKeluar: 0,
          Keluar: reportData[i].out,
          TanggalKeluar: reportData[i].dateOut ? reportData[i].dateOut : 0,
          real: reportData[i].real,
          TanggalAkhir: reportData[i].dateEnd ? reportData[i].dateEnd : 0,
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
      resultTemp[val] ? (resultTemp += val2) : (resultTemp = val2);
    });
  });

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
    ...details
  } = resultTemp;
  return details;
}

async function getProblem(arrayOfProblemId) {
  // MASALAH SUMBER MASALAH SOLUSI JANGKA PENDEK		PIC	D/L	SOLUSI JANGKA PANJANG		PIC	D/L
  let result = {
    masalah: "",
    sumberMasalah: "",
    solusi: "",
    pic: "",
    dl: "",
    solusiPanjang: "",
    picPanjang: "",
    dlPanjang: "",
  };

  if (arrayOfProblemId.length) {
    let allProblem = await Promise.all(
      arrayOfProblemId.map((val) =>
        func.findData({ store: "Problem", criteria: val })
      )
    );
    allProblem.forEach((val) => {
      result.pic += val.pic + "\r\n";
      result.dl += val.dl + "\r\n";
      result.masalah += val.masalah + "\r\n";
      result.sumberMasalah += val.sumberMasalah + "\r\n";
      result.solusi += val.solusi + "\r\n";
      result.solusiPanjang += val.solusiPanjang + "\r\n";
      result.dlPanjang += val.dlPanjang + "\r\n";
      result.picPanjang += val.picPanjang + "\r\n";
    });
  }
  return result;
}
