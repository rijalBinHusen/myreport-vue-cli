import { Documents } from "@/pages/Documents/DocumentsPeriod";
import { subscribeMutation } from "@/composable/piece/subscribeMutation";
import { baseClock } from "@/pages/BaseReport/BaseReportClock";
import { baseReportStock } from "@/pages/BaseReport/BaseReportStock";
import { problemActiveBySpvAndPeriode, updateProblem } from "../Problems/Problem";

export interface DocumentDetails {
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


    // head: string
    // isfinished:boolean
    // name: string
    // parent: string
    // parentDocument: string
    // shift: number
    // warehouse: string
    // approval: number|string
    // collected: number|string
    // finished: number
    // periode: number
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
            totalWaktu: 0
        }
    };

    if(document?.finished) {
        await subscribeMutation('', 'Confirm', { pesan: 'Document sudah diselesaikan', isAlert: true }, 'Modal/tunnelMessage')
        return {
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
            totalWaktu: document.totalWaktu
        }
    }

    if(document?.collected === 0) {
        await subscribeMutation('', 'Confirm', { pesan: 'Document belum di kumpulkan', isAlert: true }, 'Modal/tunnelMessage')
    }

    const detailsClock = clockDetails(baseReportFile, shift);
    const detailsStock = stockDetails(baseReportFile, shift);
    const problems = problemActiveBySpvAndPeriode(document?.name, periode);

    if(problems.length) {
        problems.forEach((rec) => {

            updateProblem(rec?.id, { linkToDocument: true })

        })
    }

    return { ...detailsClock, ...detailsStock, generateReport: document?.generateReport, itemVariance: problems.length };
}
