<template>
    <SelectVue 
        id="head"
        :options="head" 
        judul="Kabag"
        value="id"
        text="name"
        @selected="handleChange($event)"
        :inselect="selectedHead"
    />
</template>

<script>
import { useStore } from 'vuex';
import SelectVue from '../elements/Select.vue';
export default {
    emit: ['selectedHead'],
    props: ['inSelectHead'],
    setup(props, { emit }) {
        const store = useStore()
        const head = store.state.Headspv.lists
        const handleChange = (ev) => {
            emit('selectedHead', ev)
        }

        const selectedHead = props.selectedHead

        return { head, handleChange, selectedHead }
    },
    components: {
        SelectVue,
    }
}
</script>