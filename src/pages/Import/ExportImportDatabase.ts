interface ExportImport {
    storeName:  string, data: any[]
}


import { useIdb } from "@/utils/localforage"
import { startExport } from '@/composable/piece/exportAsFile'
import { BaseReportFileInterface } from '../BaseReport/BaseReportFile'
import { BaseClock } from '../BaseReport/BaseReportClock'
import { BaseStock } from '../BaseReport/BaseReportStock'
import { Document } from '../Documents/DocumentsPeriod'
import { waitFor } from "@/utils/piece/waiting"

export const startImport = async (data: ExportImport) => {
    const db = useIdb(data.storeName)
    for (let datum of data.data) {
        
        await db.setItem(datum?.id || "sdlf", datum)
    }
}


export async function getRawDataGrouped() {

    const summary = useIdb("summary");
    const getData = await summary.getItems();
    const groupedDataToBackup = <ExportImport[]>[];

    const summaryToBackup = {storeName: 'summary', data: getData};
    groupedDataToBackup.push(summaryToBackup);
    await startExport(summaryToBackup, "summary db.json", false);

    const stores = await summary.getKeys();

    for(let store of stores) {
        
        // table to skip
        if(['basereportstock', 'basereportclock'].includes(store)) continue;

        const db = useIdb(store);
        const data = await db.getItems<any>();
        // document, basereportfile need to grouped
        if(store == 'basereportfile') {
            const basereportclock = useIdb('basereportclock');
            const basereportstock = useIdb('basereportstock');

            const dataReportClock = await basereportclock.getItems<BaseClock>();
            const dataReportStock = await basereportstock.getItems<BaseStock>();

            const baseReportToExport = <{
                storeName: string
                groupedName: string,
                data: any[]
            }[]>[]

            for(let reportFile of data as BaseReportFileInterface[]) {
                const monthDocument = new Date(reportFile.periode).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                const monthDocumentTitle = `Backup 3R ${monthDocument}`;
                const indexPeriode = baseReportToExport.findIndex((rec) => rec.groupedName === monthDocumentTitle + ' base-report-file');
                const isPeriodePushed = indexPeriode > -1;

                if(isPeriodePushed) {
                    baseReportToExport[indexPeriode].data.push(reportFile);
                }
                else {
                    baseReportToExport.push({
                        storeName: 'basereportfile',
                        groupedName: monthDocumentTitle + ' base-report-file',
                        data: [reportFile]
                    })
                }

                const reportClockInThisPeriod = dataReportClock.filter((rec) => rec.parent === reportFile.id);
                const isReportClockExists = reportClockInThisPeriod.length > 0;

                if(isReportClockExists) {
                    const indexPeriodeBaseClock = baseReportToExport.findIndex((rec) => rec.storeName == 'basereportclock' && rec.groupedName === monthDocumentTitle + ' base-report-clock');
                    const isPeriodeBaseClockPushed = indexPeriode > -1;

                    if(isPeriodeBaseClockPushed) {
                        baseReportToExport[indexPeriodeBaseClock].data.concat(reportClockInThisPeriod);
                    }
                    else {
                        baseReportToExport.push({
                            storeName: 'basereportclock',
                            groupedName: monthDocumentTitle + ' base-report-clock',
                            data: [reportClockInThisPeriod]
                        })
                    }

                }
                
                const reportStockInThisPeriod = dataReportStock.filter((rec) => rec.parent === reportFile.id);
                const isReportStockExists = reportStockInThisPeriod.length > 0;

                if(isReportStockExists) {
                    const indexPeriodeBaseStock = baseReportToExport.findIndex((rec) => rec.storeName == 'basereportstock' && rec.groupedName === monthDocumentTitle + ' base-report-stock');
                    const isPeriodeBaseStockPushed = indexPeriode > -1;

                    if(isPeriodeBaseStockPushed) {
                        baseReportToExport[indexPeriodeBaseStock].data.concat(reportStockInThisPeriod);
                    }
                    else {
                        baseReportToExport.push({
                            storeName: 'basereportstock',
                            groupedName: monthDocumentTitle + ' base-report-stock',
                            data: [reportStockInThisPeriod]
                        })
                    }
                }
                
            }

            if(baseReportToExport.length === 0) continue;
            for(let report of baseReportToExport) {
                const dataToExport = <ExportImport>{
                    storeName: report.storeName,
                    data: report.data
                }
                
                await waitFor(1000)
               await startExport(dataToExport, report.groupedName + ".json", false);
            }
        }

        else if(store === "document") {
            
            const documetToExport = <{
                storeName: string
                groupedName: string,
                data: any[]
            }[]>[]

            for(let document of data as Document[]) {

                const monthDocument = new Date(document.periode).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                const monthDocumentTitle = `Backup 3R ${monthDocument} document`;
                const indexPeriode = documetToExport.findIndex((rec) => rec.groupedName === monthDocumentTitle);
                const isPeriodePushed = indexPeriode > -1;
    
                if(isPeriodePushed) {
                    documetToExport[indexPeriode].data.push(document);
                }
                else {
                    documetToExport.push({
                        storeName: 'document',
                        groupedName: monthDocumentTitle,
                        data: [document]
                    })
                }
            }            

            if(documetToExport.length === 0) continue;
            for(let report of documetToExport) {
                const dataToExport = <ExportImport>{
                    storeName: report.storeName,
                    data: report.data
                }
                await waitFor(1000)
               await startExport(dataToExport, report.groupedName + ".json", false);
            }
        }

        else {

            const dataToExport = <ExportImport>{storeName:  store, data: data};
            if(store != 'date-expired') {
                groupedDataToBackup.push(dataToExport);
                await waitFor(1000)
                await startExport(dataToExport, `backup ${store} ${new Date().toISOString()}.json`, false);
            }

        }
    }
    
    await startExport(groupedDataToBackup, `backup non periode data ${new Date().toISOString()}.json`, false);
    
}