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
import { startImport } from '@/composable/components/ImportActivity'

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
                await startImport(JSON.parse(event.target.result))
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