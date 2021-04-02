<template>
  <div class="row">
    <div
      class="alert alert-success shadow-inset mb-1 col"
      :class="{
        'alert-secondary': stat.standby,
        'alert-info': stat.loading,
        'alert-success': stat.completed,
        'alert-danger': stat.error,
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
      <fontAwesome
        v-else-if="stat.error"
        :icon="['fas', 'times-circle']"
        class="mr-2"
      />
      <span v-if="index >= 0" class="alert-inner--text counter">
        {{ index + 1 }}回目
      </span>

      <span class="alert-inner--text"> {{ date }} </span>
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
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import moment from "moment";

moment.locale("ja");

export default defineComponent({
  props: {
    status: {
      type: String
    },
    key: {
      type: String
    },
    start: {
      type: Date
    },
    end: {
      type: Date
    },
    index: {
      type: Number
    }
  },
  setup(props) {
    const stat = computed(() => {
      const obj = {
        standby: false,
        loading: false,
        completed: false,
        error: false
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

        case "error":
          obj.error = true;
          break;
      }
      return obj;
    });

    const date = computed(() => {
      const str = makeTime(props.start) + " - " + makeEndTime(props.end);

      return str;
    });

    const makeTime = date => {
      return moment(date).format("YYYY年 MM月 DD日 (dd) HH:mm");
    };

    const makeEndTime = date => {
      return moment(date).format("HH:mm");
    };

    return {
      props,
      stat,
      date
    };
  }
});
</script>

<style lang="scss" scoped>
.counter {
  margin-right: 10px;
}

.custom-switch {
  padding-left: 3rem;

  .custom-control-label {
    &::before {
      left: -3rem;
    }

    &::after {
      left: calc(-3rem + 2px);
    }
  }
}
</style>