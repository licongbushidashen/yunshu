<template>
  <a-modal
    :title="$t('languages.Apps.FormDesignPage.OptionSetting')"
    width="360px"
    :visible="true"
    @cancel="closeModal"
    @ok="handleOk"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="add-option-wrap">
      <ul ref="condionwrap">
        <li class="clearfix" v-for="(modulem, index) in options" :key="index">
          <div class="default">
            <a-checkbox v-model="modulem.default" />
          </div>
          <div class="input-wrap">
            <a-input
              v-if="filterType === 1"
              :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
              v-model="modulem.value"
            />
            <a-input
              v-else
              :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
              v-model="modulem.value"
              @change="inputChange(index,$event)"
            />
            <!-- <div class="tips"><span>请输入不以空格开头长度不超过200个字符</span></div> -->
          </div>
          <div>
            <span @click="deleteRow(index)">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </div>
        </li>
      </ul>
      <div class="ant-row-flex ant-row-flex-center">
        <div class="add" @click="addRows">
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
import { Component, Vue, Watch, Emit, Prop } from "vue-property-decorator";
import Bus from "@cloudpivot/form/utils/bus";
import { sliceString } from "@cloudpivot/form/utils/utils";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
@Component({
  name: "addCheckboxOption"
})
export default class AddSelectOption extends Vue {
  @Prop({
    type: Object
  })
  modalData!: any;
  @Prop({
    default: () => ({})
  })
  dataItem!: DataItemState;

  visibleIncrease: boolean = false;

  increaseValue:string = '';

  filterType = 0;
  options: Array<any> = [
    {
      default: false,
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
  @Watch('options' ,{
    immediate: true
  })
  aaOptions (val: any){
    console.log(val ,'check-options+++++++++++++++++++')
  }
  created() {
    const data = this.modalData.data;

    if (this.dataItem && this.dataItem.type === 1) {
      this.filterType = 1;
    }

    if (data.value) {
      // if (typeof this.modalData.data.expressionObject === 'undefined') return;
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
    }
  }
  /* 新增行 */
  addRows() {
    const el: any = this.$refs.condionwrap;
    const option = {
      default: false,
      value: ""
    };
    this.options.push(option);
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 10);
  }
  /* 删除行 */
  deleteRow(index: number) {
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
  closeModal() {
    this.$emit("closeModal");
  }
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
  inputChange(index: number, el: any) {
    this.options[index].value = sliceString(this.options[index].value, 200);
  }
}
</script>
<style lang="less" scoped >
// /deep/.ant-modal-body{
//   max-height: 300px;
//   overflow-y: auto;
//   &::-webkit-scrollbar {
//     width: 0;
//   }
// }
.add-option-wrap {
  margin-right: -24px;
  min-height: 200px;
  overflow: hidden;
  .add {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    margin-right: 24px;
    span {
      margin-right: 8px;
    }
  }
  ul {
    max-height: 254px;
    overflow-y: auto;
    overflow-x: hidden;
    li {
      margin-bottom: 16px;
      & > div {
        float: left;
        margin-right: 12px;
        &:last-child {
          margin-top: 5px;
          cursor: pointer;
          margin-right: 12x;
        }
      }
      .input-wrap {
        width: 240px;
        .tips {
          color: #f5222d;
          font-size: 12px;
        }
        // .error{
        //   box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
        //   border-right-width: 1px !important;
        //   border-color: #f5222d;
        //   outline: 0;
        // }
      }
      .default {
        margin-top: 6px;
        /deep/.ant-radio-wrapper {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
