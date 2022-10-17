<template>
    <div>
        <a target="_blank" class="w3-button w3-round w3-teal w3-margin" v-for="res in result" :key="res.id" :href="res?.downloadURL">
            {{ res?.id }}
        </a>
    </div>
</template>

<script setup>
    import { result, getStore } from '@/composable/firebase/firebaseGetAllDocument'
    import { onMounted } from 'vue';

    onMounted(async () => {
        await getStore('activitySaved')
    })
</script>