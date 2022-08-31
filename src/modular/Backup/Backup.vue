<template>
    <div class="w3-margin-top w3-container">
        <br />
        <br />
        <br />
        <div class="w3-row w3-center">
            <div class="w3-col s3" v-for="option in options" :key="option.id">
                <CheckboxVue 
                    :checkboxName="option.name" 
                    :value="option.id" 
                    :label="option.value"
                    @check="checkedOption.push($event)"
                 />
            </div>
            <br />
            <br />
            <br />
            <ButtonVue primary value="Mulai backup" type="button" @trig="handleBackup"/>
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
            // // open the spinner
            store.commit("Modal/active", { judul: "", form: "Loader" });
            // trigger and waiting the backup function
            if(checkedOption.includes(3)) {
                await storeBackup(checkedOption.includes(2))
            }
            // waiting for backup user activity
            if(checkedOption.includes(4)) {
                let numberOfUserLogin = window.prompt('Masukkan berapa banyak user yang ingin di backup terpisah')
                await seperateUsers(+numberOfUserLogin, checkedOption.includes(2))
            }
            // // close the spinner
            store.commit("Modal/active");
            // empty the option
            checkedOption = []
        }

        const options = [
            { id: 1, value: 'Backup to local only', name: 'mode', }, 
            { id: 2, value: 'Backup to cloud', name: 'mode', }, 
            { id: 3, value: 'Backup all data', name: 'all',}, 
            { id: 4, value: 'Backup user activity', name: 'user',}
        ]

        const checkedOption = []

        return { handleBackup, options, checkedOption }
    },
    name: "Backup",
    components: {
        CheckboxVue, ButtonVue
    }
}
</script>