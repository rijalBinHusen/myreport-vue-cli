// import myfunction from "../myfunction";

import { useIdb } from "@/utils/localforage" 
import { type Problem } from "@/pages/Problems/Problem"
import { baseItem } from "@/pages/BaseItem/Baseitem";
import { getSupervisorId } from "@/pages/Supervisors/Supervisors"
import { dateMonth } from "@/composable/piece/dateFormat";

interface Report {
  periode: string
  masalah: string
  sumberMasalah: string
  solusi: string
  pic: string
  dl: string
}

export default async function (periode: number, spvId?: string, headSpvId?: string): Promise<Report[]> {

  const result:Report[] = [];

  const dbProblem = useIdb('problem');
  const { getItemBykode } = baseItem();

  let getProblems = <Problem[]>[];
  
  if(spvId) {

    getProblems = await dbProblem.getItemsByTwoKeyValue<Problem>('periode', periode, 'nameSpv', spvId);

  } else if(headSpvId) {

    getProblems = await dbProblem.getItemsByTwoKeyValue<Problem>('periode', periode, 'nameHeadSpv', headSpvId);

  }

  if(getProblems.length > 0) {
    
    for(let problem of getProblems) {
      
      const itemName = await getItemBykode(problem.item);
      const supervisor = await getSupervisorId(problem.nameSpv);
      
      const masalah = `${itemName.name} selisih ${problem.masalah}, Karu ${supervisor.name}`

      result.push({
        periode: dateMonth(problem.periode),
        masalah,
        sumberMasalah: problem.sumberMasalah,
        solusi: problem.solusi,
        pic: problem.pic,
        dl: dateMonth(problem.dl)
      })
    }
  }

  return result;
}
