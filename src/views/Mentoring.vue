<template>
  <div class="mentoring container">
    <NavToHome />
    <section class="mentoring-main">
      <div class="row">
        <h2>メンタリングスケジュール登録</h2>
      </div>

      <div class="row">
        <div class="col-4">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2" for="courseSelect">コース</label>
              <select
                class="custom-select my-1 mr-sm-2"
                id="courseSelect"
                v-model="state.selectedCourse"
              >
                <template v-for="course in courses" :key="course.key">
                  <option v-if="courseFlag(course.key)" :value="course.key">
                    {{ course.fullname }}
                  </option>
                </template>
              </select>
              <small>{{ courseDescription() }}</small>
            </div>
          </div>
        </div>

        <div class="col-4">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2" for="courseSelect">期間</label>
              <select
                class="custom-select my-1 mr-sm-2"
                id="courseSelect"
                v-model="state.selectedWeek"
              >
                <option value="4">4週間</option>
                <option value="6">6週間</option>
                <option value="8">8週間</option>
                <option value="12">12週間</option>
                <option value="16">16週間</option>
              </select>
              <small>想定メンタリング回数: {{ numOfMentoring }}回</small>
            </div>
          </div>
        </div>

        <div class="col-4">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2" for="startDate">受講開始日</label>
              <datepicker
                v-model="startDate"
                class="form-control datepicker"
                id="startDate"
                :locale="ja"
                monthHeadingFormat="yyyy LLL"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="form-group col">
          <label class="my-1 mr-2" for="name">受講生氏名</label>
          <input
            class="form-control"
            type="text"
            id="name"
            v-model="state.studentName"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2 col" for="firstDate">1回目</label>
              <select
                class="custom-select my-1 mr-sm-2 col-4"
                id="firstDate"
                v-model="state.firstDay"
              >
                <option value="1">月曜日</option>
                <option value="2">火曜日</option>
                <option value="3">水曜日</option>
                <option value="4">木曜日</option>
                <option value="5">金曜日</option>
                <option value="6">土曜日</option>
                <option value="0">日曜日</option>
              </select>

              <select
                class="custom-select my-1 mr-0 col-3"
                id="firstHour"
                v-model="state.firstHour"
              >
                <template v-for="n in 24" :key="n - 1">
                  <option :value="n - 1">{{ n - 1 }}</option>
                </template>
              </select>
              <span class="col-1 p-0"> 時 </span>
              <select
                class="custom-select my-1 mr-0 col-3"
                id="firstMinutes"
                v-model="state.firstMin"
              >
                <option value="0">00</option>
                <option value="30">30</option>
              </select>
              <span class="col-1 p-0"> 分 </span>
            </div>
          </div>
        </div>

        <div class="col-6">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2 col" for="secondDate">2回目</label>
              <select
                class="custom-select my-1 mr-sm-2 col-4"
                id="secondDate"
                v-model="state.secondDay"
              >
                <option value="1">月曜日</option>
                <option value="2">火曜日</option>
                <option value="3">水曜日</option>
                <option value="4">木曜日</option>
                <option value="5">金曜日</option>
                <option value="6">土曜日</option>
                <option value="0">日曜日</option>
              </select>

              <select
                class="custom-select my-1 mr-0 col-3"
                id="secondHour"
                v-model="state.secondHour"
              >
                <template v-for="n in 24" :key="n - 1">
                  <option :value="n - 1">{{ n - 1 }}</option>
                </template>
              </select>
              <span class="col-1 p-0"> 時 </span>
              <select
                class="custom-select my-1 mr-0 col-3"
                id="secondMinutes"
                v-model="state.secondMin"
              >
                <option value="0">00</option>
                <option value="30">30</option>
              </select>
              <span class="col-1 p-0"> 分 </span>
            </div>
          </div>
        </div>
      </div>

      <div class="submit row justify-content-center">
        <button
          class="btn btn-primary btn-pill text-secondary"
          @click="makeSchedule"
        >
          メンタリングスケジュール生成
        </button>
      </div>
    </section>
    <hr />
    <section id="schedule" class="schedule mb-4">
      <div class="row">
        <h2 class="mb-2">生成されたメンタリングスケジュール</h2>
      </div>
      <div class="row">
        <div class="form-group mb-2 col">
          <label for="monthly-title">
            メンタリングスケジュール登録時の予定タイトル
          </label>
          <input
            type="text"
            class="form-control monthly-title"
            id="email"
            v-model="mentoringTitle"
            disabled
          />
          <small class="form-text text-muted">
            予定タイトルは、設定画面で変更できます。
          </small>
        </div>
      </div>
      <hr />
      <template v-for="(shift, index) in createdSchedule" :key="shift.start">
        <schedule
          :index="index"
          :status="shift.status"
          :start="shift.start"
          :end="shift.end"
        />
      </template>
      <div class="submit">
        <div class="form-group">
          <label class="my-1 mr-2" for="calSelect">登録するカレンダー</label>
          <select class="custom-select my-1 mr-sm-2 col-3" id="calSelect">
            <option>カレンダー</option>
          </select>
        </div>
        <button class="btn btn-primary btn-pill text-secondary">
          スケジュール登録
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed, onUnmounted } from "vue";
import { useStore } from "vuex";

