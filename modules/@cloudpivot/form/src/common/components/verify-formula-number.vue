<template>
  <div>
    <div class="verify-item">
      <div class="label">校验方式</div>
      <div class="content">
        <a-radio-group v-model="verifyFormula.partterValue">
          <a-radio :value="1" style="width: 120px">常量</a-radio>
          <a-radio :value="2">动态值</a-radio>
        </a-radio-group>
      </div>
    </div>
    <div class="verify-item" style="margin-top: 16px;margin-bottom: 16px;">
      <div class="label">校验规则</div>
      <div class="content">
        <a-config-provider :locale="locale">
        <a-select
          style="width: 120px;flex-shrink:0"
          v-model="verifyFormula.verifyRuleValue"
        >
          <a-select-option
            :key="item.value"
            :value="item.value"
            v-for="item in rule">
            {{ item.name }}
          </a-select-option>
        </a-select>
        </a-config-provider>
        <!-- 常量 校验方式 填值框 -->
        <div style="margin-left: 8px; flex: 1; min-width: 100px" v-show="isQuantity">
          <!--非介于-->
          <a-input-number
            placeholder="请输入"
            style="width:100%"
            v-model="verifyFormula.numInput"
            v-show="!isRangeRule"/>
          <!--介于-->
          <div
            class="content"
            style="align-items: center"
            v-show="isRangeRule">
            <a-input-number
              placeholder="请输入"
              style="width:100%"
              v-model="verifyFormula.numInput1"/>
            <div style="margin: 0 6px;color:rgba(0,0,0,0.65);font-size: 14px;">~</div>
            <a-input-number
              placeholder="请输入"
              style="width:100%"
              v-model="verifyFormula.numInput2"/>
          </div>
        </div>
        <!-- 动态值 校验方式 填值框 -->
        <div style="margin-left: 8px;flex: 1 100%" v-show="!isQuantity">
          <!--非介于-->
          <a-config-provider :locale="locale">
          <a-select
            :value="verifyFormula.selectDataItem"
            @change="selectDataItemHandleChange"
            allowClear
            placeholder="请选择数据项"
            style="width: 100%"
            v-show="!isRangeRule"
          >
            <a-select-option
              :key="item.id"
              :value="item.code"
              v-for="item in selectListDataItemsNumber">
              {{ item.name }}
            </a-select-option>
          </a-select>
          </a-config-provider>
          <!--介于-->
          <div
            class="content"
            v-show="isRangeRule"
            style="align-items: center">
            <config-provider :locale="locale">
              <a-select
                placeholder="请选择数据项"
                :value="verifyFormula.rangeSelectDataItem1"
                @change="rangeSelectDataItem1HandleChange"
                style="width: 100%"
              >
                <a-select-option
                  v-for="item in selectListDataItemsNumber"
                  :key="item.id"
                  :value="item.code">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </config-provider>
            <div style="margin: 0 6px;color:rgba(0,0,0,0.65);font-size: 14px;">~</div>
            <config-provider :locale="locale">
              <a-select
                :value="verifyFormula.rangeSelectDataItem2"
                @change="rangeSelectDataItem2HandleChange"
                placeholder="请选择数据项"
                style="width: 100%"
              >
                <a-select-option
                  v-for="item in selectListDataItemsNumber"
                  :key="item.id"
                  :value="item.code">{{ item.name }}</a-select-option>
              </a-select>
            </config-provider>
          </div>
        </div>
      </div>
    </div>
    <div class="verify-item" style="margin-bottom: 16px;">
      <div class="label" style="margin-top: 5px">校验失败提示语</div>
      <div class="content">
        <a-input maxlength="200" placeholder="请输入" v-model="verifyFormula.promptText"/>
      </div>
    </div>
    <div class="verify-item">
      <div class="label">
        提示弹框
        <a-tooltip title="校验失败提示语字数较多时请使用长提示弹框，只针对web端">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </div>
      <div class="content">
        <a-radio-group v-model="verifyFormula.errDialogboxType">
          <a-radio :value="1" style="width: 120px">短提示弹框</a-radio>
          <a-radio :value="2">长提示弹框</a-radio>
        </a-radio-group>
      </div>
    </div>
    <div class="verify-item-error-tip">
      <div class="content-tip">
        <div class="tip-body" v-if="verifyFormula.errDialogboxType === 1">
          <i class="icon aufontAll h-icon-all-close-circle"/>
          <span>这是一条异常消息，会主动消失</span>
        </div>
        <div class="tip-body-long" v-else-if="verifyFormula.errDialogboxType === 2">
          <div class="top">
            <i class="icon aufontAll h-icon-all-close-circle"/>
            <span>错误提示</span>
            <div>一系列的信息描述，可能会很长。也可以是很短同样也可以带标点。</div>
          </div>
          <div class="bottom">
            <a-button size="small" type="primary">知道了</a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { message,ConfigProvider } from "@h3/antd-vue";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

