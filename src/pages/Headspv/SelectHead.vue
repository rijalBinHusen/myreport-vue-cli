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
import SelectVue from '@/components/elements/Select.vue';
import { lists, getHeadspv, headspvEnabled } from './Headspv';

export default {
    emit: ['selectedHead'],
    props: ['inSelectHead', 'disabled', 'enabledHeadOnly'],
    setup(props, { emit }) {
        const head = ref([])
        
        onBeforeMount( async () => {
            await getHeadspv();
            if(props.enabledHeadOnly) {

                head.value = headspvEnabled();
                
            } else {

                head.value = lists.value

            }
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
</script>