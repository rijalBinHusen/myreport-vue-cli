<template>
    <div class="w3-row">
        <div class="w3-col s6 w3-padding-large" v-html="baseCaseHtml" style="overflow: auto; height: 400px;">
        </div>
        <div class="w3-col s6 w3-padding-large" style="overflow: auto; height: 400px;">
            <!-- Head spv -->
            <SelectHead 
                :inSelectHead="caseInserted.head"
                @selectedHead="caseInserted.head = $event; updateChangedValue('head')"
            />
            
            <!-- Supervisor -->
            <SelectSupervisors 
                :inSelectSpv="caseInserted.name"
                @selectedSpv="caseInserted.name = $event; updateChangedValue('name')"
            
            />

            <label for="sumberMasalah">Sumber masalah: </label><br>
            <textarea v-model="caseInserted.sumberMasalah" @change="updateChangedValue('sumberMasalah')" id="sumberMasalah" style="width:100%; height:60px;"></textarea>

            <label for="solusi">solusi: </label><br>
            <textarea v-model="caseInserted.solusi" @change="updateChangedValue('solusi')" id="solusi" style="width:100%; height:60px;"></textarea>

            
            <!-- Periode -->
            <label for="periode">Periode:</label>
            <datepicker 
                id="periode" 
                class="w3-margin-bottom w3-border w3-input" 
                v-model="periodeModel"
                @update:model-value="updateChangedValue('periode', $event.getTime())"
            />

            <label for="dl">Dead line:</label>
            <datepicker 
                id="dl" 
                class="w3-margin-bottom w3-border w3-input" 
                v-model="dlModel"
                @update:model-value="updateChangedValue('dl', $event.getTime())"
            />
            <!-- Masalah -->
            <label for="masalah">Masalah: </label><br>
            <label v-if="caseInserted.masalah" for="masalah">Max length(255) {{ caseInserted.masalah.length }} </label><br>
            <textarea v-model="caseInserted.masalah" @change="updateChangedValue('masalah')" rows="6" id="masalah" style="width:100%;"></textarea>
            <label for="pic">PIC</label>
            <textarea id="pic" v-model="caseInserted.pic" @change="updateChangedValue('pic')" placeholder="Name PIC" style="width:100%;"></textarea>

            <label for="status">Status done?</label>
            <input 
                type="checkbox" 
                v-model="caseInserted.status" 
                @change="updateChangedValue('status')"
                id="status"
            />

            <Button 
                primary 
                :value=" caseInserted.id ? 'Update' : 'Tambah' " 
                class="w3-right" 
                type="button"
                @trig="send"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import datepicker from "vue3-datepicker"
import Button from "@/components/elements/Button.vue"
import { Cases, type CaseImport, type Case } from "@/pages/Cases/Cases"
import SelectSupervisors from "@/pages/Supervisors/SelectSupervisors.vue"
import SelectHead from "@/pages/Headspv/SelectHead.vue"
import { useStore } from "vuex";
import { ref, onBeforeMount, computed } from "vue"
import { getSupervisorId } from "@/pages/Supervisors/Supervisors"

const store = useStore();

const { addCase, updateCase, getCaseById, getCaseImportById, updateCaseImport } = Cases();
    
    const periodeModel = ref(new Date());
    const dlModel = ref(new Date());
    const baseCase  = ref(<CaseImport>{})
    const caseInserted = ref(<Case>{
        dl: new Date().getTime(),
        head: '',
        insert: 0,
        masalah: '-',
        name: '',
        parent: '-',
        periode: new Date().getTime(),
        pic: '-',
        solusi: '-',
        status: false,
        sumberMasalah: '-'
    });
    const changed = ref(<{[key: string]: string|number|boolean}>{})

    type KeyOfCase = keyof Case;

    async function updateChangedValue (key: KeyOfCase, value?: any) {
        let isValueChanged = caseInserted.value[key] !== changed.value[key];

        if(isValueChanged) {
            if(key === 'name') {
                let spvInfo = await getSupervisorId(caseInserted.value[key])
                changed.value['pic'] = spvInfo.name
                caseInserted.value.pic = spvInfo.name
            }

            changed.value[key] = caseInserted.value[key]
        }

        if(value) {
            if(key === 'periode') {
                dlModel.value = new Date(value)
                dlModel.value.setDate(dlModel.value.getDate() + 3)

                caseInserted.value.periode = value
                caseInserted.value.dl = dlModel.value.getTime()
            }
            changed.value[key] = value
        }

    }

    function typedObjectKeys<T extends Record<string, unknown>>(obj: T) {
        return Object.keys(obj) as (keyof T)[]
    }

    const baseCaseHtml = computed(() => 
        typedObjectKeys(baseCase.value).map((val) => `${val}:<br> ${baseCase.value[val]}`).join(`<hr/>`)
    )

    async function send() {
        if(caseInserted.value.id) {

            await updateCase(caseInserted.value.id, changed.value)

        } else {

            await addCase(caseInserted.value.periode, 
                            caseInserted.value.head, 
                            caseInserted.value.dl, 
                            caseInserted.value.insert, 
                            caseInserted.value.masalah, 
                            caseInserted.value.name, 
                            caseInserted.value.parent, 
                            caseInserted.value.pic, 
                            caseInserted.value.solusi, 
                            caseInserted.value.status, 
                            caseInserted.value.sumberMasalah
                        )
            await updateCaseImport(caseInserted.value.parent, { inserted: true })

        }
        
        store.commit("Modal/active")
    }

    interface stateObject {
        parent?: string
        id?: string
        edit: boolean
    }

    onBeforeMount( async () => {

        let obj = store.getters["Modal/obj"].obj as stateObject;
        // if obj.parent exists, it means we'are on insert case mode
        // else, we're on edit case mode
        const isInsertMode = obj.hasOwnProperty('parent');

        if(isInsertMode) {

            if(obj.parent)
            var getCaseImport = await getCaseImportById(obj.parent);
            if(typeof getCaseImport === 'undefined') return;
            baseCase.value = getCaseImport;
            caseInserted.value.parent = getCaseImport.id

        } else {

            if(obj.id)
            
            var getCase = await getCaseById(obj.id);
            if(typeof getCase === 'undefined') return;
            caseInserted.value = getCase;
            periodeModel.value = new Date(getCase.periode);
            dlModel.value = new Date(getCase.dl);

            var getCaseImport = await getCaseImportById(getCase.parent);
            if(typeof getCaseImport === 'undefined') return;
            baseCase.value = getCaseImport;

        }
    })
</script>