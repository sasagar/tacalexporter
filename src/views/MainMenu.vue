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
      <hr />
      <button class="btn btn-pill btn-primary mb-4" @click="go('changelog')">
        <span class="mr-1"><fontAwesome icon="code-branch" /></span>
        Change log
      </button>
      <button class="btn btn-pill btn-primary mb-4 ml-4" @click="go('license')">
        <span class="mr-1">
          <fontAwesome :icon="['fas', 'file-contract']" />
        </span>
        License
      </button>
      <hr />
      <small> version {{ ver }} </small>
    </template>
  </div>
</template>

<script>
import { reactive, computed, watch, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const ipcRenderer = window.ipcRenderer;

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const launchCheck = computed(() => store.getters.getLaunchCheck);

    let version = ref("");

    const getver = async () => {
      version = await ipcRenderer.invoke("get-ver");
    };

    const ver = computed(() => version);

    const state = reactive({
      loading: true
    });

    const go = view => {
      router.push("/" + view);
    };

    const getUserData = async () => {
      if (launchCheck.value) {
        const userData = await ipcRenderer.invoke("google-profile");
        state.loading = false;
        store.dispatch("updateUserData", userData);
        store.dispatch("updateLaunchCheck", launchCheck.value);
      }
    };

    const check = async () => {
      await getUserData();
      if (launchCheck.value) {
        state.loading = false;
      }
    };

    getver();
    check();

    watch(
      () => launchCheck.value,
      () => {
        check();
      }
    );

    return {
      state,
      go,
      ver
    };
  },
  name: "main-menu"
};
</script>

<style lang="scss">
</style>