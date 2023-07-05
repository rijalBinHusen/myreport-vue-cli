<template>
    <Dropdown
        :value="value"  
        :lists="lists"
        listsKey="id"
        listsValue="isi"
        @trig="send($event)"
        :class="class"
        :primary="isPrimary"
    />
</template>

<script>
    import { computed } from "vue";
import Dropdown from "../elements/Dropdown.vue";
    export default {
        components: { Dropdown },
        emits: ['clicked'],
        props: {
            value: {
                type: String,
                required: true,
            },
            class: {
                type: String,
            },
            isPrimary: {
                type: Boolean
            },
            isFull: {
                type:Boolean,
                default: false,
            }
        },
        setup(props, {emit}) {
            const send = (ev) => {
                emit('clicked', ev)
            }

            const lists = computed(()  => {
                if(props.isFull) {
                    return [
                        { id: -1, isi: '-1 Hari'},
                        { id: -2, isi: '-2 Hari'},
                        { id: -3, isi: '-3 Hari'},
                        { id: 0, isi: '0 Hari' },
                        { id: 'ijin', isi: 'Tidak masuk'},
                        { id: 'kosong', isi: 'Laporan tidak ada'},
                    ]
                } else {
                    return [
                        { id: -1, isi: '-1 Hari'},
                        { id: -2, isi: '-2 Hari'},
                        { id: -3, isi: '-3 Hari'},
                        { id: 0, isi: '0 Hari' },
                    ]
                }
        })
            

            return {
                send, lists
            }
        },
    }
</script>