<template>
  <div class="settings container">
    <NavToHome />
    <section class="google mb-4">
      <h2>Googleアカウント</h2>
      <button class="btn btn-pill btn-primary mb-4">
        <span class="mr-1"><fontAwesome :icon="['fab', 'google']" /></span>
        Googleアカウントでログイン
      </button>
      <div class="logged-in">
        <button class="btn btn-pill btn-primary text-danger mb-4">
          <span class="mr-1"><fontAwesome :icon="['fab', 'google']" /></span>
          ログアウトする
        </button>
      </div>
    </section>
    <section class="title mb-4">
      <h2>カレンダー登録</h2>
      <div class="alert alert-secondary shadow-inset mb-2" role="alert">
        <span class="alert-inner--icon icon-lg"
          ><fontAwesome icon="exclamation-circle"
        /></span>
        <span class="alert-heading">テンプレート用のキーワードについて</span>
        <p>
          特定のキーワードは自動で展開されて、カレンダー登録時に置換が行われます。<br />
          集計する際のキーワードにするなど、適切に設定すると便利です。
        </p>
        <hr />
        <dl class="mb-0">
          <dt>%name</dt>
          <dd>受講生氏名に置き換わります。</dd>
          <dt>%courseid</dt>
          <dd>
            アプリが持っているコースIDに置き換わります。1コースごとに半角英数2文字に省略されていますので、簡略化して表示したい方に向いています。
          </dd>
          <dt>%course</dt>
          <dd>
            コースのフルネームが入ります。正確な表示をしたい方に向いています。
          </dd>
          <dt>%week</dt>
          <dd>
            プラン（期間）が入ります。何週間のコースかを示す物で、0埋めされた半角数字2桁です。
          </dd>
        </dl>
      </div>
      <div class="form-group mb-3">
        <label for="mentoring">メンタリング用タイトル</label>
        <input type="text" id="mentoring" class="form-control col-9" />
        <small class="form-text text-muted">
          一回ずつのメンタリングの予定タイトルになります。
        </small>
      </div>
      <div class="form-group mb-3">
        <label for="accounting">
          専任制 報酬計上日の終日スケジュールタイトル
        </label>
        <input type="text" id="accounting" class="form-control col-9" />
        <small class="form-text text-muted">
          専任制は最終日が計上日となるため、その計算ができるように、期間最終日に終日のスケジュールを登録します。そのタイトルになります
        </small>
      </div>
      <div class="form-group mb-3">
        <label for="shift">シフト用タイトル</label>
        <input type="text" id="shift" class="form-control col-9" />
        <small class="form-text text-muted">
          一回ずつのシフト勤務（チャット対応）の予定タイトルになります。
        </small>
      </div>
    </section>
    <section class="course mb-4">
      <h2>コース選択</h2>
      <template v-for="course in courses" :key="course.id">
        <CourseSetting :course="course" />
      </template>
    </section>
  </div>
</template>

<script>
import CourseSetting from "@/components/CourseSetting.vue";
import courseJson from "../json/course.json";
import { useRouter } from "vue-router";

import NavToHome from "@/components/NavToHome.vue";

export default {
  setup() {
    const router = useRouter();

    const goHome = () => {
      router.push("/");
    };
    const courses = courseJson;

    return {
      goHome,
      courses
    };
  },
  name: "settings",
  components: {
    NavToHome,
    CourseSetting
  }
};
</script>

<style lang="scss">
.settings {
  text-align: left;
}
</style>