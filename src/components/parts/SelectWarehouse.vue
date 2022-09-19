<template>
    <div>
        <label for="warehouses" class="w3-margin-top">Pilih gudang</label>
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
import { useStore } from 'vuex';
import SelectVue from '../elements/Select.vue';
export default {
    emit: ['selectedWarehouse'],
    props: ['inSelectWarehouse', 'disabled'],
    setup(props, { emit }) {
        const store = useStore()
        const warehouses = store.state.Warehouses.lists
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