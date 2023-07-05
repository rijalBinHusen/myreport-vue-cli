import * as XLSX from "xlsx";

export default function (objec, fileName) {
  // object must be object of array e.g = { document: [{etc etc etc}], clock: [{etc etc etc}] }
  // create excel work book
  return new Promise((resolve) => {

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

    resolve()
  })

}
