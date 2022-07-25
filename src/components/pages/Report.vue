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
import exportToXls from "../../exportToXls"
import exportSeperateSheet from "../../exportToXlsSeperateSheet"

export default {
    data () {
        return {
            reportNow: "",
            reports: [
                { judul: "Export pengumpulan dokumen", keterangan: "Export periode pengumpulan dokumen berdasarkan tanggal", id: "report001"},
                { judul: "Export base report", keterangan: "Export base report untuk mengisi tanggal expired di excel", id: "report002"}
            ],
            step: "",
            unsubscribe: ""
        }
    },
    methods: {
        launch(id) {
            if(id === "report001") {
            this.reportNow = id
            // luncurkan periode picker
            this.$store.commit("Modal/active", { judul: "Set record to export", form: "PeriodePicker", store: "Document", btnValue: "Export"});
            } else if (id === "report002") {
                this.exportBaseReport()        
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
        this.step = ""
        this.unsubscribe = this.$store.subscribe((mutation) => {
            // console.log(mutation)
        if (mutation.type === 'Modal/active') {
            // jika mutation.payload && mutation.payload.form === PeriodePicker (user akan memilih periode yang akan didownload)
            if(mutation.payload && mutation.payload.form === "PeriodePicker") {
                // this.step = mutation.payload.form
                this.step = mutation.payload.form
            } 
            // jika mutation.payload && mutation.payload.form === Loader (user telah memilih periode yang didownload)
            if(mutation.payload && mutation.payload.form === "Loader") {
                this.step = mutation.payload.form
                // this.step = mutation.payload.form
                // ambil periode yang telah dipilih user
                this.periode = mutation.payload.periode
            }
            // jika mutation.payload === undefined && this.step === Loader (modal ditutup otomatis setelah semua data didapatkan dari database)
            if(!mutation.payload && this.step === "Loader") {
                // this.step = ""
                this.step = ""
                // download filenya
                if(this.reportNow === "report001") {
                    let namaFileReport = `Pengumpulan dokumen periode ${this.$store.getters["dateFormat"]({format: "ymdexcel", time: this.periode[0]})} sampai dengan ${this.$store.getters["dateFormat"]({format: "ymdexcel", time: this.periode[1]})}`
                    exportToXls(this.$store.getters["Document/exportData"], namaFileReport)
                }
            }
            // jika mutation.payload === undefined (modal ditutup manual, user tidak jadi download)
            if(!mutation.payload) {
                // this.step kembali jadi "" lagi
                this.step = ""
            }

            // console.log(`Updating to ${state}`);
            }
        });
    },
    beforeUnmount() {
        this.unsubscribe();
    },
    components: {
        Table, Button,
    },
    name: "Report"
}
</script>