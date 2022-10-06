<template>
    <input type="text" v-model="value" ref="input" style="width: 100%" />
</template>

<script >
import { nextTick } from 'vue';
export default {
    data() {
        return {
            value: null
        };
    },
    methods: {
        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        getValue() {
            // now
            let now = new Date()
            // date now
            let dateNow = now.getDate()
            // month now
            let monthNow = now.getMonth()
            // if value is number
            //return 20/3/2022
            if(!isNaN(this.value)) {
                return `${this.value}/${(monthNow+1)}/${now.getFullYear()}`
            } 
            // else i just want to input 1/4 then the year we got from here
            else {
                return `${this.value}/${now.getFullYear()}`
            }
        },
        
        // Gets called once before editing starts, to give editor a chance to
        // cancel the editing before it even starts.
        isCancelBeforeStart() {
            return false;
        },
        
        // Gets called once when editing is finished (eg if Enter is pressed).
        // If you return true, then the result of the edit will be ignored.
        isCancelAfterEnd() {
            // our editor will reject any value greater than 1000
            return this.value > 1000;
        }
    },
    mounted() {
        this.value = '';
        nextTick(() => this.$refs.input.focus());
    }
}

</script>