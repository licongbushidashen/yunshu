<template>
  <a-modal
    title="超时时间设置"
    width="540px"
    :visible="value"
    :cancelText="'取消'"
    :okText="'保存'"
    @cancel="closeModal"
    @ok="handleOk"
    :maskClosable="false"
    :keyboard="false"
  >
    <!-- 限时时间 -->
    <div class="time-wrap">
      <span class="time-text">流程会在</span>
      <template v-if="timeoutCondition === 'post_node'">
        <a-input-number
          :min="0"
          :precision="0"
          v-model="processTime.dayValue"
        />
        <span>天</span>
        <a-input-number
          :min="0"
          :max="23"
          :precision="0"
          v-model="processTime.hourValue"
        />
        <span>时</span>
        <a-input-number
          :min="0"
          :max="59"
          :precision="0"
          v-model="processTime.minuteValue"
        />
        <span>分</span>
        <a-input-number
          :min="0"
          :max="59"
          :precision="0"
          v-model="processTime.secondValue"
        />
        <span>秒</span>
        <span class="time-text time-text-left">后超时</span>
      </template>
      <template v-else-if="timeoutCondition === 'in_form'">
        <a-select
          placeholder="请选择"
          allowClear
          style="width: 260px; margin-right: 10px"
          v-model="processTime.formId"
          @select="handleOnFromChange"
          class="input-select"
        >
          <a-select-option
            v-for="(item, index) in formDataItem"
            :key="index"
            :value="item.code"
            >{{ item.name }}</a-select-option
          >
        </a-select>
        <a-select
          placeholder="请选择"
          style="width: 70px"
          v-model="processTime.timeConfig"
          @select="handleOnCinfigChange"
          class="input-select"
        >
          <a-select-option
            v-for="(item, index) in timeConfig"
            :key="index"
            :value="item.type"
            >{{ item.name }}</a-select-option
          >
        </a-select>
        <span
          v-if="processTime.timeConfig === 'then'"
          class="time-text time-text-left"
          >超时</span
        >
        <div
          style="margin-top: 20px; margin-left: 65px"
          v-else-if="processTime.timeConfig === 'after'"
        >
          <a-input-number
            :min="0"
            :precision="0"
            v-model="processTime.dayValue"
          />
          <span>天</span>
          <a-input-number
            :min="0"
            :max="23"
            :precision="0"
            v-model="processTime.hourValue"
          />
          <span>时</span>
          <a-input-number
            :min="0"
            :max="59"
            :precision="0"
            v-model="processTime.minuteValue"
          />
          <span>分</span>
          <a-input-number
            :min="0"
            :max="59"
            :precision="0"
            v-model="processTime.secondValue"
          />
          <span>秒</span>
          <span class="time-text time-text-left">超时</span>
        </div>
      </template>
    </div>
    <div class="time-wrap">
      <span class="time-text" style="margin-right: 19px">超时预警</span>
      <a-switch v-model="enable" @change="handleChangeTime" />
      <span class="time-tip">预警时间不可超过已设置的超时时间</span>
    </div>
    <template v-if="enable">
      <!-- 超时预警1 -->
      <div class="time-wrap">
        <span class="time-text long-text">预警1</span>
        <a-input-number
          :disabled="
            !(
              processTime.dayValue ||
              (timeoutCondition === 'in_form' &&
                processTime.timeConfig === 'then')
            )
          "
          :min="0"
          :precision="0"
          v-model="timeoutWarning1.dayValue"
        />
        <span>天</span>
        <a-input-number
          :disabled="
            !(
              (processTime.dayValue || processTime.hourValue) ||
              (timeoutCondition === 'in_form' &&
                processTime.timeConfig === 'then')
            )
          "
          :min="0"
          :max="23"
          :precision="0"
          v-model="timeoutWarning1.hourValue"
        />
        <span>时</span>
        <a-input-number
          :min="0"
          :disabled="
            !(
              (processTime.dayValue || processTime.hourValue || processTime.minuteValue) ||
              (timeoutCondition === 'in_form' &&
                processTime.timeConfig === 'then')
            )
          "
          :max="59"
          :precision="0"
          v-model="timeoutWarning1.minuteValue"
        />
        <span>分</span>
        <a-input-number
          :disabled="
            !(
              (processTime.dayValue || processTime.hourValue || processTime.minuteValue || processTime.secondValue) ||
              (timeoutCondition === 'in_form' &&
                processTime.timeConfig === 'then')
            )
          "
          :min="0"
          :max="59"
          :precision="0"
          v-model="timeoutWarning1.secondValue"
        />
        <span>秒</span>
      </div>
      <!-- 超时预警2 -->
      <div class="time-wrap last">
        <span class="time-text long-text">预警2</span>
        <a-input-number
          :disabled="
            !(
              (processTime.dayValue ||
                (timeoutCondition === 'in_form' &&
                  processTime.timeConfig === 'then')) &&
              timeoutWarning1.dayValue
            )
          "
          :min="0"
          :precision="0"
          v-model="timeoutWarning2.dayValue"
        />
        <span>天</span>
        <a-input-number
          :disabled="
            !(
              ((processTime.dayValue || processTime.hourValue)||
                (timeoutCondition === 'in_form' &&
                  processTime.timeConfig === 'then')) &&
              (timeoutWarning1.dayValue || timeoutWarning1.hourValue)
            )
          "
          :min="0"
          :max="23"
          :precision="0"
          v-model="timeoutWarning2.hourValue"
        />
        <span>时</span>
        <a-input-number
          :disabled="
            !(
              ((processTime.dayValue || processTime.hourValue || processTime.minuteValue) ||
                (timeoutCondition === 'in_form' &&
                  processTime.timeConfig === 'then')) &&
              (timeoutWarning1.dayValue || timeoutWarning1.hourValue || timeoutWarning1.minuteValue)
            )
          "
          :min="0"
          :max="59"
          :precision="0"
          v-model="timeoutWarning2.minuteValue"
        />
        <span>分</span>
        <a-input-number
          :disabled="
            !(
              ((processTime.dayValue || processTime.hourValue || processTime.minuteValue || processTime.secondValue) ||
                (timeoutCondition === 'in_form' &&
                  processTime.timeConfig === 'then')) &&
              (timeoutWarning1.dayValue || timeoutWarning1.hourValue || timeoutWarning1.minuteValue || timeoutWarning1.secondValue)
            )
          "
          :min="0"
          :max="59"
          :precision="0"
          v-model="timeoutWarning2.secondValue"
        />
        <span>秒</span>
      </div>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { State, Action, namespace } from "vuex-class";

