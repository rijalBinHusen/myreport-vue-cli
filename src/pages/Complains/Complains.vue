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
                :datanya="lists"
                :heads="table?.heads"
                :keys="table?.keys"
                option
                :id="table?.id"
            >
			
                <template #default="{ prop }">
                    <Button v-if="!prop?.inserted && !inserted" value="Remove" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                    <Button v-if="!inserted" value="Insert" primary type="button" :datanya="prop.id" class="w3-tiny" @trig="insertComplain($event)"/>
                    <Button v-else value="Edit" secondary type="button" :datanya="prop.id" class="w3-tiny" @trig="edit($event)"/>
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
import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import Input from '@/components/elements/Input.vue'
import readExcel from "@/utils/readExcel"
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { lists, listsComplainImport, Complains } from './Complains'
import { loader } from "@/composable/piece/vuexModalLauncher"

const { removeComplain, getComplains } = Complains();

export default {
    data() {
        return {
            inserted: true,
            renderTable: false,
            grouped: [],
            lists: [],
        }
    },
    computed: {
        table() {
            if(this.inserted) {
                return {
                    heads: ["Tanggal", "Supervisor", "Kabag", "Masalah", "Sumber Masalah", "Inserted"],
                    keys: ["periode2", "spvName", "headName", "masalah", "sumberMasalah", "insert2"],
                    id: "tableComplainsInserted"
                }
            }
            return {
                heads: ['Tanggal Komplain', 'Cutomer', 'Karu', 'Item', 'Selisih'],
                keys: ['tanggalKomplain', 'customer', 'spv', 'item', 'selisih'],
                id: "tableComplainsImported"
            }
        },
    },
    methods: {
        async readExcelFile(e) {
            // bring the loader up
            loader()
            let excelRead = await readExcel(e.target.files[0])
            let res = await subscribeMutation(
                "Import complain", "ComplainImportForm", excelRead, 'Modal/tunnelMessage'
            )

            if(res) {
                this.renewLists()
            }
        },
        async remove(ev){
            let sure = await subscribeMutation(
                '', 'Confirm', { pesan: 'Record akan dihapus' }, 'Modal/tunnelMessage'
            )
            if(sure) {
                await removeComplain(ev)
                this.renewLists()
            }
        },
        async removeAll(){
            // open loader
            this.$store.commit("Modal/active", {judul: "", form: "Loader"});
            let sure = await subscribeMutation(
                '', 'Confirm', { pesan: 'Semua record akan dihapus' }, 'Modal/tunnelMessage'
            )
            if(sure) {
                loader()
                // iterate the selected record
                for (let rec of this.grouped) {
                    // delete record
                    await removeComplain(rec)
                }
                this.grouped = []
                // close the modal
                this.$store.commit("Modal/active");
            }
            this.renewLists()
        },
        async insertComplain(id) {
            let res = await subscribeMutation(
                "Insert Complain",
                "ComplainInsertForm",
                { parent: id, edit: false },
                'Modal/tunnelMessage'
            )
            if(res) {
                this.renewLists()
            }
        },

        async edit(id) {

            let res = await subscribeMutation(
                "Edit Complain",
                "ComplainInsertForm",
                { id, edit: true },
                'Modal/tunnelMessage'
            )
            if(res) {
                this.renewLists()
            }
        },

        async renewLists() {
            this.renderTable = false
            this.lists = await listsComplain(this.inserted)
            setTimeout(() => {
                this.renderTable = true
            }, 150)
        }
    },
    watch: {
        inserted() {
            this.renewLists()
        }
    },
    async mounted() {
        await getComplains()
        this.renewLists()
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