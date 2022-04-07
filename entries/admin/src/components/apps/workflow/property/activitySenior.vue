<template>
  <div class="data-item">
    <!-- 限时时间、超时预警 -->
    <!-- <template v-for="(item,key) in timeData">
      <property-widget
        :key="key"
        :label="item.label"
        :tip="item.tip"
      >
        <ellipsis-input
          slot="right"
          :value="item.value"
          @click="showModal = true"
        />
      </property-widget>
    </template> -->
    <property-widget label="超时条件">
      <template>
        <div slot="right" class="over-time-policy">
          <a-select
            placeholder="请选择"
            v-model="timeoutCondition"
            class="input-select"
            @select="selectChangeTimeout"
          >
            <a-select-option
              v-for="(item, index) in conditionData"
              :key="index"
              :value="item.type"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </div>
      </template>
    </property-widget>
    <template v-if="timeoutCondition">
      <property-widget
        label="超时时间"
        tip="设定当前任务的许可时间，超过该时间系统即认为该任务超时"
      >
        <ellipsis-input
          slot="right"
          :value="timeoutTime"
          @click="showModal = true"
        />
      </property-widget>
      <!-- 超时后策略 -->
      <property-widget label="超时后策略">
        <template>
          <div slot="right" class="over-time-policy">
            <a-select
              placeholder="请选择"
              v-model="timeoutStrategy"
              class="input-select"
              @select="selectChange"
            >
              <a-select-option
                v-for="(item, index) in selectData"
                :key="index"
                :value="item.type"
                >{{ item.name }}</a-select-option
              >
            </a-select>
          </div>
        </template>
      </property-widget>
    </template>

    <!-- 限时时间设置弹窗 -->
    <limited-time
      v-model="showModal"
      :timeItem="timeItems"
      :formDataItem="formDataItem"
      :timeoutCondition="timeoutCondition"
      @close="showModal = false"
      @submit="limitedTimeSubmit"
    />

    <property-widget label="表单锁策略">
      <template>
        <div slot="right" class="over-time-policy">
          <a-select
            placeholder="请选择"
            v-model="lockType" 
            class="input-select"
            @select="selectTableLock"
          >
            <a-select-option
              v-for="(item, index) in tableLockSelectData"
              :key="index"
              :value="item.type"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </div>
      </template>
    </property-widget>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import PropertyWidget from "../base/propertyWidget.vue";
import EllipsisInput from "../base/ellipsisInput.vue";
import LimitedTime from "../modals/limitedTime.vue";

const WorkflowModule = namespace("Apps/Workflow");

@Component({
  name: "ActivitySenior",
  components: {
    PropertyWidget,
    EllipsisInput,
    LimitedTime,
  },
})
export default class ActivitySenior extends Vue {
  @WorkflowModule.State((state) => state.selectedActivities[0] || {})
  currentActivity: any;

  @WorkflowModule.State("curActivityProps") curActivityProps: any;
  @WorkflowModule.State("WorkflowDataItem_all") WorkflowDataItem_all: any;

  @WorkflowModule.Mutation("setPropValue") setPropValue: any;

  showModal: boolean = false;

  timeoutStrategy: string = "NOTIFY_HANDLER";

  lockType: string = 'NONE' 

  timeoutCondition: any = null;

  timeItem: any = {
    allowedTime: "",
    timeoutWarning1: "",
    timeoutWarning2: "",
  };

  timeItems: any = {
    allowedTime: "",
    enable: false,
    timeoutWarning1: "",
    timeoutWarning2: "",
  };
  timeoutTime: any = "";
  timeData: any = [
    {
      label: "限时时间",
      type: "allowedTime",
      value: "",
      tip: "设定当前任务的许可时间，超过该时间系统即认为该任务超时",
    },
    {
      label: "超时预警1",
      type: "timeoutWarning1",
      value: "",
      tip:
        "设置第一次即将超时提醒的时间，即将到达超时时间前的4小时，待办列表要显示为黄色",
    },
    {
      label: "超时预警2",
      type: "timeoutWarning2",
      value: "",
      tip:
        "设置第二次提醒的时间，即将到达超时时间前的2小时，待办列表要显示为橙色",
    },
  ];

  conditionData: any = [
    {
      name: "流程到达该节点后",
      type: "post_node",
    },
    {
      name: "根据表单内字段触发",
      type: "in_form",
    },
  ];

  selectData: any = [
    {
      name: "钉钉/微信消息通知处理人",
      type: "NOTIFY_HANDLER",
    },
    {
      name: "直接进入下一节点",
      type: "APPROVE",
    },
    {
      name: "传阅上级主管",
      type: "CIRCULATE_MANAGER",
    },
    // 20191204 迭代26需求
    // {
    //   name: '转办上级主管',
    //   type: 'FORWARD_MANAGER'
    // }
  ];

  tableLockSelectData:any  = [
    {
      name: "不执行锁定",
      type: "NONE",
    },
    // {
    //   name: "打开表单时锁定",
    //   type: "1",
    // },
    {
      name: "提交表单时锁定",
      type: "SUBMIT",
    },
  ]

  formDataItem: any = null;

  beforeMount() {
    this.dataMounted();
  }

