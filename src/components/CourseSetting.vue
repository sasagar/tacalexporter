<template>
  <div class="custom-control custom-switch course-setting mb-1">
    <input type="checkbox" class="custom-control-input" :id="course.key" />
    <label class="custom-control-label" :for="course.key">
      <strong>{{ course.fullname }}</strong>
      <span class="course-description ml-3">
        <small>
          (
          <span>ID: {{ course.key }}</span>
          <span class="ml-2">メンタリング回数: 週{{ course.perWeek }}回</span>
          <span class="ml-2">
            <template v-if="course.fixed">専任制</template>
            <template v-else>非専任制</template>
          </span>
          )
        </small>
      </span>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    course: {
      type: Object
    }
  }
};
</script>

<style lang="scss">
</style>
