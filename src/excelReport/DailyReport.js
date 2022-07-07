import func from "../myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";

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
      result.dl += func.dateFormat(["dateMonth", val.dl]) + "\r\n";
      result.masalah += val.masalah + "\r\n";
      result.sumberMasalah += val.sumberMasalah + "\r\n";
      result.solusi += val.solusi + "\r\n";
      result.solusiPanjang += val.solusiPanjang + "\r\n";
      result.dlPanjang +=
        func.dateFormat(["dateMonth", val.dlPanjang]) + "\r\n";
      result.picPanjang += val.picPanjang + "\r\n";
    });
  }
  return result;
}
