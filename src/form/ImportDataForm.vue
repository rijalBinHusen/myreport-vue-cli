<template>
<form class="w3-container" @submit.prevent="impor">
    <h2>Select store</h2>
    <div class="w3-row w3-margin-bottom w3-border w3-round-large w3-padding w3-padding-16">
        <span v-for="(store) in Object.keys(dataToImport)" :key="store" class="w3-col s3">
            <Checkbox 
                :label="store" 
                @check="selectStore($event)"
                :value="store"
                :checkboxName="store"
            />
        </span>
    </div>
    <div class="w3-row w3-border w3-round-large w3-padding">
        <p class="w3-col s2">Select mode:</p>
        <span class="w3-col s2 w3-margin-top">
            <input type="radio" name="mode" id="write" @click="mode = 'write'" />
            <label for="write"> Write mode</label><br>
        </span>

        <span class="w3-col s3  w3-margin-top">
            <input type="radio" name="mode" id="append" @click="mode = 'append'" />
            <label for="append"> Append mode</label>
        </span>
    </div>
    <p>Total record would be imported: {{ total }} record</p>
    <Button v-if="total > 0 && mode" primary value="Import" type="button"/>
</form>
</template>

<script>
import Checkbox from "@/components/elements/Checkbox.vue"
import Button from "@/components/elements/Button.vue"
import { ref } from '@vue/reactivity'
import { emptyStore, reWriteStoreWithKey, reWrite } from '@/myfunction'
import { onBeforeMount } from '@vue/runtime-core'
import { useStore } from 'vuex'

export default {
    components: {
        Checkbox,
        Button,
    },
    setup() {
        const importLists = ref([])
        const total = ref(0)
        const mode = ref(null)
        const dataToImport = ref({})
        const store = useStore()

        const selectStore = (ev) => {
            if(importLists.value.includes(ev)) {
                importLists.value = importLists.value.filter((val) => val !== ev)
            } else {
                importLists.value.push(ev)
            }
        }

        const impor = async () => {
            // Bring up the loader
            store.commit("Modal/active", {judul: "", form: "Loader"});

            for(let store of importLists.value) {
                //delete the exists store
                await emptyStore(store)

                let doc = []

                for( let datumToImport of dataToImport.value[store]) {
                    
                    if(this.mode === 'write') {
                        doc.push(Object.assign(datumToImport.data, {_key: datumToImport.key })) 
                        //if the end of record
                        if( (i + 1) === dataToImport.value[store].length) {
                            //push to localbase
                            await reWriteStoreWithKey({store: store.toLowerCase(), obj: doc})
                        }
                    } 
                    
                    else {
                        await reWrite(store, datumToImport.key, datumToImport.data)
                    }
                }

                //if the end of the importLists, close the loader
                if((ind + 1) === importLists.value.length) {
                    window.location.reload()
                }
            }
        }

        onBeforeMount(() => {
            console.log(store.getters['Modal/obj'])
        })

        return {
            importLists, total, mode, selectStore, impor, dataToImport
        }
    },
}
</script>