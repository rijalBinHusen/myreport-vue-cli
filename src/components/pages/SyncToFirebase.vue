<template>
  <button @click="handleButton">
    Sync
  </button>
</template>

<script>
import syncData from "../../composable/storeSyncData"

export default {
    setup() {
        const handleButton = () => {
          console.log("run")
            syncData()
        }

        return { handleButton }
    }
}
</script>

<style>

</style>