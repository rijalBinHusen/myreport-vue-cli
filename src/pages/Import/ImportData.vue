<template>
    <div>
    <br />
    <br />
    <br />
    <br />
    <br />
        <div class="w3-col s3" v-for="option in options" :key="option.id">
            <CheckboxVue 
                :checkboxName="option.id" 
                :value="option.id" 
                :label="option.value"
                @check="toggleCheckOptions"
                :isChecked="checkedOptions.includes(option.id)"
            />
        </div>
         <Button 
            :style="{width: '250px' }" 
            class="" 
            primary value="Importer" 
            type="button" 
            @trig="launchImporter" 
        />
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useStore } from "vuex"
import Button from "@/components/elements/Button.vue"
import DatePicker from "vue3-datepicker";
import { subscribeMutation } from '@/composable/piece/subscribeMutation';
import { implantAllComplainsFromServer } from '../Complains/Complains';
import { implantItemsFromServer } from '../BaseItem/GetBaseItemFromServer';
import { implantBaseFileFromServer } from '../BaseReport/BaseReportFile';
import { implantAllCasesFromServer } from '../Cases/Cases';
import { implantDocumentsFromServer } from '../Documents/DocumentsPeriod';
import { implantProblemsFromServer } from '../Problems/Problem';
import { implantHeadSPVFromServer } from "../Headspv/ImplantHeadSpv"
import { implantSupervisorFromServer } from '../Supervisors/Supervisors';
import { implantWarehouseFromServer } from '../Warehouses/Warehouses';
import { implantFieldProblemsFromServer } from "../FieldProblems/ImplantFieldProblem"
import { ymdTime } from '@/composable/piece/dateFormat';
import { loader, modalClose } from '@/composable/piece/vuexModalLauncher';
import { implantUsersFromServer } from '../Login/users';
import CheckboxVue from '@/components/elements/Checkbox.vue';

export default {
    components: { Button, DatePicker, CheckboxVue },
    setup() {
        const store = useStore()
        const importerField = ref(null)

        const options = [
            {id: 'baseitem', value: 'Item'}, 
            {id: 'basereportfile', value: 'Base report file'},
            {id:'cases', value: 'Kasus'}, 
            {id: 'complains', value: 'Komplain'}, 
            {id: 'document', value: 'Dokumen'},
            {id: 'fieldproblem',  value: 'Kendala lapangan'},
            {id: 'headspv',  value: 'Kepala bagian'},
            {id: 'problem',  value: 'Problem report'},
            {id: 'supervisors',  value: 'Supervisor'},
            {id: 'warehouses', value: 'Gudang'},
            {id: 'user', value: 'Username application'},
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

        const launchImporter = async () => {
            let res = await subscribeMutation(
                    'Pilih dari periode berapa yang akan di tanamkan',
                    'PeriodePicker',
                    '',
                    'Modal/tunnelMessage'
                    )
                if(res) {
                    loader();

                    const periode1Time = ymdTime(res?.periode1);
                    const periode2Time = ymdTime(res?.periode2);

                    if(checkedOptions.value.includes('baseitem')) await implantItemsFromServer(periode1Time);
                    if(checkedOptions.value.includes('basereportfile')) await implantBaseFileFromServer(periode1Time, periode2Time);
                    if(checkedOptions.value.includes('cases')) await implantAllCasesFromServer();
                    if(checkedOptions.value.includes('complains')) await implantAllComplainsFromServer();
                    if(checkedOptions.value.includes('document')) await implantDocumentsFromServer(periode1Time, periode2Time);
                    if(checkedOptions.value.includes('fieldproblem')) await implantFieldProblemsFromServer();
                    if(checkedOptions.value.includes('headspv')) await implantHeadSPVFromServer();
                    if(checkedOptions.value.includes('problem')) await implantProblemsFromServer(periode1Time, periode2Time);
                    if(checkedOptions.value.includes('supervisors')) await implantSupervisorFromServer();
                    if(checkedOptions.value.includes('warehouses')) await implantWarehouseFromServer();
                    if(checkedOptions.value.includes('user')) await implantUsersFromServer();

                    modalClose()
                }
        }

        const impor = (ev) => {
            store.commit("Modal/active", {judul: "", form: "Loader"});

            const reader = new FileReader();
            
            reader.readAsText(ev.target.files[0]);

            //when reading is completed load
            reader.onload = (event) => send(JSON.parse(event.target.result));

        }


        const send = (val) => {
            //send data // bring the importer form
            store.commit("Modal/active", { 
                judul: "Pilih store", form: "ImporterForm", obj: val
            });
        }

        return {
            importerField, launchImporter, impor, options, checkedOptions, toggleCheckOptions
        }
        
    }
}
</script>