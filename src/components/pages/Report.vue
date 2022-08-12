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
import exportSeperateSheet from "../../exportToXlsSeperateSheet"
import exportDocuments from "../../excelReport/Documents"

export default {
    data () {
        return {
            reportNow: "",
            reports: [
                { judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal", id: "report001"},
                { judul: "Export base report", keterangan: "Export base report untuk mengisi tanggal expired di excel", id: "report002"},
            ],
            step: "",
            unsubscribe: ""
        }
    },
    methods: {
        launch(id) {
            if (id === "report002") {
                this.exportBaseReport()        
            } 
            else if (id === 'report001') {
                let unsubscribe;
                this.$store.commit("Modal/active", { 
                    judul: "Set record to export", 
                    form: "PeriodePicker", 
                    store: false, 
                    btnValue: "Export",
                    tunnelMessage: true,
                });

                const promise = new Promise (resolve => {
                    unsubscribe = this.$store.subscribe(mutation => {
                        if (mutation.type === 'Modal/tunnelMessage') {
                            //get the payload that send to tunnel message
                        resolve(mutation?.payload)
                        }
                    })
                })
                
                promise.then(async val => {
                    //open the loader
                    this.$store.commit("Modal/active", {judul: "", form: "Loader"})
                    // wait the process
                    await exportDocuments(val?.periode1, val?.periode2)
                    //unsubscribe the mutation
                    unsubscribe()
                    //close the loader
                    this.$store.commit("Modal/active")
                })
            }
        },
        async exportBaseReport() {
            // open loader
            // this.$store.commit("Modal/active", { judul: "", form: "Loader" })
            // // cari document dengan criteria { isFinished: false }
            // let documen = await this.$store.dispatch("getDataByCriteria", {store: "Document", criteria: { isfinished: "false" } })
            // // looping cari baseReportFile dengan criteria { periode: document.periode, imported: true }
            // await this.$store.dispatch("BaseReportFile/getDataByState")
            // // looping cari baseReportStock dengan criteria { parent: baseReportFile.id }
            // await this.$store.dispatch("BaseReportStock/getDataByParent")
            // // // looping cari baseReportClock dengan criteria { parent: baseReportFile.id }
            // await this.$store.dispatch("BaseReportClock/getDataByParent")
            // // // ambil document
            // // console.log(
            // //     "document", this.$store.getters["Document/exportCompletely"]
            // //     )
            // // console.log(
            // //     "stock", this.$store.getters["BaseReportStock/exportData"]
            // //     )
            // // download file
            await this.$store.dispatch("Document/getAllDocumentNotFinished")
            let periode = this.$store.getters["BaseReportFile/dateReport"]
            exportSeperateSheet({
                stock: this.$store.getters["BaseReportStock/exportData"],
                document: this.$store.getters["Document/exportCompletely"],
            }, `Base report periode ${periode[0].periode2} sampai dengan ${periode.slice(-1)[0].periode2}`)

            // tutup loader
            // this.$store.commit("Modal/active")
        }
    },
    created() {
        this.$store.dispatch("Baseitem/getAllItem")
    },
    components: {
        Table, Button,
    },
    name: "Report"
}
</script>