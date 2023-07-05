import * as XLSX from "xlsx";

export default function (file) {
  return new Promise((resolve, reject) => {
    let info = { fileName: file.name };
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e) => {
      const bufferArray = e.target.result;

      // const wb = XLSX.read(bufferArray, {type: "buffer"});
      const wb = XLSX.read(bufferArray);
      info.sheetNames = wb.SheetNames;
      info.sheets = wb.Sheets;

      resolve(info);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
