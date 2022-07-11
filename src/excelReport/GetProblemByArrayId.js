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
        func.findData({ store: "Problem", criteria: val })
      )
    );
    allProblem.forEach((val) => {
      result.pic += val.pic + "\r\n";
      result.dl += func.dateFormat(["dateMonth", val.dl]) + "\r\n";
      result.masalah += val.masalah + "\r\n";
      result.sumberMasalah += val.sumberMasalah + "\r\n";
      result.solusi += val.solusi + "\r\n";
      result.solusiPanjang += val.solusiPanjang + "\r\n";
      result.dlPanjang +=
        func.dateFormat(["dateMonth", val.dlPanjang]) + "\r\n";
      result.picPanjang += val.picPanjang + "\r\n";
    });
  }
  return result;
}
