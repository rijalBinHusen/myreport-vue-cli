import { baseItem } from "@/pages/BaseItem/Baseitem";
import { type BaseReportFileInterface } from "@/pages/BaseReport/BaseReportFile"
import { type BaseStock } from "@/pages/BaseReport/BaseReportStock"
import { dateMonth, ddmmyyyy } from "@/composable/piece/dateFormat";
import GetProblemByArrayId from "./GetProblemByArrayId";
import exportToXls from "@/utils/exportToXls";
import { useIdb } from "../utils/localforage"

interface StockCard {
    periode: string,
    shift: number,
    item: string,
    awal: number,
    in: number,
    dateIn: string,
    out: number,
    dateOut: string,
    akhir: number,
    dateEnd: string,
    real: number,
    selisih: number,
    problem: string
}

export const getStockCard = async (date1: number, date2: number, warehouse: string, kode: string) => {

    const dbBaseFile = useIdb('basereportfile');
    const dbBaseStock = useIdb('basereportstock');
    const { getItemBykode } = baseItem()
    let result: StockCard[] = []

    let baseReports = await dbBaseFile.getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan<BaseReportFileInterface>('periode', date1, date2);

    if (baseReports.length === 0) return;
    
    for (let report of baseReports) {
        
        const getStocks = await dbBaseStock.getItemsByTwoKeyValue<BaseStock>('parent', report.id, 'item', kode);

        if (getStocks.length > 0) {
            for (let stock of getStocks) {
                const periode = dateMonth(report.periode);
                const item = await getItemBykode(stock.item);
                const problem = await GetProblemByArrayId(stock.problem);

                result.push({
                    periode,
                    shift: stock.shift,
                    item: item.name,
                    awal: stock.awal,
                    in: stock.in,
                    dateIn: stock.dateIn,
                    out: stock.out,
                    dateOut: stock.dateOut,
                    akhir: stock.awal + stock.in - stock.out,
                    dateEnd: stock.dateEnd,
                    real: stock.real,
                    selisih: stock.real - (stock.awal + stock.in - stock.out),
                    problem: problem.masalah.replaceAll("\r\n\r\n", "")
                })
            }
        }
    }

    exportToXls(result, `Kartu stock ${result[0].item.toLocaleLowerCase()} periode ${ddmmyyyy(date1, '-')} sampai dengan ${ddmmyyyy(date2, '-')} `)
}