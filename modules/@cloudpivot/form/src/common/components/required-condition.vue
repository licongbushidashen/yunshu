<template>
  <a-modal
    :title="title"
    :visible="true"
    width="536px"
    @cancel="closeModal"
    @ok="backData"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Save')"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-row v-if="type !== 'showRule'">
      <a-col :span="4">检查类型</a-col>
      <a-col :span="20">
        <a-select
          :disabled="true"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
          v-model="checkType"
        >
          <a-select-option :key="1" value="requiredRule">必填</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row v-if="isRequireConditon && requiredType !== 2">
      <a-col :span="4">{{ checkTitle }}</a-col>
      <a-col :span="20">
        <a-select
          :disabled="true"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
          v-model="dataItem.code"
        >
          <a-select-option
              :key="i.id"
              :value="i.code"
              v-for="i in showDataItems">
            {{ i.name }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row v-if="type !== 'showRule'">
      <a-col :span="4">必填方式</a-col>
      <a-col :span="20">
        <a-radio-group name="radioGroup" v-model="requiredType">
          <a-radio :value="0" :disabled="isShowRequired">非必填</a-radio>
          <a-radio :disabled="isShowRequired" :value="1">必填</a-radio>
          <a-radio :disabled="isShowRequired" :value="2">满足条件必填</a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <template v-if="isRequireConditon">
      <dataitem-condition
        v-show="requiredType === 2"
        v-model="model"
        :items="dataItems"
      ></dataitem-condition>
    </template>
    <template v-else>
      <dataitem-condition v-model="model" :items="dataItems"></dataitem-condition>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { DataItemType } from "@cloudpivot/form/schema";
import { DateItemOperatorType, OperatorService } from "@cloudpivot/form/src/common/data-item/data-item2";
import DataitemCondition from "@cloudpivot/form/src/common/data-item/dataitem-condition2.vue";
import { DataitemConditionValue } from "@cloudpivot/form/src/common/data-item/typings";
import { DataItemState } from "@cloudpivot/form/src/stores/data-items.store";
import cloneDeep from "lodash/cloneDeep";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from 'vuex-class';
import * as dataitemStore from "@cloudpivot/form/src/stores/data-items.store-helper";

@Component({
  name: "RequiredConditon",
  components: {
    DataitemCondition
  }
})
export default class RequiredConditon extends Vue {
  @Prop({
    type: Object
  })
  modalData!: any;
  @Prop({type:Object})
  modalOptions!:any

  @Prop({
    default: () => ({})
  })
  dataItem!: DataItemState;

  @Prop({default:false})
  isShowRequired!: any;

  dataItems: DataItemState[] = [];

  showDataItems: DataItemState[] = [];

  model: DataitemConditionValue = {
    type: 1,
    conditions: []
  };
  type = '';

  requiredType: number = 0;
  checkType: string = 'requiredRule';
  currControlOptions = null;

  get title():string {
    if (this.type === 'showRule') {
      return this.$t("languages.Apps.FormDesignPage.IsShowRule") as string
    } else {
      return this.$t("languages.Apps.FormDesignPage.NecessaryRule") as string;
    }
  }

  get checkTitle(): string {
    if (this.type === 'showRule') {
      return "显示数据项";
    } else {
      return "校验数据项";
    }
  }

  get tipsInfo(): string {
    if (this.type === 'showRule') {
      return this.$t(
        "languages.Apps.FormDesignPage.NecessaryRuleText_3"
      ) as string
    } else {
      return this.$t(
        "languages.Apps.FormDesignPage.NecessaryRuleText_2"
      ) as string
    }
  }

  get isRequireConditon():boolean {
    return this.type !== 'showRule';
  }

  @Watch("modalOptions",{immediate:true})
  onModalOptions(modalOptions:any){
    this.type = modalOptions.modalType;
  }

  @Watch("modalData", {
    immediate: true
  })
  onModalDataChange(modalData: any) {

    if (!modalData.data) {
      return;
    }

    const data = modalData.data;
    const type = modalData.type;

    let items = dataitemStore.getDataItems(this).filter((item: any) => {
      if (item.isSystem) {
        switch (item.code) {
          case 'creater':
          case 'createdTime':
          case 'sequenceNo':
          case 'modifier':
          case 'modifiedTime':
          case 'owner':
          case 'createdDeptId':
            return item && !item.isSystem;
        }
      } else {
        return item;
      }
    });
    console.log(modalData, 'modalData')
    console.log(items, 'items')
    console.log(this.dataItem, 'this.dataItem')
    if (this.dataItem.parentCode) {
      const sheet = items.find(x => x.code === this.dataItem.parentCode);
      if (sheet && sheet.properties) {
        const sheetItems = sheet.properties.filter(
          (x: any) => x.used
        ) as any;
        items = items.concat(sheetItems);
      }
    }
    // this.showDataItems = JSON.parse(JSON.stringify(items));
    this.showDataItems = cloneDeep(items);
    console.log(this.showDataItems, 'this.showDataItems')
    // items = items.filter(x => x.code !== this.dataItem.code)

    this.dataItems = items;

    if (data.value) {
      this.initModel(data.value);
    }
  }

  initModel(exp: string) {
    //
    let segs: string[] = [];
    let type = 1;
    if (exp === 'true') {
      this.requiredType = 1;
    }
    if (exp && exp !=='true') {
      this.requiredType = 2;
    }
    if (exp.indexOf("||") > -1) {
      type = 2;
      segs = exp.split(" || ");
    } else {
      if (exp.indexOf("&&") > -1) {
        segs = exp.split(" && ");
      } else {
        segs = [exp];
      }
    }

    const conditions: any[] = [];

    for (const seg of segs) {
      console.log(segs, 'seg');
      // 先判断空格出现的次数
      const countOfSpace:number = seg.split(' ').length-1;
      let fields: string[] = [];
      if (countOfSpace === 1) { // 一次直接切割
        fields = seg.split(" ");
      } else { // 多次则 按空格标识分割 但是非字符串中的空格 例：{ShortText1618474250748} == '121 12 1'
        const point1 = seg.indexOf(" ");
        const point2 = seg.indexOf(" ", point1+1);
        fields[0] = seg.substring(0, point1);
        fields[1] = seg.substring(point1 + 1, point2);
        fields[2] = seg.substring(point2 + 1);
      }
      const code = fields[0].substring(1, fields[0].length - 1);

      let item: DataItemState | undefined;

      const idx = code.indexOf(".");
      if (idx > -1) {
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const sheet = this.dataItems.find(x => x.code === parentCode);
        if (sheet && sheet.properties) {
          item = sheet.properties.find(x => x.code === childCode) as any;
        }
      } else {
        item = this.dataItems.find(x => x.code === code);
      }

      if (!item) {
        continue;
      }

      let operator = OperatorService.findByLabel(item.type, fields[1]);

      if (!operator) {
        continue;
      }

      let val: any;

      if (
        !(
          operator.value === DateItemOperatorType.IsNull ||
          operator.value === DateItemOperatorType.IsNotNull
        )
      ) {
        val = fields[2];

        switch (item.type) {
          case DataItemType.Number:
            val = Number(val);
            break;
          case DataItemType.Logic:
            val = val === "true" ? 1 : 0;
            break;
          case DataItemType.Date:
          case DataItemType.Time:
          case DataItemType.ShortText:
          case DataItemType.Radio:
          case DataItemType.Checkbox:
          case DataItemType.Dropdown:
          case DataItemType.DropdownMulti:
          case DataItemType.LongText:
            val = val.substring(1, val.length - 1);
            break;
          case DataItemType.StaffMulti:
          case DataItemType.StaffSingle:
          case DataItemType.DeptSingle:
          case DataItemType.DeptMulti:
          case DataItemType.StaffDeptMix:
            if (val) {
              try {
                val = JSON.parse(val);
              } catch (e) {
                console.log("initModel", e);
              }
            }
            break;
        }
      }

      conditions.push({
        propertyCode: code,
        propertyType: item.type,
        operatorType: operator.value,
        value: val
      });
    }

    this.model = {
      type,
      conditions
    };
  }

  backData() {
    let symbol = this.model.type === 1 ? "&&" : "||";

    let exp = this.model.conditions
      .map(cond => {
        let operator = OperatorService.findByValue(
          cond.propertyType,
          cond.operatorType
        );

        if (!operator) {
          return null;
        }

        let text = "";

        let val = cond.value;

        if (cond.propertyType === DataItemType.Number) {
          if(cond.operatorType === DateItemOperatorType.IsNull || cond.operatorType === DateItemOperatorType.IsNotNull){
            text = '';
          }else{
            val = Number(val);
            if (Number.isNaN(val)) {
              return null;
            }
            text = val.toString();
          }
        } else if (cond.propertyType === DataItemType.Logic) {
          val = val === "true" || val === 1;
          text = `${val}`;
        } else if (cond.propertyType === DataItemType.StaffSingle || cond.propertyType === DataItemType.StaffMulti || cond.propertyType === DataItemType.StaffDeptMix || cond.propertyType === DataItemType.DeptMulti || cond.propertyType === DataItemType.DeptSingle) {
          if (val && Array.isArray(val)) {
            const arr = val.map((x: any) => {
              return {
                id: x.id,
                name: x.name,
                type: x.type,
                parentId: x.parentId
              };
            });

            text = JSON.stringify(arr);
          }
        } else {
          text = `'${val}'`;
        }

        let code = `{${cond.propertyCode}}`;
        // if(this.dataItem.parentCode){
        //   code = `{${this.dataItem.parentCode}.${cond.propertyCode}}`;
        // }else{
        //   code = `{${cond.propertyCode}}`;
        // }

        if (
          operator.value === DateItemOperatorType.IsNull ||
          operator.value === DateItemOperatorType.IsNotNull
        ) {
          return `${code} ${operator.label}`;
        }

        return `${code} ${operator.label} ${text}`;
      })
      .filter(x => x !== null)
      .join(` ${symbol} `);

    if (this.isRequireConditon) {
      if (this.requiredType === 1) {
        exp = 'true';
      } else if (this.requiredType === 0) {
        exp = '';
      }
    }

    const data = {
      value: exp
    };

    this.$emit("backData", data);
  }

  closeModal() {
    this.$emit("closeModal");
  }
}
</script>

<style lang="less">
.required-type {
  margin-bottom: 16px;
}
.ant-row {
  margin-bottom: 10px;
  .ant-col-4 {
    line-height: 32px;
  }
  .ant-col-20{
    line-height: 32px;
  }
}
</style>
