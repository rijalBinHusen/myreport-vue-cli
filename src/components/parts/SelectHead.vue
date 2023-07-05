<template>
    <div>
        <label for="head" class="w3-margin-top">Pilih kabag</label>
        <SelectVue 
            id="head"
            :options="head" 
            judul="Kabag"
            value="id"
            text="name"
            @selected="handleChange($event)"
            :inselect="inSelectHead"
            :disabled="disabled"
        />
    </div>
</template>

<script>
import { ref, onBeforeMount } from 'vue';
import SelectVue from '../elements/Select.vue';
import { lists } from '@/composable/components/Headspv';

export default {
    emit: ['selectedHead'],
    props: ['inSelectHead', 'disabled'],
    setup(props, { emit }) {
        const head = ref([])
        
        onBeforeMount(() => {
            head.value = lists
        })

        const handleChange = (ev) => {
            emit('selectedHead', ev)
        }

        return { head, handleChange }
    },
    components: {
        SelectVue,
    }
}
</script>@/pages/Headspv/Headspv