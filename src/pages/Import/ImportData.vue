<template>
    <div>
    <br />
    <br />
    <br />
    <br />
    <br />
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

export default {
    components: { Button, DatePicker },
    setup() {
        const store = useStore()
        const importerField = ref(null)

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

                    await implantItemsFromServer(periode1Time);
                    await implantBaseFileFromServer(periode1Time, periode2Time);
                    await implantAllCasesFromServer()
                    await implantAllComplainsFromServer()
                    await implantDocumentsFromServer(periode1Time, periode2Time)
                    await implantFieldProblemsFromServer()
                    await implantHeadSPVFromServer()
                    await implantProblemsFromServer(periode1Time, periode2Time)
                    await implantSupervisorFromServer()
                    await implantWarehouseFromServer()

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
            importerField, launchImporter, impor
        }
        
    }
}
</script>