// import func from "../myfunction";
import { waitFor } from "@/utils/piece/waiting"
// import exportToXlsSeperateSheet from "@/utils/exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";
import { baseItem } from "@/pages/BaseItem/Baseitem"
import { useIdb } from "@/utils/localforage";
import { startExport } from "@/composable/piece/exportAsFile";

export default async function (baseReport) {
  const dbBaseStock = useIdb('basereportstock');
  const { getItemBykode } = baseItem();
  // console.log(baseReport)
  const { shift, warehouseName, periode2 } = baseReport
  const details = { periode: periode2, 
                    gudang: warehouseName,
                    shift,
                }

  let fileName = `${periode2} ${warehouseName} Shift ${shift}`;
  // waitingLists
  let waitingLists = [];
  let result = [];
  //   lists base report stock
  let stocks = await dbBaseStock.getItemsByKeyValue('parentDocument', baseReport?.id);

  for (let [index, stock] of stocks.entries()) {
    //  add new promise
    waitingLists.push(waitFor(1000));
    //   item name
    let item = await getItemBykode(stock.item);
    
    //   problem info
    let problem = await getProblem(stock.problem);
    result.push(
      Object.assign(
        {
          row: index + 1,
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