<template>
    <div class="w3-container w3-margin-top">
        <br /> <br />
        <Table 
            :headers="['Judul', 'Keterangan']" 
            :lists="reports" 
            :keys="['judul', 'keterangan']"
        >
        <template #th>
          <th>Aksi</th>
        </template>

      <template #td="{ id }">
        <td>
            <Button 
                primary 
                value="Mulai" 
                type="button" 
                @trig="launch(id)" 
            />
        </td>
      </template>
        </Table>
    </div>
</template>

<script>
import Table from "@/components/elements/Table.vue"
import Button from "@/components/elements/Button.vue"
import exportDocuments from "@/excelReport/Documents"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { useStore } from "vuex"
import { ref } from "vue"
import { getStockCard } from '@/excelReport/StockCard'
import exportProblem from "@/excelReport/ProblemReport"
import { Documents, lists } from "../pages/Documents/DocumentsPeriod";
import exportToXls from "@/utils/exportToXls"
import { JSToExcelDate, dateMonth } from "@/composable/piece/dateFormat"
import { BaseReportFile, lists as baseReportLists } from "./BaseReport/BaseReportFile"
import { baseClock } from "./BaseReport/BaseReportClock"
import { baseReportStock } from "./BaseReport/BaseReportStock"

export default {
    components: { Table, Button },
    setup() {
        const reportNow = ref('')
        const reports = ref([
                { id: "report001",  judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal" },
                { id: 'report002', judul: 'Export kartu stock', keterangan: 'Export kartu stock item per tanggal' },
                { id: 'report003', judul: 'Export masalah gudang', keterangan: 'Export problem berdasarkan tanggal' },
                { id: 'report004', judul: 'Export dokumen detail', keterangan: 'Download informasi dokumen detail berdasar tanggal' }
            ])
        const store = useStore()
        const launch = async (id) => {
            if (id === 'report001' || id === 'report004') {
                let res = await subscribeMutation(
                    'Pilih record yang akan di export',
                    'PeriodePicker',
                    '',
                    'Modal/tunnelMessage'
                    )
                if(res) {
                    exportReport(id, res?.periode1, res?.periode2)
                }
            } else if (id === 'report002') {
                let warehouseAndItem = await subscribeMutation(
                    'Pilih Gudang dan item',
                    'WarehouseAndItem',
                    '',
                    'Modal/tunnelMessage'
                )
                if(warehouseAndItem) {
                    let periode = await subscribeMutation(
                        'Pilih periode yang akan di export',
                        'PeriodePicker',
                        '',
                        'Modal/tunnelMessage'
                        )
                    if(periode) {
                        exportReport(id, periode.periode1, periode.periode2, warehouseAndItem.warehouse, warehouseAndItem.item)
                    }
                }
            } else if (id === 'report003') {
                let res = await subscribeMutation(
                    'Pilih record yang akan di export',
                    'PeriodePicker',
                    '',
                    'Modal/tunnelMessage'
                    )
                if(res) {
                    exportReport(id, res?.periode1, res?.periode2)
                }
            }
        }

        const exportReport = async (reportId, periode1, periode2, warehouse, item) => {
            //open the loader
            store.commit("Modal/active", {judul: "", form: "Loader"})
            if(reportId === 'report001') {
                // wait the process
                await exportDocuments(periode1, periode2)
            } else if (reportId === 'report002') {
                // wait the process
                await getStockCard(periode1, periode2, warehouse, item)
            } else if (reportId === 'report003') {
                await exportProblem(periode1, periode2)
            } else if (reportId === 'report004') {
                const documentsToDownload = [];
                // get documents between periode
                const document = Documents();
                await document.getDocuments(periode1, periode2);

                // get base report file
                const baseReport = BaseReportFile();
                await baseReport.getBaseReportFile(periode1, periode2);

                // map all document
                for(let doc of lists.value) {

                    documentsToDownload.push({
                        periode: JSToExcelDate(doc.periode),
                        totalKendaraan: doc.totalKendaraan,
                        totalWaktu: doc.totalWaktu,
                        shift: doc.shift,
                        spvName: doc.spvName,
                        warehouseName: doc.warehouseName,
                        itemVariance: doc.itemVariance,
                        totalItemMoving: doc.totalItemMoving,
                        totalQTYIn: doc.totalQTYIn,
                        totalQTYOut: doc.totalQTYOut,
                        totalProductNotFIFO: doc.totalProductNotFIFO,
                        headName: doc.headName,
                        totalDo: doc.totalDo,
                        coretDo: doc.planOut,
                        totalItemKeluar: doc.totalItemKeluar
                    })

                    // when document not finished, get base report file, get clock, get stock
                    if(!doc.isfinished) {

                        const theBaseReportFile = baseReportLists.value.find((rec) => rec?.warehouse === doc.warehouse && rec.periode === doc.periode);
                        
                        if(theBaseReportFile.id && theBaseReportFile.imported) {

                            const baseStock = baseReportStock();
                            const { getBaseClockByParentByShift, clockDetails } = baseClock();
                            // retrieve what we need from the clock and stock
                            
                            await baseStock.getBaseStockByParentByShift(theBaseReportFile.id, doc.shift)
                            await getBaseClockByParentByShift(theBaseReportFile.id, doc.shift)

                            const stockDetails = baseStock.stockDetails(theBaseReportFile.id, doc.shift);
                            const getClockDetails = clockDetails(theBaseReportFile.id, doc.shift)

                            let theLastRecord = documentsToDownload.length - 1;
                            documentsToDownload[theLastRecord] =
                             {
                                ...documentsToDownload[theLastRecord], ...stockDetails, ...getClockDetails, coretDo: stockDetails.planOut
                                }

                        }
                        continue
                        
                    }
                }
                exportToXls(documentsToDownload, `Detail dokumen periode ${dateMonth(periode1)} sampai dengan ${dateMonth(periode2)}`)
            }
            //close the loader
            store.commit("Modal/active")
        }

        return { reportNow, reports, launch }
    },
}
</script>