<template>
    <div>
        <DropdownVue  v-for="res in result" :key="res.id" 
            :value="res?.id" 
            :lists="options"
            listsKey="id"
            listsValue="value"
            @trig="handleDropdown($event, res?.downloadURL, res?.id)"
        /> 
        <!-- <a target="_blank" class="w3-button w3-round w3-teal w3-margin" v-for="res in result" :key="res.id" :href="res?.downloadURL">
            {{ res?.id }}
        </a> -->
    </div>
</template>

<script setup>
    import DropdownVue from '@/components/elements/Dropdown.vue';
    import { result, getStore } from '@/composable/firebase/firebaseGetAllDocument'
    import { onMounted } from 'vue';
    import { deleteFile } from '@/composable/firebase/storage'
    import { deleteDocumentByKey } from '@/composable/firebase/fireStore'

    const handleDropdown = async (res, url, fileName) => {
        // jika kunjungi
        if(res == 0) {
            // buka url ditab baru
            window.open(url)
        } 
        // Jika hapus
        else {
            await deleteFile('myreport/'+fileName)
            await deleteDocumentByKey('activitySaved', fileName)
            console.log('file deleted')
        }
    }

    const options = [
        { id: 0, value: 'Kunjungi' },
        { id: 1, value: 'Hapus' }
    ]

    onMounted(async () => {
        await getStore('activitySaved')
    })
</script>