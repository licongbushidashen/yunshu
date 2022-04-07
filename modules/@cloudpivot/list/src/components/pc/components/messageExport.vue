<template>
  <span>
    文件生成完成，请前往<a @click="handleUpload">导出任务列表</a>手动下载文件
  </span>
</template>
<script lang='ts'>
  import {Component, Vue} from "vue-property-decorator";

  @Component({})
  export default class MessageExport extends Vue {
    
    handleUpload() {
      this.$emit("handleUpload");
    }

  }
</script>
