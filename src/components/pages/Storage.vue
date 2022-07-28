<template>
  <button-vue
    primary 
    value="Create logs starter" 
    type="button" 
    @trig="createLog"
  >
    </button-vue>
</template>

<script>
import ButtonVue from '../elements/Button.vue'
import createLogsFromScratch from "../../composable/createLogsFromScratch"
import { useStore } from 'vuex'

export default {
    setup() {
        const store = useStore()

        const createLog = async () => {
            // Bring up the loader
            store.commit("Modal/active", {judul: "", form: "Loader"});
            await createLogsFromScratch()
            store.commit("Modal/active")
        }

        return { createLog }
    },
    components: {
        ButtonVue
    },
}
</script>

<style>

</style>