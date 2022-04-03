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
                @trig="setPeriode($event)" 
            />
            <div class=" w3-center" style="margin-top:80px;">
                <p class="">
                    Next backup : {{ 
                        _BACKUP.length > 0 
                            ? GET_DATEFORMAT({format: "full", time: _BACKUP[0].nextBackup})
                            : '' }}
                </p>
                <p>
                    Last backup periode :
                </p>
                <ul v-if="_BACKUP.length > 0" class="w3-ul w3-center">
                    <li v-for="list in _BACKUP" :key="list.id">
                        {{ GET_DATEFORMAT({format: "full", time: list.id}) +" Backup success"}}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Button from "../elements/Button.vue"
import { mapState, mapGetters, mapActions } from "vuex"
export default {
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
      APPEND: "append",
    }),
        setPeriode(value) {
            let now = new Date();
            if (value == "hours") {
                now.setHours(now.getHours() + 1);
            }
            if (value == "day") {
                now.setDate(now.getDate() + 1);
            }
            if (value == "week") {
                now.setDate(now.getDate() + 7);
            }
            if (value == "month") {
                now.setDate(1);
                now.setMonth(now.getMonth() + 1);
            }
            this.APPEND({
                store: "Backup",
                obj: {
                id: this.GET_DATEFORMAT({format: "time"}),
                nextBackup: now.getTime(),
                setup: value,
                }
            });
            this.exportDataCollect("start")
        },    
        //trigeer methods untuk collect data
        exportDataCollect(cond) {
        // bring up the loader
        this.$store.commit("Modal/active", {judul: "", form: "Loader"});
        if (cond == "start") {
            //buka loader
            // this.$store.dispatch("Modal/loading", "open");
            //trigger methods divuex untuk collect data
            this.$store.dispatch("Backup/backup")
            //periksa apakah sudah tercollect atau tidak
            this.checkDataCollect();
        } else {
            //cek apakah progres suda selessai atau tidak
            this.checkDataCollect();
        }
        },
        //periksa apakah collect data sudah selelsai
        checkDataCollect() {
        // status: this.$store.getters["ExIm/statusExport"]
        JSON.parse(this._EXPORTBACKUP).status
            ? //jika sudah
            this.download(`Backup myreport ${
                this.GET_DATEFORMAT({format: "full"})
            }.js`, "text/plain")
            : //jike belum jalankan lagi exportDataCollect
            setTimeout(() => {
                this.exportDataCollect();
            }, 3000);
        },
        download(fileName, contentType) {
        // tutup Loader
        this.$store.commit("Modal/active")
        
        var a = document.createElement("a");
        var file = new Blob(
            [this._EXPORTBACKUP],
            {
            type: contentType,
            }
        );
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        //destroy data collect
        //   this.$store.dispatch("ExIm/destroyDataCollect");
        },
        // download(jsonData, 'json.txt', 'text/plain');
    },
    computed: {
        ...mapState({
            _BACKUP: state => JSON.parse(JSON.stringify(state.Backup.lists)),
            _EXPORTBACKUP: state => JSON.stringify(state.Backup.backupExport)
        }),
        ...mapGetters({
            GET_DATEFORMAT: "dateFormat",
        })
    },
    name: "Backup"
}
</script>