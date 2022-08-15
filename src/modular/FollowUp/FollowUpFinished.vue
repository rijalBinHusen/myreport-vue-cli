<template>
  <div class="w3-margin">
    <div class="w3-row" >
        {{ record?.pesan }}
    </div>
    <div class="w3-row w3-margin-top w3-margin-bottom">
        <p class="w3-large w3-text-black">
            Balasan:
        </p>
        <textarea v-model="answer" style="width:100%;" rows="7"></textarea>
    </div>
    <Button primary value="Submit" type="button" @trig="handleSubmit"/>
  </div>
</template>

<script>
import { onMounted, ref } from '@vue/runtime-core'
import { useStore } from 'vuex'
import Button from '../../components/elements/Button.vue'
import { markAsFinished } from "../../composable/components/followUp"

export default {
    components: { Button },
    setup() {
        const store = useStore()
        const record = ref(null)
        const answer = ref(null)


        const handleSubmit = () => {
            // console.log(record?.value?.id)
            // mark as finish record
            markAsFinished(record?.value?.id, answer.value)
            // close the modal
            store.commit('Modal/active')
        }

        onMounted(() => {
            record.value = store.getters['Modal/obj']?.obj
        })

        return { record, answer, handleSubmit }
    }
}
</script>

<style>

</style>