const VerifyRule = [
  {name:'等于',value:'='},
  {name:'大于',value:'>'},
  {name:'小于',value:'<'},
  {name:'大于等于',value:'>='},
  {name:'小于等于',value:'<='},
  {name:'介于',value:'~'},
]
enum VerifyRuleEnum {
  '='='等于',
  '>'='大于',
  '<'='小于',
  '>='='大于等于',
  '<='='小于等于',
  '~'='介于',
}
interface IVerifyRuleItem {
  name: string
  value: Object
}
interface IVerifyFunctionReturn {
  value: Object
  status: boolean
}
@Component({
  name: "VerifyFormulaNumber",
  components: {
    ConfigProvider
  }
})
export default class VerifyFormulaNumber extends Vue{
  @Prop() selectListDataItemsNumber!: any;
  @Prop() modalData!: any;
  @Prop() verifyFormula!: any;
  @Prop() visible: any;


  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }

    // 校验规则 数组
    rule: IVerifyRuleItem[] = VerifyRule;

    // 动态值 非介于 值
    selectDataItemHandleChange(val: string) {
      this.verifyFormula.selectDataItem = val || ''
    }

    // 动态值 介于 第一个值
    rangeSelectDataItem1HandleChange(val: string) {
      this.verifyFormula.rangeSelectDataItem1 = val || ''
    }

    // 动态值 介于 第二个值
    rangeSelectDataItem2HandleChange(val: string) {
      this.verifyFormula.rangeSelectDataItem2 = val || ''
    }

    // 判断当前校验规则是否是 介于
    get isRangeRule() {
      return this.verifyFormula.verifyRuleValue === '~'
    }

    // 是否是常量模式
    get isQuantity() {
      return this.verifyFormula.partterValue === 1
    }

    closeModal() {
      this.$emit("closeModal");
    }

    @Watch('visible')
    changeModelData(val: any) {
      if (val) {
        if (this.modalData && this.modalData.options) {
          this.modalData.options.verifyFormula && this.parseModalData(this.modalData.options.verifyFormula)
        }
      }
    }

    // 反解析 校验规则
    parseModalData(val: string) {
      if (typeof val == "object") {
        let obj = JSON.parse(JSON.stringify(val));
        for (let key of Object.keys(obj)) {
          let v = obj[key]
          switch (key) {
            case 'type':
              this.verifyFormula.partterValue = (+v as 1 | 2);
              break;
            case 'rule':
              this.verifyFormula.verifyRuleValue = v
              break
            case 'lInput':
              this.verifyFormula.numInput1 = (+v as number)
              break
            case 'rInput':
              this.verifyFormula.numInput2 = (+v as number)
              break
            case 'input':
              this.verifyFormula.numInput = (+v as number)
              break
            case 'select':
              this.verifyFormula.selectDataItem = v
              break
            case 'lSelect':
              this.verifyFormula.rangeSelectDataItem1 = v
              break
            case 'rSelect':
              this.verifyFormula.rangeSelectDataItem2 = v
              break
            case 'prompt':
              this.verifyFormula.promptText = v
              break
            case 'dialogBox':
              this.verifyFormula.errDialogboxType = (+v as 1 | 2)
              break
          }
        }
      } else {
        let arr = val.split('_')
        for (let value of arr) {
          let [key, v] = value.split(':')
          switch (key) {
            case 'type':
              this.verifyFormula.partterValue = (+v as 1 | 2);
              break;
            case 'rule':
              this.verifyFormula.verifyRuleValue = v
              break
            case 'lInput':
              this.verifyFormula.numInput1 = (+v as number)
              break
            case 'rInput':
              this.verifyFormula.numInput2 = (+v as number)
              break
            case 'input':
              this.verifyFormula.numInput = (+v as number)
              break
            case 'select':
              this.verifyFormula.selectDataItem = v
              break
            case 'lSelect':
              this.verifyFormula.rangeSelectDataItem1 = v
              break
            case 'rSelect':
              this.verifyFormula.rangeSelectDataItem2 = v
              break
            case 'prompt':
              this.verifyFormula.promptText = v
              break
            case 'dialogBox':
              this.verifyFormula.errDialogboxType = (+v as 1 | 2)
              break
          }
        }
      }
    }

    // 校验 常量的 input 输入是否正确
    verifyNumInput(numInput: any, numInput1: any, numInput2: any, rValue: Object): IVerifyFunctionReturn {
      let value = '', status = true;
      if (!this.isRangeRule) { // 非介于 规则
        if (('' + numInput).length > 0 && !/^[\+\-]?\d*?\.?\d*?$/.test(numInput)) {
          message.error('校验规则不合法!')
          return {value, status: false}
        } else if (('' + numInput).length > 0) {
          return {value: {...rValue, input: numInput}, status}
        }
      } else { // 介于 规则
        if (('' + numInput1).length > 0 && ('' + numInput2).length == 0) {
          // 只填写左侧边界值
          message.error('请输入右侧边界值!')
          return {value, status: false}
        } else if (('' + numInput1).length == 0 && ('' + numInput2).length > 0) {
          // 只填写右侧边界值
          message.error('请输入左侧边界值!')
          return {value, status: false}
        } else if (('' + numInput1).length > 0 && ('' + numInput2).length > 0) { // 左右边界值 都有填写
          if (!/^[\+\-]?\d*?\.?\d*?$/.test(numInput1)) {
            // 左侧边界值 格式不对
            message.error('校验规则,左侧边界值不合法!')
            return {value, status: false}
          } else if (!/^[\+\-]?\d*?\.?\d*?$/.test(numInput2)) {
            // 右侧边界值 格式不对
            message.error('校验规则,右侧边界值不合法!')
            return {value, status: false}
          }
          return {value: {...rValue, lInput: numInput1, rInput: numInput2}, status}
        }
      }
      return {value, status}
    }

    // 校验 动态值 select下拉选择状态
    verifySelect(selectDataItem: string | [], rangeSelectDataItem1: string | [], rangeSelectDataItem2: string | [], rValue: any): IVerifyFunctionReturn {
      let value = '', status = true
      if (!this.isRangeRule) { // 非介于判断
        if (selectDataItem.length > 0) { // 如果大于0说明选择了值
          let item = this.selectListDataItemsNumber.find((val: any) => val.code === selectDataItem)
          if (item.parentCode) {
            return {value: {...rValue, select: selectDataItem}, status}
          } else {
            return {value: {...rValue, select: selectDataItem}, status}
          }
        }
      } else { // 介于判断
        if (rangeSelectDataItem1.length > 0 && rangeSelectDataItem2.length === 0) {
          // 左侧边界有值 右边界没有
          this.$message.error('请选择右侧边界值!')
          return {value, status: false}
        } else if (rangeSelectDataItem1.length === 0 && rangeSelectDataItem2.length > 0) {
          // 左侧边界没值, 右边界有值
          this.$message.error('请选择左侧边界值!')
          return {value, status: false}
        } else if (rangeSelectDataItem1.length > 0 && rangeSelectDataItem2.length > 0) {
          return {value: {...rValue, lSelect: rangeSelectDataItem1, rSelect: rangeSelectDataItem2}, status}
        }
      }
      return {value, status}
    }

    // 校验失败提示语
    verifyPrompt(promptText: string, partterValue: number, verifyRuleValue: any, rValue: Object): IVerifyFunctionReturn {
      if (promptText.length === 0) {
        // 没有填写 失败提示语,使用默认的提示语
        // 数据项名称+必须+等于/大于/小于/大于等于/小于等于/介于+校验规则
        if (partterValue === 1) { // 常量
          let v = ''
          if (this.isRangeRule) { // 介于 规则
            v = `${this.verifyFormula.currControlOptions.name as any}必须${VerifyRuleEnum[verifyRuleValue]}${this.verifyFormula.numInput1}~${this.verifyFormula.numInput2}`
          } else { // 非介于 规则
            v = `${this.verifyFormula.currControlOptions.name as any}必须${VerifyRuleEnum[verifyRuleValue]}${this.verifyFormula.numInput}`
          }
          return {value: {...rValue, defaultPrompt: v}, status: true}
        } else { // 动态值
          let v = ''
          if (this.isRangeRule) { // 介于 规则
            let [cname1] = this.selectListDataItemsNumber.filter((val) => val.code === this.verifyFormula.rangeSelectDataItem1)
            let [cname2] = this.selectListDataItemsNumber.filter((val) => val.code === this.verifyFormula.rangeSelectDataItem2)
            v = `${this.verifyFormula.currControlOptions.name as any}必须${VerifyRuleEnum[verifyRuleValue]}${cname1.name}~${cname2.name}`
          } else { // 非介于 规则
            let [cname] = this.selectListDataItemsNumber.filter((val) => val.code === this.verifyFormula.selectDataItem)
            v = `${this.verifyFormula.currControlOptions.name as any}必须${VerifyRuleEnum[verifyRuleValue]}${cname.name}`
          }
          return {value: {...rValue, defaultPrompt: v}, status: true}
        }
      } else {
        let encodeText = promptText
        return {value: {...rValue, prompt: encodeText}, status: true}
      }
    }

    backData() {
      const value = this.getData();
      this.$emit("backData", {value: value ? JSON.stringify(value) : ''});
    }

    getData() {
      let rValue: any = {
        type: this.verifyFormula.partterValue,
        rule: this.verifyFormula.verifyRuleValue,
        dialogBox: this.verifyFormula.errDialogboxType
      }
      if (this.verifyFormula.partterValue === 1) {
        let {value, status} = this.verifyNumInput(this.verifyFormula.numInput, this.verifyFormula.numInput1, this.verifyFormula.numInput2, rValue)
        if (!status) return
        rValue = value
      } else {
        let {value, status} = this.verifySelect(this.verifyFormula.selectDataItem, this.verifyFormula.rangeSelectDataItem1, this.verifyFormula.rangeSelectDataItem2, rValue)
        if (!status) return
        rValue = value
      }
      // 如果校验规则 选择框或输入框没有内容,默认值为 空
      if (rValue) {
        let {value} = this.verifyPrompt(this.verifyFormula.promptText, this.verifyFormula.partterValue, this.verifyFormula.verifyRuleValue, rValue)
        rValue = value;
        return rValue;
      } else {
        return '';
      }
    }

    created() {
      if (this.modalData && this.modalData.options) {
        this.modalData.options.verifyFormula && this.parseModalData(this.modalData.options.verifyFormula)
      }
    }
  }
