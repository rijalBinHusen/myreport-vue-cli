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
                    :isChecked="checkedOption.includes(option.id)"
                 />
            </div>
            <br />
            <br />
            <br />
            <ButtonVue primary class="mb-3" value="Mulai backup" type="button" @trig="handleBackup"/>
        </div>
        <ButtonVue primary value="Sync data" type="button" @trig="syncAllDataToServer"/>
        <ButtonVue primary value="Resend error sync" type="button" @trig="errorSyncResend"/>
        <ButtonVue primary value="Create dummy activity" type="button" @trig="createDummyActivity"/>
    </div>
</template>

<script>
import { useStore } from "vuex"
import { storeBackup, syncAllDataToServer, syncBasedOnActivity, errorSyncResend, getSummaryData, createDummyActivity } from "./storeBackup"
import CheckboxVue from "@/components/elements/Checkbox.vue"
import ButtonVue from "@/components/elements/Button.vue"
import { ref } from '@vue/reactivity'

export default {
    setup() {
        const store = useStore()
        const handleBackup = async () => {
            // // open the spinner
            store.commit("Modal/active", { judul: "", form: "Loader" });
            // trigger and waiting the backup function
            if(checkedOption.value.includes(3)) {
                await storeBackup(checkedOption.value.includes(2))
            }
            // waiting for backup user activity
            // if(checkedOption.value.includes(4)) {
            //     await seperateUsers(checkedOption.value.includes(2))
            // }
            // // close the spinner
            store.commit("Modal/active");
            // empty the option
            checkedOption.value.length = 0
        }

        const options = [
            { id: 1, value: 'Backup to local only', name: 'mode', }, 
            { id: 2, value: 'Backup to cloud', name: 'mode', }, 
            { id: 3, value: 'Backup all data', name: 'all',}, 
            { id: 4, value: 'Backup user activity', name: 'user',}
        ]

        const checkedOption = ref([])

        // async function tryToLogin () {
        //     let email = window.prompt('Insert your email');
        //     let password = window.prompt('Insert your password');

        //     let reqLogin = await loginToServer(email, password);
            
        //     if(reqLogin?.status === 200 && reqLogin?.ok === true) {
        //         const resp = await reqLogin.json();
        //         setJWTToken(resp.token);
        //     }

        // }

        const getSummary = async () => {
            getSummaryData();
        }

        return { 
            handleBackup, 
            options, 
            checkedOption,
            syncAllDataToServer, 
            syncBasedOnActivity, 
            errorSyncResend, 
            getSummary,
            createDummyActivity
        }
    },
    name: "Backup",
    components: {
        CheckboxVue, ButtonVue
    }
}
</script>