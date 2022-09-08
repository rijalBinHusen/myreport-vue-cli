import { append } from '@/myfunction'
import { reactive } from 'vue';
import { ymdTime } from '@/composable/piece/dateFormat'

const lists = reactive([])

export const addData = async (periode, supervisor, head, masalah, sumberMasalah, solusi, pic, dl) => {
    // add data
    // periode, supervisor, head, masalah, sumberMasalah, Solusi, PIC, dl
    let record = { 
        periode: ymdTime(periode),
        supervisor: supervisor,
        head: head,
        masalah: masalah, 
        sumberMasalah: sumberMasalah,
        solusi: solusi,
        pic: pic,
        dl: ymdTime(dl)
     };

    await append({ store: "fieldProblem", obj: record })
    .then((val) => {
        if(lists.value) {
            lists.value.unshift(val?.data)
        }
      })
    return
}
