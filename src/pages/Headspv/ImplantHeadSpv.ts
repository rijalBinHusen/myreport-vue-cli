import { progressMessage } from "@/components/parts/Loader/state"
import { useIdb } from "@/utils/localforage"
import { getData } from "@/utils/requestToServer"

interface headSpv {
    disabled: boolean
    id: string
    name: string
    phone: string
    shift: string
}

interface headSpvFromServer {
    id: string,
    head_name: string,
    head_phone: string,
    head_shift: string,
    is_disabled: string
}


export async function implantHeadSPVFromServer () {
    const fetchEndPoint = await getData('field_problems?limit=' + 100);
    const isFetchFailed = fetchEndPoint?.status != 200;

    if(isFetchFailed) return;

    const dbItem = useIdb('headspv');

    const waitingServerKeyValue = await fetchEndPoint.json();
    const items: headSpvFromServer[] = waitingServerKeyValue?.data

    for(let [index, item] of items.entries()) {
        progressMessage.value = `Menanamkan head supervisor ${index + 1} dari ${items.length}`;

        let recordToSet:headSpv = {
            id: item.id,
            disabled: Boolean(item.is_disabled),
            name: item.head_name,
            phone: item.head_phone,
            shift: item.head_shift
        }

        await dbItem.setItem(item.id, recordToSet);
    }

    progressMessage.value = ''
}