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
                @trig="launchModal"
            />
        </div>
    
        <!-- <DatatableVue
            :datanya="table?.lists"
            :heads="table?.heads"
            :keys="table?.keys"
            option
            id="tableFieldProblem"
        >
        
            <template #default="{ prop }">
                <Button v-if="!prop?.inserted && !inserted" value="Delete" :datanya="prop.id" danger type="button" class="w3-tiny" @trig="remove($event)"/>
                <Button v-if="!inserted" value="Insert" primary type="button" class="w3-tiny" @trig="insertCase(prop)"/>
                <Button v-else value="Edit" secondary type="button" class="w3-tiny" @trig="edit(prop)"/>
                
            </template> -->
        <!-- </DatatableVue>  -->
        
    </div>
</template>
    
    <script>
    import ButtonVue from '@/components/elements/Button.vue'
    import DatatableVue from '@/components/parts/Datatable.vue'
    import { modalLauncher } from '@/composable/piece/vuexModalLauncher'
    
    export default {
        setup() {
            const launchModal = () => {
                modalLauncher('Tambahkan data kendala', 'FieldProblemVue')
            }

            return { launchModal }
        },
        data() {
            return {}
        },
        components: {
            ButtonVue,
            DatatableVue
        },
    }
    </script>