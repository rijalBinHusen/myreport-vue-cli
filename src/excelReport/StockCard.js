import { findData } from "@/myfunction";
import getDaysArray from "@/composable/piece/getDaysArray";

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
    console.log(dates)
    // cari semua base report file berdasarkan tanggal dan gudang
    let basesReport = await Promise.all(
         dates.map((date) => findData({ store: 'basereportfile', criteria: { periode: date, warehouse }}) )
    )
    console.log(basesReport)
    // cari item berdasarkan basereport id dan items
    let stockCard = await 
                    Promise.all(basesReport.flat()
                    .map((baseReportFile) => {
                        if(baseReportFile) {
                            return findData({ store: 'basereportstock', criteria: { parent: baseReportFile.id, item: kode}})
                        }
                    })
                )
    let result = await Promise.all(stockCard)
    console.log(result.flat())
}