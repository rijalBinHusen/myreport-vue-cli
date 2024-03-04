<template>
  <div v-if="props.isActive" style="display: block;" class="w3-modal">
    <div class="w3-modal-content w3-animate-zoom w3-round-large">
      <header class="w3-container w3-teal w3-round-large">
        <span
          @click="emits('closeModal')"
          class="w3-xlarge w3-button w3-display-topright w3-teal w3-round-large w3-hover-none"
        >
          &times;
        </span>
        <h2 class="w3-center">
            {{ props.judul }}
        </h2>
      </header>
      <div
        class="w3-container margin-top w3-padding"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

  const props = defineProps({
    judul: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    }
  })

  const emits = defineEmits<{
      (e: 'closeModal'): void
    }>()


</script>
