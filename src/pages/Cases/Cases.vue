<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="launchFileImporter" type="button"/>
        <Button primary :class="['w3-right', isInsertMode ? '' : 'w3-disabled']" value="Imported" @trig="listsMode = 'import';" type="button"/>
        <Button primary :class="['w3-right', isInsertMode ? 'w3-disabled' : '']" value="Cases" @trig="listsMode = 'insert'" type="button"/>
        <input
            class="w3-hide"
            @change.prevent="readExcelFile($event)"
            type="file"
            ref="importerCase"
            accept=".xls, .ods"
        />
    </div>

    <Datatable
        :datanya="lists"
        :heads="tables.heads"
        :keys="tables?.keys"
        option
        :id="tables?.id"
    >
    
        <template #default="{ prop }">

            <Button v-if="!prop?.inserted && !isInsertMode" value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
            <Button v-if="!isInsertMode" value="Insert" primary type="button" class="w3-tiny" @trig="insertCase(prop?.id)"/>
            <Button v-else value="Edit" secondary type="button" class="w3-tiny" @trig="edit(prop.id)"/>
            
        </template>

    </Datatable> 
    
</div>
</template>

<script lang="ts" setup>
    import Button from "@/components/elements/Button.vue"
    import Datatable from "@/components/parts/Datatable.vue"
    import Input from '@/components/elements/Input.vue'
    import readExcel from "@/utils/readExcel"
    import { Cases, lists as listsCaseInserted, listsCaseImport } from './Cases'
    import { subscribeMutation } from "@/composable/piece/subscribeMutation"
    import { computed, onMounted, ref } from "vue"
    import { loader, modalClose } from "@/composable/piece/vuexModalLauncher"
    const { getCases, addCaseImport, removeCase } = Cases()

    const  importerCase = ref()

    const launchFileImporter = () => {
        importerCase.value.click();
    }

    const listsMode = ref(<'insert'|'import'>"insert");

    const isInsertMode = computed(() => listsMode.value === 'insert')

    const lists = computed(() => 
        isInsertMode.value
        ? listsCaseInserted.value
        : listsCaseImport.value
    );

    const tables = computed(() =>
        isInsertMode.value
        ? {
            heads: ["Tanggal", "Supervisor", "Kabag", "Masalah", "Sumber Masalah", "Diinput"],
            keys: ["periode2", "spvName", "headName", "masalah", "sumberMasalah", "insert2"],
            id: "tableCasesInserted"
        }
        : {
            heads: ['Tanggal','Bagian', 'Temuan', 'Karu', 'Kabag', 'Keterangan', 'Keterangan 2'],
            keys: ['periode','bagian', 'temuan', 'karu', 'kabag', 'keterangan1', 'keterangan2'],
            id: "tableCasesImported"
        }
    );
    
    function readExcelFile(e: Event) {
        const fileInput = e.target as HTMLInputElement;
        // bring the loader up
        loader()
        if(fileInput.files)
        readExcel(fileInput.files[0]).then(async (d) => {
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
        modalClose()
        })
    };
        
    async function remove(ev: string) {
        let res = await subscribeMutation(
            '',
            'Confirm',
            {},
            'Modal/tunnelMessage'
        )
        if(res) {
            await removeCase(ev)
        }
    }
     
    async function insertCase(id: string) {
        subscribeMutation(
            'Edit cases',
            'CaseInsertForm',
            { parent: id, edit: false },
            'Modal/tunnelMessage'
        )
    }
    async function  edit(id: string) {
        subscribeMutation(
            'Edit cases',
            'CaseInsertForm',
            { id, edit: true },
            'Modal/tunnelMessage'
        )
    }
    
    onMounted( async () => {
        
        await getCases()

    })
</script>