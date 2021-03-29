import { createStore } from "vuex";

export default createStore({
  state: {
    mentoringTitle: "",
    accountingTitle: "",
    shiftTitle: "",
    courseSettings: {},
    shiftSettings: {},
    mentoringCalSelect: "",
    shiftCalSelect: "",
    createdSchedule: [],
  },
  mutations: {
    setMentoringTitle(state, payload) {
      state.mentoringTitle = payload;
    },
    setAccountingTitle(state, payload) {
      state.accountingTitle = payload;
    },
    setShiftTitle(state, payload) {
      state.shiftTitle = payload;
    },
    setCourseSettings(state, payload) {
      state.courseSettings = payload;
    },
    setShiftSettings(state, payload) {
      state.shiftSettings = payload;
    },
    setMentoringCalSelect(state, payload) {
      state.mentoringCalSelect = payload;
    },
    setShiftCalSelect(state, payload) {
      state.shiftCalSelect = payload;
    },
    setCreatedSchedule(state, payload) {
      state.createdSchedule = payload;
    },
  },
  actions: {
    updateMentoringTitle(payload) {
      this.setMentoringTitle(payload);
    },
    updateAccountingTitle(payload) {
      this.setAccountingTitle(payload);
    },
    updateShiftTitle(payload) {
      this.setShiftTitle(payload);
    },
    updateCourseSettings(payload) {
      this.setCourseSettings(payload);
    },
    updateShiftSettings(payload) {
      this.setShiftSettings(payload);
    },
    updateMentoringCalSelect(payload) {
      this.setMentoringCalSelect(payload);
    },
    updateShiftCalSelect(payload) {
      this.setShiftCalSelect(payload);
    },
    updateCreatedSchedule(payload) {
      this.setCreatedSchedule(payload);
    },
  },
  modules: {},
});
