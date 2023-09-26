<template>
    <div>
        <DropdownVue  v-for="res in result" :key="res.id" 
            :value="res?.id" 
            :lists="options"
            listsKey="id"
            listsValue="value"
            @trig="handleDropdown($event, res?.downloadURL, res?.id)"
            primary
        />
    </div>
</template>

<script setup>
    import DropdownVue from '@/components/elements/Dropdown.vue';
    import { loader, modalClose } from '@/composable/piece/vuexModalLauncher';
import { subscribeMutation } from '@/composable/piece/subscribeMutation';

    const handleDropdown = async (res, url, fileName) => {
        // jika kunjungi
        if(res == 0) {
            // buka url ditab baru
            window.open(url)
        } 
        // Jika hapus
        else {
            const confirm =  await subscribeMutation('', 'Confirm', { pesan: 'Apakah anda yakin akan menghapusnya?'}, 'Modal/tunnelMessage')
            if(confirm) {
                loader()
                await deleteFile('myreport/'+fileName)
                modalClose()
            }
        }
    }

    const options = [
        { id: 0, value: 'Kunjungi' },
        { id: 1, value: 'Hapus' }
    ]
</script>