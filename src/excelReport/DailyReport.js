// import func from "../myfunction";
import { waitFor } from "@/utils/piece/waiting"
import exportToXlsSeperateSheet from "@/utils/exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";
import GetFieldProblemByPeriodeBySpv from "./GetFieldProblemByPeriodeBySpv";
import { baseReportStock } from "@/pages/BaseReport/BaseReportStock";
import { baseItem } from "@/pages/BaseItem/Baseitem"

export default async function (baseReport) {
  const { getBaseStockByParentByShift } = baseReportStock();
  const { getItemBykode } = baseItem();
  // console.log(baseReport)
  const { totalDo, totalKendaraan, totalWaktu, shift, totalProductNotFIFO, spvName, warehouseName, periode2, headName } = baseReport
  const details = { totalDo, totalKendaraan, totalWaktu, totalProductNotFIFO, shift, spvName, warehouseName, periode2, headName }

  let fieldProblem = await GetFieldProblemByPeriodeBySpv(baseReport?.periode, baseReport?.name)

  let fileName = `${periode2} ${warehouseName} Shift ${shift} ${spvName} `;
  // waitingLists
  let waitingLists = [];
  let result = [];
  //   lists base report stock
  let stocks = await getBaseStockByParentByShift(baseReport?.baseReportFile, shift);
  // func.findData({
  //   store: "BaseReportStock",
  //   criteria: {
  //     parent: baseReport.baseReportFile,
  //     shift: Number(baseReport.shift),
  //   },
  // });

  for (let stock of stocks) {
    //  add new promise
    waitingLists.push(waitFor(1000));
    //   item name
    let item = await getItemBykode(stock.item);

    // await func.findData({
    //   store: "Baseitem",
    //   criteria: { kode: reportData[i].item },
    // });
    //   problem info
    let problem = await getProblem(stock.problem);
    result.push(
      Object.assign(
        {
          row: i + 1,
          "Nama item": item?.name,
          "Stock awal": +stock.awal,
          "Produk masuk": +stock.in,
          "Tanggal produk masuk": stock.dateIn || "-",
          "Coret DO": stock.planOut || 0,
          "Produk keluar": +stock.out,
          "Tanggal produk keluar": stock.dateOut || "-",
          "Real stock": +stock.real,
          "Tanggal produk akhir": stock.dateEnd || "-",
        },
        problem
      )
    );
  }

  await Promise.all(waitingLists);
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