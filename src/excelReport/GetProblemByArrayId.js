import func from "../myfunction";

export default async function (arrayOfProblemId) {
  // MASALAH SUMBER MASALAH SOLUSI JANGKA PENDEK		PIC	D/L	SOLUSI JANGKA PANJANG		PIC	D/L
  let result = {
    masalah: "",
    sumberMasalah: "",
    solusi: "",
    pic: "",
    dl: "",
    solusiPanjang: "",
    picPanjang: "",
    dlPanjang: "",
  };

  if (arrayOfProblemId.length) {
    let allProblem = await Promise.all(
      arrayOfProblemId.map((val) =>
        func.findData({ store: "Problem", criteria: { id: val } })
      )
    );
    allProblem.flat().forEach((val) => {
      result.pic += `* ${val.pic}  \r\n\r\n`;
      result.dl += `* ${func.dateFormat(["dateMonth", val.dl])} \r\n\r\n`;
      result.masalah += `* ${val.masalah} ${func.dateFormat(["dateMonth", val.periode])} \r\n\r\n`;
      result.sumberMasalah += `* ${val.sumberMasalah} \r\n\r\n`;
      result.solusi += `* ${val.solusi} \r\n\r\n`;
      result.solusiPanjang += `* ${val.solusiPanjang} \r\n\r\n`;
      result.dlPanjang +=
        func.dateFormat(["dateMonth", val.dlPanjang]) + "\r\n\r\n";
      result.picPanjang += val.picPanjang + "\r\n\r\n";
    });
  }
  // console.log(result);
  return result;
}
