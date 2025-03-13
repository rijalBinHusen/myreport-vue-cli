// import func from "../myfunction";
import { waitFor } from "@/utils/piece/waiting"
// import exportToXlsSeperateSheet from "@/utils/exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";
import { startExport } from "@/composable/piece/exportAsFile";
import { BaseReportFileInterface } from "@/pages/BaseReport/BaseReportFile";
import { baseReportStock } from "@/pages/BaseReport/BaseReportStock";
import { JSToExcelDate } from "@/composable/piece/dateFormat";

export default async function (baseReport: BaseReportFileInterface, shift: number) {
  
  // console.log(baseReport)
  const { warehouseName, periode2, periode } = baseReport;
  const excelDate = JSToExcelDate(periode);
  const details = { periode2, periode: excelDate,  gudang: warehouseName, shift }

  let fileName = `${periode2} ${warehouseName} Shift ${shift}`;
  // waitingLists
  let waitingLists = [];
  let result = [];
  const baseStockOperation = baseReportStock();
  //   lists base report stock
  let stocks = await baseStockOperation.getBaseStockByParentByShift(baseReport.id, shift);

  for (let [index, stock] of stocks.entries()) {
    //  add new promise
    waitingLists.push(waitFor(1000));
    
    //   problem info
    let problem = await getProblem(stock.problem);
    result.push(
      Object.assign(
        {
          row: index + 1,
          "Nama item": stock?.itemName,
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
  // exportToXlsSeperateSheet(
  //   {
  //     result: [{ id: "Bismillah" }],
  //     base: result,
  //     notes: [details],
  //     kendalaLapangan: fieldProblem || [{ periode: '',	masalah: '',	sumberMasalah: '',	solusi: '',	pic: '',	dl: '' }],
  //   },
  //   fileName
  // );
  

  startExport({
    base: result,
    notes: [details],
  }, fileName + '.json')
}