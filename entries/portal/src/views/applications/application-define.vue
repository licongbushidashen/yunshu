<template>
  <application-custom :url="url" />
</template>
<script lang="ts">
import {
  Component, Prop, Vue, Watch
} from 'vue-property-decorator';

import list from '@cloudpivot/list/pc';

@Component({
  name: 'application-define',
  components: {
    applicationCustom: list.components.ApplicationCustomIframe
  }
})
export default class ApplicationDefine extends Vue {
  
  get url() {
    return this.$route.params.url;
  }

}
</script>
<style lang="less" scoped>

</style>
