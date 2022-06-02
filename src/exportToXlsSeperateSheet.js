import * as XLSX from "xlsx";

export default function (objec, fileName) {
  // object must be object of array e.g = { document: [{etc etc etc}], clock: [{etc etc etc}] }
  // create excel work book
  let workbook = XLSX.utils.book_new();

  let sheet = Object.keys(objec)

  // iterateSheet
  sheet.forEach((val) => {
    // array of sheet
    let worksheet = XLSX.utils.json_to_sheet(objec[val]);

    // append worksheet to work book
    XLSX.utils.book_append_sheet(workbook, worksheet, val);
  })

  // excel file
  XLSX.writeFile(workbook, `${fileName}.xls`);

  // var a = document.createElement("a");
  // var file = new Blob([result], {
  //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // });

  // a.href = URL.createObjectURL(file);
  // a.download = "test";
  // a.click();
}
