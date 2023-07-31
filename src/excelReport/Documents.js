import { ymdTime, dateMonth } from "@/composable/piece/dateFormat";
import { getHeadspvId } from "@/pages/Headspv/Headspv";
import { getSupervisorId } from "@/pages/Supervisors/Supervisors";
import { getWarehouseById } from "@/pages/Warehouses/Warehouses";
import exportToXls from "@/utils/exportToXls"
import { useIdb } from "@/utils/localforage";


const report = async  (startDate, endDate) => {

    let result = [];

    const startDateTime = ymdTime(startDate);
    const endDateTime = ymdTime(endDate);
    
    const dbDocument = useIdb('document');
    const documents = await dbDocument.getItemsByKeyGreaterOrEqualThanAndLowerOrEqualThan('periode', startDateTime, endDateTime);

    if(documents.length > 0) {
        for(let doc of documents) {
            const warehouseInfo = await getWarehouseById(doc?.warehouse);
            const headInfo = await getHeadspvId(doc?.head);
            const spvInfo = await getSupervisorId(doc?.name);

            result.push ({
                Periode: dateMonth(doc?.periode),
                Karu: spvInfo.name,
                Bagian: spvInfo.name,
                Kabag: spvInfo.name,
                Shift: doc?.shift,
                Dikumpulkan: !isNaN(doc.collected+ "") ? dateMonth(doc?.collected) : doc?.collected,
                Selesai: !isNaN(doc.finished+ "") ? dateMonth(doc?.finished) : doc?.finished,
                Diparaf: !isNaN(doc.approval+ "") ? dateMonth(doc?.approval) : doc?.approval,
                Dibagikan: !isNaN(doc.shared+ "") ? dateMonth(doc?.shared) : doc?.shared,
            })
        }
    }

    console.log(result);

    if(result.length)

    exportToXls(result, `Pengumulan document ${dateMonth(startDate)} Sampai dengan ${dateMonth(endDate)}`)
}

export default report