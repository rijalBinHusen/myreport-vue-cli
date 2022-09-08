import { append, getData } from '@/myfunction'
import { ymdTime } from '@/composable/piece/dateFormat'

let lists = []

const getFieldProblem = async () => {
    if(!lists.length) {
        // get all data from indexeddb
        await getData({store: 'fieldproblem', limit: 50, desc: true, orderBy: 'id'})
        .then((val) => lists = val)
    }
    // delete data
}

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
            lists.unshift(val?.data)
        }
      })
    return
}

export const listsFieldProblem = async () => {
    await getFieldProblem()
    return lists
}

