import { append, deleteDocument, findData, update } from "@/myfunction"
import { totalTime } from "../piece/totalTimeAsMinute"

export let lists = []

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
                    sheets["B"+i]?.v <= 3 ? shift?.v  : 3, 
                    sheets["D"+i] ? sheets["D"+i].v : 0, 
                    sheets["F"+i] ? sheets["F"+i].w : 0, 
                    sheets["G"+i] ? sheets["G"+i].w : 0 , 
                    sheets["H"+i] ? sheets["H"+i].w : 0,
                    0)
        }
    }
    return true
}

export const appendData = async (parent, shift, noDo, reg, start, finish, rehat) => {1
    await append({ store: "BaseReportClock", obj: {
            parent: parent,
            shift: shift,
            noDo: noDo,
            reg: reg,
            start: start,
            finish: finish,
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
    let findRecFirst = lists.find((rec) => rec.parent == parent && rec.shift == shift)
    if(!findRecFirst) {
        await findData({ store: "BaseReportClock", criteria: { parent, shift } })
                .then((res) => lists = lists.concat(res) )
    }
    return
}

export const baseReportClockLists = (parent, shift) => {
    let result = []
    lists.forEach((rec) => {
        if(rec.parent == parent && rec.shift == shift) {
            result.push({
                ...rec, 
                totalTime: totalTime(rec?.start, rec?.finish) - (rec.rehat * 60)
            })
        }
    })
    return result
}

export const updateBaseClock = async (id, objtToUpdate) => {
    lists = lists.map((val) => {
        if(val.id == id) {
            return { ...val, ...objtToUpdate}
        }
        return val
    })
    await update({ store: 'BaseReportClock', criteria: { id: id }, obj: objtToUpdate })
    return true
}

export const clockDetails = (parent, shift) => {
        let totalDo = 0;
        let totalKendaraan = 0;
        let totalWaktu = 0;
        lists.forEach((val) => {
          if (
            val.shift == shift &&
            val.parent == parent &&
            val?.start && val?.finish &&
            val.start.length == 5 &&
            val.finish.length == 5
          ) {
            totalDo += 1;
            totalKendaraan += 1;
            // jaddikan menit, masukan total waktu - rehat
            totalWaktu += totalTime(val?.start, val?.finish) - (val.rehat * 60);
          }
        });
        return {
          totalDo: totalDo,
          totalKendaraan: totalKendaraan,
          totalWaktu: totalWaktu,
        };
}

export async function markClockFinished(parentBaseReportFile, shift, parentDocument) {
    // iterate the state
    for (let list of lists) {
      // if state?.shift == payload.shift && payload?.parent
      if (
        list?.shift == shift &&
        list?.parent == parentBaseReportFile
      ) {
        // jika parentDocument kosong
        if (!lists?.parentDocument) {
          // update recordnya
          await updateBaseClock(list.id, { parentDocument });
        }
        // jika sudah terisi
      }
    }
    return;
  }

export const removeClock = async (id) => {
  lists = lists.filter((rec) => rec.id !== id)
  deleteDocument({ store: 'basereportclock', criteria: { id }})
  return true
}