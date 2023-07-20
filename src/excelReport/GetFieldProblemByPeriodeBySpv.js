// import myfunction from "../myfunction";
import { dateMonth } from "@/composable/piece/dateFormat";
import { getSupervisorId } from "@/pages/Supervisors/Supervisors";
import { useIdb } from "@/utils/localforage";

export default async function (periode, supervisor, head) {
  const dbFieldProblem = useIdb('fieldproblem');

  let result = []
  let problems;

  if(supervisor) {
    problems = await dbFieldProblem.getItemsByTwoKeyValue('periode', periode, 'supervisor', supervisor);
  }

  else if (head) {
    problems = await dbFieldProblem.getItemsByTwoKeyValue('periode', periode, 'head', head);
  }

  if(typeof problems === 'undefined') return;

  for (let problem of problems) {
    const supervisor = getSupervisorId(problem.supervisor);

    result.push({
      periode: dateMonth(problem.periode),
      masalah: `[Kendala] ${problem.masalah} Karu ${supervisor.name}`,
      sumberMasalah: problem.sumberMasalah,
      solusi: problem.solusi,
      pic: problem.pic,
      dl: dateMonth(problem.dl)
    })
  }

  return result;
}
