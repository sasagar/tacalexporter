<template>
  <div class="main container">
    <button
      class="btn btn-pill btn-primary btn-block text-success mb-4"
      @click="go('mentoring')"
    >
      <span class="mr-1"><fontAwesome icon="user" /></span>
      新規メンタリングスケジュール登録
    </button>
    <button
      class="btn btn-pill btn-primary btn-block text-secondary mb-4"
      @click="go('monthly')"
    >
      <span class="mr-1"><fontAwesome icon="calendar" /></span>
      月間シフト登録
    </button>
    <hr class="mb-4" />
    <button class="btn btn-pill btn-primary mb-4" @click="go('settings')">
      <span class="mr-1"><fontAwesome icon="cogs" /></span>
      設定
    </button>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const go = view => {
      router.push("/" + view);
    };

    return {
      go
    };
  },
  name: "main-menu"
};
</script>

<style lang="scss">
</style>