import myfunction from "@/myfunction";
import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";
import getProblem from "./GetProblemByPeriodeBySpv";
import getCases from "./GetCasesByPeriodeBySpv";
import GetComplains from "./GetComplainByPeriodeBySpv";

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
  let newArrayOfArrayOfdocuments = arrayOfArrayOfDocuments.map(async (val) => {
    let arrProblem = [];
    let newArrayOfDocuments = [
      {
        periode: 1,
        totalKendaraan: 2,
        totalWaktu: 3,
        shift: 4,
        spvName: 5,
        warehouseName: 6,
        itemVariance: 7,
        totalItemMoving: 8,
        totalQTYIn: 9,
        totalQTYOut: 10,
        totalProductNotFIFO: 11,
        headName: 12,
        totalDo: 13,
        planOut: 14,
        totalItemKeluar: 15,
      },
    ];
    val.forEach((val) => {
      arrProblem.push(getProblem(val.periode, val.name));
      arrProblem.push(getCases(val.periode, val.name));
      arrProblem.push(GetComplains(val.periode, val.name));
      // new details document
      newArrayOfDocuments.push({
        periode: +val.periode2.match(/\d+/)[0],
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
      problem: waitAllProblem.flat().filter((val) => !!val),
    };
  });

  newArrayOfArrayOfdocuments.forEach((val) => {
    val.then((result) => {
      // console.log(Object.assign(result, { Report: [{ id: "Bismillah" }] }));
      exportToXlsSeperateSheet(
        Object.assign(
          {
            Report: [{ id: "Bismillah" }],
          },
          result
        ),
        result?.base[1]?.periode +
          " - " +
          result?.base.slice(-1)[0]?.periode +
          " " +
          result?.base[1]?.warehouseName +
          " " +
          result?.base[1]?.spvName
      );
    });
  });

  // newArrayOfArrayOfdocuments.forEach((val) => {
  // });
}
