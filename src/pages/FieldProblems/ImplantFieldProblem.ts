import { progressMessage } from "@/components/parts/Loader/state"
import { useIdb } from "@/utils/localforage"
import { getData } from "@/utils/requestToServer"

interface fieldProblem {
    dl: number
    head: string
    id: string
    masalah: string
    periode: number
    pic: string
    solusi: string
    sumberMasalah: string
    supervisor: string
}

interface fieldProblemFromServer {
    id: string,
    periode: string,
    supervisor_id: string,
    head_spv_id: string,
    masalah: string,
    sumber_masalah: string,
    solusi: string,
    pic: string,
    dl: string
}


export async function implantFieldProblemsFromServer () {
    const fetchEndPoint = await getData('field_problems?limit=' + 100);
    const isFetchFailed = fetchEndPoint?.status != 200;

    if(isFetchFailed) return;

    const dbItem = useIdb('fieldproblem');

    const waitingServerKeyValue = await fetchEndPoint.json();
    const items: fieldProblemFromServer[] = waitingServerKeyValue?.data

    for(let [index, item] of items.entries()) {
        progressMessage.value = `Menanamkan field problem ${index + 1} dari ${items.length}`;

        let recordToSet:fieldProblem = {
            id: item.id,
            dl: Number(item.dl),
            head: item.head_spv_id,
            masalah: item.masalah,
            periode: Number(item.periode),
            pic: item.pic,
            solusi: item.solusi,
            sumberMasalah: item.sumber_masalah,
            supervisor: item.supervisor_id
        }

        await dbItem.setItem(item.id, recordToSet);
    }

    progressMessage.value = ''
}