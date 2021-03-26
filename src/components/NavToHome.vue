<template>
  <section class="nav-bar mb-4">
    <button class="btn btn-pill text-success btn-primary" @click="goHome">
      <span class="mr-1">
        <fontAwesome :icon="['fas', 'chevron-left']" />
      </span>
      Home
    </button>
  </section>
  <hr class="mb-4" />
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();

    const goHome = () => {
      router.push("/");
    };

    return {
      goHome
    };
  },
  name: "nav-to-home"
});
</script>