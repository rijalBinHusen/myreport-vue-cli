<template>
    <div>
        <form @submit.prevent="kirim">
            <label>Masukkan kode item</label>
            <InputItem @chose="stock.item = $event" placeholder="Kode item" class="w3-input w3-border w3-margin-top" />
            <Input label="Masukkan Awal" placeholder="Stock awal" type="number" @inp="stock.awal = +$event" />
            <Input label="Masukkan Masuk" placeholder="Masuk" type="number" @inp="stock.in = +$event" />
            <Input label="Masukkan Keluar" placeholder="Keluar" type="number" @inp="stock.out = +$event" />
            <Input label="Masukkan Real" placeholder="Real" type="number" @inp="stock.real = +$event" />
            <Button 
                v-if="stock.item"
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
import { uid } from "uid"
import Button from "../../components/elements/Button.vue"
import InputItem from "./InputItem.vue"

export default {
    methods: {
        kirim() {
            let objToSend = JSON.parse(JSON.stringify(
                Object.assign(  this.stock, 
                                this.$store.state.Modal.more.addOn, 
                                {id: uid(6)}
                            )
                ))
            delete objToSend.period
            this.$store.dispatch("append", {
                        store: "BaseReportStock",
                        obj: objToSend,
                        period: this.$store.state.Modal.more.period
                    })
            this.$store.commit("Modal/active");
        }
    },
    data() {
        return {
            stock: {
            item: null,
            awal: null,
            in: null,
            out: null,
            real: null,
            }
        }
    },
    components: {
        Input,
        Button,
        InputItem,
    },
    name: "BaseStockForm"
}
</script>