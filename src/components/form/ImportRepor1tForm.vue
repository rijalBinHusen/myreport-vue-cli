<template>
    <div>
        {{ JSON.stringify(_IMPOR_REPORT_1)}}
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    computed: {
        ...mapState({
            _IMPOR_REPORT_1: state => state.ImporReport1.lists
        })
    }
}
</script>