  // 限时弹窗提交事件
  limitedTimeSubmit(time: any) {
    const objLength = Object.keys(this.curActivityProps.activitySenior).length;
    if (objLength) {
      if (
        (time.processTime && this.timeoutCondition === "post_node") ||
        (time.formId && this.timeoutCondition === "in_form")
      ) {
        this.timeoutTime = "已设置";
      }else{
        this.timeoutTime = "";
      }
      this.timeItems = {
        processTime: time.processTime,
        formId: time.formId,
        enable: time.enable,
        timeConfig: time.timeConfig,
        timeoutWarning1: time.timeoutWarning1,
        timeoutWarning2: time.timeoutWarning2,
      };
      this.setPropValue({
        key: "activitySenior.allowedTime",
        value: time.processTime,
      });
      this.setPropValue({
        key: "activitySenior.timeoutWarning1",
        value: time.timeoutWarning1,
      });
      this.setPropValue({
        key: "activitySenior.timeoutWarning2",
        value: time.timeoutWarning2,
      });
      this.setPropValue({
        key: "activitySenior.timeoutTime",
        value: {
          formId: time.formId,
          enable: time.enable,
          timeConfig: time.timeConfig,
        },
      });
    }
  }

  // 时间毫秒数转时间段
  msecToTimeSpan(msec: number) {
    if (msec) {
      const days = Math.floor(msec / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (msec % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((msec % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((msec % (1000 * 60)) / 1000);
      return `${days}天${hours}小时${minutes}分${seconds}秒`;
    }
    return "";
  }

  // 超时后策略改变事件
  selectChange(value: any) {
    this.timeoutStrategy = value;
    const objLength = Object.keys(this.curActivityProps.activitySenior).length;
    if (objLength) {
      this.setPropValue({ key: "activitySenior.timeoutStrategy", value });
    }
  }

  // 超时后策略改变事件
  selectChangeTimeout(value: any) {
    this.timeoutCondition = value;
    const objLength = Object.keys(this.curActivityProps.activitySenior).length;
    if (objLength) {
      this.timeoutTime = "";
      this.timeItems = {
        processTime: 0,
        formId: "",
        enable: false,
        timeConfig: "then",
        timeoutWarning1: 0,
        timeoutWarning2: 0,
      };
      this.setPropValue({
        key: "activitySenior.allowedTime",
        value: 0,
      });
      this.setPropValue({
        key: "activitySenior.timeoutWarning1",
        value: 0,
      });
      this.setPropValue({
        key: "activitySenior.timeoutWarning2",
        value: 0,
      });
      this.setPropValue({
        key: "activitySenior.timeoutTime",
        value: {
          formId: "",
          enable: false,
          timeConfig: "then",
        },
      });
      this.setPropValue({ key: "activitySenior.timeoutCondition", value });
    }
  }

  selectTableLock(value:any){
    this.setPropValue({ key: "activitySenior.lockType", value });
  }

  // 根据数据初始化视图
  dataMounted() {
    this.formDataItem = this.WorkflowDataItem_all.filter(
      (i: any) =>
        i.propertyType === 3 &&
        (i.code === "modifiedTime" ||
          i.format === "YYYY-MM-DD" ||
          i.format === "YYYY-MM-DD HH:mm" ||
          i.format === "YYYY-MM-DD HH:mm:ss")
    );

    if (Object.keys(this.curActivityProps.activitySenior).length) {
      const activitySeniorArray = Object.entries(
        this.curActivityProps.activitySenior
      );
      this.lockType = this.curActivityProps.activitySenior.lockType || "NONE"
      const activitySenior:any = this.curActivityProps.activitySenior;
      if (!activitySenior.timeoutCondition && activitySenior.allowedTime) {
        this.timeoutCondition = "post_node";
        this.timeoutTime = "已设置";
      } else {
        this.timeoutTime =
          (activitySenior.timeoutCondition === "in_form" &&
            activitySenior.timeoutTime.formId) ||
          (activitySenior.timeoutCondition === "post_node" &&
            activitySenior.allowedTime)
            ? "已设置"
            : "";
        this.timeoutCondition = activitySenior.timeoutCondition;
      }
      this.timeItems = {
        processTime: activitySenior.allowedTime,
        formId: activitySenior.timeoutTime ? activitySenior.timeoutTime.formId : '',
        enable: activitySenior.timeoutWarning1 || activitySenior.timeoutWarning2 ? true : false,
        timeConfig: activitySenior.timeoutTime ? activitySenior.timeoutTime.timeConfig : '',
        timeoutWarning1: activitySenior.timeoutWarning1,
        timeoutWarning2: activitySenior.timeoutWarning2,
      };
      activitySeniorArray.forEach((a: any) => {
        if (!a && !a[0] && !a[1]) {
          return;
        }
        const [key, value] = a;
        if (key === "timeoutStrategy") {
          // 迭代26 删除转办上级主管 兼容数据
          if (value === "FORWARD_MANAGER") {
            this.timeoutStrategy = "转办上级主管";
          } else {
            this.timeoutStrategy = value;
          }
          return;
        }
        // this.timeData.forEach((t: any, i: string) => {
        //   if (t.type === key) {
        //     const val = typeof value === "string" ? Number(value) : value;
        //     this.timeItem[key] = val;
        //     t.value = this.msecToTimeSpan(val);
        //   }
        // });
      });
    }
  }

  @Watch("currentActivity")
  onActivityChange(v: string) {
    this.dataMounted();
  }
}
</script>

<style lang="less" scoped>
.over-time-policy {
  width: 100%;
  height: 32px;
  /deep/.input-select {
    width: 100%;
    border: none;
  }
  /deep/.ant-select-selection {
    border: none;
    box-shadow: none;
  }
}
</style>
