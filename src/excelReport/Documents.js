import getDaysArray from "@/composable/piece/getDaysArray"
import func from "../myfunction"
import exportToXls from "@/exportToXls"

// cari array date
// cari document by array date
// cari nama karu berdasarkan id yang ada didokumen

// cari document berdasarkan tanggal
const getDocumentsByDate = (date) => {
    // kembalikan sebagai promise
    return func
    .findData({ 
        store: 'document', 
        criteria: { periode: date }
    })
}

// cari document berdasarkan array tanggal
const getAllDocuments = (arrayDates) => {
    // variable untuk menampung semua document
    let allDocuments = []
    // iterate array date
    arrayDates.forEach(val => {
        // push to variable all Documents
        allDocuments.push(getDocumentsByDate(val))
    })
    // resurn as array of promises
    return allDocuments
}

// get supervisor by id
const getSupervisor = (id) => {
    // return as array
    return func.findData({
        store: 'supervisors',
        criteria: { id: id}
    })
}

// get head info
const getHead = (id) => {
    // return as array
    return func.findData({
        store: 'headspv',
        criteria: { id: id}
    })
}

// get warehouse info
const getWarehouse = (id) => {
    // return as promise
    return func.findData({
        store: 'warehouses',
        criteria: { id: id}
    })
}

const report = async  (startDate, endDate) => {
    // initiate varibale date
    let dates;
    // if date same, just find one data
    if (startDate === endDate) {
        dates = [startDate]
    } else {
    // if data different, get array date between two date
        dates = getDaysArray(startDate, endDate)
    }

    // 
    const documents = await Promise.all(getAllDocuments(dates))
    .then(async docs => {
        let docsFlat = docs.flat()
        let result = []
        let karu = {};
        let head = {};
        let warehouse = {}
        for (let doc of docsFlat) {
            if(doc) {
                if(!karu.hasOwnProperty(doc?.name)) {
                    await getSupervisor(doc?.name)
                            .then(val => { karu[doc?.name] = val[0]?.name })
                }
                if(!head.hasOwnProperty(doc?.head)) {
                    await getHead(doc?.head)
                            .then(val => { head[doc?.head] = val[0]?.name })
                }
                if(!warehouse.hasOwnProperty(doc?.warehouse)) {
                    await getWarehouse(doc?.warehouse)
                            .then(val => { warehouse[doc?.warehouse] = val[0]?.name })
                }
                result.push ({
                    periode: func.dateFormat(['dateMonth', doc?.periode]),
                    karu: karu[doc?.name] || 'Not found',
                    bagian: warehouse[doc?.warehouse] || 'Not found',
                    kabag: head[doc?.head] || 'Not found',
                    shift: doc?.shift,
                    dikumpulkan: !isNaN(doc.collected+ "") ? func.dateFormat(['dateMonth', doc?.collected]) : doc?.collected,
                    selesai: !isNaN(doc.finished+ "") ? func.dateFormat(['dateMonth', doc?.finished]) : doc?.finished,
                    diparaf: !isNaN(doc.approval+ "") ? func.dateFormat(['dateMonth', doc?.approval]) : doc?.approval,
                    dibagikan: !isNaN(doc.shared+ "") ? func.dateFormat(['dateMonth', doc?.shared]) : doc?.shared,
                })
            }
        }
        return result
    })

    exportToXls(documents, `Pengumulan document ${func.dateFormat(['dateMonth', startDate])} Sampai dengan ${func.dateFormat(['dateMonth', endDate])}`)
}

export default report