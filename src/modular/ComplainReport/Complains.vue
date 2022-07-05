<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="$refs.importerCase.click();" type="button"/>
        <Button primary :class="['w3-right', inserted ? '' : 'w3-disabled']" value="Imported" @trig="inserted = false" type="button"/>
        <Button primary :class="['w3-right', inserted ? 'w3-disabled' : '']" value="Complains" @trig="inserted = true" type="button"/>
        <input
            class="w3-hide"
            @change.prevent="readExcel($event)"
            type="file"
            ref="importerCase"
            accept=".xls, .ods"
        />
    </div>

            <Datatable
                :datanya="table?.lists"
                :heads="table?.heads"
                :keys="table?.keys"
                option
                :id="table?.id"
            >
			
                <template #default="{ prop }">
                    <Button v-if="!prop?.inserted && !inserted" value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                    <Button v-if="!inserted" value="Insert" primary type="button" class="w3-tiny" @trig="insertCase(prop)"/>
                    <Button v-else value="Edit" secondary type="button" class="w3-tiny" @trig="edit(prop)"/>
                    
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
    data() {
        return {
            inserted: false,
        }
    },
    computed: {
        table() {
            if(this.inserted) {
                return {
                    lists: this.$store.getters["Complains/inserted"],
                    heads: ["Tanggal", "Supervisor", "Kabag", "Masalah", "Sumber Masalah", "Solusi"],
                    keys: ["periode2", "spvName", "headName", "masalah", "sumberMasalah", "solusi"],
                    id: "tableComplainsInserted"
                }
            }
            return {
                lists: this.$store.getters["Complains/imported"],
                heads: ['Tanggal','Bagian', 'Temuan', 'Karu', 'Kabag', 'Keterangan', 'Keterangan 2'],
                keys: ['periode','bagian', 'temuan', 'karu', 'kabag', 'keterangan1', 'keterangan2'],
                id: "tableComplainsImported"
            }
        },
    },
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
            info.sheets = wb.SheetNames
            info.sheet = wb.Sheets
                
            resolve(info)
            };
            
            fileReader.onerror=((error) => { reject(error) })
        })
        
        promise.then(async (d) => {
            
            // bring up the modal and the form and throw the data (d)
            this.$store.commit("Modal/active", { 
                judul: "Import complain", 
                form: "ComplainImportForm",
                obj: d
            });
        
            })
        },
        remove(ev){
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) {
                return;
            }
            this.$store.dispatch("delete", { 
                store: "Complains", 
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

        edit(obj) {
            this.$store.commit("Modal/active", { 
                judul: "Edit Case", 
                form: "CaseInsertForm",
                obj: { ...obj, edit: true }
            });
        },
    },
    components: {
        Button,
        Datatable,
        Input,
        Datatable,
    },
    name: "Complain",
}
</script>