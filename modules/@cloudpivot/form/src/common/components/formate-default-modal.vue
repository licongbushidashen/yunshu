<template>
  <a-modal
    title="显示格式设置"
    width="520px"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="backData"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Ok')"
  >
    <a-form class="app-form">
      <a-form-item
        label="同步默认格式"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 12 }"
        class="form-label"
      >
        <a-switch v-model="syncFlag" @change="onsyncChange"></a-switch>
        <p class="message">即与数据模型{{ modalData.attributes[0].dataItem.name }}默认格式保持一致</p>
      </a-form-item>
      <a-form-item
        label="显示格式"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 12 }"
        class="form-label"
      >
        <a-select v-model="showFormate" style="width: 180px" @change="changeShowFormate">
          <a-select-option v-for="item in formteList" :key="item.value" :value="item.value"> 
            {{ item.label }} 
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

const DataModelModule = namespace("Apps/DataModel");

@Component({
  name: "FormateDefaultModal",
  components: {},
})
export default class DictionaySetting extends Vue {
  @Prop({}) modalData!: any
  @Prop({}) getControl!:any
  @Prop({}) getFormControls!:any

  closeModal() {
    this.$emit("closeModal");
  }

  control: any = null

  syncFlag: any = true   // 是否开启同步

  // 默认格式
  get defaultFormat() {
    return this.control.options && this.control.options.format
  }
  
  // 显示格式
  showFormate: string = ''
  
  formteList: any[] = []

  changeShowFormate(val) {
    console.log(val)
    this.syncFlag = false
  }

  backData() {
    const backData: any = {}
    backData.value = this.showFormate
    backData.syncFlag = this.syncFlag
    this.$emit("backData", backData);
  }


  onsyncChange(flag: boolean) {
    if(flag) {
      this.showFormate = this.control.options.format
    } else {
      // 关闭开关时若不存在显示格式则取默认格式
      this.showFormate = this.control.options.format1 || this.control.options.format
    }
  }

  @Watch("modalData", {
    immediate: true
  })
  onModalDataChange(modalData: any) {
    // 每次数据改变同步control
    this.control = this.getControl()
    // let fromList = this.getFormControls()
    let items:any = modalData.items
    // 判断是否为历史数据
    let code:string = this.control.key
    // let target:any = fromList[code]
    let target: any = items && items[code] || null

    if(target && target.options) {
      if(!('syncFormate' in target.options) && target.options.format !== target.options.format1) {
        // 兼容历史数据原本为空值的，显示格式为空值则表示同步默认
        if(target.options.format1 === '') {
          this.syncFlag = true  
        } else {
          this.syncFlag = false
        }
      } else {
        this.syncFlag = this.control.options.syncFormate
      }
    } else {
      this.syncFlag = this.control.options.syncFormate
    }
    // 获取父组件
    this.onsyncChange(this.syncFlag)
    const p = this.$parent as any
    this.formteList = p.modalOptions && p.modalOptions.list || []
  }

}
</script>
<style lang="less" scoped>
</style>

<style lang="less">
.app-form {
  .ant-form-item-label {
    text-align: left;
  }

  .message {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 17px;
  }
}
</style>
