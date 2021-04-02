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
              {{ today.getFullYear() }}年 {{ today.getMonth() + 1 }} 月
            </option>
            <option :value="nextMonthVal">
              {{ nextMonth.getFullYear() }}年 {{ nextMonth.getMonth() + 1 }} 月
            </option>
            <option :value="wNextMonthVal">
              {{ wNextMonth.getFullYear() }}年
              {{ wNextMonth.getMonth() + 1 }} 月
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
      <template v-for="shift in createdSchedule" :key="shift.start">
        <schedule
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
import { defineComponent, computed, reactive, onUnmounted } from "vue";
import { useStore } from "vuex";

import NavToHome from "@/components/NavToHome.vue";
import MonthlySwitch from "@/components/MonthlySwitch.vue";
import Schedule from "@/components/Schedule.vue";

export default defineComponent({
  setup() {
    const store = useStore();

    const today = new Date();
    today.setDate(1);

    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const wNextMonth = new Date(nextMonth);
    wNextMonth.setMonth(nextMonth.getMonth() + 1);

    const thisMonthVal =
      today.getFullYear() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getDate();
    const nextMonthVal =
      nextMonth.getFullYear() +
      "/" +
      (nextMonth.getMonth() + 1) +
      "/" +
      nextMonth.getDate();
    const wNextMonthVal =
      wNextMonth.getFullYear() +
      "/" +
      (wNextMonth.getMonth() + 1) +
      "/" +
      wNextMonth.getDate();

    const state = reactive({
      selectedMonth:
        nextMonth.getFullYear() +
        "/" +
        (nextMonth.getMonth() + 1) +
        "/" +
        nextMonth.getDate()
    });

    const shiftTitle = computed({
      get: () => store.getters.getShiftTitle,
      set: str => {
        store.dispatch("updateShiftTitle", { title: str });
      }
    });

    const makeSchedule = () => {
      // 月間初日
      const startDate = new Date(state.selectedMonth);
      // 翌月初日
      const endDate = new Date(state.selectedMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      // 作業用の日付（ターゲット）
      let targetDate = new Date(startDate);

      // 作業用のスケジュール配列
      let shifts = [];

      // 翌月初日以前まで繰り返し
      while (targetDate < endDate) {
        // 曜日を取得
        const wday = targetDate.getDay();
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
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // 作業用配列をstoreにおさめる
      store.dispatch("updateCreatedSchedule", { arr: shifts });
    };

    const makeTime = (num, targetDate) => {
      // 仮のオブジェクトを作って...
      const obj = {};
      let sHour = 0;
      let eHour = 0;
      // シフトに合わせた時間を用意して、突っ込む
      if (num === 1) {
        sHour = 15;
        eHour = 19;
      } else if (num === 2) {
        sHour = 19;
        eHour = 23;
      }
      const time = targetDate;
      time.setHours(sHour, 0);
      obj.start = new Date(time);
      obj.end = new Date(time.setHours(eHour, 0));
      obj.status = "standby";

      return obj;
    };

    const createdSchedule = computed(() => store.state.createdSchedule);

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
      createdSchedule
    };
  },
  components: {
    NavToHome,
    MonthlySwitch,
    Schedule
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