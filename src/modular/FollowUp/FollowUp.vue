<template>
    <Button primary value="Periode" type="button" @trig="handleButton" />
   <Datatable
       :datanya="[{ name: 'one', warehouse: 'name' }]"
       :heads="['Nama', 'Gudang']"
       :keys="['name', 'warehouse']"
       option
       id="followUp"
     />
</template>

<script>
import Button from '@/components/elements/Button.vue'
import Datatable from "../../components/parts/Datatable.vue"
import followUpAdd from "../../composable/followUpAdd"
export default {
    components: { Datatable, Button },
    setup() {
        const handleButton = () => {
            console.log('function', followUpAdd())
        }
        return { handleButton }
    }
}
</script>


<style>

</style>