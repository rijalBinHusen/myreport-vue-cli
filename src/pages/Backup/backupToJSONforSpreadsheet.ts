import { startExport } from "@/composable/piece/exportAsFile";
import { useIdb } from "@/utils/localforage";
import { Item } from "@/pages/BaseItem/GetBaseItemFromServer";

interface JSONFormat {
    store: string,
    data: object
    exportedTime: number
}

const storeToBackup = ['baseitem'];

async function getAllData() {
    const dbSummary = useIdb('summary');
    const summaryKeys = await dbSummary.getKeys();
    const summaryData = dbSummary.getItems();
    await startExport(summaryData, `backup summary ${new Date().toISOString()}.json`, false)

    for (let store of summaryKeys) {
        if(store === 'baseitem') "";
        const db = useIdb(store);
        const getItems = await db.getItems<{ [key: string]: string | number | boolean }>();
        await startExport(getItems, `backup ${store} ${new Date().toISOString()}.json`, false)
    }
}