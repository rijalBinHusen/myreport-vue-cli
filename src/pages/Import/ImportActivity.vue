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
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useStore } from "vuex"
import Button from "@/components/elements/Button.vue"
import { startImport } from './ImportActivity'
import { useIdb } from '@/utils/localforage';
import { loaderMessage } from '@/components/parts/Loader/state';

export default {
    components: { Button },
    setup() {
        const store = useStore()
        const importerField = ref(null)

        const launchImporter = () => {
            importerField.value.click()
        }

        const impor =async (ev) => {
            store.commit("Modal/active", {judul: "", form: "Loader"});

            const reader = new FileReader();
            
            reader.readAsText(ev.target.files[0]);

            //when reading is completed load
            reader.onload = async (event) => {
                const parsedData = JSON.parse(event.target.result);
                const isDataOke = parsedData?.storeName && parsedData?.data && parsedData.data.length;
                if(!isDataOke) {
                    alert("Data tidak sesuai")
                    return; 
                }

                let index = 1;
                const db = useIdb(parsedData.storeName);
                for(let datum of parsedData.data) {
                    loaderMessage.value  = `Mengimport data ke ${parsedData.storeName} (${index} / ${parsedData.data.length})`;
                    await db.setItem(datum?.id, datum)
                    loaderMessage.value  = ""
                    index++
                }
                // close loader
                store.commit("Modal/active")
            };

        }

        return {
            importerField, launchImporter, impor
        }
        
    }
}
</script>