<template>
  <a-modal
      :cancelText="$t('languages.Apps.Cancel')"
      :keyboard="false"
      :maskClosable="false"
      :okText="$t('languages.Save')"
      :title="title"
      :visible="visible"
      @cancel="closeModal"
      @ok="backData"
      width="640px"
  >
    <a-row class="required-type">
      <a-col :span="4">
        <span>{{ type === 'other' ? '校验数据项' : '显示数据项' }}</span>
      </a-col>
      <a-col :span="20">
        <a-select
            :disabled="!isAdd"
            @change="handleChangeData"
            class="data-item-select-content"
            style="width: 100%"
            placeholder="请选择"
            v-model="modalData.propertyCode"
            :showSearch="true"
            optionFilterProp="children"
            :filter-option="filterOption" 
        >
          <a-select-option :key="i.id" :value="i.code" :disabled="i.isDisabled" v-for="i in formatDataItemFiler">
            <div class="select-option-flex">
              <div class="left">{{ i.name }}</div>
              <div :style="{'background': i.color}" class="right">{{ i.text }}</div>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <template v-if="(type === 'other')">
      <a-row class="required-type">
        <a-col :span="4">
          <span>检验方式</span>
        </a-col>
        <a-col :span="20">
          <a-radio-group name="radioGroup" v-model="requiredType">
            <a-radio :value="1">必填</a-radio>
            <a-radio :value="2">满足条件必填</a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
      <template>
        <dataitem-condition
            :items="dataItems"
            :currControlOptions="currControlOptions"
            v-model="model"
            v-show="requiredType === 2">
        </dataitem-condition>
      </template>
    </template>
    <dataitem-condition
        v-if="type === 'display' && modalData.propertyCode"
        :items="dataItems"
        :currControlOptions="currControlOptions"
        :currentPropertyCode="modalData.propertyCode"
        v-model="model">
    </dataitem-condition>
  </a-modal>
</template>
<script lang="ts">
import { DataItemState } from "@/components/apps/form-design/stores/data-items.store";
import { DataItemType, DataItemTypeColor, DataItemTypeText } from "@/components/apps/form-design/typings";
import { DateItemOperatorType, OperatorService } from "@/components/shared/data-item/data-item2";
import DataitemCondition, { DataitemConditionValue } from "@cloudpivot/form/src/common/data-item/dataitem-condition2.vue";
import { cloneDeep } from "lodash";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: "AddOtherRules",
  components: {
    DataitemCondition,
  },
})
export default class AddOtherRules extends Vue {
  @DataModelModule.State('dataItem') dataItem: any;
  @Prop({
    type: Object,
  })
  modalData!: any;
  @Prop({
    default: false,
  }) visible!: boolean;
  @Prop({
    default: true,
  }) isAdd!: boolean;

  @Prop() type: any;
  @Prop() list: any;

  @Prop() bizSchemaCode: any;

  formatDataItem: any[] = [];
  formatDataItemFiler: any[] = [];

  dataItems: DataItemState[] = [];

  model: DataitemConditionValue = {
    type: 1,
    conditions: [],
  };

  requiredType = 1;
  currControlOptions = null;

  get title(): string {
    if (this.type === "other") {
      return this.isAdd ? '新建必填规则' : '编辑必填规则';
    } else {
      return this.isAdd ? '新建显示规则' : '编辑显示规则';
    }
  }

  handleChangeData(value) {
    this.currControlOptions = this.formatDataItemFiler.find(i => i.code === value);
    this.dataItems = this.dataItems.filter((item)=>{
      if (item.parentCode) {
        return `${item.parentCode}.${item.code}` !== value;
      } else{
        return item.code !== value;
      }
    });
  }

