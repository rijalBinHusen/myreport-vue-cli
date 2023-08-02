import { dateMonth } from "@/composable/piece/dateFormat";
import { useIdb } from "@/utils/localforage";

export default async function (periode, spvId, headSpvId) {

  let result = [];
  const dbComplain = useIdb('complains');

  let complains;

  if(spvId) {

    complains = await dbComplain.getItemsByTwoKeyValue('periode', periode, 'name', spvId);

  } else if( headSpvId ) {

    complains = await dbComplain.getItemsByTwoKeyValue('periode', periode, 'head', headSpvId);

  }


  if(complains.length === 0) return;

  for(let complain of complains) {
    result.push({
      periode: dateMonth(complain?.periode),
      masalah: complain?.masalah,
      sumberMasalah: complain?.sumberMasalah,
      solusi: complain?.solusi,
      pic: complain?.pic,
      dl: dateMonth(complain?.dl),
      periode2: complain?.isCount ? +dateMonth(complain?.periode).match(/\d+/)[0] : '',
    })
  }

  return result
}