import Datepicker from "vue3-datepicker";

import { ja } from "date-fns/locale";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ja";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");
dayjs.locale("ja");

import NavToHome from "@/components/NavToHome.vue";
import Schedule from "@/components/Schedule.vue";

import courseJson from "../json/course.json";

export default defineComponent({
  setup() {
    const store = useStore();
    const courses = courseJson;

    const state = reactive({
      selectedCourse: "",
      selectedWeek: 4,
      studentName: "",
      firstDay: 4,
      firstHour: 13,
      firstMin: 0,
      secondDay: 0,
      secondHour: 13,
      secondMin: 0
    });

    const startDate = ref(new Date());

    const courseFlag = key => {
      return store.getters.getCourseSetting(key);
    };

    // 選択中のコースのデータを返す
    const courseData = computed(() => {
      let res = [{}];
      if (state.selectedCourse) {
        res = courses.filter(course => course.key === state.selectedCourse);
      }
      return res[0];
    });

    // タイトルを随時文字列置換する
    const mentoringTitle = computed({
      get: () => {
        let str = store.getters.getMentoringTitle;
        if (state.studentName) {
          str = str.replace(/%name/g, state.studentName);
        }

        if (state.selectedCourse) {
          str = str.replace(/%courseid/g, state.selectedCourse);
          str = str.replace(/%course/g, courseData.value["fullname"]);
        }

        if (state.selectedWeek) {
          str = str.replace(/%week/g, ("0" + state.selectedWeek).slice(-2));
        }

        return str;
      },
      set: str => {
        store.dispatch("updateMentoringTitle", { title: str });
      }
    });

    // コースの設定がわかるようにする
    const courseDescription = () => {
      let str = "";

      if (state.selectedCourse) {
        const data = courseData.value;

        str = "メンタリング回数: 週";
        str += data["perWeek"];
        str += "回　";
        if (data["fixed"]) {
          str += "専任制";
        } else {
          str += "非専任制";
        }
      }

      return str;
    };

    // メンタリング回数を割り出す
    const numOfMentoring = computed(() => {
      let count = 0;
      if (courseData.value["perWeek"] === 1) {
        count = state.selectedWeek;
      } else if (courseData.value["perWeek"] === 2) {
        count = state.selectedWeek * 2 - 1;
      }
      return count;
    });

    // 期間を繰り返してスケジュールを割り出す
    const makeSchedule = () => {
      // 初日
      const date = dayjs(new Date(startDate.value));
      // 一回目の情報
      const first = {
        day: state.firstDay,
        hour: state.firstHour,
        min: state.firstMin
      };
      // 二回目の曜日
      const second = {
        day: state.secondDay,
        hour: state.secondHour,
        min: state.secondMin
      };

      // メンタリング回数
      const count = numOfMentoring.value;

      // コースのデータ
      const data = courseData.value;

      // 作業用のカレンダー一覧
      let shifts = [];

      // 繰り返し用の情報用意
      // カウンタ
      let tmpcount = 0;
      // 回数フラグ
      let flag = true;

      while (tmpcount < count) {
        let dayData = 4;

        if (flag) {
          dayData = first;
        } else {
          dayData = second;
        }

        if (dayData.day * 1 === date.getDay()) {
          const obj = {};
          let startTime = dayjs(new Date(date));
          startTime.hour(dayData.hour);
          startTime.minute(dayData.min);

          let endTime = dayjs(new Date(startTime));
          endTime.minute(startTime.minute() + 30);

          obj.start = startTime.toDate();
          obj.end = endTime.toDate();
          obj.status = "standby";

          shifts.push(obj);
          // 週1かどうかで処理を分ける
          if (data["perWeek"] === 1) {
            // 週1は一回目以外でfalse
            flag = false;
          } else {
            // 週2は毎回フラグ入れ替え
            flag = !flag;
          }
          tmpcount = ++tmpcount;
        }
        date.add(1, "day");
      }
      // 作業用配列をstoreにおさめる
      store.dispatch("updateCreatedSchedule", { arr: shifts });
    };

    const createdSchedule = computed(() => store.state.createdSchedule);

    onUnmounted(() => {
      store.dispatch("clearCreatedSchedule");
    });

    return {
      courses,
      state,
      ja,
      startDate,
      courseFlag,
      mentoringTitle,
      courseDescription,
      numOfMentoring,
      makeSchedule,
      createdSchedule
    };
  },
  components: {
    NavToHome,
    Schedule,
    Datepicker
  }
});
</script>

<style lang="scss">
.mentoring {
  text-align: left;
  .table {
    .custom-switch {
      padding-left: 0;
      .custom-control-label {
        &::before {
          left: 1rem;
        }
        &::after {
          left: calc(1rem + 2px);
        }
      }
    }
  }

  .submit {
    text-align: center;
  }

  .schedule {
    .custom-switch {
      display: inline-block;
    }
  }
}
</style>