<template>
  <select
    class="custom-select my-1 mr-sm-2 col-5"
    id="calSelect"
    v-model="selComputed"
  >
    <template v-for="calendar in props.calList" :key="calendar.etag">
      <option :value="calendar.id">
        <template v-if="calendar.summaryOverride">{{
          calendar.summaryOverride
        }}</template>
        <template v-else>{{ calendar.summary }}</template>
      </option>
    </template>
  </select>
</template>

<script>
import { defineComponent, toRefs, computed } from "vue";

export default defineComponent({
  props: {
    calList: {
      type: Object
    },
    sel: {
      type: String
    }
  },
  emits: ["update:sel"],
  setup(props, { emit }) {
    const { sel } = toRefs(props);
    const selComputed = computed({
      get: () => {
        return sel.value;
      },
      set: value => {
        emit("update:sel", value);
      }
    });

    return {
      props,
      selComputed
    };
  }
});
</script>
