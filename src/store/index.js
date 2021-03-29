import { createStore } from "vuex";

export default createStore({
  state: {
    mentoringTitle: "メンタリング %name %course%week",
    accountingTitle: "%course%week %name 計上日",
    shiftTitle: "チャットシフト",
    courseSettings: {},
    shiftSettings: {},
    mentoringCalSelect: "",
    shiftCalSelect: "",
    createdSchedule: [],
  },
  mutations: {
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
  },
  actions: {
    updateMentoringTitle(context, payload) {
      context.commit("setMentoringTitle", payload);
    },
    updateAccountingTitle(context, payload) {
      context.commit("setAccountingTitle", payload);
    },
    updateShiftTitle(context, payload) {
      context.commit("setShiftTitle", payload);
    },
    updateCourseSettings(context, payload) {
      const obj = context.state.courseSettings;
      obj[payload.key] = payload.flag;

      context.commit("setCourseSettings", {
        obj,
      });
    },
    updateShiftSettings(context, payload) {
      const obj = context.state.shiftSettings;
      obj[payload.key] = payload.flag;

      context.commit("setShiftSettings", {
        obj,
      });
    },
    updateMentoringCalSelect(payload) {
      this.setMentoringCalSelect(payload);
    },
    updateShiftCalSelect(payload) {
      this.setShiftCalSelect(payload);
    },
    updateCreatedSchedule(context, payload) {
      console.log(payload.arr);
      context.commit("setCreatedSchedule", { arr: payload.arr });
    },
  },
  getters: {
    getCourseSetting: (state) => (courseKey) => {
      if (state.courseSettings[courseKey]) {
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
      if (state.shiftSettings[shiftKey]) {
        return state.shiftSettings[shiftKey];
      } else {
        return false;
      }
    },
  },
  modules: {},
});
