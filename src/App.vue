<template>
  <div class="container mt-4">
    <h1 class="mb-0">TechAcademy Mentor Console</h1>
    <hr />
  </div>
  <router-view v-slot="{ Component }">
    <transition name="content" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

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
