<template>
  <div
    class="alert alert-success shadow-inset mb-1"
    :class="{
      'alert-secondary': stat.standby,
      'alert-info': stat.loading,
      'alert-success': stat.completed,
    }"
  >
    <fontAwesome
      v-if="stat.standby"
      :icon="['fas', 'exclamation-circle']"
      class="mr-2"
    />
    <fontAwesome
      v-else-if="stat.loading"
      :icon="['fas', 'spinner']"
      class="mr-2"
      spin
    />
    <fontAwesome
      v-else-if="stat.completed"
      :icon="['fas', 'check-circle']"
      class="mr-2"
    />

    <span class="alert-inner--text"> {{ props.date }} </span>
    <template v-if="stat.completed != true">
      <span class="custom-control custom-switch ml-4">
        <input
          type="checkbox"
          class="custom-control-input"
          id="month-3"
          checked
        />
        <label class="custom-control-label text-center" for="month-3">
          登録
        </label>
      </span>
    </template>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {
    status: {
      type: String
    },
    key: {
      type: String
    },
    date: {
      type: String
    }
  },
  setup(props) {
    const stat = computed(() => {
      const obj = {
        standby: false,
        loading: false,
        completed: false
      };
      switch (props.status) {
        case "standby":
          obj.standby = true;
          break;

        case "loading":
          obj.loading = true;
          break;

        case "completed":
          obj.completed = true;
          break;
      }
      return obj;
    });
    return {
      props,
      stat
    };
  }
});
</script>