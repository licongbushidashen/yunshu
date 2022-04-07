<template>
  <div class="property-container">
    <a-collapse :bordered="false" :activeKey="['1','2', '3', '4', '5']">
      <!-- 一般属性 -->
      <a-collapse-panel header="一般属性" key="1">
        <common-setting
          type="SUB_INSTANCE"
          v-if="isShowCommonSetting"
          @setMappingStr="setMappingStr"
        />
      </a-collapse-panel>

      <a-collapse-panel header="消息通知" key="5">
        <notification type="SUB_INSTANCE"/>
      </a-collapse-panel>

      <!-- 数据映射 -->
      <a-collapse-panel header="数据映射" key="2">
        <data-mapping ref="mapping"/>
      </a-collapse-panel>

      <!-- 参与者设置 -->
      <a-collapse-panel header="参与者" key="3">
        <participant type="SUB_INSTANCE"/>
      </a-collapse-panel>

      <!-- 事件处理 -->
      <a-collapse-panel header="事件处理" key="4">
        <activity-event type="SUB_INSTANCE"/>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts">
import {
 Component, Vue, Prop, Watch 
} from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';
import commonSetting from './property/commonSetting.vue';
import Participant from './property/participant.vue';
import DataMapping from './property/dataMapping.vue';
import { SWTreeGenerator } from './helper/helper';
import ActivityEvent from './property/activityEvent.vue';
import Notification from './property/notification.vue'
@Component({
  name: 'SubInstanceProperty',
  components: {
    commonSetting,
    Participant,
    DataMapping,
    ActivityEvent,
    Notification
  }
})
export default class SubInstanceProperty extends Vue {
  isShowCommonSetting:boolean = true;

  setMappingStr() {
    const mapping = this.$refs.mapping as any;
    if (mapping) {
      mapping.setMappingStr();
    }
  }
}
</script>
<style lang="less" scoped>

</style>
