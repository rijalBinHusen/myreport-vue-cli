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

import DocumentsGroupForm from "@/pages/Documents/DocumentsGroupForm.vue"
import DocumentCheckForm from "@/pages/Documents/DocumentCheckForm.vue"
import Loader from "./Loader/Loader.vue"
import ImporterForm from "@/pages/Import/ImportDataForm.vue"
import BaseReportFile from "@/pages/BaseReport/BaseReportFileForm.vue"
import BaseClockForm from "@/pages/Base/BaseClockForm.vue";
import BaseProblemForm from "@/pages/Base/BaseProblemForm.vue";
import BaseStockForm from "@/pages/Base/BaseStockForm.vue"
import PeriodePicker from "../parts/PeriodePicker.vue"
import WarehouseSupervisorsForm from "@/pages/Warehouses/WarehouseSupervisorsForm.vue"
import FinishedForm from "@/pages/Base/BaseFinishForm.vue"
import CaseInsertForm from "@/pages/Cases/CaseInsertForm.vue"
import ComplainImportForm from "@/pages/Complains/ComplainImportForm.vue"
import ComplainInsertForm from "@/pages/Complains/ComplainInsertForm.vue"
import Confirm from "./Confirm.vue"
import FollowUpFinished from "@/pages/Followup/FollowUpFinishedForm.vue"
import FieldProblemForm from "@/pages/FieldProblems/FieldProblemForm.vue"
import DocumentSingleForm from "@/pages/Documents/DocumentSingleForm.vue"
import WarehouseAndItem from "./WarehouseAndItem.vue"
import WarehouseHeadForm from "@/pages/Warehouses/WarehouseHeadForm.vue"

export default {
  name: "Modal",
    components: {
      WarehouseAndItem,
      FollowUpFinished,
      Confirm,
      ComplainInsertForm,
      ComplainImportForm,
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
      FieldProblemForm,
      WarehouseHeadForm
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
    },
    pressKey(e) {
      if(e.keyCode == 27) {
        this.active()
      }
    }
  },
  computed: {
    modal() {
      return this.$store.state.Modal.active
    }
  },
  mounted() {
    // add listen event
      window.addEventListener("keydown", this.pressKey)
  }, 
  unmounted() {
    //remove listen event
      window.removeEventListener("keydown", this.pressKey)
  },
};
</script>
