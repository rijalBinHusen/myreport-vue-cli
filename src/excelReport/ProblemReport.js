import exportToXls from "@/exportToXls";
import { getProblemBetweenPeriode, listsProblem } from "@/composable/components/Problem"
import { ddmmyyyy } from "@/composable/piece/dateFormat"
export default async function (periode1, periode2) {
    await getProblemBetweenPeriode(periode1, periode2);
    const results = await listsProblem()

    const mapResult = results.map(res => ({
        periode: res?.periode,
        namaGudang: res?.namaGudang,
        namaItem: res?.namaItem,
        masalah: res?.masalah,
        supervisor: res?.supervisor,
        status: res?.status,  
    }))

    exportToXls(mapResult, `Masalah digudang jadi periode ${ddmmyyyy(periode1, '-')} sampai dengan ${ddmmyyyy(periode2, '-')}`)
}
