<template>
<form @submit.prevent="send">
    <label>Masukkan nama</label>
    <Select 
    :options="names" 
    value="id"
    text="name"
    @selected="collect.name = $event"
    />

    <Input label="Periode" type="date" placeholder="jumlah" @inp="collect.periode = $event" />

    <Button
    primary 
    v-if="collect.name && collect.periode"
    class="w3-margin-top" 
    value="Tambah" 
    type="button"
   />

</form>

</template>

<script>
import Select from "../elements/Select.vue"
import Input from "../elements/Input.vue"
import Button from "../elements/Button.vue"

export default {
    name: "CollectForm",
    data() {
        return {
            collect: {
                name: "",
                periode: "",
            }
        }
    },
    methods: {
        async send(){
            if(this.collect.name) {
                if(this.collect.name === "semua") {
                    // ambil semua nama
                    let allName = this.$store.getters["Name/enabled"]
                    // iterate semua nama satu satu
                    for(let i=0; i < allName.length; i++) {
                        // tunggu sampai append selesai
                        await this.$store.dispatch("append", {
                            store: "Uncollected",
                            id: this.$store.state.Uncollected.lists.length > 0 
                            ? this.$store.state.Uncollected.lists[0]["id"]
                            : "unc22030000",
                            obj: {name: allName[i].id, periode: this.collect.periode}
                        })
                    }
                } else {
                    this.$store.dispatch("append", {
                            store: "Uncollected",
                            id: this.$store.state.Uncollected.lists.length > 0 
                            ? this.$store.state.Uncollected.lists[0]["id"]
                            : "unc22030000",
                            obj: Object.assign({}, this.collect)
                        })
                }
                
                this.$store.commit("Modal/active")
            }
        }
    },
    components: {
        Input,
        Select,
        Button
    },
    computed: {
        names() {
            // ambil semua nama dari state
            let options = Array.from(this.$store.state.Name.lists)
            // tambahkan option lain
            options.unshift({id: "semua", name: "Semua SPV" })
            options.unshift({id: "", name: "Pilih nama" })
            // kembalikan agar tidak reactive
            return JSON.parse(JSON.stringify(options))
        }
    }
}
</script>