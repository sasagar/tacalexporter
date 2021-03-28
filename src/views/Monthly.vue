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
          <select class="custom-select my-1 mr-sm-2 col-3" id="monthSelect">
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
        <button class="btn btn-primary btn-pill text-secondary">
          スケジュール生成
        </button>
      </div>
    </section>
    <hr />
    <section id="schedule" class="schedule mb-4">
      <h2 class="mb-2">月間予定</h2>
      <schedule
        status="completed"
        key="month-1"
        date="2021年 03月 26日 (金) 15:00 - 19:00"
      />
      <schedule
        status="loading"
        key="month-2"
        date="2021年 03月 26日 (金) 19:00 - 23:00"
      />
      <schedule
        status="standby"
        key="month-3"
        date="2021年 03月 29日 (月) 19:00 - 23:00"
      />
      <schedule
        status="error"
        key="month-4"
        date="2021年 03月 30日 (火) 19:00 - 23:00"
      />
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
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

import NavToHome from "@/components/NavToHome.vue";
import MonthlySwitch from "@/components/MonthlySwitch.vue";
import Schedule from "@/components/Schedule.vue";

export default defineComponent({
  setup() {
    const router = useRouter();

    const goHome = () => {
      router.push("/");
    };

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

    return {
      goHome,
      today,
      nextMonth,
      wNextMonth,
      thisMonthVal,
      nextMonthVal,
      wNextMonthVal
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