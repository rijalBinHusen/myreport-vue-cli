import { append, deleteDocument, findData } from "@/myfunction"

let lists = []

export const startImportClock = async (sheets, baseId) => {
    // dapatkan ref
    let infoRowColClock = sheets["!ref"].split(":")
    // dapatkan length data clock
    let lengthRowClock = +infoRowColClock[1].match(/\d+/)[0]

    for(let i = 1; i <= lengthRowClock; i++) {
        /* 
            #CLOCK jika B5.v > 0 dan D5.v !== D4.v
            maka masukkan ke idb 
        */
        //    CLOCK CHECKER
        // nomor do
        let clockNo = sheets["D"+i] ? sheets["D"+ (i)].v : 0
        // nomor do sebelumnya (atasnya)
        let clockNoBefore = sheets["D"+ (i-1)] ? sheets["D"+ (i-1)].v : false
        // shift
        let shift = sheets["B"+i]?.v > 0 ? true : false
        // status untuk diimport true or false
        let clockStatus = shift && clockNo > 0 && clockNoBefore !== clockNo ? true : false

        if(i > 5 && clockStatus) {
            await appendData(
                    baseId, 
                    sheets["B"+i], 
                    sheets["D"+i], 
                    sheets["F"+i], 
                    sheets["G"+i], 
                    sheets["H"+i],
                    0)
        }
    }
    return true
}

export const appendData = async (parent, shift, noDo, reg, start, finish, rehat) => {
    await append({ store: "BaseReportClock", obj: {
            parent: parent,
            shift: shift?.v <= 3 ? shift?.v  : 3,
            noDo: noDo ? noDo.v : 0,
            reg: reg ? reg.w : 0,
            start: start ? start.w : 0,
            finish: finish ? finish.w : 0,
            rehat: rehat,
        }
        })
        .then((val) => {
            if(lists) {
                lists.unshift(val?.data)
            }
        })
}

export const removeClockByParent = async (parent) => {
    deleteDocument({ store: 'basereportclock', criteria: { parent }})
    return true
}

export const getBaseClockByParentByShift = async (parent, shift) => {
    await findData({ store: "BaseReportClock", criteria: { parent, shift } })
            .then((res) => {
                if(lists.length) {
                    lists.concat(res)
                }
            })
    return
}