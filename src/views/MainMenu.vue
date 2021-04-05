<template>
  <div class="main container">
    <template v-if="state.loading">
      <div class="row">
        <div class="col lead">
          <fontAwesome :icon="['fas', 'spinner']" class="mr-2" spin />
          Googleアカウントの確認中...
        </div>
      </div>
    </template>
    <template v-else>
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
    </template>
  </div>
</template>

<script>
import { reactive, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const ipcRenderer = window.ipcRenderer;

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const state = reactive({
      loading: true
    });

    const go = view => {
      router.push("/" + view);
    };

    onBeforeMount(async () => {
      const userData = await ipcRenderer.invoke("google-profile");
      state.loading = false;
      store.dispatch("updateUserData", userData);
    });

    return {
      state,
      go
    };
  },
  name: "main-menu"
};
</script>

<style lang="scss">
</style>