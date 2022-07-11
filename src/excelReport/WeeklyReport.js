import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";
import getProblem from "./GetProblemByPeriodeBySpv";

export default function (arrayOfArrayOfDocuments) {
  let arrProblem = [];
  let newArrayOfArrayOfdocuments = arrayOfArrayOfDocuments.map((val) => {
    let newArrayOfDocuments = val.map(
      ({
        id,
        periode,
        warehouse,
        collected,
        approval,
        status,
        shared,
        finished,
        baseReportFile,
        isfinished,
        name,
        head,
        parentDocument,
        periode2,
        ...resultTemp
      }) => {
        arrProblem.push(getProblem(periode, name));
        resultTemp.periode = periode2.match(/\d+/)[0];
        return resultTemp;
      }
    );
    return newArrayOfDocuments;
  });
  newArrayOfArrayOfdocuments.forEach((val) => {
    exportToXlsSeperateSheet(
      {
        result: [{ id: "Bismillah" }],
        base: val,
      },
      "Bismillah 2"
    );
  });
}
