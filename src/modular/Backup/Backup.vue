<template>
    <div class="w3-margin-top w3-container">
        <br />
        <br />
        <br />
        <div class="w3-row w3-center">
            <p class="w3-col w3-large s2 w3-left-align w3-margin-right">Set backup periode : </p>
            <Button 
                v-for="bup in backupLists"
                class="w3-col s2"
                :key="bup"
                :primary="_BACKUP[0].setup == bup.toLowerCase()"
                :danger="_BACKUP[0].setup != bup.toLowerCase()"
                :value="bup" 
                type="button" 
                :datanya="bup.toLowerCase()" 
                @trig="setPeriode($event); handleBackup()" 
            />
            <div class=" w3-center" style="margin-top:80px;">
                <p class="">
                    Next backup at least : {{ 
                        _BACKUP.length > 0 
                            ? GET_DATEFORMAT({format: "full", time: _BACKUP[0].nextBackup})
                            : '' }}
                </p>
                <p>
                    Last backup periode :
                </p>
                <ul v-if="_BACKUP.length > 0" class="w3-ul w3-center">
                    <li v-for="list in _BACKUP" :key="list.id">
                        {{ list.time ? GET_DATEFORMAT({format: "full", time: list.time}) +" Backup success" : "Not backup yet"}}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Button from "../../components/elements/Button.vue"
import { mapState, mapGetters, mapActions, useStore } from "vuex"
import storeBackup from "../../composable/storeBackup"

export default {
    setup() {
        const store = useStore()
        const handleBackup = async () => {
            // open the spinner
            store.commit("Modal/active", { judul: "", form: "Loader" });
            // trigger and waiting the backup function
            await storeBackup()
            // close the spinner
            store.commit("Modal/active");
        }

        return { handleBackup }
    },
    components: {
        Button,
    },
    data() {
        return {
            backupLists: ["Hours", "Day", "Week", "Month"]
        }
    },
    methods: {
        ...mapActions({
        APPEND: "Backup/append",
        }),

        setPeriode(value) {
            this.APPEND(value)
        },

    },
    computed: {
        ...mapState({
            _BACKUP: state => JSON.parse(JSON.stringify(state.Backup.lists)),
        }),
        ...mapGetters({
            GET_DATEFORMAT: "dateFormat",
        })
    },
    name: "Backup"
}
</script>