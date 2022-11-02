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

export default {
    components: { Table, Button },
    setup() {
        const reportNow = ref('')
        const reports = ref([
                { id: "report001",  judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal" },
                { id: 'report002', judul: 'Export kartu stock', keterangan: 'Export kartu stock item per tanggal' }
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
                    //open the loader
                    store.commit("Modal/active", {judul: "", form: "Loader"})
                    // wait the process
                    await exportDocuments(res?.periode1, res?.periode2)
                    //close the loader
                    store.commit("Modal/active")
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
                    console.log(warehouseAndItem, periode)
                    await getStockCard(periode.periode1, periode.periode2, warehouseAndItem.warehouse, warehouseAndItem.item)
                }
            }
        }

        return { reportNow, reports, launch}
    },
}
</script>