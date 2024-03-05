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
            @change.prevent="readJSONFile($event)"
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
    import { ref } from "vue"
    import { loader, modalClose } from "@/composable/piece/vuexModalLauncher"
    import { ExpiredDate, expiredDateJSON } from "./DateExpired";
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
    
    function readJSONFile(e: Event) {
        const fileInput = e.target as HTMLInputElement;
        // bring the loader up
        loader()

        const reader = new FileReader();
        if(fileInput.files && fileInput.files[0] == null) return;
        // @ts-ignore
        reader.readAsText(fileInput.files[0]);
        // on text loaded
        reader.onload = (event) => {
            if(event.target && event.target.result){
                // @ts-ignore
                startImport(JSON.parse(event.target.result))
            }
        };
    };

    async function startImport (records: expiredDateJSON[]) {
        for(let record of records) {

            let warehouseId = await getWarehouseByCustomMapped(record.gudang);
            if(!warehouseId) {
               const getWarehouse = await selectWarehouse(record.gudang);
               if(getWarehouse) {
                    warehouseId = getWarehouse;
                    await createCustomWarehouse(record.gudang, warehouseId);
                }
                else {
                    alert("Record tidak di input, Gudang tidak dipilih");
                    continue
                }
            }

            await addExpiredDate(record.no_do, 
                                    record.date_transaction, 
                                    record.shift + '',
                                    record.item_kode, 
                                    record.item_name, 
                                    record.date_expired, 
                                    record.mulai_muat, 
                                    record.selesai_muat, 
                                    warehouseId,
                                    record.tally,
                                    record.karu,
                                    record.qty + '',
                                    record.no_pol,
                                    record.catatan,
                                    record.gudang
                                    )
            
        }

        // close the loader
        modalClose()
    }

    const warehuseNameToSet = ref("");
    async function selectWarehouse(yourWarehouseName: string): Promise<string> {

        currentForm.value = "chooseWarehouse";
        isModalActive.value = true;
        modalTitle.value = `Pilih id gudang`;
        warehuseNameToSet.value = yourWarehouseName;

        const choosedWarehouseId = await eventSubscribeEmit.waitForEvent("warehouseSetted");
        return choosedWarehouseId
    }
    async function setWarehouse(params: { warehouseName: string, warehouseId: string }) {
        eventSubscribeEmit.emit("warehouseSetted", params.warehouseId);
    }
</script>