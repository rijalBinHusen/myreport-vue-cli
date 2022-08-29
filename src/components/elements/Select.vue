<template>
    <select 
        @change="selected($event.target.value)" 
        :id="id" 
        :class="classLists" 
        name="option"
        :disabled='disabled'
    >
        <option value="">Pilih {{ judul }}</option>
        <option 
            v-for="option in options" :key="option[value]" 
            :value="option[value]"
            :selected="option[value] == inselect"
            >
        
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
    @selected=""
    :inselect=""
    title="Periode"
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
        inselect: String,
        id: String,
        judul: String,
        disabled: Boolean,
    },
    emits: ["selected"],
    methods: {
        selected(ev) {
            this.$emit("selected", ev)
        }
    },
    computed: {

        classLists() {    
            let className = ["w3-select w3-round-large"];

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