@Component({
  name: "LimitedTime",
})
export default class LimitedTime extends Vue {
  @Prop() value!: boolean;
  @Prop() timeItem!: any;
  @Prop() timeoutCondition!: any;
  @Prop() formDataItem!: any;

  // 限时时间
  processTime: any = {
    dayValue: 0,
    hourValue: 0,
    minuteValue: 0,
    secondValue: 0,
    timeConfig: "then",
    formId: "",
  };
  enable: boolean = false;
  // 超时预警时间1
  timeoutWarning1: any = {
    dayValue: 0,
    hourValue: 0,
    minuteValue: 0,
    secondValue: 0,
  };
  // 超时预警时间2
  timeoutWarning2: any = {
    dayValue: 0,
    hourValue: 0,
    minuteValue: 0,
    secondValue: 0,
  };

  timeConfig: any = [
    {
      name: "当时",
      type: "then",
    },
    {
      name: "之后",
      type: "after",
    },
  ];

  // 数据渲染
  dataMounted(value: any) {
    this.enable = value.enable;
    this.processTime = this.msecToTime(value.processTime);
    this.processTime.formId = value.formId;
    this.processTime.timeConfig = value.timeConfig ? value.timeConfig : "then";
    this.timeoutWarning1 = this.msecToTime(value.timeoutWarning1);
    this.timeoutWarning2 = this.msecToTime(value.timeoutWarning2);
  }
  // 点击关闭事件
  closeModal() {
    this.$emit("close");
  }
  handleOnCinfigChange() {
    this.clearTime();
  }
  handleOnFromChange() {
    this.processTime.timeConfig = "then";
    this.clearTime();
  }
  handleChangeTime() {
    this.clearTime();
  }

