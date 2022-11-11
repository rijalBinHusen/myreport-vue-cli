import { dateMonth } from "./dateFormat"
import { addDocument } from "./fireStore"
import func from "../../myfunction"

const syncProblem = async (idProblem) => {
    // get the record first
  let doc = await 
              func.findData({ store: 'problem', criteria: {id: idProblem}})
                .then(async (doc) => {
                  if(!doc) { return }
                  // get item details
                  let item = await func.findData({store: 'baseitem', criteria: { kode: doc[0]?.item } })
                  // get spv details
                  let spv = doc[0]?.nameSpv ? await func.findData({store: 'supervisors', criteria: { id: doc[0]?.nameSpv } }) : [{ name: 'Vacant' }]
                  // get headspv details
                  let headspv = doc[0]?.nameHeadSpv ? await func.findData({store: 'headspv', criteria: { id: doc[0]?.nameHeadSpv } }) : [{ name: 'Vacant' }]
                  // warehouse
                  let warehouse = doc[0]?.warehouse ? await func.findData({store: 'warehouses', criteria: { id: doc[0]?.warehouse } }) : [{ name: 'Not found' }]
                  // return
                  return {
                    problem: {
                      id: doc[0]?.id,
                      item: item[0]?.name, 
                      warehouse: warehouse[0]?.name,
                      masalah: doc[0]?.masalah
                    },
                    detailsProblem: {
                      id: doc[0]?.id,
                      periode: dateMonth(doc[0]?.periode),
                      spv: spv[0]?.name,
                      head: headspv[0]?.name,
                      sumbermasalah: doc[0]?.sumberMasalah,
                      solusi: '',
                      dl: dateMonth(doc[0]?.dl),
                    }
                  } 
              })
  if(doc) {
    // write problem
    addDocument('problem', doc?.problem?.id, doc?.problem)
    // write details problem
    addDocument('problemDetails', doc?.problem?.id, doc?.detailsProblem)
  }
}

export default syncProblem