<template>
  <div class="container mt-4">
    <h1 class="mb-0">TechAcademy Mentor Console</h1>
    <hr />
  </div>
  <Suspense>
    <template #default>
      <router-view v-slot="{ Component }">
        <transition name="content" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>
    <template #fallback>
      <div class="row">
        <div class="col lead">
          <fontAwesome :icon="['fas', 'spinner']" class="mr-2" spin />
          処理中...
        </div>
      </div>
    </template>
  </Suspense>
</template>

<script>
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const ipcRenderer = window.ipcRenderer;

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();

    const readyFunc = async () => {
      const launchCheck = await ipcRenderer.invoke("launch-checker");
      store.dispatch("updateLaunchCheck", launchCheck);

      const shiftSettings = await ipcRenderer.invoke(
        "get-settings",
        "shiftSettings"
      );
      const courseSettings = await ipcRenderer.invoke(
        "get-settings",
        "courseSettings"
      );
      const mentoringTitle = await ipcRenderer.invoke(
        "get-settings",
        "mentoringTitle"
      );
      const accountingTitle = await ipcRenderer.invoke(
        "get-settings",
        "accountingTitle"
      );
      const shiftTitle = await ipcRenderer.invoke("get-settings", "shiftTitle");

      store.dispatch("initShiftSettings", shiftSettings);
      store.dispatch("initCourseSettings", courseSettings);
      store.dispatch("initMentoringTitle", mentoringTitle);
      store.dispatch("initAccountingTitle", accountingTitle);
      store.dispatch("initShiftTitle", shiftTitle);

      if (launchCheck) {
        let calList = await ipcRenderer.invoke("google-cal-list");
        calList = calList.filter(cal => cal.accessRole === "owner");

        store.dispatch("updateCalendarList", calList);
      }

      const shiftCalSelect = await ipcRenderer.invoke(
        "get-settings",
        "shiftSelectedCal"
      );

      store.dispatch("updateShiftCalSelect", shiftCalSelect);

      const mentoringCalSelect = await ipcRenderer.invoke(
        "get-settings",
        "mentoringSelectedCal"
      );

      store.dispatch("updateMentoringCalSelect", mentoringCalSelect);

      if (!store.state.launchCheck) {
        router.push("google");
      }
    };

    readyFunc();
  }
});
</script>


<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.content-enter-from {
  transform: translate(-100px, 0);
  opacity: 0;
}
.content-enter-to {
  opacity: 1;
}
.content-enter-active {
  transition: all 1s 0s ease;
}
.content-leave-from {
  transform: translate(0, 0);
  opacity: 1;
}
.content-leave-to {
  transform: translate(100px, 0);
  opacity: 0;
}
.content-leave-active {
  transition: all 0.5s 0s ease;
}
</style>
