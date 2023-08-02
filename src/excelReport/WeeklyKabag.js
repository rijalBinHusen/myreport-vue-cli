import exportToXlsSeperateSheet from "../utils/exportToXlsSeperateSheet";
import getProblem from "./GetProblemByPeriodeBySpv";
import getCases from "./GetCasesByPeriodeBySpv";
import GetComplains from "./GetComplainByPeriodeBySpv";
import GetFieldProblem from "./GetFieldProblemByPeriodeBySpv";
import { JSToExcelDate } from "@/composable/piece/dateFormat";

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
  return new Promise((resolve) => {
    let newArrayOfArrayOfdocuments = arrayOfArrayOfDocuments.map(
      async (val) => {
        let arrProblem = [];
        let newArrayOfDocuments = [
          {
            periode: '',
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
            periodeBulan: 0,
          },
        ];
        let arrayPeriodeSearched = [];
        val.forEach((val2) => {
          if (!arrayPeriodeSearched.includes(val2.periode)) {
            arrProblem.push(getProblem(val2.periode, false, val2.head));
            arrProblem.push(getCases(val2.periode, false, val2.head));
            arrProblem.push(GetComplains(val2.periode, false, val2.head));
            arrProblem.push(GetFieldProblem(val2.periode, undefined, val2.head))
            arrayPeriodeSearched.push(val2.periode);
          }
          // new details document
          newArrayOfDocuments.push({
            periodeBulan: val2?.periode2,
            periode: JSToExcelDate(val2.periode),
            totalKendaraan: +val2.totalKendaraan,
            totalWaktu: +val2.totalWaktu,
            shift: val2.shift,
            spvName: val2.spvName,
            warehouseName: val2.warehouseName,
            itemVariance: +val2.itemVariance,
            totalItemMoving: +val2.totalItemMoving,
            totalQTYIn: +val2.totalQTYIn,
            totalQTYOut: +val2.totalQTYOut,
            totalProductNotFIFO: +val2.totalProductNotFIFO,
            headName: val2.headName,
            totalDo: +val2.totalDo,
            planOut: +val2.planOut,
            totalItemKeluar: +val2.totalItemKeluar,
          });
        });
        let waitAllProblem = await Promise.all(arrProblem);
        return {
          base: newArrayOfDocuments,
          problem: waitAllProblem.flat().filter((val) => !!val),
        };
      }
    );

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
          result?.base[1]?.headName
          + " " +
          result?.base[1]?.periodeBulan
          + " Sampai " +
          result?.base.slice(-1)[0]?.periodeBulan
          + " Shift " +
          result?.base[1]?.shift
        );
      });
    });
    resolve();
    // newArrayOfArrayOfdocuments.forEach((val) => {
    // });
  });
}
