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
    import { subscribeMutation } from "@/composable/piece/subscribeMutation"
    import { ref } from "vue"
    import { loader, modalClose } from "@/composable/piece/vuexModalLauncher"
    import { ExpiredDate } from "./DateExpired";
    

    const { addExpiredDate, getWarehouseByCustomMapped, createCustomWarehouse } = ExpiredDate();
    const  importerCase = ref()

    const launchFileImporter = () => {
        importerCase.value.click();
    }
    
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
            if(!sheet["B"+i]) continue;

            const date_transaction = sheet["A"+i];
            const no_do = sheet["B"+i];
            const no_pol = sheet["C"+i];
            const gudang = sheet["D"+i];
            const shift = sheet["E"+i];
            const mulai_muat = sheet["F"+i];
            const selesai_muat = sheet["G"+i];
            const item_kode = sheet["H"+i];
            const item_name = sheet["I"+i];
            const qty = sheet["J"+i];
            const date_expired = sheet["K"+i];
            const tally = sheet["L"+i];
            const karu = sheet["M"+i];
            const catatan = sheet["N"+i];

            let warehouseId = await getWarehouseByCustomMapped(gudang);
            if(!warehouseId) {
               const getWarehouse = await selectWarehouse(gudang);
               if(getWarehouse) {
                    warehouseId = getWarehouse;
                    await createCustomWarehouse(gudang, warehouseId);
                }
                else {
                    alert("Record tidak di input, Gudang tidak dipilih");
                    continue
                }
            }

            await addExpiredDate(no_do, 
                                    date_transaction, 
                                    Number(shift), 
                                    item_kode, 
                                    item_name, 
                                    date_expired, 
                                    mulai_muat, 
                                    selesai_muat, 
                                    warehouseId,
                                    tally,
                                    karu,
                                    Number(qty),
                                    no_pol,
                                    catatan,
                                    gudang
                                    )
            
        }

        // close the loader
        modalClose()
        })
    };

    async function selectWarehouse(yourWarehouseName: string): Promise<string|undefined> {

        alert("Function not implemented");
        return;
    }
        
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
</script>