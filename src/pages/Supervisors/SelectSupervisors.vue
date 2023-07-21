<template>
    <div>
        <label for="supervisors" class="w3-margin-top">Pilih karu</label>
        <SelectVue 
            id="supervisors"
            :options="supervisors" 
            judul="Karu"
            value="id"
            text="name"
            @selected="handleChange($event)"
            :inselect="inSelectSpv"
            :disabled="disabled"
        />
    </div>
</template>

<script>
import { ref, onBeforeMount } from 'vue';
import SelectVue from '@/components/elements/Select.vue';
import { supervisorsEnabled, lists as supervisorLists, getSupervisors } from '@/pages/Supervisors/Supervisors'
export default {
    emit: ['selectedSpv'],
    props: ['inSelectSpv', 'disabled', 'spvEnabled'],
    setup(props, { emit }) {
        const supervisors = ref([])

        onBeforeMount(async () => {
            await getSupervisors();

            if(props?.spvEnabled) {
                supervisors.value = supervisorsEnabled()
            } else {
                supervisors.value = supervisorLists.value
            }
        })
                            
        const handleChange = (ev) => {
            emit('selectedSpv', ev)
        }

        return { supervisors, handleChange }
    },
    components: {
        SelectVue,
    }
}
</script>@/pages/Supervisors/Supervisors