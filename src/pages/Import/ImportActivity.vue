<template>
    <div class="w3-center">
    <input
      class="w3-hide"
      @change.prevent="impor($event)"
      type="file"
      accept=".json"
      ref="importerField"
    />
    <br />
    <br />
    <br />
    <br />
    <br />
         <Button 
            :style="{width: '250px' }" 
            class="" 
            primary value="Importer" 
            type="button" 
            @trig="launchImporter" 
        />
         <Button 
            :style="{width: '250px' }" 
            class="" 
            primary value="Backup" 
            type="button" 
            @trig="getRawDataGrouped" 
        />
  </div>
</template>

<script lang="ts" setup>
import { ref } from '@vue/reactivity'
import { useStore } from "vuex"
import Button from "@/components/elements/Button.vue"
import { getRawDataGrouped } from './ExportImportDatabase'
import { useIdb } from '@/utils/localforage';
import { loaderMessage } from '@/components/parts/Loader/state';

    const store = useStore()
    const importerField = ref(<HTMLElement|null>null)

    const launchImporter = () => {
        if(importerField.value) {

            importerField.value.click()
        }
    }

    const impor =async (ev: Event) => {
        store.commit("Modal/active", {judul: "", form: "Loader"});
        const input = ev.target as HTMLInputElement;

        if(!input.files?.length) return;
        const reader = new FileReader();
        
        reader.readAsText(input.files[0]);

        //when reading is completed load
        reader.onload = async (event) => {

            if(!event.target || !event.target.result || typeof event.target.result !== 'string') return;
            const parsedData = JSON.parse(event.target.result);
            // parsed data should be an object which contain { storeName:  string, data: any[] }, or an array of objects with the same structure
            let isDataOke = parsedData?.storeName && parsedData?.data && parsedData.data.length;
            const isContainArray = typeof parsedData === 'object' && Array.isArray(parsedData);

            if(isContainArray) {
                for(let datum of parsedData) {
                    if(!datum.storeName || !datum.data || !datum.data.length) isDataOke = false;
                }
            }

            if(!isDataOke) {
                alert("Data tidak sesuai")
                return;
            }

            if(isContainArray) {
                for(let datum of parsedData) {
                    await importData(datum.storeName, datum.data);
                }
            } else {
                await importData(parsedData.storeName, parsedData.data);
            }

            // close loader
            store.commit("Modal/active");
        };

    }

    async function importData (storeName: string, data: any[]) {
        
        let index = 1;
            const db = useIdb(storeName);
            for(let datum of data) {
                loaderMessage.value  = `Mengimport data ke ${storeName} (${index} / ${data.length})`;
                await db.setItem(datum?.id, datum)
                loaderMessage.value  = ""
                index++
            }
    }
</script>