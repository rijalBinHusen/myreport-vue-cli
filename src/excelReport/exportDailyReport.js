import * as XLSX from "xlsx";

export default function (file) {
  const promise = new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e) => {
      const bufferArray = e.target.result;

      // const wb = XLSX.read(bufferArray, {type: "buffer"});
      const wb = XLSX.read(bufferArray);

      resolve(wb);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });

  promise.then((d) => {
    console.log(d);
    // let warehouseName = this.$store.getters["Warehouses/warehouseId"](infobase?.warehouse)?.name
    // let periode2 = this.$store.getters["dateFormat"]({ format: "dateMonth", time: infobase?.periode })
    // // send data excel to vuex
    // this.$store.commit("BaseReportFile/importTemp", d)
    // // bring the form up and send the baseid info to the modal state
    // this.$store.commit("Modal/active", {
    //     judul: warehouseName + " " + periode2,
    //     form: "BaseReportFile",
    //     obj: infobase,
    // });
  });
  // get the base file from assets
  // const workbook = XLSX.readFile("./BaseDailyReport.ods");
  // get the sheet name (from sheet first)
  // get the sheet that would to write in
  // console.log(workbook);
  // insert the date
  // cell reference

  // export data
}
