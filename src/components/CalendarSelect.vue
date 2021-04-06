<template>
  <select
    class="custom-select my-1 mr-sm-2 col-5"
    id="calSelect"
    :value="props.sel"
    @change="update"
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
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    calList: {
      type: Object
    },
    sel: {
      type: String
    }
  },
  emits: ["update"],
  setup(props, context) {
    const update = val => {
      context.emit("update", val.target.value);
    };
    return {
      props,
      update
    };
  }
});
</script>
