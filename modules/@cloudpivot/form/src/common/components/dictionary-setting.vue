<template>
  <a-modal
    title="数据字典"
    width="640px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <!-- <span>看看是否可复用data-dictionaries.vue</span> -->
    <data-dictionaries
        ref="DataDictionariesRef"
        :modalData="dataDictionaryData"
    ></data-dictionaries>
    <template slot="footer">
      <a-button @click="closeModal">取消</a-button>
      <a-button @click="delDataDictionary">删除字典</a-button>
      <a-button type="primary" @click="handleOk">保存</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { ConfigProvider } from "@h3/antd-vue";
import { namespace } from "vuex-class";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import DataDictionaries from "@cloudpivot/form/src/common/components/data-dictionaries.vue";
import {
  DataItemType,
  FormControlType,
  DataItemTypeText,
} from "@cloudpivot/form/schema";

const DataModelModule = namespace("Apps/DataModel");

@Component({
  name: "DictionaySetting",
  components: {
    ConfigProvider,
    DataDictionaries
  },
})
export default class DictionaySetting extends Vue {
  @DataModelModule.State("dataItem") dataItems: any;
  @Prop({
    type: Object,
  })
  modalData!: any;

  created() {
    this.initData();
  }
  dataDictionaryData: any = {}; // 数据字典数据

  initData() {
    const data = this.modalData.data;
    if (data.value) {
      this.dataDictionaryData = data.value.options
    }
  }

  getData() {
    let backData: any = "";
    backData = (this.$refs.DataDictionariesRef as any).bizmodeBack();
    return backData;
  }

  closeModal() {
    this.$emit("closeModal");
  }

  handleOk() {
    let backdata = this.getData()
    if(!backdata) {
      this.delDataDictionary()
      return
    }
    this.$emit("backData", {
      value: {
        "options": backdata,
        "isUseDataDictionary": true
      }
    });
  }
  delDataDictionary(){
    this.$emit("backData", {
      value: ''
    });
  }
}
</script>
<style lang="less" scoped>
</style>
