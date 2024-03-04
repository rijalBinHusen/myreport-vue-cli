<template>
<div class="">
    <div class="w3-border w3-padding w3-container">
        <label>Set record to show : </label>
        <Button primary value="Set" type="button" />
        <Button primary class="w3-right" value="Import" @trig="launchFileImporter" type="button"/>
        <!-- <Button primary :class="['w3-right', isInsertMode ? '' : 'w3-disabled']" value="Imported" @trig="listsMode = 'import';" type="button"/>
        <Button primary :class="['w3-right', isInsertMode ? 'w3-disabled' : '']" value="Cases" @trig="listsMode = 'insert'" type="button"/> -->
        <input
            class="w3-hide"
            @change.prevent="readExcelFile($event)"
            type="file"
            ref="importerExpiredDate"
            accept=".xls, .ods"
        />
    </div>

    <!-- <Datatable
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

    </Datatable>  -->

    <ModalSlot 
        :isActive="isModalActive"
        :judul="modalTitle"
    >
        <CustomWarehouseChoose 
            v-if="currentForm = 'chooseWarehouse'"
            :warehouseName="warehuseNameToSet"
            @warehouseSetted="setWarehouse($event)"
        />
    </ModalSlot>
    
</div>
</template>

<script lang="ts" setup>
    import Button from "@/components/elements/Button.vue"
    import Datatable from "@/components/parts/Datatable.vue"
    import Input from '@/components/elements/Input.vue'
    import readExcel from "@/utils/readExcel"
    import { ref } from "vue"
    import { loader, modalClose } from "@/composable/piece/vuexModalLauncher"
    import { ExpiredDate } from "./DateExpired";
    import ModalSlot from "@/components/parts/ModalSlot.vue"
    import CustomWarehouseChoose from "./CustomWarehouseChoose.vue"
    import EventEmitter from "../../utils/EventEmitter";
    
    const eventSubscribeEmit = new EventEmitter();
    const importerExpiredDate = ref();
    const isModalActive = ref(false);
    const modalTitle = ref("");
    const form = {
        chooseWarehouse: CustomWarehouseChoose
    }
    const currentForm = ref(<keyof typeof form>"");
    
    const { addExpiredDate, getWarehouseByCustomMapped, createCustomWarehouse } = ExpiredDate();

    const launchFileImporter = () => {
        importerExpiredDate.value.click();
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
        
        const rowHeader = <{column: string, text: string}[]>[];

        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const column = letter + 0;
            if(sheet[column].v) {
                rowHeader.push({
                    column: letter, text: sheet[column].v
                })
            }
        }

        const keyValuePairedColumn = await setKeyValuePaired(rowHeader);

        // console.log(sheet)
        for(let i = 1; i <= lengthRow; i++) {
            if(!sheet["B"+i].v) continue;

            const date_transaction = sheet["A"+i].v;
            const no_do = sheet["B"+i].v;
            const no_pol = sheet["C"+i].v;
            const gudang = sheet["D"+i].v;
            const shift = sheet["E"+i].v;
            const mulai_muat = sheet["F"+i].v;
            const selesai_muat = sheet["G"+i].v;
            const item_kode = sheet["H"+i].v;
            const item_name = sheet["I"+i].v;
            const qty = sheet["J"+i].v;
            const date_expired = sheet["K"+i].v;
            const tally = sheet["L"+i].v;
            const karu = sheet["M"+i].v;
            const catatan = sheet["N"+i].v;

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
                                    shift,
                                    item_kode, 
                                    item_name, 
                                    date_expired, 
                                    mulai_muat, 
                                    selesai_muat, 
                                    warehouseId,
                                    tally,
                                    karu,
                                    qty,
                                    no_pol,
                                    catatan,
                                    gudang
                                    )
            
        }

        // close the loader
        modalClose()
        })
    };

    const warehuseNameToSet = ref("");
    async function selectWarehouse(yourWarehouseName: string): Promise<string> {

        currentForm.value = "chooseWarehouse";
        isModalActive.value = true;
        modalTitle.value = `Pilih id gudang`;
        warehuseNameToSet.value = yourWarehouseName;

        const subscribeEventWhileWarehouseSetted = await eventSubscribeEmit.waitForEvent("warehouseSetted");
        return subscribeEventWhileWarehouseSetted
    }
    async function setWarehouse(params: { warehouseName: string, warehouseId: string }) {
        eventSubscribeEmit.emit("warehouseSetted", params.warehouseId);
    }

    async function setKeyValuePaired(excelColumn: { column: string, text: string }[]) {

        const keyValuPaired = [
            
        ]

        const columnToSet = [

        ]
        // the place to set what column will tighly to each value
        // e.g no_do = A, date_transaction = B
        // const a = {

        //     id?: string,
        //     no_do: string,
        //     date_transaction: string,
        //     shift: number,
        //     item_kode: string,
        //     item_name: string,
        //     date_expired: string
        //     mulai_muat: string
        //     selesai_muat: string,
        //     idWarehouse: string
        //     tally: string
        //     karu: string
        //     qty: number
        //     no_pol: string
        //     catatan: string
        //     gudang_csv: string
        // }
    }
        
    // async function remove(ev: string) {
    //     let res = await subscribeMutation(
    //         '',
    //         'Confirm',
    //         {},
    //         'Modal/tunnelMessage'
    //     )
    //     if(res) {
    //         await removeCase(ev)
    //     }
    // }
     
    // async function insertCase(id: string) {
    //     subscribeMutation(
    //         'Edit cases',
    //         'CaseInsertForm',
    //         { parent: id, edit: false },
    //         'Modal/tunnelMessage'
    //     )
    // }
    
    // async function  edit(id: string) {
    //     subscribeMutation(
    //         'Edit cases',
    //         'CaseInsertForm',
    //         { id, edit: true },
    //         'Modal/tunnelMessage'
    //     )
    // }
</script>