<template>

  <button-vue
    primary 
    value="Send to firebase" 
    type="button" 
    @trig="syncData"
  />

  <button-vue
    primary 
    value="Dialog" 
    type="button" 
    @trig="handleToDialog"
  />

</template>

<script>
import ButtonVue from '../elements/Button.vue'
import { useStore } from 'vuex'
import storeSyncData from "../../composable/storeSyncData"
import { onUnmounted } from '@vue/runtime-core'

export default {
    setup() {
        const store = useStore()

        const syncData = async () => {
          store.commit("Modal/active", {judul: "", form: "Loader"});
            await storeSyncData()
            store.commit("Modal/active")
        }

        const handleToDialog = () => {
          // Launch the modal, and the confirmation component
          store.commit("Modal/active", {judul: "", form: "Confirm"})
          // initiate the subscribe store
          let unsubscribe;
          // set as a promise
          const prom = new Promise(resolve => {
            // fill the subscribe store
            unsubscribe = store.subscribe((mutation) => {
              // if the confirmation button clicked whatever yes or no
              if(mutation?.type == 'Modal/tunnelMessage') {
                // resolve the messaage, true or false
                resolve(mutation?.payload)
              }
            })

          })
          // if the promise fullfilled
          prom.then((val) => {
            // unsubscribe the vuex
            unsubscribe()
            // close the modal
            store.commit("Modal/active")
            // do your function here .........
            console.log(val)
          })
        }

        return { syncData, handleToDialog }
    },
    components: {
        ButtonVue
    },
}
</script>

<style>

</style>