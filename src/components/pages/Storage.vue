<template>

  <button-vue
    primary 
    value="Create logs starter" 
    type="button" 
    @trig="createLog"
  />

  
  <button-vue
    primary 
    value="Send to firebase" 
    type="button" 
    @trig="syncData"
  />

</template>

<script>
import ButtonVue from '../elements/Button.vue'
import createLogsFromScratch from "../../composable/createLogsFromScratch"
import { useStore } from 'vuex'
import storeSyncData from "../../composable/storeSyncData"

export default {
    setup() {
        const store = useStore()

        const createLog = async () => {
            // Bring up the loader
            store.commit("Modal/active", {judul: "", form: "Loader"});
            await createLogsFromScratch()
            store.commit("Modal/active")
        }

        const syncData = async () => {
            store.commit("Modal/active", {judul: "", form: "Loader"});
            await storeSyncData()
            store.commit("Modal/active")
        }

        return { createLog, syncData }
    },
    components: {
        ButtonVue
    },
}
</script>

<style>

</style>