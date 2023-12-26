// import func from "../myfunction";
import { useIdb } from "@/utils/localforage";
import { dateMonth } from "@/composable/piece/dateFormat";
import { Problem } from "../pages/Problems/Problem";

export default async function (arrayOfProblemId: string[]) {
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

  if (typeof arrayOfProblemId === 'object' && arrayOfProblemId.length) {

    for(let problemId of arrayOfProblemId) {

      let getProblem = await dbProblem.getItem<Problem>(problemId)

      if(getProblem !== null) {
          result.pic += `* ${getProblem.pic}  \r\n\r\n`;
          result.dl += `* ${dateMonth(getProblem.dl)} \r\n\r\n`;
          result.masalah += `* ${getProblem.masalah} ${dateMonth(getProblem.periode)} \r\n\r\n`;
          result.sumberMasalah += `* ${getProblem.sumberMasalah} \r\n\r\n`;
          result.solusi += `* ${getProblem.solusi} \r\n\r\n`;
          result.solusiPanjang += `* ${getProblem.solusiPanjang} \r\n\r\n`;
          result.dlPanjang += dateMonth(getProblem.dlPanjang) + "\r\n\r\n";
          result.picPanjang += getProblem.picPanjang + "\r\n\r\n";
      }
    }
  }
  return result;
}
