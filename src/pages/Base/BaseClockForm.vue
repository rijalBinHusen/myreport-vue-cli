<template>
    <div>
        <form @submit.prevent="send">
            <Input label="Masukkan nomor DO" placeholder="Nomor DO" type="text" @inp="noDo = $event" />
            <Input label="Masukkan Jam register" placeholder="Register" type="text" @inp="reg = $event" />
            <Input label="Masukkan Jam mulai" placeholder="Start" type="text" @inp="start = $event" />
            <Input label="Masukkan Jam selesai" placeholder="Finish" type="text" @inp="finish = $event" />
            <Input label="Masukkan Jumlah istirahat" placeholder="break" type="number" @inp="rehat = +$event" />
            <Button 
                value="Submit" 
                class="w3-right w3-margin-top"
                type="button" 
                primary
                :nomargin="true"
            />
        </form>
    </div>
</template>

<script>
import Input from "@/components/elements/Input.vue"
import Button from "@/components/elements/Button.vue"
import { appendData } from '@/pages/BaseReport/BaseReportClock'
import { ref, onMounted } from "vue"
import { useStore } from "vuex"
export default {
    setup() {
        const store = useStore()
        const noDo = ref('')
        const reg = ref('')
        const start = ref('')
        const finish = ref('')
        const rehat = ref('')
        const obj = ref({})

        const send = async () => {
            await appendData(
                obj.value?.parent, 
                obj.value?.shift, 
                noDo.value,
                reg.value,
                start.value,
                finish.value,
                rehat.value
            )
            store.commit('Modal/tunnelMessage', true)
            store.commit("Modal/active");
        }

        onMounted(() => {
            obj.value = store.getters['Modal/obj']?.obj
        })

        return {
            noDo, reg, start, finish, rehat, send
        }
    },
    components: {
        Input,
        Button,
    },
}
</script>@/pages/BaseReport/BaseReportClock