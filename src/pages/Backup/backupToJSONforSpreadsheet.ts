import { startExport } from "@/composable/piece/exportAsFile";
import { useIdb } from "@/utils/localforage";
import { Document, Documents, DocumentsMapped } from "@/pages/Documents/DocumentsPeriod";
import { JSToExcelDate } from "@/composable/piece/dateFormat";
import { Activity } from "@/utils/localforage"
import { getWeekNumber } from "@/utils/generatorId";
import { waitFor } from "@/utils/piece/waiting";

const storeToBackup = ['document'];
// const storeToBackup = ['date-expired'];

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

                const monthDocumentTitle = `Summary 3R ${monthDocument}`;
                const weekDocumentTitle = `Summary 3R Week ${weekDocument}`;
                
                const isMonthDocumentPushed = documentsGroup[monthDocumentTitle] ? true : false;
                const isWeekDocumentPushed = documentsGroup[weekDocumentTitle] ? true : false;
                
                if(isMonthDocumentPushed) documentsGroup[monthDocumentTitle].push(pickData);
                else documentsGroup[monthDocumentTitle] = [pickData];
                
                if(isWeekDocumentPushed) documentsGroup[weekDocumentTitle].push(pickData);
                else documentsGroup[weekDocumentTitle] = [pickData];
            }
        }

        if(!Object.keys(documentsGroup).length) return;
        
    }

    for(let  key in documentsGroup) {
        await waitFor(1000);
        await startExport(documentsGroup[key], key + ".json", false);
    }
}

export async function getDataByActivity() {
    
    const dbActivity = useIdb('activity');
    const activities = await dbActivity.getItems<Activity>();
    if(!activities.length) return;
    let recordExported = <{ [key: string]: string[] }>{};

    // store data to export
    const documentsGroup = <{
        [documentPeriod: string]:  any[]
    }>{}

    // const documentsGroupLastUpdate = <{
    //     [documentPeriod: string]:  number
    // }>{}

    for(let activity of activities) {
        const isNotForExecute = !storeToBackup.includes(activity.store) || (recordExported[activity.store] && recordExported[activity.store].includes(activity.idRecord))
        if(isNotForExecute) {
            await dbActivity.removeItem(activity.id);
            continue; 
        }

        const db = useIdb(activity.store);
        const data = await db.getItem<any>(activity.idRecord);

        if(activity.store == 'document') {
            const doc = Documents();
            const documentMapped = await doc.documentsMapper(data);

            const startMonthDocument = new Date(documentMapped.periode).setDate(1);
            const endMonthDocument = new Date(documentMapped.periode + (1000 * 60 * 60 * 24 * 31)).setDate(0);
            
            // get all document in month
            const getAllDocumentInMonth = await db.getItemsGreatEqualLowEqual<any>('periode', startMonthDocument, 'periode',  endMonthDocument);
            
            if(!getAllDocumentInMonth) continue;
            
            // map all document
            for(let docInMonth of getAllDocumentInMonth) {
                const documentMapped2 = await doc.documentsMapper(docInMonth);
            
                const monthDocument = new Date(documentMapped2.periode).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                const weekDocument = getWeekNumber(new Date(documentMapped2.periode)) + " - " + new Date(documentMapped2.periode).getFullYear(); 
                const monthDocumentTitle = `Summary 3R ${monthDocument}`;
                const weekDocumentTitle = `Summary 3R Week ${weekDocument}`;
                
                const isMonthDocumentPushed = documentsGroup[monthDocumentTitle] ? true : false;
                const isWeekDocumentPushed = documentsGroup[weekDocumentTitle] ? true : false;

                // get last updated time
                // const lastUpdated = activities.find((rec) => rec.idRecord === documentMapped2.id);
                // if(!lastUpdated) continue;
            
                const converter = new convertDataToArray();
                const pickData = converter.convertDocumentStoreToArray(documentMapped2);
                // push to group week document
                if(isWeekDocumentPushed) {
                    documentsGroup[weekDocumentTitle].push(pickData);
                    // check the greater last updated
                    // if(lastUpdated.time > documentsGroupLastUpdate[weekDocumentTitle]) {
                    //     documentsGroupLastUpdate[weekDocumentTitle] = lastUpdated.time
                    // }
                }
                else { 
                    documentsGroup[weekDocumentTitle] = [pickData]; 
                    // documentsGroupLastUpdate[weekDocumentTitle] = lastUpdated.time
                }

                // push to group month document
                if(isMonthDocumentPushed) {
                    documentsGroup[monthDocumentTitle].push(pickData); 
                    // check the greater last updated
                    // if(lastUpdated.time > documentsGroupLastUpdate[monthDocumentTitle]) {
                    //     documentsGroupLastUpdate[monthDocumentTitle] = lastUpdated.time
                    // }
                }
                else {
                    documentsGroup[monthDocumentTitle] = [pickData];
                    // documentsGroupLastUpdate[monthDocumentTitle] = lastUpdated.time
                }
                
                // push to record exported
                recordExported.hasOwnProperty(activity.store)
                ? recordExported[activity.store].push(documentMapped2.id)
                : recordExported[activity.store] = [documentMapped2.id];


            }
        }

        await dbActivity.removeItem(activity.id);
    }


    if(!Object.keys(documentsGroup).length) return;

    for(let  key in documentsGroup) {
        // get last updated time on documentsGroupLastUpdate
        // const lastUpdated = documentsGroupLastUpdate[key];
        // // if there is no exists continue
        // if(!lastUpdated) continue;
        // // convert lastUpdated to localedatetime ID-id
        // const lastUpdatedLocaledatetime = new Date(lastUpdated).toLocaleDateString('id-ID', { month: "long", year: "numeric", day: "2-digit"})
        // await startExport(documentsGroup[key], key + " updated " + lastUpdatedLocaledatetime + ".json", false);
        await startExport(documentsGroup[key], key + ".json", false);
     }
}

class convertDataToArray {
    convertDocumentStoreToArray(document: DocumentsMapped): (string|number)[] {
        return [
            document.id,
            document.baseReportFile,
            JSToExcelDate(document.periode),
            document.warehouseName + '',
            document.spvName + '',
            document.headName + '',
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
            (document.generateReport && document.collected) + '',
            JSToExcelDate(new Date())
        ]
    }
}