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
  return new Promise(async (resolve) => {
    let newArrayOfArrayOfdocuments = []
    for ( let val of arrayOfArrayOfDocuments) {

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
          },
        ];
        let arrayPeriodeSearched = [];
        val.forEach((val2) => {
          if (!arrayPeriodeSearched.includes(val2.periode+val2?.name)) {
            arrProblem.push(getProblem({ periode: val2.periode, nameSpv: val2.name}));
            arrProblem.push(getCases({ periode: val2.periode, name: val2.name}));
            arrProblem.push(GetComplains({ periode: val2.periode, name: val2.name}));
            arrayPeriodeSearched.push(val2.periode+val2?.name);
          }
          // new details document
          newArrayOfDocuments.push({
            periodeBulan: val2?.periode2,
            periode: +val2.periode2.match(/\d+/)[0],
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
        newArrayOfArrayOfdocuments.push({
          base: newArrayOfDocuments,
          problem: waitAllProblem.flat().filter((val) => !!val),
        });
  }
  // console.log(newArrayOfArrayOfdocuments)

    for (let result of newArrayOfArrayOfdocuments ) {
        await exportToXlsSeperateSheet(
          Object.assign(
            {
              Report: [{ id: "Bismillah" }],
            },
            result
          ),
          result?.base[1]?.warehouseName +
            " " +
            " Semua karu " +
            result?.base[1]?.periodeBulan +
            " - " +
            result?.base.slice(-1)[0]?.periodeBulan
        );
        await myfunction.tunggu(500)
    }
    resolve();
    // newArrayOfArrayOfdocuments.forEach((val) => {
    // });
  });
}
