import { append } from "@/myfunction"


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
                sheets["A"+i],
                sheets["D"+i],
                in1st,
                out1st,
                sheets["G"+i]
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
                sheets["A"+i],
                sheets["G"+i],
                in2nd,
                out2nd,
                sheets["J"+i]
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
                sheets["A"+i],
                sheets["J"+i],
                totalIn,
                totalOut,
                sheets["P"+i]
            )
        }
    }
}

export const appendData = async (parent, shift, item, awal, masuk, keluar, riil) => {
    await append({
        store: "BaseReportStock",
        obj: {
            parent: parent,
            shift: shift,
            item: item ? item.v : "No item",
            awal: awal ?  awal.v : 0,
            in:  masuk,
            out: keluar,
            dateIn: "",
            dateOut: "",
            dateEnd: "",
            real: riil ? riil.v : 0,
            problem: this.PROBLEMACTIVE(this.infoBaseReport.periode, this.infoBaseReport.warehouse, sheets["A"+i] ? sheets["A"+i].v : "No item")
        },
    })
    return true
}