  clearTime() {
    this.timeoutWarning1 = {
      dayValue: 0,
      hourValue: 0,
      minuteValue: 0,
      secondValue: 0,
    };
    // 超时预警时间2
    this.timeoutWarning2 = {
      dayValue: 0,
      hourValue: 0,
      minuteValue: 0,
      secondValue: 0,
    };
  }

  // 点击保存事件
  handleOk() {
    const allowedMesc = this.timeSpanToMsec(this.processTime);
    const timeoutWarning1Mesc = this.timeSpanToMsec(this.timeoutWarning1);
    const timeoutWarning2Mesc = this.timeSpanToMsec(this.timeoutWarning2);
    const time = {
      processTime: allowedMesc,
      formId: this.processTime.formId,
      enable: this.enable,
      timeConfig: this.processTime.timeConfig,
      timeoutWarning1: timeoutWarning1Mesc,
      timeoutWarning2: timeoutWarning2Mesc,
    };

    if (!allowedMesc && !timeoutWarning1Mesc && !timeoutWarning2Mesc) {
      this.$emit("submit", time);
      this.closeModal();
      return;
    }
    if (!allowedMesc && this.timeoutCondition === "post_node") {
      this.$message.warning("超时预警需要根据限时时间计算，请填写限时时间！");
      return;
    }
    if (!this.processTime.formId && this.timeoutCondition === "in_form") {
      this.$message.warning("请选择表单字段");
      return;
    }
    if (
      this.processTime.timeConfig === "then" &&
      this.timeoutCondition === "in_form"
    ) {
      if (timeoutWarning1Mesc < timeoutWarning2Mesc) {
        this.$message.warning("限时设置不合理，要求超时预警1>超时预警2！");
        return;
      }
    } else {
      if (
        allowedMesc < timeoutWarning1Mesc ||
        allowedMesc < timeoutWarning2Mesc ||
        timeoutWarning1Mesc < timeoutWarning2Mesc
      ) {
        this.$message.warning(
          "限时设置不合理，要求限时时间>超时预警1>超时预警2！"
        );
        return;
      }
    }

    this.$emit("submit", time);
    this.closeModal();
  }
  // 时间段对象转毫秒数
  timeSpanToMsec(time: any) {
    if (time) {
      const days =
        parseInt(time.dayValue ? time.dayValue : 0, 10) * 1000 * 60 * 60 * 24;
      const hours =
        parseInt(time.hourValue ? time.hourValue : 0, 10) * 1000 * 60 * 60;
      const minutes =
        parseInt(time.minuteValue ? time.minuteValue : 0, 10) * 1000 * 60;
      const seconds =
        parseInt(time.secondValue ? time.secondValue : 0, 10) * 1000;
      return days + hours + minutes + seconds;
    }
    return 0;
  }
  // 毫秒数转为时间对象
  msecToTime(msec: number) {
    let timeObj = {
      dayValue: 0,
      hourValue: 0,
      minuteValue: 0,
      secondValue: 0,
      timeConfig: "then",
      formId: "",
    };
    if (msec) {
      const days = Math.floor(msec / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (msec % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((msec % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((msec % (1000 * 60)) / 1000);
      timeObj = {
        dayValue: days,
        hourValue: hours,
        minuteValue: minutes,
        secondValue: seconds,
        timeConfig: "then",
        formId: "",
      };
    }
    return timeObj;
  }

  @Watch("value")
  onValueChange(v: any) {
    if (v) {
      this.dataMounted(this.timeItem);
    }
  }

  @Watch("timeItem", { deep: true })
  onTimeItemChange(v: any) {
    this.dataMounted(v);
  }
}
</script>
<style lang="less">
.time-wrap {
  margin-bottom: 16px;
  .time-text {
    margin-right: 14px;
  }
  .time-text-left {
    margin-left: 10px;
  }
  .time-tip {
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    margin-left: 10px;
  }
  span.long-text {
    margin-right: 35px;
  }
  .ant-input-number {
    width: 58px;
    margin: 0 8px 0 5px;
    .ant-input-number-handler-wrap {
      width: 18px;
      .ant-input-number-handler-up-inner,
      .ant-input-number-handler-down-inner {
        right: 2px;
      }
    }
    input {
      font-size: 14px;
    }
  }
  &.last {
    margin-bottom: 0;
  }
}
</style>
