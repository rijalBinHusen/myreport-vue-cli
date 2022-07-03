<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="$refs.importerCase.click();" type="button"/>
        <Button primary class="w3-right" value="Imported" type="button"/>
        <Button primary class="w3-right" value="Cases" type="button"/>
        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerCase"
            accept=".xls, .ods"
        />
    </div>

            <Datatable
                :datanya="$store.getters['Cases/imported']"
                :heads="['Tanggal','Bagian', 'Temuan', 'Karu', 'Kabag', 'Keterangan', 'Keterangan 2']"
                :keys="['periode','bagian', 'temuan', 'karu', 'kabag', 'keterangan1', 'keterangan2']"
                option
                id="tableApproval"
            >
			
                <template #default="{ prop }">
                    <Button value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                    <Button value="Insert" primary type="button" class="w3-tiny" @trig="insertCase(prop)"/>
                </template>
            </Datatable> 
			
        </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Input from '@/components/elements/Input.vue'
import * as XLSX from "xlsx";

export default {
    name: "Cases",
    methods: {
    readExcel(e) {
    // bring the loader up
    this.$store.commit("Modal/active", {judul: "", form: "Loader"});
        const file = e.target.files[0]
        let info = { fileName: file.name }
        
        const promise = new Promise ((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            
            fileReader.onload = (e) => {
            const bufferArray = e.target.result;
                
            // const wb = XLSX.read(bufferArray, {type: "buffer"});
            const wb = XLSX.read(bufferArray);
            let sheets = wb.SheetNames
            info.sheet = wb.Sheets[sheets[0]]
                
            resolve(info)
            };
            
            fileReader.onerror=((error) => { reject(error) })
        })
        
        promise.then(async (d) => {
        // insert to idb
        let infoRow = d.sheet["!ref"].split(":")
        let lengthRow = +infoRow[1].match(/\d+/)[0]
        // console.log(d.sheet)
        for(let i = 1; i <= lengthRow; i++) {
            if(d.sheet["B"+i]) {
            await this.$store.dispatch("append", { 
                store: "Cases",
                obj: { 
                    periode: d.sheet["C"+i]?.w, 
                    divisi: d.sheet["D"+i]?.v , 
                    bagian: d.sheet["E"+i]?.v , 
                    fokus: d.sheet["F"+i]?.v , 
                    temuan: d.sheet["G"+i]?.v , 
                    karu: d.sheet["I"+i]?.v , 
                    kabag: d.sheet["J"+i]?.v , 
                    keterangan1: d.sheet["L"+i]?.v , 
                    keterangan2: d.sheet["M"+i]?.v ,
                    import: true,
                    }
                })
            }
        }
        // close the loader
        this.$store.commit("Modal/active");
            })
        },
        remove(ev){
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) {
                return;
            }
            this.$store.dispatch("delete", { 
                store: "Cases", 
                criteria: {id: ev}
            })
        },
        insertCase(obj) {
            this.$store.commit("Modal/active", { 
                judul: "Insert Case", 
                form: "CaseInsertForm",
                obj: obj
            });
        },
    },
    components: {
        Button,
        Datatable,
        Input,
        Datatable,
    },
}
</script>