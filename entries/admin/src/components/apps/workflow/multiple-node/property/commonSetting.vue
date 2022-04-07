<template>
  <div class="commonsetting-panel">
    <!-- 编码 -->
    <property-widget label="编码">
      <div slot="right" class="right-box">
        <p class="inner-padding grey-box" :title="multiActivityCode">{{ multiActivityCode }}</p>
      </div>
    </property-widget>

    <!-- 名称 -->
    <property-widget label="显示名称">
      <div slot="right" class="right-box"> 
        <p class="inner-padding grey-box" :title="multiActivityName">{{ multiActivityName }}</p>
      </div>
    </property-widget>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Watch
} from 'vue-property-decorator';
import { State, namespace } from 'vuex-class';
import PropertyWidget from '../../base/propertyWidget.vue';

const WorkflowModule = namespace('Apps/Workflow');


@Component({
  name: 'MultiCommonSetting',
  components: {
    PropertyWidget,
  }
})

export default class MultiCommonSetting extends Vue {
 @WorkflowModule.State('selectedActivities') selectedActivities: any;

  get multiActivityCode() {
    let str = '';
    this.selectedActivities.forEach((sel:any) => {
      str += `${sel.activityCode};`;
    });
    return str;
  }

  get multiActivityName() {
    let str = '';
    this.selectedActivities.forEach((sel:any) => {
      str += `${sel.activityName};`;
    });
    return str;
  }

}
</script>



<style lang="less">
.right-box {
  width: 100%;
  display: flex;
  align-items: center;
  .grey-box {
    width: 100%;
    height: 31px;
    line-height: 31px;
    background: #f5f5f5;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
