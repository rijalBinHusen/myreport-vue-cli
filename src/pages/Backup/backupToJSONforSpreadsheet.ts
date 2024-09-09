import { startExport } from "@/composable/piece/exportAsFile";
import { useIdb } from "@/utils/localforage";
import { Document, Documents } from "@/pages/Documents/DocumentsPeriod";
import { JSToExcelDate } from "@/composable/piece/dateFormat";

interface JSONFormat {
    store: string,
    data: object
    exportedTime: number
}

const storeToBackup = ['document'];

export async function getAllData() {
    // const dbSummary = useIdb('summary');
    // const summaryKeys = await dbSummary.getKeys();
    // const summaryData = dbSummary.getItems();
    // await startExport(summaryData, `backup summary ${new Date().toISOString()}.json`, false)

    // for (let store of summaryKeys) {
    //     if(store === 'baseitem') "";
    //     const db = useIdb(store);
    //     const getItems = await db.getItems<{ [key: string]: string | number | boolean }>();
    //     await startExport(getItems, `backup ${store} ${new Date().toISOString()}.json`, false)
    // }
    for(let store of storeToBackup) {
        const db = useIdb(store);
        const data = await db.getItems<Document>();
        await startExport(data, `backup ${store} ${new Date().toISOString()}.json`, false);

        let dataMapped = [];
        for(let datum of data) {
            if(store === "document") {
                const mapper = Documents();
                const mappedData = await mapper.documentsMapper(datum);
                // id, parent, parent_document, base_report_file, periode, warehouseName, spvName, headName, shift, 
                // collected, finished, approval, shared, total_do, total_kendaraan, total_waktu, 
                // plan_out, total_item_keluar, total_item_moving, total_product_not_FIFO, total_qty_in, total_qty_out
                // is_generated_document,
                const pickData = [
                    mappedData.id,
                    mappedData.parent,
                    mappedData.parentDocument,
                    mappedData.baseReportFile,
                    JSToExcelDate(mappedData.periode),
                    mappedData.warehouseName,
                    mappedData.spvName,
                    mappedData.headName,
                    mappedData.shift,
                    JSToExcelDate(mappedData.collected),
                    JSToExcelDate(mappedData.finished),
                    JSToExcelDate(mappedData.approval),
                    JSToExcelDate(mappedData.shared),
                    mappedData.totalDo,
                    mappedData.totalKendaraan,
                    mappedData.totalWaktu,
                    mappedData.planOut,
                    mappedData.totalItemKeluar,
                    mappedData.totalItemMoving,
                    mappedData.totalProductNotFIFO,
                    mappedData.totalQTYIn,
                    mappedData.totalQTYOut,
                    mappedData.generateReport
                ]
                dataMapped.push(pickData);
                if(dataMapped.length == 500){
                    await startExport(dataMapped, `Document exported at ${new Date().toISOString()}.json`, false);
                    dataMapped.length = 0;
                }
            }
        }
    }
}