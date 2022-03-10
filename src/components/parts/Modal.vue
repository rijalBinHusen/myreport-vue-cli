<template>
  <div v-if="modal" style="display: block" class="w3-modal">
    <div class="w3-modal-content w3-animate-zoom">
      <header class="w3-container w3-teal">
          <!-- v-if="modal.mode !== 'loading'" -->
        <span
          @click="active"
          class="w3-xlarge w3-button w3-display-topright w3-teal"
        >
          &times;
        </span>
        <h2 class="w3-center">
            <!-- {{ modal.mode + " " + currentNav }} -->
            {{ judul }}
        </h2>
      </header>
      <div
        class="w3-container w3-padding margin-top"
        style="min-height: 300px"
      >
        <component :is="form"> </component>
      </div>
    </div>
  </div>
</template>

<script>

import newName from "../form/newName.vue"
import CollectForm from "../form/CollectForm.vue"

export default {
  name: "Modal",
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
  components: {
    newName,
    CollectForm,
  },
};
</script>
