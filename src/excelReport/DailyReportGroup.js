// import func from "../myfunction";
import exportToXlsSeperateSheet from "@/utils/exportToXlsSeperateSheet";
import getProblem from "./GetProblemByArrayId";
import GetFieldProblemByPeriodeBySpv from "./GetFieldProblemByPeriodeBySpv";
import { waitFor } from "@/utils/piece/waiting";
import { baseItem } from "@/pages/BaseItem/Baseitem";
import { useIdb } from "@/utils/localforage";

export default async function (baseReport) {
  const dbStock = useIdb('basereportstock');
  const { getItemBykode } = baseItem();
  // baseReport must be a group, e.g = [baseReport, baseReport]
  let details = detailsDocument(baseReport);
  // console.log(details);
  let fieldProblem = await GetFieldProblemByPeriodeBySpv(baseReport[0]?.periode, baseReport[0]?.name)
  let fileName = `${details?.periode2} ${details?.warehouseName} Shift ${details.shift} ${details.spvName} `;
  // tunggu
  let tunggu = [];
  let result = [];
  //   lists base report stock
  let reportPromise = await Promise.all(baseReport.map((val) => dbStock.getItemsByKeyValue('parentDocument', val?.id)));
    // func.findData({
    //   store: "BaseReportStock",
    //   criteria: {
    //     parent: val.baseReportFile,
    //     shift: Number(val.shift),
    //   },
    // })
  // console.log(reportData.flat());
  let stocks = reportPromise.flat();

  for (let [index, stock] of stocks.entries()) {
    //  add new promise
    tunggu.push(waitFor(1000));
    //   item name
    let item = await getItemBykode(stock?.item);
    // reportData[i]?.item ? 
    //             await func.findData({
    //               store: "Baseitem",
    //               criteria: { kode: reportData[i]?.item },
    //             })
    //             : ''
    //   problem info

    let problem = await getProblem(stock?.problem);
    result.push(
      Object.assign(
        {
          row: index + 1,
          namaItem: item.name,
          awal: stock?.awal || 0,
          Masuk: stock?.in || 0,
          TanggalMasuk: stock?.dateIn || "-",
          "Coret DO": stock.planOut || 0,
          Keluar: stock?.out || 0,
          TanggalKeluar: stock?.dateOut || "-",
          real: stock?.real || 0,
          TanggalAkhir: stock?.dateEnd || "-",
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
  const { totalDo, totalKendaraan, totalWaktu, totalProductNotFIFO, itemVariance } = resultTemp;

  return {
    totalDo,
    totalKendaraan,
    totalWaktu,
    totalProductNotFIFO,
    itemVariance,
    shift: arrayOfDocumentDetails[0]?.shift,
    spvName: arrayOfDocumentDetails[0]?.spvName,
    warehouseName: arrayOfDocumentDetails[0]?.warehouseName,
    periode2: arrayOfDocumentDetails[0]?.periode2,
    headName: arrayOfDocumentDetails[0]?.headName,
  };
}
