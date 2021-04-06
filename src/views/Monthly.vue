<template>
  <div class="monthly container">
    <NavToHome />
    <section class="monthly-main">
      <h2>月間スケジュール登録</h2>
      <table class="table shadow-soft rounded table-striped mb-4">
        <thead>
          <tr>
            <th>チャットシフト</th>
            <th>月曜日</th>
            <th>火曜日</th>
            <th>水曜日</th>
            <th>木曜日</th>
            <th>金曜日</th>
            <th>土曜日</th>
            <th>日曜日</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>前半</th>
            <td>
              <MonthlySwitch id="mon-1" time="15:00 - 19:00" />
            </td>
            <td>
              <MonthlySwitch id="tue-1" time="15:00 - 19:00" />
            </td>
            <td>
              <MonthlySwitch id="wed-1" time="15:00 - 19:00" />
            </td>
            <td>
              <MonthlySwitch id="thu-1" time="15:00 - 19:00" />
            </td>
            <td>
              <MonthlySwitch id="fri-1" time="15:00 - 19:00" />
            </td>
            <td>
              <MonthlySwitch id="sat-1" time="15:00 - 19:00" />
            </td>
            <td>
              <MonthlySwitch id="sun-1" time="15:00 - 19:00" />
            </td>
          </tr>
          <tr>
            <th>後半</th>
            <td>
              <MonthlySwitch id="mon-2" time="19:00 - 23:00" />
            </td>
            <td>
              <MonthlySwitch id="tue-2" time="19:00 - 23:00" />
            </td>
            <td>
              <MonthlySwitch id="wed-2" time="19:00 - 23:00" />
            </td>
            <td>
              <MonthlySwitch id="thu-2" time="19:00 - 23:00" />
            </td>
            <td>
              <MonthlySwitch id="fri-2" time="19:00 - 23:00" />
            </td>
            <td>
              <MonthlySwitch id="sat-2" time="19:00 - 23:00" />
            </td>
            <td>
              <MonthlySwitch id="sun-2" time="19:00 - 23:00" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="submit">
        <div class="form-group">
          <label class="my-1 mr-2" for="monthSelect">登録月</label>
          <select
            class="custom-select my-1 mr-sm-2 col-3"
            id="monthSelect"
            v-model="state.selectedMonth"
          >
            <option :value="thisMonthVal">
              {{ today.year() }}年 {{ today.month() + 1 }} 月
            </option>
            <option :value="nextMonthVal">
              {{ nextMonth.year() }}年 {{ nextMonth.month() + 1 }} 月
            </option>
            <option :value="wNextMonthVal">
              {{ wNextMonth.year() }}年 {{ wNextMonth.month() + 1 }} 月
            </option>
          </select>
        </div>
        <button
          class="btn btn-primary btn-pill text-secondary"
          @click="makeSchedule"
        >
          スケジュール生成
        </button>
      </div>
    </section>
    <hr />
    <section id="schedule" class="schedule mb-4">
      <h2 class="mb-2">月間予定</h2>
      <div class="form-group mb-2">
        <label for="monthly-title">シフト登録時の予定タイトル</label>
        <input
          type="text"
          class="form-control monthly-title"
          id="email"
          v-model="shiftTitle"
          disabled
        />
        <small class="form-text text-muted">
          予定タイトルは、設定画面で変更できます。
        </small>
      </div>
      <hr />
      <template v-for="(shift, index) in createdSchedule" :key="shift.start">
        <schedule
          :status="shift.status"
          :start="shift.start"
          :end="shift.end"
          :index="index"
          :regFlag="shift.regFlag"
        />
      </template>
      <div class="submit">
        <div class="form-group">
          <label class="my-1 mr-2" for="calSelect">登録するカレンダー</label>
          <CalendarSelect
            :calList="calList"
            :sel="selectedCalendar"
            @update="changeCal"
          />
        </div>
        <button
          class="btn btn-primary btn-pill text-secondary"
          @click="registSchedule"
          v-bind:disabled="!state.submitReady"
        >
          スケジュール登録
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, computed, reactive, onUnmounted } from "vue";
import { useStore } from "vuex";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ja";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");
dayjs.locale("ja");

import NavToHome from "@/components/NavToHome.vue";
import MonthlySwitch from "@/components/MonthlySwitch.vue";
import Schedule from "@/components/Schedule.vue";
import CalendarSelect from "@/components/CalendarSelect.vue";

const ipcRenderer = window.ipcRenderer;

