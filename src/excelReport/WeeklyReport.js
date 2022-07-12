import myfunction from "@/myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";
import getProblem from "./GetProblemByPeriodeBySpv";

/*
  periode
  totalKendaraan
  totalWaktu
  shift
  spvName
  warehouseName
  itemVariance
  totalItemMoving
  totalQTYIn
  totalQTYOut
  totalProductNotFIFO
  headName
  totalDo
  planOut
  totalItemKeluar 
*/

export default function (arrayOfArrayOfDocuments) {
  let tunggu = [];
  let newArrayOfArrayOfdocuments = arrayOfArrayOfDocuments.map(async (val) => {
    let arrProblem = [];
    let newArrayOfDocuments = [];
    val.forEach((val) => {
      tunggu.push(myfunction.tunggu(400));
      arrProblem.push(getProblem(val.periode, val.name));
      // new details document
      newArrayOfDocuments.push({
        periode: val.periode2.match(/\d+/)[0],
        totalKendaraan: val.totalKendaraan,
        totalWaktu: val.totalWaktu,
        shift: val.shift,
        spvName: val.spvName,
        warehouseName: val.warehouseName,
        itemVariance: val.itemVariance,
        totalItemMoving: val.totalItemMoving,
        totalQTYIn: val.totalQTYIn,
        totalQTYOut: val.totalQTYOut,
        totalProductNotFIFO: val.totalProductNotFIFO,
        headName: val.headName,
        totalDo: val.totalDo,
        planOut: val.planOut,
        totalItemKeluar: val.totalItemKeluar,
      });
    });
    let waitAllProblem = await Promise.all(arrProblem);
    return {
      base: newArrayOfDocuments,
      problem: waitAllProblem.flat(),
    };
  });

  newArrayOfArrayOfdocuments.forEach((val) => {
    val.then((result) => {
      console.log(result);
    });
  });

  // newArrayOfArrayOfdocuments.forEach((val) => {
  //   exportToXlsSeperateSheet(
  //     {
  //       result: [{ id: "Bismillah" }],
  //       base: val,
  //     },
  //     "Bismillah 2"
  //   );
  // });
}
