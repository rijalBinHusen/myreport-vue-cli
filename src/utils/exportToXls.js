import * as XLSX from "xlsx";

export default function (array, fileName) {
  // array must be array of object e.g = [{id:1}, {id:2}]
  let worksheet = XLSX.utils.json_to_sheet(array);

  // create excel work book
  let workbook = XLSX.utils.book_new();

  // add worksheet to work book
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

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
