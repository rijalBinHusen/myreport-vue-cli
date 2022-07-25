<template>
    <div>
        <label class="w3-margin-top">Nama file</label>
        <input type="text" class="w3-input w3-margin-top w3-margin-bottom" :value="importTemp?.fileName" disabled />
        <p>Select sheet to import</p>
        <div class="w3-large w3-row w3-margin-bottom">
            <div class="w3-col s3" v-for="sheet in importTemp.sheets" :key="sheet">
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
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            // sheetsSelected = ["Januari", "Februari", .......]
            // importTemp = {}
            // iterate the sheet
            for (let sheetName of this.sheetsSelected) {
                // jumlah row
                let totalRow = this.importTemp.sheet[sheetName]["!ref"].split(":")
                // dapatkan length number data clock
                let totalRowNumber = +totalRow[1].match(/\d+/)[0]
                let sheet = this.importTemp.sheet[sheetName]
                for( let i = 5; i <= totalRowNumber; i++) {
                    if(sheet["P"+i] && sheet["P"+i]?.v) {
                        // insert to idb
                        let typeKesalahan = "";

                        if(sheet["T"+i]?.v) { typeKesalahan += "Klaim" }
                        if(sheet["U"+i]?.v) { typeKesalahan += "Kurang muat" }
                        if(sheet["V"+i]?.v) { typeKesalahan += "Lebih muat" }
                        if(sheet["W"+i]?.v) { typeKesalahan += "Singsal muat" }
                        if(sheet["X"+i]?.v) { typeKesalahan += "Lain lain" }

                        await this.$store.dispatch("append", { 
                            store: "Complains",
                            obj: {
                                row: i < 9 ? sheetName+"0"+i : sheetName+i, 
                                gudang: sheet["A"+i]?.v, 
                                tally: sheet["B"+i]?.v , 
                                spv: sheet["C"+i]?.v , 
                                kabag: sheet["D"+i]?.v , 
                                tanggalSuratJalan: sheet["E"+i]?.w , 
                                tanggalBongkar: sheet["F"+i]?.w , 
                                tanggalKomplain: sheet["G"+i]?.w , 
                                tanggalInfo: sheet["H"+i]?.w , 
                                customer: sheet["I"+i]?.v ,
                                nomorSJ: sheet["J"+i]?.v ,
                                nopol: sheet["L"+i]?.v ,
                                item: sheet["M"+i]?.v ,
                                do: sheet["N"+i]?.v ,
                                real: sheet["O"+i]?.v ,
                                type: typeKesalahan,
                                import: true,
                                }
                        })
                    }
                }
            }
            this.$store.commit("Modal/active");
        },
    },
    computed: {},
    created() {
        this.importTemp = this.$store.getters["Modal/obj"]?.obj
    }
}
</script>