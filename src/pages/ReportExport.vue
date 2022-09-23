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
import { onBeforeMount, ref } from "vue"

export default {
    components: { Table, Button },
    setup() {
        const reportNow = ref('')
        const reports = ref([
                { judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal", id: "report001"},
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
            }
        }

        onBeforeMount(() => {
            store.dispatch("Baseitem/getAllItem")
        })

        return { reportNow, reports, launch}
    },
}
</script>