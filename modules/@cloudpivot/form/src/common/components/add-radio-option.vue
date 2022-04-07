<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.OptionSetting')"
    width="360px"
    :visible="true"
    @cancel="closeModal"
    @ok="handleOk"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="add-option-wrap">
      <div class="radio-group" ref="condionwrap">
        <a-radio-group :value="defaultValue" @change="radioChange">
          <div
            v-for="(modulem, index) in options"
            :key="index"
            class="radio-item-wrap clearfix"
          >
            <div class="radio-wrap">
              <a-radio class="radio-item" :value="index"></a-radio>
            </div>
            <div class="input-wrap">
              <a-input
                :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
                class="input"
                v-model="modulem.value"
                maxlength="200"
                @change="inputChange(index)"
              />
            </div>
            <div class="delete-wrap">
              <span class="delete" @click="deleteRow(index)">
                <i class="icon aufontAll h-icon-all-delete-o"></i>
              </span>
            </div>
          </div>
        </a-radio-group>
      </div>
      <div class="ant-row-flex ant-row-flex-center">
        <div class="add" @click="addRow">
          <span>
            <i class="icon aufontAll h-icon-all-plus-o"></i>
          </span>
          <span>{{ $t('languages.Apps.FormDesignPage.AddOptins') }}</span>
        </div>
        <div class="add" @click="addAllRow">
          <span>
            <i class="icon aufontAll h-icon-all-plus-o"></i>
          </span>
          <span>{{ $t("languages.Apps.FormDesignPage.BatchSetting") }}</span>
        </div>
        <a-modal
          :title="$t('languages.Apps.FormDesignPage.BatchSettingTitle')"
          :cancelText="$t('languages.Apps.Cancel')"
          :okText="$t('languages.Apps.Ok')"
          :visible="visibleIncrease"
          @ok="handleBatchOk"
          @cancel="handleBatchClose"
          class="modal"
          :width="340"
          :maskClosable="false"
          :keyboard="false"
        >
          <a-textarea
            v-model="increaseValue"
            :rows="4"
            :maxLength="100000"
            :placeholder="$t('languages.Apps.FormDesignPage.BatchSettingTextarea')"
          />
        </a-modal>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit ,Watch } from "vue-property-decorator";
import { sliceString } from "@cloudpivot/form/utils/utils";

@Component({
  name: "AddRadioModal"
})
export default class AddRadioModal extends Vue {
  @Prop({
    type: Object
  })
  modalData!: any;
  options: Array<any> = [
    {
      default: true,
      value: ""
    },
    {
      default: false,
      value: ""
    },
    {
      default: false,
      value: ""
    }
  ];
  defaultValue: number = -1;

  visibleIncrease: boolean = false;

  increaseValue:string = '';

  created() {
    const data = this.modalData.data;

    if (data.value) {
      // this.options = this.modalData.data.expressionObject.options;
      // const dataLength = this.modalData.data.length;
      // for (let i = 0; i < dataLength; i+=1) {
      //   if (this.modalData.data[i].defaltValue) {
      //     this.defaultValue = i;
      //   }
      // }
      this.options = data.value
        .split(";")
        .filter((s: string) => s.length)
        .map((s: string) => ({
          default: false,
          value: s
        }));

      if (data.default) {
        data.default
          .split(";")
          .filter((s: string) => s.length)
          .forEach((s: string) => {
            const opt = this.options.find(x => x.value === s);
            if (opt) {
              opt.default = true;
            }
          });
      }

      for (let i = 0; i < this.options.length; i++) {
        if (this.options[i].default) {
          this.defaultValue = i;
          break;
        }
      }
    }
  }
  /**
   * 弹框关闭
   */
  closeModal() {
    this.$emit("closeModal");
  }
  /**
   * 讲数据传出
   */
  handleOk() {
    const value = this.options
      .filter(x => x.value)
      .map(x => x.value)
      .join(";");

    const defaultValue = this.options
      .filter(x => x.value && x.default)
      .map(x => x.value)
      .join(";");

    const backData = {
      value: value,
      default: defaultValue
    };

    this.$emit("backData", backData);
  }
  /**
   * 增加行
   */
  addRow() {
    const el: any = this.$refs.condionwrap;
    const obj = {
      default: this.options.length === 0 ? true : false,
      value: ""
    };
    this.options.push(obj);
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
  }
  /**
   * 删除行
   */
  deleteRow(index: number) {
    // console.log('delete' ,index ,this.defaultValue ,this.options)
    // 判读当前想是否为被选中项，如果是，则将选中项清空
    if(this.defaultValue === index) {
      this.defaultValue = -1
    }
    // 判断当前删除项是否为当前被选中项的前面，如果是，则被选中项要减去1
    if(index < this.defaultValue && this.defaultValue >= 1) {
      this.defaultValue--
    }
    // console.log('delete' ,index ,this.defaultValue ,this.options)
    this.options.splice(index, 1);
  }
  addAllRow() {
    this.visibleIncrease = !this.visibleIncrease
  }
  /**
   * 批量设置自定义选项
   */
  handleBatchOk() {
    if (!this.increaseValue) {
      this.handleBatchClose()
      return false
    }

    const arrValue:string[] = this.increaseValue.split(/[(\r\n)\r\n]+/);
    const length:number = this.options.length
    const el: any = this.$refs.condionwrap;
    const obj:object[] = []
    arrValue.forEach((value:string, index:number) => {
      obj.push({
        default: length === 0 ? true : false,
        value: value
      })
    })
    this.options = [...this.options, ...obj];
    // this.increaseValue = '';
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
    this.handleBatchClose()
  }

  // 关闭批量设置自定义选项
  handleBatchClose() {
    this.visibleIncrease = false
  }
  /**
   * 单选框改变回调
   */
  radioChange(e: any) {
    console.log('change' ,parseInt(e.target.value, 10))
    this.defaultValue = parseInt(e.target.value, 10);
    const optionsLength = this.options.length;
    for (let i = 0; i < optionsLength; i += 1) {
      this.options[i].default = false;
    }
    this.options[this.defaultValue].default = true;
  }
  inputChange(index: number) {
    this.options[index].value = sliceString(this.options[index].value, 200);
  }
}
</script>
<style lang="less" scoped>
.add-option-wrap {
  margin-right: -24px;
  min-height: 200px;
  overflow: hidden;
  .add {
    color: @primary-color;
    text-align: center;
    margin-right: 24px;
    cursor: pointer;
    span {
      margin-right: 8px;
    }
  }
  .radio-group {
    max-height: 254px;
    overflow: auto;
    /deep/.ant-radio-wrapper {
      margin-right: 0;
    }
    .input {
      width: 240px;
    }
    .delete {
      // float: right;
      margin-left: 8px;
    }
    .radio-item-wrap {
      margin-bottom: 16px;
      & > div {
        float: left;
      }
      .input-wrap {
        margin-left: 8px;
      }
      .radio-wrap,
      .delete-wrap {
        margin-top: 4px;
      }
    }
  }
}
</style>