</script>
<style lang="less" scoped>
  .verify-item {
    display: flex;
    width: 100%;
    height: 32px;
    align-items: center;
    
    .label {
      width: 16.66666667%;
      flex-shrink: 0;
      /*margin-right: 10px;*/
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
    }
    
    .content {
      display: flex;
      flex: 1;
    }
  }

  .verify-item-error-tip {
      margin-left: 16.66666667%;

      .content-tip {
        width: 100%;
        height: 124px;
        background: #F4F5F8;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;

        .tip-body {
          width: 278px;
          background: #FFFFFF;
          box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          padding: 5px;

          i {
            color: #F4454E;
            margin-right: 10px;
            margin-left: 10px;
          }
        }

        .tip-body-long {
          padding: 12px 12px 10px;
          width: 284px;
          height: 108px;
          background: #FFFFFF;
          box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
          border-radius: 2px;

          .top {
            i {
              color: #F4454E;
              float: left;
              margin-right: 12px;
              height: 20px;
              line-height: 20px;
              font-size: 14px;
            }

            span {
              display: block;
              overflow: hidden;
              color: rgba(0, 0, 0, .85);
              font-weight: 500;
              font-size: 14px;
              line-height: 1.4;
            }

            div {
              margin-top: 8px;
              color: rgba(0, 0, 0, .65);
              font-size: 12px;
              margin-left: 26px;
            }
          }

          .bottom {
            float: right;
          }
        }
      }
    }
</style>