export default defineComponent({
  setup() {
    const store = useStore();

    const today = dayjs(new Date()).date(1);

    const nextMonth = dayjs(new Date(today)).add(1, "month");

    const wNextMonth = dayjs(new Date(nextMonth)).add(1, "month");

    const thisMonthVal = today.format("YYYY/M/D");
    const nextMonthVal = nextMonth.format("YYYY/M/D");
    const wNextMonthVal = wNextMonth.format("YYYY/M/D");

    const state = reactive({
      selectedMonth: nextMonth.format("YYYY/M/D"),
      submitReady: false
    });

    const calList = computed(() => store.state.calendarList);

    const shiftTitle = computed({
      get: () => store.getters.getShiftTitle,
      set: str => {
        store.dispatch("updateShiftTitle", { title: str });
      }
    });

    const selectedCalendar = computed(() => {
      let selected = store.getters.getShiftCalSelect;
      if (selected === "") {
        selected = calList.value[0].id;
        store.dispatch("updateShiftCalSelect", selected);
      }
      return selected;
    });

    const changeCal = id => {
      store.dispatch("updateShiftCalSelect", id);
    };

    const makeSchedule = () => {
      // 月間初日
      const startDate = dayjs(new Date(state.selectedMonth)).date(1);
      // 翌月初日
      const endDate = dayjs(new Date(state.selectedMonth)).add(1, "month");

      // 作業用の日付（ターゲット）
      let targetDate = dayjs(new Date(startDate));

      // 作業用のスケジュール配列
      let shifts = [];

      // 翌月初日以前まで繰り返し
      while (targetDate < endDate) {
        // 曜日を取得
        const wday = targetDate.day();
        // キーを入れる為の作業用変数
        let wkey = "";

        // 曜日をキーにするために置き換え
        switch (wday) {
          case 0:
            wkey = "sun";
            break;

          case 1:
            wkey = "mon";
            break;

          case 2:
            wkey = "thu";
            break;

          case 3:
            wkey = "wed";
            break;

          case 4:
            wkey = "thu";
            break;

          case 5:
            wkey = "fri";
            break;

          case 6:
            wkey = "sat";
            break;
        }

        // 登録するべきシフトがあるかどうか確認して、あったらスケジュールの配列に追加
        if (store.getters.getShiftSetting(wkey + "-1")) {
          const obj = makeTime(1, targetDate);

          // 作業用の配列に追加
          shifts.push(obj);
        }

        // 同じ事を2でもやる
        if (store.getters.getShiftSetting(wkey + "-2")) {
          const obj = makeTime(2, targetDate);
          // 作業用の配列に追加
          shifts.push(obj);
        }

        // 繰り返しの最後に必ず1日ずらす
        targetDate = targetDate.add(1, "days");
      }

      // 作業用配列をstoreにおさめる
      store.dispatch("updateCreatedSchedule", { arr: shifts });
      // ステータスを変更
      state.submitReady = true;
    };

    const makeTime = (num, targetDate) => {
      // 仮のオブジェクトを作って...
      const obj = {};
      let sHour = 0;
      // シフトに合わせた時間を用意して、突っ込む
      if (num === 1) {
        sHour = 15;
      } else if (num === 2) {
        sHour = 19;
      }
      const time = targetDate.clone();
      obj.start = time
        .hour(sHour)
        .minute(0)
        .clone()
        .toDate();
      obj.end = time
        .hour(sHour)
        .minute(0)
        .add(4, "hour")
        .clone()
        .toDate();
      obj.status = "standby";
      obj.regFlag = true;

      return obj;
    };

    const createdSchedule = computed({
      get: () => store.state.createdSchedule,
      set: obj => {
        store.dispatch("updateCreatedSchedule", { arr: obj });
      }
    });

    const registSchedule = async () => {
      // ステータスを変更
      state.submitReady = false;

      const shifts = store.getters.getCreatedSchedule;

      for (const i in shifts) {
        if (shifts[i].regFlag) {
          store.dispatch("updateStatusOfCreatedSchedule", {
            num: i,
            status: "loading"
          });
          let obj = shifts[i];

          const selected = store.getters.getShiftCalSelect;
          const title = store.getters.getShiftTitle;
          obj.allDay = false;
          obj.cal = selected;
          obj.title = title;
          // オブジェクトのままだと送れないので文字列に
          const str = JSON.stringify(obj);
          const res = await ipcRenderer.invoke("google-cal-regist", str);
          if (res) {
            store.dispatch("updateStatusOfCreatedSchedule", {
              num: i,
              status: "completed"
            });
          } else {
            store.dispatch("updateStatusOfCreatedSchedule", {
              num: i,
              status: "error"
            });
          }
        }
      }
      // ステータスを変更
      state.submitReady = true;
    };

    onUnmounted(() => {
      store.dispatch("clearCreatedSchedule");
    });

    return {
      store,
      state,
      today,
      nextMonth,
      wNextMonth,
      thisMonthVal,
      nextMonthVal,
      wNextMonthVal,
      shiftTitle,
      makeSchedule,
      createdSchedule,
      selectedCalendar,
      calList,
      changeCal,
      registSchedule
    };
  },
  components: {
    NavToHome,
    MonthlySwitch,
    Schedule,
    CalendarSelect
  }
});
</script>

<style lang="scss">
.monthly {
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