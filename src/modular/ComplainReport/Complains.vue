<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="$refs.importerComplain.click();" type="button"/>
        <Button primary :class="['w3-right', inserted ? '' : 'w3-disabled']" value="Imported" @trig="inserted = false" type="button"/>
        <Button primary :class="['w3-right', inserted ? 'w3-disabled' : '']" value="Complains" @trig="inserted = true" type="button"/>
        <Button danger v-if="grouped.length" class="w3-right" value="Delete all" @trig="removeAll" type="button"/>
        <input
            class="w3-hide"
            @change.prevent="readExcelFile($event)"
            type="file"
            ref="importerComplain"
            accept=".xls, .ods"
        />
    </div>

            <Datatable
                v-if="renderTable"
                :datanya="table?.lists"
                :heads="table?.heads"
                :keys="table?.keys"
                option
                :id="table?.id"
            >
			
                <template #default="{ prop }">
                    <Button v-if="!prop?.inserted && !inserted" value="Remove" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                    <Button v-if="!inserted" value="Insert" primary type="button" class="w3-tiny" @trig="insertComplain(prop)"/>
                    <Button v-else value="Edit" secondary type="button" class="w3-tiny" @trig="edit(prop)"/>
                </template>

                <template v-if="!inserted" #th>
                    <th>Mark to delete</th>
                </template>

                <template v-if="!inserted" #td="{ obj }">
                    <span v-if="!obj?.inserted" >
                        <input :id="obj.id" v-model="grouped" :value="obj.id" type="checkbox" />
                        <label :for="obj.id"> Remove</label>
                    </span>
                    <p v-else>inserted</p>
                </template>
            </Datatable> 
			
        </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import Datatable from "../../components/parts/Datatable.vue"
import Input from '@/components/elements/Input.vue'
import readExcel from "@/composable/readExcel"

export default {
    data() {
        return {
            inserted: true,
            renderTable: true,
            grouped: [],
        }
    },
    computed: {
        table() {
            if(this.inserted) {
                return {
                    lists: this.$store.getters["Complains/inserted"],
                    heads: ["Tanggal", "Supervisor", "Kabag", "Masalah", "Sumber Masalah", "Inserted"],
                    keys: ["periode2", "spvName", "headName", "masalah", "sumberMasalah", "insert2"],
                    id: "tableComplainsInserted"
                }
            }
            return {
                lists: this.$store.getters["Complains/imported"],
                heads: ['Tanggal Komplain', 'Cutomer', 'Karu', 'Item', 'Selisih'],
                keys: ['tanggalKomplain', 'customer', 'spv', 'item', 'selisih'],
                id: "tableComplainsImported"
            }
        },
    },
    methods: {
        readExcelFile(e) {
            // bring the loader up
        this.$store.commit("Modal/active", {judul: "", form: "Loader"});
        readExcel(e.target.files[0]).then((d) => {
            // bring up the modal and the form and throw the data (d)
            this.$store.commit("Modal/active", { judul: "Import complain", form: "ComplainImportForm", obj: d });
        
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
        async removeAll(){
            // open loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            let sure = confirm("Apakah anda yakin akan menghapusnya?")
            if(!sure) {
                return;
            }
            // iterate the selected record
            for (let rec of this.grouped) {
                // delete record
                await this.$store.dispatch("delete", { 
                    store: "Complains", 
                    criteria: {id: rec}
                })
            }
            this.grouped = []
            // close the modal
            this.$store.commit("Modal/active");
        },
        insertComplain(obj) {
            this.$store.commit("Modal/active", { 
                judul: "Insert Complain", 
                form: "ComplainInsertForm",
                obj: obj
            });
        },

        edit(obj) {
            this.$store.commit("Modal/active", { 
                judul: "Edit Complain", 
                form: "ComplainInsertForm",
                obj: { ...obj, edit: true }
            });
        },
    },
    watch: {
        inserted() {
            this.renderTable = false
            setTimeout(() => {
                this.renderTable = true
            }, 300)
        }
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