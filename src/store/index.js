import { createStore } from "vuex";

const ipcRenderer = window.ipcRenderer;

export default createStore({
  state: {
    launchCheck: false,
    userData: {},
    mentoringTitle: "メンタリング %name %courseid%week",
    accountingTitle: "%courseid%week %name 計上日",
    shiftTitle: "チャットシフト",
    courseSettings: {},
    shiftSettings: {},
    mentoringCalSelect: "",
    shiftCalSelect: "",
    createdSchedule: [],
    calendarList: [],
  },
  mutations: {
    setLaunchCheck(state, payload) {
      state.launchCheck = payload;
    },
    setUserData(state, payload) {
      Object.assign(state, { userData: payload });
    },
    setMentoringTitle(state, payload) {
      state.mentoringTitle = payload.title;
    },
    setAccountingTitle(state, payload) {
      state.accountingTitle = payload.title;
    },
    setShiftTitle(state, payload) {
      state.shiftTitle = payload.title;
    },
    setCourseSettings(state, payload) {
      const obj = { courseSettings: payload.obj };
      Object.assign(state, obj);
    },
    setShiftSettings(state, payload) {
      const obj = { shiftSettings: payload.obj };
      Object.assign(state, obj);
    },
    setMentoringCalSelect(state, payload) {
      state.mentoringCalSelect = payload;
    },
    setShiftCalSelect(state, payload) {
      state.shiftCalSelect = payload;
    },
    setCreatedSchedule(state, payload) {
      state.createdSchedule.splice(0);
      state.createdSchedule.push(...payload.arr);
    },
    setStatusOfCreatedSchedule(state, payload) {
      state.createdSchedule[payload.num].status = payload.status;
    },
    setFlagOfCreatedSchedule(state, payload) {
      state.createdSchedule[payload.num].regFlag = payload.flag;
    },
    setCalendarList(state, payload) {
      state.calendarList.splice(0);
      state.calendarList.push(...payload.arr);
    },
    clearSchedule(state) {
      state.createdSchedule.splice(0);
    },
  },
  actions: {
    async updateLaunchCheck(context, payload) {
      context.commit("setLaunchCheck", payload);
      if (!payload) {
        await ipcRenderer.invoke("google-logout");
        context.commit("setUserData", {});
      }
    },
    updateUserData(context, payload) {
      context.commit("setUserData", payload);
    },
    updateMentoringTitle(context, payload) {
      context.commit("setMentoringTitle", payload);

      const mentoringTitle = {
        name: "mentoringTitle",
        setting: payload.title,
      };

      ipcRenderer.invoke("save-settings", mentoringTitle);
    },
    initMentoringTitle(context, payload) {
      context.commit("setMentoringTitle", { title: payload });
    },
    updateAccountingTitle(context, payload) {
      context.commit("setAccountingTitle", payload);

      const accountingTitle = {
        name: "accountingTitle",
        setting: payload.title,
      };

      ipcRenderer.invoke("save-settings", accountingTitle);
    },
    initAccountingTitle(context, payload) {
      context.commit("setAccountingTitle", { title: payload });
    },
    updateShiftTitle(context, payload) {
      context.commit("setShiftTitle", payload);

      const shiftTitle = {
        name: "shiftTitle",
        setting: payload.title,
      };

      ipcRenderer.invoke("save-settings", shiftTitle);
    },
    initShiftTitle(context, payload) {
      context.commit("setShiftTitle", { title: payload });
    },
    updateCourseSettings(context, payload) {
      const obj = context.state.courseSettings;
      obj[payload.key] = payload.flag;

      context.commit("setCourseSettings", {
        obj,
      });

      const courseSettings = {
        name: "courseSettings",
        setting: context.getters.getAllCourseSettings,
      };

      ipcRenderer.invoke("save-settings", courseSettings);
    },
    initCourseSettings(context, payload) {
      if (payload) {
        context.commit("setCourseSettings", { obj: payload });
      }
    },
    updateShiftSettings(context, payload) {
      const obj = context.state.shiftSettings;
      obj[payload.key] = payload.flag;

      context.commit("setShiftSettings", {
        obj,
      });

      const shiftSettings = {
        name: "shiftSettings",
        setting: context.getters.getAllShiftSettings,
      };

      ipcRenderer.invoke("save-settings", shiftSettings);
    },
    initShiftSettings(context, payload) {
      if (payload) {
        context.commit("setShiftSettings", { obj: payload });
      }
    },
    updateMentoringCalSelect(context, payload) {
      context.commit("setMentoringCalSelect", payload);
    },
    updateShiftCalSelect(context, payload) {
      context.commit("setShiftCalSelect", payload);
      const selectedCal = {
        name: "shiftSelectedCal",
        setting: payload,
      };

      ipcRenderer.invoke("save-settings", selectedCal);
    },
    updateCreatedSchedule(context, payload) {
      context.commit("setCreatedSchedule", { arr: payload.arr });
    },
    updateStatusOfCreatedSchedule(context, payload) {
      context.commit("setStatusOfCreatedSchedule", payload);
    },
    updateFlagOfCreatedSchedule(context, payload) {
      context.commit("setFlagOfCreatedSchedule", payload);
    },
    updateCalendarList(context, payload) {
      context.commit("setCalendarList", { arr: payload });
    },
    clearCreatedSchedule(context) {
      context.commit("clearSchedule");
    },
  },
  getters: {
    getCourseSetting: (state) => (courseKey) => {
      if (courseKey in state.courseSettings) {
        return state.courseSettings[courseKey];
      } else {
        return false;
      }
    },
    getMentoringTitle: (state) => {
      return state.mentoringTitle;
    },
    getAccountingTitle: (state) => {
      return state.accountingTitle;
    },
    getShiftTitle: (state) => {
      return state.shiftTitle;
    },
    getShiftSetting: (state) => (shiftKey) => {
      if (shiftKey in state.shiftSettings) {
        return state.shiftSettings[shiftKey];
      } else {
        return false;
      }
    },
    getAllShiftSettings: (state) => {
      const settings = state.shiftSettings;
      const res = {};

      for (const shift in settings) {
        if (settings[shift] === true) {
          res[shift] = true;
        }
      }
      return res;
    },
    getAllCourseSettings: (state) => {
      const settings = state.courseSettings;
      const res = {};

      for (const course in settings) {
        if (settings[course] === true) {
          res[course] = true;
        }
      }
      return res;
    },
    getLaunchCheck: (state) => {
      return state.launchCheck;
    },
    getUserData: (state) => {
      return state.userData;
    },
    getShiftCalSelect: (state) => {
      return state.shiftCalSelect;
    },
    getCreatedSchedule: (state) => {
      return state.createdSchedule;
    },
  },
  modules: {},
});
