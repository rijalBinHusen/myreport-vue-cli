// import func from "../myfunction";
import { useIdb } from "@/utils/localforage";
import { dateMonth } from "@/composable/piece/dateFormat";

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

  const dbProblem = useIdb('problem');

  if (arrayOfProblemId && arrayOfProblemId.length) {
    let allProblem = await Promise.all(
      arrayOfProblemId.map((idProblem) => dbProblem.getItem(idProblem))
    );

    allProblem.flat().forEach((problem) => {
      result.pic += `* ${problem.pic}  \r\n\r\n`;
      result.dl += `* ${dateMonth(problem.dl)} \r\n\r\n`;
      result.masalah += `* ${problem.masalah} ${dateMonth(problem.periode)} \r\n\r\n`;
      result.sumberMasalah += `* ${problem.sumberMasalah} \r\n\r\n`;
      result.solusi += `* ${problem.solusi} \r\n\r\n`;
      result.solusiPanjang += `* ${problem.solusiPanjang} \r\n\r\n`;
      result.dlPanjang +=
        dateMonth(problem.dlPanjang) + "\r\n\r\n";
      result.picPanjang += problem.picPanjang + "\r\n\r\n";
    });
  }
  // console.log(result);
  return result;
}
