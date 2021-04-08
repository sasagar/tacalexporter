<template>
  <div class="changelog container">
    <NavToHome />
    <section class="major mb-4">
      <div class="row">
        <div class="col"><h2>Version 5</h2></div>
      </div>

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.6</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>修正</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>Mac: アップデーター向けの調整</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.5</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>修正</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>バージョン表示が適切に表示されない場合があることの修正</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.4</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>追加</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>Change Logの追加</li>
            <li>メインメニュー下部にバージョン表示の追加</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.3</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>変更</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>
              アイコンをMacOSのインターフェイスガイドラインに合わせたサイズに調整
            </li>
          </ul>
        </div>
      </div>
      <div class="row">
        <div class="col"><h5>修正</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>認証情報の扱い方を変更</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.2</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>変更</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>Mac: 公証に対応</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.1</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>修正</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>初回起動で固まってしまう不具合の修正</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->

      <!-- miners -->
      <hr />
      <div class="row miners">
        <div class="col"><h3>v5.0.0</h3></div>
      </div>
      <div class="row">
        <div class="col"><h5>変更</h5></div>
      </div>
      <div class="row">
        <div class="col">
          <ul>
            <li>全面的なUI刷新</li>
            <li>コードのリファクタリング</li>
            <li>全体をVue.jsに書き換え</li>
          </ul>
        </div>
      </div>
      <!-- /minors -->
    </section>
  </div>
</template>

<script>
import NavToHome from "@/components/NavToHome.vue";

export default {
  setup() {},
  name: "changelog",
  components: {
    NavToHome
  }
};
</script>

<style lang="scss">
.changelog {
  text-align: left;
}
</style>