<template>
  <a-modal
    title="映射关系"
    width="640px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <a-row type="flex" style="align-items:center;">
      <a-col :span="4">数据项类型</a-col>
      <a-col :span="20">
        <a-select style="width: 100%" :disabled="true" v-model="currentDataType">
          <template v-for="item in dataItemTypeList">
              <a-select-option
                :value="item.key"
                :key="item.key"
              >{{ item.value }}</a-select-option>
            </template>
        </a-select>
      </a-col>
    </a-row>
    <div class="mappingBody">
      <user-selection-map :dataItem="dataItems" :maping="selectMappingData" :control="control" ref="user1SelectMapRef"></user-selection-map>
    </div>

    <template slot="footer">
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleOk">保存</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import UserSelectionMap from "./user-selection-map.vue";
import {
  ConfigProvider,
} from "@h3/antd-vue";
import { namespace } from "vuex-class";
import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";
import { DataItemType, FormControlType, DataItemTypeText } from "@cloudpivot/form/schema";
import { listApi } from "@cloudpivot/api";

const DataModelModule = namespace("Apps/DataModel");

@Component({
  name: "UserSelectionMap2",
  components: {
    UserSelectionMap,
    ConfigProvider,
  },
})
export default class UserSelectionMap2 extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;
  @Prop({
    type: Object,
  })
  modalData!: any;

  selectMappingData: any = "";

  control: any = {};

  dataItemTypeList: any[] = [];
  currentDataType = '';

  created() {
    this.initData();
  }

  initData() {
    // 获取数据类型
    for(let key in DataItemTypeText) {
      this.dataItemTypeList.push({
        key,
        value: DataItemTypeText[key]
      })
    }
    let dataItemTypeArr: any[] = [];
    for(let key in DataItemType) {
      dataItemTypeArr.push({
        key,
        value: DataItemType[key]
      })
    }
    
    let dataItem: any = this.$attrs.dataItem;
    let findItem: any = dataItemTypeArr.find(x => x.value === dataItem.type);
    if (findItem) {
      this.currentDataType = findItem.key;
      this.control = dataItem;
      this.control.parentKey = dataItem.parentCode;
    }
    const exp = this.modalData ? this.modalData.data : null;
    if (exp && exp.value) {
      this.selectMappingData = exp.value;
    }
  }

  closeModal() {
    this.$emit("closeModal");
  }

  handleOk() {
    let backData: any = "";
    backData = (this.$refs.user1SelectMapRef as any).getMaping();
    // 检验设置是否合法 后续再优化
    if (backData) {
      const mapArr: any = backData.split(";");
      mapArr.pop();
      if (Array.isArray(mapArr)) {
        let isMatch = mapArr.every(val => {
          //修改为可以携带.的字符，匹配子表编码拼接子表数据项编码
          if(val.indexOf('.') > -1 ){
            return /\w+:\{\w+\.\w+\}/.test(val);
          } else{
            return /\w+:{\w+}/.test(val);
          }
        });
        if (!isMatch) {
          this.$message.error("映射不合法");
          return;
        }
      }
    }

    this.$emit("backData", {
      value: backData
    });
  }
}
</script>
<style lang="less" scoped>
  .mappingBody {
    margin: 15px 0;
  }
</style>