  filterOption(input, option) {
      return (
      option.componentOptions.children[0].children[0].children[0].text.trim().toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  }

  @Watch('visible')
  changeVisible(val) {
    this.formatDataItem = [];
  }

  @Watch('formatDataItem')
  changeDataItem() {
    this.currControlOptions = this.formatDataItem.find(i => i.code === this.modalData.propertyCode);
    if (this.type === "other") {
      this.formatDataItemFiler = this.formatDataItem.filter(i => {
        return i.code !== "parentId"
      }).map(i => {
        const icon = DataItemType[i.type];
        if (icon) {
          i.color = DataItemTypeColor[icon];
          i.text = DataItemTypeText[icon];
        }
        return i;
      });
    } else {
      this.formatDataItemFiler = this.formatDataItem.map(i => {
        const icon = DataItemType[i.type];
        if (icon) {
          i.color = DataItemTypeColor[icon];
          i.text = DataItemTypeText[icon];
        }
        return i;
      });
    }
  }

  @Watch("modalData", {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData || !modalData.options) {
      this.formatDataItem = [];
      return;
    }
    if (this.isAdd) {
      this.model = {
        type: 1,
        conditions: [],
      };
      this.requiredType = 1;
    }
    this.formatDataItem = this.dataItem.filter(i => {
      switch (i.type) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
        case DataItemType.LongText:
        case DataItemType.Number:
        case DataItemType.Date:
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.Attachment:
        case DataItemType.Address:
        case DataItemType.RelevanceFormEx:
        case DataItemType.RelevanceForm:
          return i && !i.isSystem;
          break;
      }
    });
    const data = this.type === 'other' ? modalData.options.requiredFormula : modalData.options.displayFormula;
    let items = this.dataItem;
    let itemsSelect = cloneDeep(this.dataItem);
    if (this.modalData.showSheet) {
      // const sheet = items.find((x) => x.code === this.modalData.schemaCode);
      // if (sheet && sheet.properties) {
      //   const sheetItems = sheet.properties.filter(
      //     (x: any) => x.code !== this.modalData.propertyCode
      //   ) as any;
      //   itemsSelect = itemsSelect.concat(sheet.properties);
      //   items = items.concat(sheetItems);
      // }
    }

    if (!this.isAdd) {
      this.formatDataItem = itemsSelect;
    } else if (this.isAdd && this.type === 'display') {
      this.formatDataItem = itemsSelect.filter(i => !i.isSystem);
    }
    this.formatDataItem.forEach(item => {
      if (item.parentCode) {
        const sheet = this.dataItem.find((x) => x.code === item.parentCode);
        item.code = `${sheet.code}.${item.code}`;
        item.name = `${sheet.name}.${item.name}`;
      }
      item.isDisabled = false;
    });

    this.formatDataItem.forEach(item => {
      if (item.parentCode) {
        let existItem: any = this.list.find(x => x.propertyCode === item.code.split(".")[1] && x.schemaCode !== item.schemaCode);
        if (existItem) {
          item.isDisabled = true;
        }
      } else {
        let existItem: any = this.list.find(x => x.propertyCode === item.code && x.schemaCode === item.schemaCode);
        if (existItem) {
          item.isDisabled = true;
        }
      }
    });

    //若schemaCode值不等于模型编码，则用于拼接字表code
    if(this.modalData.propertyCode && this.modalData.schemaCode !== this.bizSchemaCode){
      this.modalData.propertyCode = `${this.modalData.schemaCode}.${this.modalData.propertyCode}`;
    }

    const dataChange = items.filter((item: any) => {
      if (item.isSystem) {
        switch (item.code) {
          case 'creater':
          case 'createdTime':
          case 'sequenceNo':
          case 'modifier':
          case 'modifiedTime':
          case 'owner':
          case 'createdDeptId':
            return item;
            break;
        }
      } else {
        return item;
      }
    });
    this.dataItems = dataChange;
    if (data) {
      this.initModel(data);
      this.handleChangeData(this.modalData.propertyCode);
    }
  }

  initModel(exp: string) {
    let segs: string[] = [];
    let type = 1;
    if (exp && exp !== 'true') {
      this.requiredType = 2;
    } else {
      this.requiredType = 1;
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
      // 先判断空格出现的次数
      const countOfSpace: number = seg.split(' ').length - 1;
      let fields: string[] = [];
      if (countOfSpace === 1) { // 一次直接切割
        fields = seg.split(" ");
      } else { // 多次则 按空格标识分割 但是非字符串中的空格 例：{ShortText1618474250748} == '121 12 1'
        const point1 = seg.indexOf(" ");
        const point2 = seg.indexOf(" ", point1 + 1);
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
          case DataItemType.StaffDeptMix:
          case DataItemType.StaffSingle:
          case DataItemType.DeptMulti:
          case DataItemType.DeptSingle:
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
    let errorList:any[] = []
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
            if (cond.operatorType === DateItemOperatorType.IsNull || cond.operatorType === DateItemOperatorType.IsNotNull) {
              text = '';
            } else {
              val = Number(val);
              if (Number.isNaN(val)) {
                return null;
              }
              text = val.toString();
            }
          } else if (cond.propertyType === DataItemType.Logic) {
            val = val === "true" || val === 1;
            text = `${val}`;
          } else if (cond.propertyType === DataItemType.StaffSingle || cond.propertyType === DataItemType.StaffMulti
              || cond.propertyType === DataItemType.DeptSingle || cond.propertyType === DataItemType.DeptMulti || cond.propertyType === DataItemType.StaffDeptMix) {
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
          if(['包含','不包含','位于','不位于','属于','不属于'].includes(operator.label) && text === ''){
            let currentItem:any = this.dataItems.find(el => el.code === cond.propertyCode) || {}
            errorList.push(`${currentItem.name}[${cond.propertyCode}]不能${operator.label}空值`)
          }
          return `${code} ${operator.label} ${text}`;
        })
        .filter(x => x !== null)
        .join(` ${symbol} `);

    if(errorList.length){
      this.$message.error(errorList[0]);
      return;
    }
    if (!this.modalData.propertyCode) {
      this.$message.error('请选择数据项');
      return;
    }

    if (this.type === 'other') {
      if (this.requiredType === 1) {
        exp = 'true';
      }
      if (this.requiredType === 2 && !exp) {
        this.$message.error('请填写规则');
        return;
      }
      const param = {requiredFormula: exp};
      this.modalData.options = JSON.stringify(param);
    } else {
      if (!exp) {
        this.$message.error('请填写规则');
        return;
      }
      this.modalData.options = JSON.stringify({displayFormula: exp});
    }
    this.$emit("backData", this.modalData, this.currControlOptions);
  }


  closeModal() {
    // this.requiredType = 1;
    this.$emit("closeModal");
  }
}
</script>

<style lang="less">
.required-type {
  margin-bottom: 16px;
  line-height: 32px;
}
</style>
