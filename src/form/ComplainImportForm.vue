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
import Select from "@/components/elements/Select.vue"
import Button from "@/components/elements/Button.vue"
import { modalClose, loader } from "@/composable/piece/vuexModalLauncher"
import { addComplainImport } from '@/composable/components/Complains'

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
                        let typeKesalahan = function () {
                            if(sheetByName["T"+i]?.v) { typeKesalahan += "Klaim" }
                            else if(sheetByName["U"+i]?.v) { return "Kurang muat" }
                            else if(sheetByName["V"+i]?.v) { return "Lebih muat" }
                            else if(sheetByName["W"+i]?.v) { return "Singsal muat" }
                            else if(sheetByName["X"+i]?.v) { return "Lain lain" }
                        }
                        
                        await addComplainImport(
                            sheetByName["I"+i]?.v, sheetByName["N"+i]?.v, sheetByName["A"+i]?.v, sheetByName["M"+i]?.v,
                            sheetByName["D"+i]?.v, sheetByName["J"+i]?.v, sheetByName["L"+i]?.v, sheetByName["O"+i]?.v,
                            i < 9 ? sheetName+"0"+i : sheetName+i, sheetByName["C"+i]?.v, sheetByName["B"+i]?.v, sheetByName["F"+i]?.w,
                            sheetByName["H"+i]?.w, sheetByName["G"+i]?.w, sheetByName["E"+i]?.w, typeKesalahan()
                        )

                        
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