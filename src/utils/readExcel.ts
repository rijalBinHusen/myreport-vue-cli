import * as XLSX from "xlsx";
import { type WorkBook, WorkSheet } from "./xlsx.type"

export interface resultExcelRead {
  fileName: string;
  sheetNames: string[];
  sheets: WorkSheet
}

export default function (file: any): Promise<resultExcelRead> {
  return new Promise((resolve, reject) => {
    let info = <resultExcelRead>{ fileName: file.name };
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e: any) => {
      const bufferArray = e.target.result;

      // const wb = XLSX.read(bufferArray, {type: "buffer"});
      const wb: WorkBook = XLSX.read(bufferArray);
      info.sheetNames = wb.SheetNames;
      info.sheets = wb.Sheets;

      resolve(info);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
