<template>
  <button v-if="type === 'button'" :class="className" @click="trigger">
    <slot></slot>
    {{ value }}
  </button>

  <a v-if="type === 'link'" :href="href" :class="className" @click="trigger">
    <slot></slot>
    {{ value }}
  </a>
</template>

<script>
/**
<Button primary value="Periode" type="button" @trig="addPeriod" />
 */
export default {
  name: "Button",
  props: {
    datanya: String ,
    danger: Boolean,
    primary: Boolean,
    secondary: Boolean,
    value: String,
    type: {
      type: String,
      required: true,
    },
    class: String,
    href: String,
    icon: String,
    small: Boolean,
    noborder: Boolean,
  },
  emits: ["trig"],
  methods: {
    trigger() {
      this.$emit("trig", this.datanya);
    },
  },
  computed: {
    className() {
      let classList = [];
      if (this.type == "button") classList.push("w3-button w3-margin-right");
      if (!this.noborder) classList.push("w3-border")
      if (this.small) classList.push("w3-small");
      if (this.primary) classList.push("w3-teal");
      if (this.secondary) classList.push("w3-aqua");
      if (this.danger) classList.push("w3-pink");
      if (this.class) classList.push(this.class);

      return classList.join(" ");
    },
  },
};
</script>