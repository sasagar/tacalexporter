<template>
  <div class="license container">
    <NavToHome />
    <section>
      <h2>ライセンス</h2>
      <table class="table shadow-soft rounded">
        <tr
          v-for="(license, key) in licenses"
          @click="onLicenseClick(license)"
          :key="license"
        >
          <td>
            <div class="list-item__title">
              <h6>
                <strong>{{ key }}</strong>
              </h6>
              <template v-if="license.publisher != null">
                {{ license.publisher }}<br />
              </template>
              License: {{ license.licenses }}
            </div>
            <div class="list-item__subtitle">{{ license.repository }}</div>
          </td>
        </tr>
      </table>
    </section>
    <NavToHome />
  </div>
</template>

<script>
import NavToHome from "@/components/NavToHome.vue";

import licensesJson from "../assets/licenses/licenses.json"; // 自動生成したライセンスを定義したJSONファイルをimport

export default {
  setup() {
    return {
      licenses: licensesJson,
      NavToHome
    };
  },
  methods: {
    onLicenseClick(license) {
      // ライセンスをタップすると、ブラウザでリポジトリのページ(GitHubなど)を開く(cordova-plugin-inappbrowserをインストールしておく必要あり)
      window.open(license.repository, "_system");
    }
  }
};
</script>

<style lang="scss" scoped>
.license {
  text-align: left;
  td {
    cursor: pointer;
  }
}
</style>