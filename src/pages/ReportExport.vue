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
import { onMounted, ref } from "vue"
import { getStockCard } from '@/excelReport/StockCard'
import exportProblem from "@/excelReport/ProblemReport"

export default {
    components: { Table, Button },
    setup() {
        const reportNow = ref('')
        const reports = ref([
                { id: "report001",  judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal" },
                { id: 'report002', judul: 'Export kartu stock', keterangan: 'Export kartu stock item per tanggal' },
                { id: 'report003', judul: 'Export masalah gudang', keterangan: 'Export problem berdasarkan tanggal' }
            ])
        const store = useStore()
        const launch = async (id) => {
            if (id === 'report001') {
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
            }
            //close the loader
            store.commit("Modal/active")
        }

        return { reportNow, reports, launch }
    },
}
</script>@/pages/BaseItem/Baseitem