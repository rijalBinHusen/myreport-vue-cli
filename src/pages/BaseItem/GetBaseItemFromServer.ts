import { progressMessage } from "@/components/parts/Loader/state"
import { useIdb } from "@/utils/localforage"
import { getData } from "@/utils/requestToServer"


interface ItemromServer {
    id: string
    item_kode: string
    item_name: string
    last_used: string
}

interface Item {
    id: string
    kode: string
    lastUsed: number
    name: string
}

export async function implantItemsFromServer (periode: number) {
    const fetchEndPoint = await getData('base_items?last_used=' + periode);
    const isFetchFailed = fetchEndPoint?.status != 200;

    if(isFetchFailed) return;

    const dbItem = useIdb('baseitem');

    const waitingServerKeyValue = await fetchEndPoint.json();
    const items: ItemromServer[] = waitingServerKeyValue?.data

    for(let [index, item] of items.entries()) {
        progressMessage.value = `Menanamkan base item ${index + 1} dari ${items.length}`;

        let recordToSet:Item = {
            id: item.id,
            kode: item.item_kode,
            name: item.item_name,
            lastUsed: Number(item.last_used)
        }

        await dbItem.setItem(item.id, recordToSet);
    }

    progressMessage.value = ''
}