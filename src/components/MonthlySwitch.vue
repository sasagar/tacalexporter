<template>
  <div class="custom-control custom-switch">
    <input type="checkbox" class="custom-control-input" :id="id" />
    <label class="custom-control-label text-center" :for="id"> </label>
    <div>
      <small> {{ time }} </small>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
  props: {
    id: {
      type: String
    },
    time: {
      type: String
    }
  }
});
</script>