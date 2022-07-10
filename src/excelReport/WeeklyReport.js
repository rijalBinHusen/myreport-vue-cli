import exportToXlsSeperateSheet from "../exportToXlsSeperateSheet";

export default function (arrayOfArrayOfDocuments) {
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
