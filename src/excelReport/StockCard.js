import { findData } from "@/myfunction";
import getDaysArray from "@/composable/piece/getDaysArray";
import { BaseItem } from "@/pages/BaseItem/Baseitem";
import { dateMonth, ddmmyyyy } from "@/composable/piece/dateFormat";
import GetProblemByArrayId from "./GetProblemByArrayId";
import exportToXls from "@/utils/exportToXls";

export const getStockCard = async (date1, date2, warehouse, kode) => {
    let dates;
    // pertama, cari tahu apakah 2 tanggal yang dikirim berbeda atau tidak
    if( date1 == date2) {
        // jika sama
        dates = [date1]
    } else {
        // jika berbeda
        dates = getDaysArray(date1, date2)
    }
    // cari semua base report file berdasarkan tanggal dan gudang
    let basesReport = await Promise.all(
         dates.map((date) => findData({ store: 'basereportfile', criteria: { periode: date, warehouse }}) )
    )
    // cari item berdasarkan basereport id dan items
    let stockCard = await 
                    Promise.all(basesReport.flat()
                    .map((baseReportFile) => {
                        if(baseReportFile) {
                            return findData({ store: 'basereportstock', criteria: { parent: baseReportFile.id, item: kode}})
                                        .then((resArr) => {
                                            if(resArr) {
                                                return resArr.map((res) => ({ ...res, periode: baseReportFile.periode }))
                                            }
                                        })
                        }
                    })
                )
    let resultPromise = await Promise.all(stockCard)

    let result = []

    const { getItemBykode } = new BaseItem();
    
    let item = await getItemBykode(kode)

    for (let res of resultPromise.flat()) {
        if(res) {
            let problem = await GetProblemByArrayId(res?.problem)
            // periode, shift, nama item, awal, in, dateIn, out, dateOut, real, dateEnd, selisih, problem
            const { shift, awal, dateIn, out, dateOut, real, dateEnd } = res
            result.push({ 
                periode: dateMonth(res.periode),
                shift,
                item: item?.name,
                awal,
                in: res?.in,
                dateIn,
                out,
                dateOut,
                akhir: awal + res?.in - out,
                dateEnd,
                real,
                selisih: real - (awal + res?.in - out),
                problem: problem?.masalah
            })
        }
    }

    exportToXls(result, `Kartu stock ${item?.name.toLowerCase()} periode ${ddmmyyyy(date1, '-')} sampai dengan ${ddmmyyyy(date2, '-')} `)
    // console.log(result.)
    return
}