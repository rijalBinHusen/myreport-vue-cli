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
import { fieldProblem } from '@/composable/piece/vuexModalLauncher'
import { listsFieldProblem } from '@/composable/components/FieldProblem'
import { ref } from '@vue/reactivity'
import { onMounted } from '@vue/runtime-core'
import { subscribeMutation } from '@/composable/piece/subscribeMutation'

export default {
    setup() {
        const lists = ref([])
        const renderTable = ref(false)
        const table = {
            heads : ['periode', 'supervisor', 'head', 'masalah'],
            keys: ['periode', 'supervisor', 'head', 'masalah']
        }

        const renewLists = async () => {
            lists.value = await listsFieldProblem()
            renderTable.value = true
        }

        onMounted(() => {
            renewLists()
        })

        const handleDropdown = async (action, id) => {
            if(action === 'edit') {
                // subscribe mutation
                let res = await subscribeMutation(
                                'Edit kendala lapangan', 
                                'FieldProblemForm',
                                id,
                                'Modal/tunnelMessage'
                            )
                // if the mutation contain payload true
                if(res) {
                    renewLists()
                }
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