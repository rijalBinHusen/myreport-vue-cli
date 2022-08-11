<template>
      <div class="w3-padding-48 w3-center">
          <h4>
                {{ 
                    obj?.pesan || 'Apakah anda yakin akan menghapusnya' 
                }}
            </h4>
          <div class="w3-section">
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
import { useStore } from 'vuex';
import Button from "../elements/Button.vue"

export default {
    setup() {
        const store = useStore()

        const obj = store.getters["Modal/obj"]

        return { obj }
    },
    components: {
        Button
    },
};
</script>