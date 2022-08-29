<template>
    <div>
        <form @submit.prevent="kirim">
            <Input label="Masukkan nomor DO" placeholder="Nomor DO" type="text" @inp="clock.noDo = $event" />
            <Input label="Masukkan Jam register" placeholder="Register" type="text" @inp="clock.reg = $event" />
            <Input label="Masukkan Jam mulai" placeholder="Start" type="text" @inp="clock.start = $event" />
            <Input label="Masukkan Jam selesai" placeholder="Finish" type="text" @inp="clock.finish = $event" />
            <Input label="Masukkan Jumlah istirahat" placeholder="break" type="number" @inp="clock.rehat = +$event" />
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
import Input from "../../components/elements/Input.vue"
import Button from "../../components/elements/Button.vue"
export default {
    methods: {
        kirim() {
            this.$store.dispatch("append", {
                        store: "BaseReportClock",
                        obj: { ...this.clock, ...this.$store.state.Modal.more.addOn },
                    })
            this.$store.commit("Modal/active");
        }
    },
    data() {
        return {
            clock: {
            noDo: null,
            reg: null,
            start: null,
            finish: null,
            rehat: null,
            }
        }
    },
    components: {
        Input,
        Button,
    },
    name: "BaseClockForm"
}
</script>