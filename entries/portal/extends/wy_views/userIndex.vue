<template>
  <div>
    <Header></Header>
    <router-view />
  </div>
</template>
<script>
import Header from "./userheader.vue";

export default {
  components: {
    Header
  }
};
</script>
