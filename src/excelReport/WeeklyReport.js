export default function (arrayOfDocuments) {
  let documents = [];
  for (let i = 0; i < arrayOfDocuments.length; i++) {
    // delete unused variable
    const {
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
    } = arrayOfDocuments[i];
    // resultTemp.periode = val.periode2.match(/\d+/)[0];
    console.log(resultTemp);
    documents.push(resultTemp);
  }
  console.log(documents);
}
