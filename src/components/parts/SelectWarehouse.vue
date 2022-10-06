<template>
    <div>
        <label v-if="!noLabel" for="warehouses" class="w3-margin-top">Pilih gudang</label>
        <SelectVue 
            id="warehouses"
            :options="warehouses" 
            judul="Gudang"
            value="id"
            text="name"
            @selected="handleChange($event)"
            :inselect="inSelectWarehouse"
            :disabled="disabled"
        />
    </div>
</template>

<script>
import { ref, onBeforeMount } from 'vue';
import SelectVue from '../elements/Select.vue';
import { lists } from '@/composable/components/Warehouses';

export default {
    emit: ['selectedWarehouse'],
    props: ['inSelectWarehouse', 'disabled', 'noLabel'],
    setup(props, { emit }) {
        const warehouses = ref([])

        onBeforeMount(() => {
            warehouses.value = lists
        })

        const handleChange = (ev) => {
            emit('selectedWarehouse', ev)
        }

        return { warehouses, handleChange }
    },
    components: {
        SelectVue,
    }
}
</script>