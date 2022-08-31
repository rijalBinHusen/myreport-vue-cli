<template>
    <div class="w3-margin-top w3-container">
        <br />
        <br />
        <br />
        <div class="w3-row w3-center">
            <div class="w3-col s3" v-for="option in options" :key="option.id">
                <CheckboxVue :value="option.id" :label="option.value" @check="check($event)" />
            </div>
            <br />
            <br />
            <br />
            <ButtonVue primary value="Mulai backup" type="button"/>
        </div>
    </div>
</template>

<script>
import { useStore } from "vuex"
import { storeBackup } from "../../composable/storeBackup"
import { seperateUsers } from "../../composable/storeBackup"
import CheckboxVue from "@/components/elements/Checkbox.vue"
import ButtonVue from "@/components/elements/Button.vue"

export default {
    setup() {
        const store = useStore()
        const handleBackup = async () => {
            // let numberOfUserLogin = window.prompt('Masukkan berapa banyak user yang ingin di backup terpisah')
            // // open the spinner
            // store.commit("Modal/active", { judul: "", form: "Loader" });
            // // trigger and waiting the backup function
            // await storeBackup()
            // // waiting for backup user activity
            // // console.log(numberOfUserLogin)
            // await seperateUsers(+numberOfUserLogin)
            // // close the spinner
            // store.commit("Modal/active");
            
            // jika backup local only
            // jika backup to cloud
            // jika backup all data
            // jika backup user activity 
        }

        const options = [
            { id: 1, value: 'Backup to local only' }, 
            { id: 2, value: 'Backup to cloud' }, 
            { id: 3, value: 'Backup all data'}, 
            { id: 4, value: 'Backup user activity'}
        ]

        checkedOption = []

        const check = (ev) => {
            checkedOption.push(ev)
        }

        return { handleBackup, options, check }
    },
    name: "Backup",
    components: {
        CheckboxVue, ButtonVue
    }
}
</script>