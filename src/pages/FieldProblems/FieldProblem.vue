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
                @trig="handleButton('tambah')"
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
                        { id: 'delete', content: 'Delete'}, 
                        { id: 'duplicate', content: 'Duplicate'}
                    ]"
                    listsKey="id"
                    listsValue="content"
                    @trig="handleButton($event, prop?.id)"
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
import { listsFieldProblem, deleteData, addData, getFieldProblemById } from './FieldProblem'
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
        
        const handleButton = async (action, id) => {
            const form = action === 'edit' ? 'FieldProblemForm' : 'Confirm'
            const info = action === 'edit' 
                                ? id 
                                : action == 'duplicate'
                                ? { pesan: 'Record akan digandakan?' }
                                : '';
            const title =  action === 'edit' ? 'Edit kendala lapangan' : '';
            // subscribe mutation
            let res = await subscribeMutation( title,  form, info, 'Modal/tunnelMessage')

            if(action === 'delete') {
                // if the mutation contain payload true
                if(res) {

                    await deleteData(id)
                }
            }

            if(action === 'duplicate') {
                let fieldProblem = await getFieldProblemById(id);

                const { supervisor, head, masalah, sumberMasalah, solusi, pic, dl } = fieldProblem;

                if(res) {

                    await addData( new Date().getTime(), supervisor, head,masalah, sumberMasalah, solusi, pic, dl );
                }
            }

            // if the mutation receive message true
            if(res) {
                renewLists()
            }
        }

        return { table, lists, renderTable, handleButton }
    },
    components: {
        ButtonVue,
        DatatableVue,
        Dropdown,
    },
}
</script>
