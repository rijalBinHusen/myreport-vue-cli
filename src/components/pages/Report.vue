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
import Table from "../elements/Table.vue"
import Button from "../elements/Button.vue"

export default {
    data () {
        return {
            reports: [
                { judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal", id: "report001"}
            ]
        }
    },
    methods: {
        launch(id) {
            this.$store.commit("Modal/active", { judul: "Set record to export", form: "ExportDocumen"});
        }
    },
    components: {
        Table, Button,
    },
    name: "Report"
}
</script>