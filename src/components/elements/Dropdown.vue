<template>
    <div class="w3-dropdown-hover w3-white">
      <Button primary :value="value" type="button"/>
      <div class="w3-dropdown-content w3-bar-block w3-card-4">
    
        <Button 
            type="button"
            v-for="list in lists" 
            :key="list[listsKey]" 
            class="w3-bar-item"
            :datanya="list[listsKey] + ''" 
            :value="list[listsValue]" 
            @trig="send($event)"
        />
      </div>
    </div>
</template>

<script>
/* <Dropdown 
    value="dropdown1" 
    lists=[{ id: 1, content: "satu "}, { id: 2, content: "dua "}] 
    listsKey="id"
    @trig="yourMethods"
/> */
import Button from "./Button.vue"

export default {
    name: "Dropdown",
    components: { Button },
    emits: ["trig"],
    props: {
        value: {
            type: String,
            required: true,
        },
        lists: {
            type: Object,
            required: true
        },
        listsKey: {
            type: String,
            required: true,
        },
        listsValue: {
            type: String,
            required: true,
        }
    },
    methods: {
        send(e) {
            this.$emit("trig", e)
        }
    }
}
</script>