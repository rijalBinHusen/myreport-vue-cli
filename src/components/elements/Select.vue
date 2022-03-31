<template>
    <select @change="selected($event.target.value)" :class="classLists" name="option">
        <option 
            v-for="option in options" :key="option[value]" 
            :value="option[value]">
        
            {{ option[text] }}
        
        </option>
  </select>
</template>

<script>
/* <Select 
    :options="[
        {id:1, isi: 'satu'}, 
        {id:2, isi: 'DUA'}, 
        {id:3, isi: 'TIGA'},
    ]" 
    value="id"
    text="isi"
    />
    */

export default {
    name: "Select",
    props: {
        options: {
            type: Array,
            required: true,
        },
        value: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true,
        },
        nomargin: Boolean,
        small: Boolean,
    },
    emits: ["selected"],
    methods: {
        selected(ev) {
            this.$emit("selected", ev)
        }
    },
    computed: {

        classLists() {    
            let className = ["w3-select "];

            if(!this.nomargin) {
                className.push("w3-margin-top w3-margin-bottom")
            }
            if(this.small) {
                className.push("w3-small")
            }

            return className.join(" ")
        },
    },
};
</script>