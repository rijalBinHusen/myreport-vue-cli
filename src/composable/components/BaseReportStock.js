import { append, deleteDocument, findData, update } from "@/myfunction"
import { problemActive } from '@/composable/components/Problem'
import { findBaseReportFile } from "./BaseReportFile"
import store from '@/store'

let lists = []


export const startImportStock = async (sheets, baseId) => {
    // dapatkan !ref
    let infoRowColStock = sheets["!ref"].split(":")
    // dapatkan length data stock
    let lengthRowStock = +infoRowColStock[1].match(/\d+/)[0]

    for(let i = 1; i <= lengthRowStock; i++) {
        /* 
            #STOCK 
            shift 1 jika E5.v > 0 atau F5.v > 0 , A+i !== false
            masukkan ke idb
        */
        //    Checker stock shift 1
        let in1st = sheets["E"+i] ? sheets["E"+i].v : 0
        let out1st = sheets["F"+i] ? sheets["F"+i].v : 0
        if(in1st > 0 || out1st > 0) {
            await appendData(
                baseId,
                1,
                sheets["A"+i] ? ["A"+i].v : "No item",
                sheets["D"+i] ? ["D"+i].v : 0,
                in1st,
                out1st,
                sheets["G"+i] ? ["G"+i].v : 0
                )
        }
        /*
            shift 2 jika H5.v > 0 atau I5.v > 0 , A+i !== false
            masukkan ke idb
        */
        //    Checker stock shift 2
        let in2nd = sheets["H"+i] ? sheets["H"+i].v : 0
        let out2nd = sheets["I"+i] ? sheets["I"+i].v : 0
        if(in2nd > 0 || out2nd > 0) {
            await appendData(
                baseId,
                2,
                sheets["A"+i] ? ["A"+i].v : "No item",
                sheets["G"+i] ? ["G"+i].v : 0,
                in2nd,
                out2nd,
                sheets["J"+i] ? ["J"+i].v : 0
                )
        }

        /*
            shift 3 jika K5.v > 0 atau L5.v > 0  atau M5.v > 0  atau O5.v > 0 
            A+i !== false
            masukkan ke idb 
        */
        // number checker
        let in1 = sheets["K"+i] ? +sheets["K"+i].v : 0
        let in2 = sheets["O"+i] ? +sheets["O"+i].v : 0
        let totalIn = in1 == in2 ? in1 : in1 + in2
        let out1 = sheets["L"+i] ? +sheets["L"+i].v : 0
        let out2 = sheets["M"+i] ? +sheets["M"+i].v : 0
        let totalOut = out1 + out2

        if( (in1 || out1  || out2  || in2) && i > 3 && sheets["A"+i] ) {
            await appendData(
                baseId,
                3,
                sheets["A"+i] ? ["A"+i].v : "No item",
                sheets["J"+i] ? ["J"+i].v : 0,
                totalIn,
                totalOut,
                sheets["P"+i] ? ["P"+i].v : 0
            )
        }
    }
}

export const appendData = async (parent, shift, item, awal, masuk, keluar, riil) => {
    let parentDetails = findBaseReportFile(parent)
    let getProblem = problemActive(parentDetails?.warehouse, item ? item.v : "No item")
    await append({
        store: "BaseReportStock",
        obj: {
            parent: parent,
            shift: shift,
            item: item,
            awal: awal,
            in:  masuk,
            out: keluar,
            dateIn: "",
            dateOut: "",
            dateEnd: "",
            real: riil,
            problem: getProblem
        },
    })
    .then((val) => {
        if(lists) {
            lists.unshift(val?.data)
        }
    })
    return true
}

export const removeStockByParent = async (parent) => {
    deleteDocument({ store: 'basereportstock', criteria: { parent }})
    return true
}

export const getBaseStockByParentByShift = async (parent, shift) => {
    let findRecFirst = lists.find((rec) => rec.parent == parent && rec.shift == shift)
    if(!findRecFirst) {
        await findData({ store: "BaseReportStock", criteria: { parent, shift } })
                .then((res) => lists = lists.concat(res) )
    }
}

export const baseReportStockLists = (parent, shift) => {
    let result = []
    lists.forEach((rec) => {
        if(rec.parent == parent && rec.shift == shift) {
            result.push({
                ...rec,
                itemName: store.getters["Baseitem/baseItemKode"](rec.item).name,
                problem2: store.getters["Problem/masalah"](rec.problem),
                selisih: Number(rec.real) - (Number(rec.awal) + Number(rec.in) - Number(rec.out)),
                planOut: rec?.planOut || 0
            })
        }
    })
    return result
  }

export const stockDetails = (parent, shift) => {
    /*
     expected result = {
        totalIn: Number, 
        totalItemMoving: Number, 
        totalQtyOut: Number, 
        totalProductNotFifo: Number 
    }
    */
    let result = {
      totalItemMoving: 0,
      totalQTYIn: 0,
      totalQTYOut: 0,
      totalProductNotFIFO: 0,
      planOut: 0,
      totalItemKeluar: 0,
    };
    lists.forEach((val) => {
      if (val.shift == shift && val.parent == parent) {
        if (Number(val.out)) {
          result["totalItemKeluar"]++;
        }
        result["totalItemMoving"]++;
        result["totalQTYIn"] = result["totalQTYIn"] + Number(val.in);
        result["totalQTYOut"] = result["totalQTYOut"] + Number(val.out);
        result["planOut"] = result["planOut"] += val?.planOut ? Number(val?.planOut) : 0;
      }
    });

    return result
}

export const updateBaseStock = async (id, objtToUpdate) => {
    lists = lists.map((val) => {
        if(val.id == id) {
            return { ...val, ...objtToUpdate}
        }
        return val
    })
    await update({ store: 'BaseReportStock', criteria: { id: id }, obj: objtToUpdate })
    return true
}

export async function markStockFinished(parentBaseReportFile, shift, parentDocument) {
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
          await updateBaseStock(list.id, { parentDocument });
        }
        // jika sudah terisi
      }
    }
    return;
  }

  export const removeStock = async (id) => {
    lists = lists.filter((rec) => rec.id !== id)
    deleteDocument({ store: 'basereportstock', criteria: { id }})
    return true
  }