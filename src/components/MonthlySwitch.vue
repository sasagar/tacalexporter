<template>
  <div class="custom-control custom-switch">
    <input
      type="checkbox"
      class="custom-control-input"
      :id="id"
      v-model="enableFlag"
    />
    <label class="custom-control-label text-center" :for="id"> </label>
    <div>
      <small> {{ time }} </small>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  props: {
    id: {
      type: String
    },
    time: {
      type: String
    }
  },
  setup(props) {
    const store = useStore();

    const enableFlag = computed({
      get: () => store.getters.getShiftSetting(props.id),
      set: flag => {
        store.dispatch("updateShiftSettings", {
          key: props.id,
          flag: flag
        });
      }
    });

    return {
      enableFlag
    };
  }
});
</script>