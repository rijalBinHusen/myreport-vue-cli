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
            option
        >
        
            <template #default="{ prop }">
                <Dropdown 
                    value="Opsi" 
                    :lists="[
                        { id: 'edit', content: 'Edit'}, 
                        { id: 'delete', content: 'Delete'}
                    ]"
                    listsKey="id"
                    listsValue="content"
                    @trig="handleDropdown($event, prop?.id)"
                    primary
                />
            </template>
        </DatatableVue> 
        
    </div>
</template>
    
<script>
import ButtonVue from '@/components/elements/Button.vue'
import Dropdown from '@/components/elements/Dropdown.vue'
import DatatableVue from '@/components/parts/Datatable.vue'
import { fieldProblem, fieldProblemEdit } from '@/composable/piece/vuexModalLauncher'
import { listsFieldProblem } from '@/composable/components/FieldProblem'
import { ref } from '@vue/reactivity'
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

        const handleDropdown = (action, id) => {
            if(action === 'edit') {
                fieldProblemEdit(id)
            }
        }

        return { fieldProblem, table, lists, renderTable, handleDropdown }
    },
    components: {
        ButtonVue,
        DatatableVue,
        Dropdown,
    },
}
</script>