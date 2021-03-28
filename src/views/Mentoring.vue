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
              <select class="custom-select my-1 mr-sm-2" id="courseSelect">
                <option value="WD">Webデザインコース</option>
                <option value="WP">WordPressコース</option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-4">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2" for="courseSelect">期間</label>
              <select class="custom-select my-1 mr-sm-2" id="courseSelect">
                <option value="4">4週間</option>
                <option value="6">6週間</option>
                <option value="8">8週間</option>
                <option value="12">12週間</option>
                <option value="16">16週間</option>
              </select>
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
          <input class="form-control" type="text" id="name" />
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <div class="row">
            <div class="form-group col">
              <label class="my-1 mr-2 col" for="firstDate">1回目</label>
              <select class="custom-select my-1 mr-sm-2 col-4" id="firstDate">
                <option value="0">月曜日</option>
                <option value="1">火曜日</option>
                <option value="2">水曜日</option>
                <option value="3">木曜日</option>
                <option value="4">金曜日</option>
                <option value="5">土曜日</option>
                <option value="6">日曜日</option>
              </select>

              <select
                class="custom-select my-1 mr-0 col-3"
                id="firstHour"
                v-model="firstHour"
              >
                <template v-for="n in 24" :key="n - 1">
                  <option :value="n - 1">{{ n - 1 }}</option>
                </template>
              </select>
              <span class="col-1 p-0"> 時 </span>
              <select class="custom-select my-1 mr-0 col-3" id="firstMinutes">
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
              <select class="custom-select my-1 mr-sm-2 col-4" id="secondDate">
                <option value="0">月曜日</option>
                <option value="1">火曜日</option>
                <option value="2">水曜日</option>
                <option value="3">木曜日</option>
                <option value="4">金曜日</option>
                <option value="5">土曜日</option>
                <option value="6">日曜日</option>
              </select>

              <select
                class="custom-select my-1 mr-0 col-3"
                id="secondHour"
                v-model="secondHour"
              >
                <template v-for="n in 24" :key="n - 1">
                  <option :value="n - 1">{{ n - 1 }}</option>
                </template>
              </select>
              <span class="col-1 p-0"> 時 </span>
              <select class="custom-select my-1 mr-0 col-3" id="secondMinutes">
                <option value="0">00</option>
                <option value="30">30</option>
              </select>
              <span class="col-1 p-0"> 分 </span>
            </div>
          </div>
        </div>
      </div>

      <div class="submit row justify-content-center">
        <button class="btn btn-primary btn-pill text-secondary">
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
            value="シフト用タイトルが入る"
            disabled
          />
          <small class="form-text text-muted">
            予定タイトルは、設定画面で変更できます。
          </small>
        </div>
      </div>
      <hr />
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
      <div class="submit row justify-content-center">
        <div class="form-group">
          <label class="my-1 mr-2 col" for="calSelect">
            登録するカレンダー
          </label>
          <select class="custom-select my-1 mr-sm-2 col" id="calSelect">
            <option>カレンダー</option>
          </select>
        </div>
      </div>
      <div class="submit row justify-content-center">
        <button class="btn btn-primary btn-pill text-secondary">
          スケジュール登録
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

import Datepicker from "vue3-datepicker";

import { ja } from "date-fns/locale";

import NavToHome from "@/components/NavToHome.vue";
import Schedule from "@/components/Schedule.vue";

export default defineComponent({
  setup() {
    const startDate = ref(new Date());

    const firstHour = 13;
    const secondHour = 13;

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
      ja,
      startDate,
      firstHour,
      secondHour,
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