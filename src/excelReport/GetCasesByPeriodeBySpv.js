// import myfunction from "../myfunction";

import { dateMonth } from "@/composable/piece/dateFormat";
import { useIdb } from "@/utils/localforage";

export default async function (periode, spvId, headSpvId) {

  let result = [];
  const dbCase = useIdb('cases');

  let cases = [];

  if(spvId) {
    
    cases = await dbCase.getItemsByTwoKeyValue('periode', periode, 'name', spvId);

  } else if(headSpvId) {

    cases = await dbCase.getItemsByTwoKeyValue('periode', periode, 'head', headSpvId);

  }

  if(cases.length === 0) return;

  for(let caseSpv of cases) {
    result.push({
      masalah: "[Kasus] " + caseSpv?.masalah,
      sumberMasalah: caseSpv?.sumberMasalah,
      solusi: caseSpv?.solusi,
      pic: caseSpv?.pic,
      periode: dateMonth(caseSpv?.periode),
      dl: dateMonth(caseSpv?.dl),
    })
  }

  return result;
}
