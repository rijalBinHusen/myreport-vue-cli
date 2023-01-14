<template>
<form class="w3-container" @submit.prevent="impor">
    <h2>Select store</h2>
    <div class="w3-row w3-margin-bottom w3-border w3-round-large w3-padding w3-padding-16">
        <span v-for="(store) in importLists" :key="store" class="w3-col s3">
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
import { deleteCollection, reWriteStoreWithKey, write, tunggu } from '@/myfunction'
import { onBeforeMount } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { subscribeMutation } from "@/composable/piece/subscribeMutation"
import { setMessageLoader } from "../composable/piece/vuexModalLauncher"

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
        const importListsPicked = ref([])

        const selectStore = (ev) => {
            if(importListsPicked.value.includes(ev)) {
                importListsPicked.value = importListsPicked.value.filter((val) => val !== ev)
                total.value -= dataToImport.value[ev].length
            } else {
                importListsPicked.value.push(ev)
                total.value += dataToImport.value[ev].length
            }
        }

        const impor = async () => {
            // Bring up the loader
            store.commit("Modal/active", {judul: "", form: "Loader"});

            for(let store of importListsPicked.value) {
                //delete the exists store
                await deleteCollection(store)
                // wait for 3 second to make sure that the proces finished
                await tunggu(600)

                let doc = []

                for(let datumToImport of dataToImport.value[store]) {
                    setMessageLoader(`Writing ${total.value} record remaining!`)
                    // total - 1
                    total.value = total.value - 1
                    if(mode.value === 'write') {
                        doc.push(JSON.parse(JSON.stringify({ ...datumToImport.data, _key: datumToImport.key })))
                        //if the end of record
                        if( doc.length === dataToImport.value[store].length) {
                            //push to localbase
                            await reWriteStoreWithKey(store, doc)
                        }
                    } 
                    
                    else {
                        let singleData = JSON.parse(JSON.stringify(datumToImport))
                        await write(store, singleData.key, singleData.data)
                    }   
                    
                }
                //if the end of the importLists, close the loader
                if(store == importListsPicked.value.slice(-1).toString()) {
                    let res = await subscribeMutation(
                                    '', 
                                    'Confirm', 
                                    { pesan: 'Proses import sudah selesai mohon pastikan tidak ada error di console'}, 
                                    'Modal/tunnelMessage'
                                )
                    if(res) {
                        // await tunggu(1500)
                        window.location.reload()
                    }
                }
            }
        }
            
        onBeforeMount(() => {
            dataToImport.value = JSON.parse(JSON.stringify(store.getters['Modal/obj']?.obj))
            importLists.value = Object.keys(dataToImport.value)
        })

        return {
            importListsPicked, importLists, total, mode, selectStore, impor, dataToImport
        }
    }
}

</script>