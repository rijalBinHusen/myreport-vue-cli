<template>
    <select @change="selected($event.target.value)" class="w3-select w3-margin-top w3-margin-bottom" name="option">
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
        }
    },
    emits: ["selected"],
    methods: {
        selected(ev) {
            this.$emit("selected", ev)
        }
    }
}
</script>