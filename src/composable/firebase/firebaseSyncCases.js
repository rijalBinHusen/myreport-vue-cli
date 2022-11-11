import myfunction from "@/myfunction"
import { addDocument } from "./fireStore"

const syncCases = async (store, docId) => {
    // find the record
    let doc = await myfunction.findData({ store: store, criteria: { id: docId }})
    if(doc && doc[0]?.insert) {
        // only input the reecord that hastOwnProperty insert
        let name = await myfunction.findData({ store: 'supervisors', criteria: { id: doc[0]?.name }})
        await addDocument(store, doc[0]?.id, { 
          id: doc[0]?.id,
          periode: myfunction.dateFormat(['dateMonth', doc[0]?.periode]),
          name: name[0]?.name,
          masalah: doc[0]?.masalah,
        })

        await addDocument(store+'Details', doc[0]?.id, {
          id: doc[0]?.id,
          sumberMasalah: doc[0]?.sumberMasalah,
          solusi: doc[0]?.solusi,
          pic: doc[0]?.pic,
          dl: myfunction.dateFormat(['dateMonth', doc[0]?.dl])
        })
      }
}

export default syncCases