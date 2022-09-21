<template>
    <div>
        <label v-if="showLable" for="shiftSelesai">Shift {{ label }}</label>
        <SelectVue 
            class="w3-border"
            id="shiftMulai"
            judul="Shift"
            :options="[
                { id:1, title: 'Shift 1'},
                { id:2, title: 'Shift 2'},
                { id:3, title: 'Shift 3'},
            ]"
            value="id"
            text="title"
            :inselect="inSelectShift"
            @selected="selectShift($event)"
        />
    </div>
</template>

<script>
import SelectVue from "../elements/Select.vue";

    export default {
        props: ['inSelectShift', 'label', 'showLable'],
        emit: ['selectedShift'],
        setup(props, { emit }) {
            const selectShift = (ev) => {
                emit('selectedShift', ev)
            }

            return { selectShift }
        },
        components: {
            SelectVue
        }
    }

</script>