import { startExport } from "@/composable/piece/exportAsFile";
import { useIdb } from "@/utils/localforage";
import { Document, Documents, DocumentsMapped } from "@/pages/Documents/DocumentsPeriod";
import { JSToExcelDate } from "@/composable/piece/dateFormat";
import { Activity } from "@/utils/localforage"
import { getWeekNumber } from "@/utils/generatorId";
import { waitFor } from "@/utils/piece/waiting";

const storeToBackup = ['document'];

export async function getAllData() {
    let documentsGroup = <{
        [documentPeriod: string]:  any[]
    }>{}

    for(let store of storeToBackup) {
        const db = useIdb(store);
        const data = await db.getItems<any>();
        const dataToExport = {storeName:  store, data: data};
        await startExport(dataToExport, `backup ${store} ${new Date().toISOString()}.json`, false);

        for(let datum of data) {
            if(store === "document") {
                const mapper = Documents();
                const mappedData = await mapper.documentsMapper(datum);

                const monthDocument = new Date(mappedData.periode).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                const weekDocument = getWeekNumber(new Date(mappedData.periode)) + " - " + new Date(mappedData.periode).getFullYear();

                const converter = new convertDataToArray();
                const pickData = converter.convertDocumentStoreToArray(mappedData);

                const monthDocumentTitle = `Summary dokumen ${monthDocument}`;
                const weekDocumentTitle = `Summary dokumen Week ${weekDocument}`;
                
                const isMonthDocumentPushed = documentsGroup[monthDocumentTitle] ? true : false;
                const isWeekDocumentPushed = documentsGroup[weekDocumentTitle] ? true : false;
                
                if(isMonthDocumentPushed) documentsGroup[monthDocumentTitle].push(pickData);
                else documentsGroup[monthDocumentTitle] = [pickData];
                
                if(isWeekDocumentPushed) documentsGroup[weekDocumentTitle].push(pickData);
                else documentsGroup[weekDocumentTitle] = [pickData];
            }
        }

        if(!Object.keys(documentsGroup).length) return;

        for(let  key in documentsGroup) {
            await waitFor(1000);
            await startExport(documentsGroup[key], key + ".json", false);
         }

    }
}

export async function getDataByActivity() {
    const dbActivity = useIdb('activity');
    const activities = await dbActivity.getItems<Activity>();

    if(!activities.length) return;
    let recordExported = <{ [key: string]: string[] }>{};

    // store data to export
    let documentsGroup = <{
        [documentPeriod: string]:  any[]
    }>{}

    for(let activity of activities) {
        const isNotForExecute = !storeToBackup.includes(activity.store) || (recordExported[activity.store] && recordExported[activity.store].includes(activity.idRecord))
        if(isNotForExecute) {
            // await dbActivity.removeItem(activity.id);
            continue; 
        }

        const db = useIdb(activity.store);
        const data = await db.getItem<any>(activity.idRecord);

        if(activity.store == 'document') {
            const doc = Documents();
            const documentMapped = await doc.documentsMapper(data);

            const documentPeriod = new Date(documentMapped.periode);
            const startMonthDocument = new Date(documentMapped.periode).setDate(1);
            const endMonthDocument = new Date(documentMapped.periode + (1000 * 60 * 60 * 24 * 31)).setDate(0);
            const startWeekDocument = new Date(documentMapped.periode).setDate(documentPeriod.getDate() - documentPeriod.getDay());
            const endWeekDocument = new Date(startWeekDocument).setDate(new Date(startWeekDocument).getDate() + 6);
            
            const monthDocument = new Date(documentMapped.periode).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
            const weekDocument = getWeekNumber(new Date(documentMapped.periode)) + " - " + new Date(documentMapped.periode).getFullYear(); 
            const monthDocumentTitle = `Summary dokumen ${monthDocument}`;
            const weekDocumentTitle = `Summary dokumen Week ${weekDocument}`;
            
            // get all document in month
            const getAllDocumentInMonth = await db.getItemsGreatEqualLowEqual<any>('periode', startMonthDocument, 'periode',  endMonthDocument);
            // console.log('periode start: ', startMonthDocument,  'periode end: ', endMonthDocument, new Date(startMonthDocument), " - ", new Date(endMonthDocument));
            // console.log('document in month: ', getAllDocumentInMonth);
            if(getAllDocumentInMonth) {
                // map all document
                for(let docInMonth of getAllDocumentInMonth) {
                    const documentMapped2 = await doc.documentsMapper(docInMonth);
                    const isMonthDocumentPushed = documentsGroup[monthDocumentTitle] ? true : false;
                    const isWeekDocumentPushed = documentsGroup[weekDocumentTitle] ? true : false;
                    // is periode document between  start and end week document
                    const isNeedToPushToWeekDocs = documentMapped2.periode >= startWeekDocument && documentMapped2.periode <= endWeekDocument;
                    if(isNeedToPushToWeekDocs) {
                        // push to group week document
                        if(isWeekDocumentPushed) documentsGroup[weekDocumentTitle].push(documentMapped2);
                        else documentsGroup[weekDocumentTitle] = [documentMapped2];
                    }

                    // push to group month document
                    if(isMonthDocumentPushed) documentsGroup[monthDocumentTitle].push(documentMapped2);
                    else documentsGroup[monthDocumentTitle] = [documentMapped2];
                    
                    // push to record exported
                    recordExported.hasOwnProperty(activity.store)
                    ? recordExported[activity.store].push(documentMapped2.id)
                    : recordExported[activity.store] = [documentMapped2.id];
                }

            }
        }
    }


    if(!Object.keys(documentsGroup).length) return;

    for(let  key in documentsGroup) {
        await startExport(documentsGroup[key], key + ".json", false);
     }
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
            document.generateReport && document.collected,
            JSToExcelDate(new Date())
        ]
    }
}