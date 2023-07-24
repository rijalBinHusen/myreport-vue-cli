import { Documents } from "@/pages/Documents/DocumentsPeriod";
import { subscribeMutation } from "@/composable/piece/subscribeMutation";
import { baseClock } from "@/pages/BaseReport/BaseReportClock";
import { baseReportStock } from "@/pages/BaseReport/BaseReportStock";
import { problemActiveBySpvAndPeriode, updateProblem } from "../Problems/Problem";
import { getWarehouseById } from "../Warehouses/Warehouses"
import { getSupervisorId } from "../Supervisors/Supervisors";
import { getHeadspvId } from "../Headspv/Headspv";

export interface DocumentDetails {
    id: string
    generateReport: boolean
    totalQTYOut: number
    totalItemMoving: number
    totalQTYIn: number
    planOut: number
    totalItemKeluar: number
    totalDo: number
    totalWaktu: number
    totalKendaraan: number
    totalProductNotFIFO: number
    itemVariance: number
    collected: number|string
    isfinished:boolean
    periode: number
    warehouseName: string
    shift: number,
    supervisorName: string
    headSpvName: string


    // name: string
    // parent: string
    // parentDocument: string
    // warehouse: string
    // approval: number|string
    // finished: number
    // shared: number
    // status: number
}

export async function getDocumentDetails (baseReportFile: string, periode: number, warehouse: string, shift: 1|2|3): Promise<DocumentDetails> {
    const { getDocumentByPeriodeByWarehouseByShift } = Documents()
    const { clockDetails } = baseClock();
    const { stockDetails } = baseReportStock();
    const document = await getDocumentByPeriodeByWarehouseByShift(periode, warehouse, shift);
    
    if(typeof document === 'undefined') {

        subscribeMutation('', 'Confirm', { pesan: 'Document tidak pernah ada', isAlert: true }, 'Modal/tunnelMessage');

        return {
            id: '',
            periode: 0,
            generateReport: true,
            totalQTYOut: 0,
            itemVariance: 0,
            planOut: 0,
            totalDo: 0,
            totalItemKeluar: 0,
            totalItemMoving: 0,
            totalKendaraan: 0,
            totalProductNotFIFO: 0,
            totalQTYIn: 0,
            totalWaktu: 0,
            collected: 0, 
            isfinished: false,
            warehouseName: "Doesn't exists",
            shift: 1,
            supervisorName: "Doesn't exists",
            headSpvName: "Doesn't exists"
        }
    };

    const warehouseInfo = await getWarehouseById(document.warehouse)
    const supervisorInfo = await getSupervisorId(document.name);
    const headSpvInfo = await getHeadspvId(document.head);

    let result = <DocumentDetails>{
        id: document.id,
        periode: document.periode,
        generateReport: document.generateReport,
        totalQTYOut: document.totalQTYOut,
        itemVariance: document.itemVariance,
        planOut: document.planOut,
        totalDo: document.totalDo,
        totalItemKeluar: document.totalItemKeluar,
        totalItemMoving: document.totalItemMoving,
        totalKendaraan: document.totalKendaraan,
        totalProductNotFIFO: document.totalProductNotFIFO,
        totalQTYIn: document.totalQTYIn,
        totalWaktu: document.totalWaktu,
        collected: document.collected,
        isfinished: document.isfinished,
        warehouseName: warehouseInfo.name,
        shift: document.shift,
        supervisorName: supervisorInfo.name,
        headSpvName: headSpvInfo.name
    };

    if(document?.finished) {
        
        await subscribeMutation('', 'Confirm', { pesan: 'Document sudah diselesaikan', isAlert: true }, 'Modal/tunnelMessage')

    } 
    
    else {

        const detailsClock = clockDetails(baseReportFile, shift);
        const detailsStock = stockDetails(baseReportFile, shift);
        result = { ...result, ...detailsClock, ...detailsStock };

        const problems = problemActiveBySpvAndPeriode(document?.name, periode);
    
        if(problems.length) {
            problems.forEach((rec) => {
    
                updateProblem(rec?.id, { linkToDocument: true })
    
            })
    
            result.itemVariance = problems.length;
        }

    }


    if(!Boolean(document?.collected)) {
        await subscribeMutation('', 'Confirm', { pesan: 'Document belum di kumpulkan', isAlert: true }, 'Modal/tunnelMessage')
    }

    return result;
}

export async function setGenerateDocument(idDocument: string, bool: boolean) {
    const { updateDocument } = Documents();

    await updateDocument(idDocument, { generateReport: bool });
}
