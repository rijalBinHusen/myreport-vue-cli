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
import { useStore } from 'vuex';
import SelectVue from '../elements/Select.vue';
export default {
    emit: ['selectedSpv'],
    props: ['inSelectSpv', 'disabled', 'spvEnabled'],
    setup(props, { emit }) {
        const store = useStore()
        const supervisors = props?.spvEnabled 
                            ? store.getters['Supervisors/enabled'] 
                            :store.state.Supervisors.lists
                            
        const handleChange = (ev) => {
            emit('selectedSpv', ev)
        }

        return { supervisors, handleChange }
    },
    components: {
        SelectVue,
    }
}
</script>