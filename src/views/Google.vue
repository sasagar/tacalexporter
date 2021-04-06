<template>
  <div class="google container">
    <h2>Google認証</h2>
    <hr class="m-4" />
    <div class="row">
      <div class="col-12">
        Googleの認証画面が開きます。<br />
        <strong>このアプリは Google で確認されていません</strong>
        と表示される際は、<br />
        左下にある「詳細」リンクから<strong>TechAcademyメンタリングスケジュール登録（安全ではないページ）に移動</strong>をクリックして進めてください。<br />
        最後に表示されるコードを貼り付けて、登録を行ってください。
      </div>
    </div>

    <div class="row">
      <div class="form-group mb-2 col">
        <label for="code"> Googleの認証コード </label>
        <input type="text" class="form-control code" id="code" v-model="code" />
        <small class="form-text text-muted">
          コードは表示された物をそのままコピー&ペーストで貼り付けてください。
        </small>
      </div>
    </div>

    <div class="submit row justify-content-center">
      <button class="btn btn-primary btn-pill text-secondary" @click="sendCode">
        コードを登録
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const ipcRenderer = window.ipcRenderer;

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();

    const state = reactive({
      code: ""
    });

    const code = computed({
      get: () => state.code,
      set: str => {
        state.code = str;
      }
    });

    const sendCode = async () => {
      const res = await ipcRenderer.invoke("google-code", state.code);

      if (res) {
        const launchCheck = await ipcRenderer.invoke("launch-checker");
        store.dispatch("updateLaunchCheck", launchCheck);
        router.push({ name: "main-menu" });
      }
    };

    return {
      code,
      sendCode
    };
  }
});
</script>

<style lang="scss">
.google {
  text-align: left;
}
</style>