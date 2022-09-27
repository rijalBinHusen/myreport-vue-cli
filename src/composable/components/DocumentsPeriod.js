import { findData, update, append, deleteDocument } from "../../myfunction"
import getDatesArray from "../piece/getDaysArray"
import { dateMonth, dayPlus1 } from '../piece/dateFormat'
import { getHeadspvId } from './Headspv'
import { getSupervisorId } from './Supervisors'
import { getWarehouseId } from './Warehouses'

let lists = []

// get all documents by periode
export const getDocuments = async (periode1, periode2) => {
    lists = []
    let datesArray = getDatesArray(periode1, periode2)
    let bunchOfPromise = datesArray
                            .map((date) => findData({ store: "Document", criteria: { periode: date } }) )
    let result = await Promise.all(bunchOfPromise)
    // result.filter((res) => res).fla
    lists = result.filter((val) => val).flat()
    return true
}

export const listsOfDocuments = () => {
    // await getDocuments()
    if(!lists.length) { return [] }
    return documentsMapper(lists)
}

// update document
export const updateDocument = async (idDocument, objToUpdate) => {
    await update({ 
        store: 'Document', 
        criteria: { id: idDocument }, 
        obj: objToUpdate 
    })
    
    lists = lists.map((val) => {
        return val?.id === idDocument
            ? { ...val, ...objToUpdate }
            : val
    })
}
// finished document
export const finishedDocument = async () => {
    if(lists.length) {
        let filtered = lists.filter((rec) => rec?.isfinished)
        return await documentsMapper(filtered)
    }
}
// unfinished document
export const unFinishedDocument = async () => {
    if(lists.length) {
        let filtered = lists.filter((rec) => !rec?.isfinished)
        return await documentsMapper(filtered)
    }
}

const documentsMapper = async (docs) => {
    let result = []
    if(docs) {
        for (let rec of docs) {
            let getName = [
                // find name supervisor
                getSupervisorId(rec.name),
                // find name head
                getHeadspvId(rec.head),
                // find name warehouse
                getWarehouseId(rec.warehouse)
            ]
            await Promise.all(getName).then((res) => {
                result.push({ 
                    ...rec, 
                    spvName: res[0]?.name, 
                    headName: res[1]?.name, 
                    warehouseName: res[2]?.name,
                    periode2: isNaN(rec.periode) ? rec.periode : dateMonth(rec.periode),
                    collected2: isNaN(rec.collected) ? rec.collected : dateMonth(rec.collected),
                    approval2: isNaN(rec.approval) ? rec.approval : dateMonth(rec.approval),
                    finished2: isNaN(rec.finished) ? rec.finished : dateMonth(rec.finished),
                })
            })
        }
    }
    return result
}
// append document
export const addData = async (name, periode, shift, head, warehouse) => {
    let newRecord = {
        collected: false,
        approval: false,
        status: 0,
        shared: false,
        finished: false,
        totalDo: false,
        totalKendaraan: false,
        totalWaktu: false,
        baseReportFile: false,
        isfinished: false,
        name,
        periode,
        shift,
        head,
        warehouse,
    }
    // add data
    await append({ store: "Document", obj: newRecord })
        .then((val) => {
            lists.unshift(val?.data)
        })
    return
}

export const isGenerateDocument = (idDocument, val) => {
    update({
        store: 'Document',
        criteria: {id: idDocument},
        obj: { isGenerate: val }
    })
}

export const removeDocument = async (idDocument) => {
    await deleteDocument({ store: 'document', criteria: { id: idDocument }})
    lists = lists.filter((list) => list.id != idDocument)
    return
}

export const findDocument = (idDocument) => {
    return lists.find((rec) => rec.id == idDocument)
}

export const getUncollectedDocuments = async () => {
    lists = await findData({ store: "Document", criteria: { status: 0 }})
    return true
}

export const getLastDate = () => {
    let res = lists.reduce(function(prev, current) {
        return (prev.periode > current.periode) ? prev.periode : current.periode
    })
    return dayPlus1(res)
}

export const documentsBySupervisor = async () => {
    /*expected result [
        {
        spvId: '',
        warehouseName: '', 
        spvName: '', 
        documents: [ id: '', title: 'warehousename 12-Sept' ],
        }
    ] */
    let result = []
    for(let list of lists) {
        // find index first, it may pushed before
        let findRes = result.findIndex((res) => res.spvId == list.name)
        // date in date month format
        let periode2 = dateMonth(list.periode)
        // get warehouse name
        let warehouseName = await getWarehouseId(list.warehouse).then((res) => res.name.replace('Gudang jadi ', ''))
        // get supervisor name
        let spvName = await getSupervisorId(list.name).then(res => res.name)
        // if the spv id exists in result
        if(findRes > -1) {
            result[findRes].documents.push({ id: list.id, title: periode2 + ' ' + warehouseName })
        } 
        // if not
        else {
            result.push({
                spvId: list.name,
                spvName,
                warehouseName,
                documents: [{ id: list.id, title: periode2 + ' ' + warehouseName }]
            })
        }
    }
    return result
}

export const documentMore2DaysBySpv = async (spvId) => {
  // expected result { warehouseName: [ listOfDocument ] }
  let result = {};
  for(let list of lists) {
    // if list?.name (spvId) === spvId
    let getWarehouse = await getWarehouseId(list?.warehouse).then((res) => res.name)
    if (
      list?.name === spvId 
      && new Date().getTime() - list.periode >= 172800000
      && list?.status == 0
    ) {
      result[getWarehouse]
        ? result[getWarehouse].push(
            "*" 
            + dateMonth(list?.periode)
            + "* Shift (" 
            + list?.shift 
            + ")"
          )
        : (result[getWarehouse] = [
            "*"
            + dateMonth(list.periode)
            + "* Shift ("
            + list?.shift 
            + ")",
          ]);
    }
  };
/* expected result 
    warehousename:
        periode1 shift 1
        periode2 shift 1
        periode3 shift 1
*/
    let listLaporanText = "";
    Object.keys(result).forEach((val) => {
        if(val) {
            listLaporanText += `${result[val].join(", ")} |  ${val }%0a`
        }
    })
  return listLaporanText;
}