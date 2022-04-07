<template>
  <div>
    <Header></Header>
    <router-view />
  </div>
</template>
<script>
import Header from "./header.vue";

export default {
  components: {
    Header
  }
};
</script>
