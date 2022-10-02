<template>
  <div v-if="modal" style="display: block;" class="w3-modal">
    <div class="w3-modal-content w3-animate-zoom w3-round-large">
      <header v-if="!!judul" class="w3-container w3-teal w3-round-large">
          <!-- v-if="modal.mode !== 'loading'" -->
        <span
          @click="active"
          class="w3-xlarge w3-button w3-display-topright w3-teal w3-round-large w3-hover-none"
        >
          &times;
        </span>
        <h2 class="w3-center">
            <!-- {{ modal.mode + " " + currentNav }} -->
            {{ judul }}
        </h2>
      </header>
      <div
        class="w3-container margin-top w3-padding"
      >
        <component style="min-height: 400px" :is="form"> </component>
      </div>
    </div>
  </div>
</template>

<script>

import DocumentsGroupForm from "@/form/DocumentsGroupForm.vue"
import DocumentCheckForm from "@/form/DocumentCheckForm.vue"
import Loader from "./Loader.vue"
import ImporterForm from "@/form/ImportDataForm.vue"
import BaseReportFile from "@/form/BaseReportFileForm.vue"
import BaseClockForm from "../../modular/Base/BaseClockForm.vue";
import BaseProblemForm from "../../modular/Base/BaseProblemForm.vue";
import BaseStockForm from "../../modular/Base/BaseStockForm.vue"
import PeriodePicker from "../parts/PeriodePicker.vue"
import WarehouseSupervisorsForm from "@/form/WarehouseSupervisorsForm.vue"
import FinishedForm from "@/form/FinishedForm.vue"
import CaseInsertForm from "@/form/CaseInsertForm.vue"
import Complains from "../../modular/ComplainReport/ComplainInsertForm.vue"
import ComplainImportForm from "../../modular/ComplainReport/ComplainImportForm.vue"
import ComplainInsertForm from "../../modular/ComplainReport/ComplainInsertForm.vue"
import Confirm from "./Confirm.vue"
import FollowUpFinished from "@/form/FollowUpFinishedForm.vue"
import FieldProblemForm from "@/form/FieldProblemForm.vue"
import DocumentSingleForm from "@/form/DocumentSingleForm.vue"

export default {
  name: "Modal",
    components: {
      FollowUpFinished,
      Confirm,
      ComplainInsertForm,
      ComplainImportForm,
      Complains,
      CaseInsertForm,
      DocumentSingleForm,
      FinishedForm,
      WarehouseSupervisorsForm,
      BaseProblemForm,
      PeriodePicker,
      DocumentCheckForm,
      BaseStockForm,
      BaseClockForm,
      DocumentsGroupForm,
      Loader,
      ImporterForm,
      BaseReportFile,
      FieldProblemForm
    },
  props: {
    judul: {
      type: String,
      required: true,
    },
    form: {
      type: String,
      required: true,
    }
  },
  methods: {
    active() {
      this.$store.commit("Modal/active")
    }
  },
  computed: {
    modal() {
      return this.$store.state.Modal.active
    }
  },
};
</script>
