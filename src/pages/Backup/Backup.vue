<template>
    <div class="w3-margin-top w3-container">
        <br />
        <br />
        <br />
        <div class="w3-row w3-center">
            <div class="w3-col s3" v-for="option in options" :key="option.id">
                <CheckboxVue 
                    :checkboxName="option.id" 
                    :value="option.id" 
                    :label="option.value"
                    @check="toggleCheckOptions"
                    :isChecked="checkedOptions.includes(option.id)"
                 />
            </div>
            <br />
            <br />
            <br />
            <!-- <ButtonVue primary class="mb-3" value="Mulai backup" type="button" @trig="handleBackup"/> -->
            <ButtonVue primary value="Sync data" type="button" @trig="syncCheckedStoreName"/>
        </div>
        <ButtonVue primary value="Resend error sync" type="button" @trig="errorSyncResend"/>
        <ButtonVue primary value="Create dummy activity" type="button" @trig="createDummyActivity"/>
        <!-- <ButtonVue primary value="Fix parent document" type="button" @trig="fixAllParentDocumentBaseStock"/> -->
    </div>
</template>

<script>
import { useStore } from "vuex"
import { storeBackup, syncAllDataToServer, syncBasedOnActivity, errorSyncResend, getSummaryData, createDummyActivity, fixAllParentDocumentBaseStock } from "./storeBackup"
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
            if(checkedOptions.includes(3)) {
                await storeBackup(checkedOptions.includes(2))
            }
            // waiting for backup user activity
            // if(checkedOptions.includes(4)) {
            //     await seperateUsers(checkedOptions.includes(2))
            // }
            // // close the spinner
            store.commit("Modal/active");
            // empty the option
            checkedOptions.length = 0
        }

        const options = [
            {id: 'baseitem', value: 'Item'}, 
            {id: 'basereportclock', value: 'Base report clock'}, 
            {id: 'basereportfile', value: 'Base report file'},
            {id: 'basereportstock', value: 'Base report stock'}, 
            {id:'cases', value: 'Kasus'}, 
            {id: 'complains', value: 'Komplain'}, 
            {id: 'document', value: 'Dokumen'},
            {id: 'fieldproblem',  value: 'Kendala lapangan'},
            {id: 'headspv',  value: 'Kepala bagian'},
            {id: 'problem',  value: 'Problem report'},
            {id: 'supervisors',  value: 'Supervisor'},
            {id: 'warehouses', value: 'Gudang'},
        ]

        const checkedOptions = ref([])

        function toggleCheckOptions (storeName) {

            let findIndex = checkedOptions.value.indexOf(storeName);
            let isExists = findIndex > -1;

            if(isExists) {

                checkedOptions.value.splice(findIndex, 1)

            } else {

                checkedOptions.value.push(storeName);

            }
        }
        
        async function syncCheckedStoreName () {
            let noCheckedStoreName = checkedOptions.value.length === 0

            if(noCheckedStoreName) return;
            
            await syncAllDataToServer(checkedOptions.value)
        }

        const getSummary = async () => {
            getSummaryData();
        }

        return { 
            handleBackup, 
            options, 
            checkedOptions,
            toggleCheckOptions,
            syncCheckedStoreName, 
            syncBasedOnActivity, 
            errorSyncResend, 
            getSummary,
            createDummyActivity,
            fixAllParentDocumentBaseStock
        }
    },
    name: "Backup",
    components: {
        CheckboxVue, ButtonVue
    }
}
</script>