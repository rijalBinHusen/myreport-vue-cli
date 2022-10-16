<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="$refs.importerCase.click();" type="button"/>
        <Button primary :class="['w3-right', inserted ? '' : 'w3-disabled']" value="Imported" @trig="inserted = false;" type="button"/>
        <Button primary :class="['w3-right', inserted ? 'w3-disabled' : '']" value="Cases" @trig="inserted = true" type="button"/>
        <input
            class="w3-hide"
            @change.prevent="readExcelFile($event)"
            type="file"
            ref="importerCase"
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
                    <Button v-if="!prop?.inserted && !inserted" value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                    <Button v-if="!inserted" value="Insert" primary type="button" class="w3-tiny" @trig="insertCase(prop?.id)"/>
                    <Button v-else value="Edit" secondary type="button" class="w3-tiny" @trig="edit(prop.id)"/>
                    
                </template>
            </Datatable> 
			
        </div>
</template>

<script>
import Button from "@/components/elements/Button.vue"
import Datatable from "@/components/parts/Datatable.vue"
import Input from '@/components/elements/Input.vue'
import readExcel from "@/composable/readExcel"
import { getCases, listsCase, addCaseImport, removeCase } from '@/composable/components/Cases'
import { subscribeMutation } from "@/composable/piece/subscribeMutation"

export default {
    data() {
        return {
            inserted: true,
            renderTable: false,
            lists: [],
        }
    },
    computed: {
        table() {
            if(this.inserted) {
                return {
                    heads: ["Tanggal", "Supervisor", "Kabag", "Masalah", "Sumber Masalah", "Diinput"],
                    keys: ["periode2", "spvName", "headName", "masalah", "sumberMasalah", "insert2"],
                    id: "tableCasesInserted"
                }
            }
            return {
                heads: ['Tanggal','Bagian', 'Temuan', 'Karu', 'Kabag', 'Keterangan', 'Keterangan 2'],
                keys: ['periode','bagian', 'temuan', 'karu', 'kabag', 'keterangan1', 'keterangan2'],
                id: "tableCasesImported"
            }
        },
    },
    methods: {
        readExcelFile(e) {
            // bring the loader up
        this.$store.commit("Modal/active", {judul: "", form: "Loader"});

        readExcel(e.target.files[0]).then(async (d) => {
            // insert to idb
            let sheetName = d['sheetNames'][0]
            let sheet = d['sheets'][sheetName]
            let infoRow = sheet["!ref"].split(":")
            let lengthRow = +infoRow[1].match(/\d+/)[0]
            // console.log(sheet)
            for(let i = 1; i <= lengthRow; i++) {
                if(sheet["B"+i]) {
                    await addCaseImport(
                        sheet["E"+i]?.v, sheet["D"+i]?.v, sheet["F"+i]?.v, sheet["J"+i]?.v , sheet["I"+i]?.v , sheet["L"+i]?.v, 
                        sheet["M"+i]?.v , sheet["C"+i]?.w, sheet["G"+i]?.v
                    )
                }
            }
            // close the loader
            this.$store.commit("Modal/active");
            this.renewLists()
            })
        },
        async remove(ev){
            let res = await subscribeMutation(
                '',
                'Confirm',
                {},
                'Modal/tunnelMessage'
            )
            if(res) {
                await removeCase(ev)
                this.renewLists()
            }
        },
        async insertCase(id) {
            let res = await subscribeMutation(
                'Edit cases',
                'CaseInsertForm',
                { parent: id, edit: false },
                'Modal/tunnelMessage'
            )
            if(res) {
                this.renewLists()
            }
        },
        async edit(id) {
            let res = await subscribeMutation(
                'Edit cases',
                'CaseInsertForm',
                { id, edit: true },
                'Modal/tunnelMessage'
            )
            if(res) {
                this.renewLists()
            }
        },
        async renewLists() {
            this.renderTable = false
            this.lists = await listsCase(this.inserted)
            setTimeout(() => {
                this.renderTable = true
            }, 150)
        }
    },
    async mounted() {
        await getCases()
        this.renewLists()
    },
    watch: {
        inserted() {
            this.renewLists()
        }
    },
    components: {
        Button,
        Datatable,
        Input,
        Datatable,
    },
    name: "Cases",
}
</script>