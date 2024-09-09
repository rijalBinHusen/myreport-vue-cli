import { startExport } from "@/composable/piece/exportAsFile";
import { useIdb } from "@/utils/localforage";
import { Document, Documents, DocumentsMapped } from "@/pages/Documents/DocumentsPeriod";
import { JSToExcelDate } from "@/composable/piece/dateFormat";
import { Activity } from "@/utils/localforage"

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
        const data = await db.getItems<any>();
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
                const converter = new convertDataToArray();
                const pickData = converter.convertDocumentStoreToArray(mappedData);
                dataMapped.push(pickData);

                if(dataMapped.length == 500){
                    await startExport(dataMapped, `Document exported at ${new Date().toISOString()}.json`, false);
                    dataMapped.length = 0;
                }
            }
        }

        if(dataMapped.length) await startExport(dataMapped, `${store} exported at ${new Date().toISOString()}.json`, false);
    }
}

export async function getActivity() {
    const dbActivity = useIdb('activity');
    const activities = await dbActivity.getItems<Activity>();

    if(!activities.length) return;
    let recordExported = <{ [key: string]: string[] }>{};

    // store data to export
    const documentsToExport = [];

    for(let activity of activities) {
        const isNotForExecute = recordExported[activity.store] && recordExported[activity.store].includes(activity.idRecord)
        if(isNotForExecute) continue;

        const db = useIdb(activity.store);
        const data = await db.getItem<any>(activity.idRecord);

        if(activity.store == 'document') {
            const doc = Documents();
            const documentMapped = await doc.documentsMapper(data);

            const converter = new convertDataToArray();
            const convertedData = converter.convertDocumentStoreToArray(documentMapped);
            documentsToExport.push(convertedData)
            if(documentsToExport.length == 500) {
                await startExport(documentsToExport, `Document exported at ${new Date().toISOString()}.json`, false);
                documentsToExport.length = 0;
            }
        }
    }

    if(documentsToExport.length) await startExport(documentsToExport, `Document exported at ${new Date().toISOString()}.json`, false);
}

class convertDataToArray {
    convertDocumentStoreToArray(document: DocumentsMapped) {
        return [
            document.id,
            document.baseReportFile,
            JSToExcelDate(document.periode),
            document.warehouseName,
            document.spvName,
            document.headName,
            document.shift,
            JSToExcelDate(document.collected),
            JSToExcelDate(document.finished),
            JSToExcelDate(document.approval),
            JSToExcelDate(document.shared),
            document.totalDo,
            document.totalKendaraan,
            document.totalWaktu,
            document.planOut,
            document.totalItemKeluar,
            document.totalItemMoving,
            document.totalProductNotFIFO,
            document.totalQTYIn,
            document.totalQTYOut,
            document.generateReport && document.collected
        ]
    }
}