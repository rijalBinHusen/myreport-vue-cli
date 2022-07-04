<template>
  <div v-if="modal" style="display: block;" class="w3-modal">
    <div class="w3-modal-content w3-animate-zoom w3-round-large">
      <header v-if="form !== 'Loader'" class="w3-container w3-teal w3-round-large">
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

import UncollectedForm from "../../modular/Uncollected/UncollectedForm.vue"
import UncollectedEditForm from "../../modular/Uncollected/UncollectedEditForm.vue"
import ApprovalForm from "../../modular/Approval/ApprovalForm.vue"
import Loader from "./Loader.vue"
import ImporterForm from "../../modular/ImportData/ImporterForm.vue"
import BaseReportFile from "../../modular/BaseImport/BaseReportFileForm.vue"
import BaseClockForm from "../../modular/Base/BaseClockForm.vue";
import BaseProblemForm from "../../modular/Base/BaseProblemForm.vue";
import BaseStockForm from "../../modular/Base/BaseStockForm.vue"
import PeriodePicker from "../parts/PeriodePicker.vue"
import WarehouseSupervisorsForm from "../../modular/Warehouses/WarehouseSupervisorsForm.vue"
import SupervisorWarehousesForm from "../../modular/Supervisors/SupervisorWarehousesForm.vue"
import FinishedForm from "../../modular/Finished/FinishedForm.vue"
import EditDocumentForm from "../../modular/EditDocument/EditDocumentForm.vue"
import CaseInsertForm from "../../modular/CasesReport/CaseInsertForm.vue"
import Complains from "../../modular/ComplainReport/ComplainInsertForm.vue"

export default {
  name: "Modal",
    components: {
      Complains,
      CaseInsertForm,
      EditDocumentForm,
      FinishedForm,
      SupervisorWarehousesForm,
      WarehouseSupervisorsForm,
      BaseProblemForm,
      PeriodePicker,
      UncollectedEditForm,
      BaseStockForm,
      BaseClockForm,
      UncollectedForm,
      ApprovalForm,
      Loader,
      ImporterForm,
      BaseReportFile,
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
