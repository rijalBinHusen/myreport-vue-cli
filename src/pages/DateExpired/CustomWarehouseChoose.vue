<template>
    <div>
        <h1>Pilih custom gudang</h1>
        <p>{{ props.warehouseName }}</p>
        <SelectWarehouse @selectedWarehouse="selectedWarehouse = $event" />
        <button @click="send">Submit</button>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SelectWarehouse from '../Warehouses/SelectWarehouse.vue';

const props = defineProps({
    warehouseName: {
        type: String,
        required: true
    }
})

const selectedWarehouse = ref("");

function send() {
    emits("warehouseSetted", { warehouseName: props.warehouseName, warehouseId: selectedWarehouse.value })
}

const emits = defineEmits<{
      (e: 'warehouseSetted', keyValue: { warehouseName: string, warehouseId: string }): void
    }>()


</script>