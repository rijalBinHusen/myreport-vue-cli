<template>
    <div>
        <label class="w3-margin-top">Nama file</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="importTemp?.fileName" disabled />
        <p>Select sheet to import</p>
        <div class="w3-large w3-row w3-margin-bottom">
            <div class="w3-col s3" v-for="sheet in importTemp.sheetNames" :key="sheet">
                <input type="checkbox" class="w3-margin-right" :id="sheet" v-model="sheetsSelected" :value="sheet" />
                <label :for="sheet">{{ sheet }}</label>
            </div>
        </div>
        <Button class="w3-right" primary value="Submit" type="button" @trig="startImport"/>
    </div>
</template>

<script>
import Select from "../../components/elements/Select.vue"
import Button from "../../components/elements/Button.vue"
import { modalClose, loader } from "@/composable/piece/vuexModalLauncher"

export default {
    components: {
        Select,
        Button,
    },
    data() {
        return {
            sheetsSelected: [],
            importTemp: "",
        }
    },
    methods: {
        async startImport() {
            loader()
            // sheetsSelected = ["Januari", "Februari", .......]
            // importTemp = {}
            // iterate the sheet
            for (let sheetName of this.sheetsSelected) {
                // sheet name
                let sheetByName = this.importTemp.sheets[sheetName]
                // jumlah row
                let totalRow = sheetByName["!ref"].split(":")
                // console.log()
                // dapatkan length number data clock
                let totalRowNumber = +totalRow[1].match(/\d+/)[0]
                for( let i = 5; i <= totalRowNumber; i++) {
                    if(sheetByName["P"+i] && sheetByName["P"+i]?.v || (sheetByName["C"+i] && sheetByName["C"+i].v)) {
                        // insert to idb
                        let typeKesalahan = "";

                        if(sheetByName["T"+i]?.v) { typeKesalahan += "Klaim" }
                        if(sheetByName["U"+i]?.v) { typeKesalahan += "Kurang muat" }
                        if(sheetByName["V"+i]?.v) { typeKesalahan += "Lebih muat" }
                        if(sheetByName["W"+i]?.v) { typeKesalahan += "Singsal muat" }
                        if(sheetByName["X"+i]?.v) { typeKesalahan += "Lain lain" }

                        await this.$store.dispatch("append", { 
                            store: "Complains",
                            obj: {
                                row: i < 9 ? sheetName+"0"+i : sheetName+i, 
                                gudang: sheetByName["A"+i]?.v, 
                                tally: sheetByName["B"+i]?.v , 
                                spv: sheetByName["C"+i]?.v , 
                                kabag: sheetByName["D"+i]?.v , 
                                tanggalSuratJalan: sheetByName["E"+i]?.w , 
                                tanggalBongkar: sheetByName["F"+i]?.w , 
                                tanggalKomplain: sheetByName["G"+i]?.w , 
                                tanggalInfo: sheetByName["H"+i]?.w , 
                                customer: sheetByName["I"+i]?.v ,
                                nomorSJ: sheetByName["J"+i]?.v ,
                                nopol: sheetByName["L"+i]?.v ,
                                item: sheetByName["M"+i]?.v ,
                                do: sheetByName["N"+i]?.v ,
                                real: sheetByName["O"+i]?.v ,
                                type: typeKesalahan,
                                import: true,
                                }
                        })
                    }
                }
            }
            modalClose()
        },
    },
    computed: {},
    created() {
        this.importTemp = this.$store.getters["Modal/obj"]?.obj
    }
}
</script>