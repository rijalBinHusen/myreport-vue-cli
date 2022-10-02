<template>
      <div class="w3-padding-48 w3-center">
          <h4>
                {{ 
                    obj?.pesan || 'Apakah anda yakin akan menghapusnya' 
                }}
            </h4>
          <div class="w3-section" v-if="!obj?.isAlert">
            <Button
                primary
                value="Iya" 
                type="button"
                @trig="$store.commit('Modal/tunnelMessage', true)"
            />
            
            <Button
                danger
                value="Tidak" 
                type="button"
                @trig="$store.commit('Modal/tunnelMessage', false)"
            />
          </div>
      </div>
</template>

<script>
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import Button from "../elements/Button.vue"

export default {
    setup() {
        const store = useStore()
        const obj = store.getters["Modal/obj"]?.obj

        const keyDown = (e) => {
            // if enter
            if(e.keyCode == 13) {
                // klick the true button
                store.commit('Modal/tunnelMessage', true)
                store.commit('Modal/active')
            }
            e.preventDefault()
        }
 
        onBeforeMount(() => {
            window.addEventListener("keydown", keyDown)
        })

        onBeforeUnmount(() => {
            window.removeEventListener("keydown", keyDown)
        })
        return { obj }
    },
    components: {
        Button
    },
};
</script>