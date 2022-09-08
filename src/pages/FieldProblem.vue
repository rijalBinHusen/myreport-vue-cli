<template>
    <div class="">
        <div class="w3-border w3-padding w3-container">
            <label>Set record to show : </label>
            <ButtonVue primary value="Set" type="button" />
            <ButtonVue 
                primary 
                class="w3-right" 
                value="Tambahkan" 
                type="button" 
                @trig="fieldProblem"
            />
        </div>
    
        <DatatableVue
            v-if="renderTable"
            :datanya="lists"
            :heads="['periode', 'supervisor', 'head', 'masalah']"
            :keys="['periode', 'supervisor', 'head', 'masalah']"
            id="tableFieldProblem"
        >
        
            <!-- <template #default="{ prop }">
                <Button v-if="!prop?.inserted && !inserted" value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                <Button v-if="!inserted" value="Insert" primary type="button" class="w3-tiny" @trig="insertCase(prop)"/>
                <Button v-else value="Edit" secondary type="button" class="w3-tiny" @trig="edit(prop)"/>
                
            </template> -->
        </DatatableVue> 
        
    </div>
</template>
    
<script>
import ButtonVue from '@/components/elements/Button.vue'
import DatatableVue from '@/components/parts/Datatable.vue'
import { fieldProblem } from '@/composable/piece/vuexModalLauncher'
import { listsFieldProblem } from '@/composable/components/FieldProblem'
import { reactive, ref } from '@vue/reactivity'
import { onMounted } from '@vue/runtime-core'

export default {
    setup() {
        const lists = ref([])
        const renderTable = ref(false)
        const table = {
            heads : ['periode', 'supervisor', 'head', 'masalah'],
            keys: ['periode', 'supervisor', 'head', 'masalah']
        }

        onMounted(async () => {
            lists.value = await listsFieldProblem()
            renderTable.value = true
        })

        return { fieldProblem, table, lists, renderTable }
    },
    components: {
        ButtonVue,
        DatatableVue
    },
}
</script>