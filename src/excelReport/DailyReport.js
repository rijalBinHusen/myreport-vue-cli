import func from "../myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";

export default async function (baseReport) {
  // delete unneeded property
  Reflect.deleteProperty(
    baseReport,
    "id",
    "periode",
    "warehouse",
    "collected",
    "approval",
    "status",
    "shared",
    "finished",
    "baseReportFile",
    "isfinished",
    "name",
    "periode",
    "head",
    "warehouse",
    "collected2",
    "approval2"
  );
  let tunggu = func.tunggu(2000);
  //   console.log(baseReport);
  let fileName = `${baseReport?.periode2} ${baseReport?.warehouseName} Shift ${baseReport.shift} ${baseReport.spvName} `;

  let result = [];
  //   lists base report stock
  let reportData = func.findData({
    store: "BaseReportStock",
    criteria: {
      parent: baseReport.baseReportFile,
      shift: Number(baseReport.shift),
    },
  });

  reportData.then((data) => {
    data.forEach(async (val, index) => {
      // renew promise
      tunggu = func.tunggu(2000);
      let item = await func.findData({
        store: "Baseitem",
        criteria: { kode: val.item },
      });
      result.push({
        row: index + 1,
        namaItem: item[0]?.name,
        awal: val.awal,
        Masuk: val.in,
        TanggalMasuk: val.dateIn ? val.dateIn : 0,
        planKeluar: 0,
        Keluar: val.out,
        TanggalKeluar: val.dateOut ? val.dateOut : 0,
        real: val.real,
        TanggalAkhir: val.dateEnd ? val.dateEnd : 0,
      });
    });
  });

  tunggu.then(() => {
    exportToXlsSeperateSheet(
      {
        result: [{ id: "Bismillah" }],
        base: result,
        notes: [baseReport],
      },
      fileName
    );
  });
}
