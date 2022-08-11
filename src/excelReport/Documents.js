import getDaysArray from "@/composable/piece/getDaysArray"
import func from "../myfunction"

// cari array date
// cari document by array date
// cari nama karu berdasarkan id yang ada didokumen

const getDocumentsByDate = (date) => {
    return func
    .findData({ 
        store: 'document', 
        criteria: { periode: date }
    })
}

const getAllDocuments = (arrayDates) => {
    let allDocuments = []
    arrayDates.forEach(val => {
        allDocuments.push(getDocumentsByDate(val))
    })
    return allDocuments
}

const getSupervisor = async (id) => {
    return func.findData({
        store: 'supervisors',
        criteria: { id: id}
    })
}

const report = async  (startDate, endDate) => {
    let dates;
    if (startDate === endDate) {
        dates = [startDate]
    } else {
        dates = getDaysArray(startDate, endDate)
    }

    
    const documents = await Promise.all(getAllDocuments(dates))
    .then(async docs => {
        let docsFlat = docs.flat()
        let result = []
        let karu = {};
        for (let doc of docsFlat) {
            if(doc) {
                if(!karu.hasOwnProperty(doc?.name)) {
                    await getSupervisor(doc?.name)
                    .then(val => { karu[doc?.name] = val[0]?.name })
                }
                result.push ({
                    tanggal: doc?.periode,
                    karu: karu[doc?.name] || 'Tidak aada karunya',
                    collected: doc?.collected
                })
            }
        }
        return result
    })

    console.error(await documents)
    // for (let doc of tempDocuments) {
    //     if(!karu.hasOwnProperty(doc?.name)) {
    //         await getSupervisor(doc?.name).then(val => {
    //             karu[doc?.name] = val?.name
    //         })
    //     }
    // }
}

export default report