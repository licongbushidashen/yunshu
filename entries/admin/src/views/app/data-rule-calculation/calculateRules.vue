<template>
  <div>
    <a-spin :spinning="spinning" tip="Loading..." >
    <a-button @click="addRule" block style="width: 100px" type="link">+ 新建规则</a-button>
    <data-item-list :columns="columns" :dataSource="list" :noSort="true">
      <span class="resize" slot="nameTitle">显示数据项</span>
      <span class="resize" slot="typeTitle">规则</span>
      <span class="resize" slot="actionTitle"></span>
      <p
        :title="text"
        class="text-ellipsis"
        slot="name"
        slot-scope="{ record, text }"
      >
        <a-tooltip placement="top">
          <template #title>
            <span>{{ record.name }}</span>
          </template>
          <span v-hight-light="{'value': text }" v-if="text"></span>
        </a-tooltip>
      </p>
      <p class="text-ellipsis" slot="checkType" slot-scope="{ record, text }">
        <span>{{ record.options && formatOptions(record.options.shortTextStitch) }}</span>
      </p>
      <span
        class="action-list-operating right"
        slot="action"
        slot-scope="{ record, text }"
      >
        <i @click="handleUpdate(record)" class="icon aufontAll h-icon-all-edit-o"></i>
        <a-popconfirm
          @confirm="handleDelete(record)"
          placement="left"
          title="您确定要删除吗?"
        >
          <i class="icon aufontAll h-icon-all-delete-o"></i>
        </a-popconfirm>
      </span>
    </data-item-list>
    </a-spin>
    <add-calculate-rule :isAdd="isAdd" :list="list" :modalData="updateData" :visible.sync="showModel" :bizSchemaCode="bizSchemaCode" @backData="backData" 
                     @closeModal="closeModal"/>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import DataItemList from "@/components/apps/model/data-item-list.vue";
  import AddCalculateRule from "@/views/app/data-rule-calculation/addCalculateRule.vue";
  import * as DataRuleApi from '@/apis/data-rule';

  import {DataItemType} from "@/components/apps/form-design/typings";

  import {
    DateItemOperatorType,
    logicDataItemOperators,
    numberDataItemOperators,
    OperatorService,
    relevanceFormDataItemOperators,
    sequenceStatusOperators,
    staffDataItemOperators,
    textDataItemOperators,
  } from "@/components/shared/data-item/data-item2";
  import {namespace} from 'vuex-class';

  const DataModelModule = namespace('Apps/DataModel');

  @Component({
    name: "calculateRules",
    components: {
      DataItemList,
      AddCalculateRule
    },
  })
  export default class calculateRules extends Vue {
    @Prop() lists: any;
    @Prop() activeKey: any;
    @Prop() columns: any;
    @DataModelModule.State('dataItem') dataItems: any;
    @DataModelModule.State('dataItemList') dataItemList: any;
    @DataModelModule.Action('getFormRuleList') getFormRuleList: any;
    @DataModelModule.State("formRuleList") formRuleList: any;
    @DataModelModule.Action('getDataItemList') getDataItemListX: any;
    @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;
    showModel: boolean = false;
    isAdd: boolean = true;
    updateData: any = {
      propertyCode: undefined,
      options: {}
    };
    list: any = [];
    spinning: boolean = false;
    created() {
      this.setBizSchemaCodeX(this.bizSchemaCode);
    }

    initData() {
      this.spinning = true;
      this.getDataItemListX().then(() => {
        this.getFormRuleList().then(() => {
          this.list = this.formRuleList.filter(x => x.dataRuleType === 2).map(i => {
            let currentParent = this.dataItemList.find(item => item.code === i.schemaCode);
            if (currentParent && currentParent.subSchema && Array.isArray(currentParent.subSchema.properties)) {
              let currentItem = currentParent.subSchema.properties.find(item => item.code === i.propertyCode);
              if (currentItem) {
                i.name = currentParent.name + '.' + currentItem.name;
              }
            } else{
              let currentItem = this.dataItemList.find(item => item.code === i.propertyCode );
              if (currentItem) {
                i.name = currentItem.name;
              }
            }
            if (typeof(i.options) === "string") {
              i.options = JSON.parse(i.options);
            }
            return i
          }).map(i => {
            const arr = this.dataItems.filter(v => {
              if (v.type === DataItemType.Sheet && v.code !== i.propertyCode) {
                if (Array.isArray(v.properties)) {
                  const l = v.properties.filter(n => n.schemaCode === i.schemaCode && n.code === i.propertyCode);
                  if (l.length > 0) {
                    i.showSheet = true;
                    i.name = l[0].name;
                  }
                }
              } else {
                return v.code === i.propertyCode && v.schemaCode === i.schemaCode
              }
            });
            if (arr.length > 0) {
              i.name = arr[0].name;
            }
            return i;
          });
          this.spinning = false;
        })
        .catch(() => {
          this.spinning = false;
        })
      })
      .catch(() => {
        this.spinning = false;
      })
    }

    mounted() {
      this.initData();
    }

    get bizSchemaCode() {
      return this.$route.params.bizSchemaCode;
    }

    formatOptions(options) {
      let res: string = '';
      try {
        let ruleObj: any = JSON.parse(options);
        if (ruleObj && ruleObj.formula) {
          let relevantDataItems: string[] | null = ruleObj.formula.match(/\{.*?\}/g);
          if (Array.isArray(relevantDataItems)) {
            relevantDataItems.forEach((item: string) => {
              let key: string = item.substring(1, item.length -1);
              const iIndex: number = key.indexOf('.');
              if (iIndex > -1) {
                let sheetCode: string = key.substring(0, iIndex);
                let subCode: string = key.substring(iIndex + 1);
                let sheetItem: any = this.dataItems.find((x: any) => {
                  return x.code === sheetCode;
                });
                let subItem: any = this.dataItems.find((x: any) => {
                  return x.code === subCode;
                });
                if (sheetItem && subItem) {
                  ruleObj.formula = ruleObj.formula.replace(new RegExp('\{' + key + '\}','g'), `${sheetItem.name}.${subItem.name}`);
                }
              } else {
                let searchItem: any = this.dataItems.find((x: any) => {
                  return x.code === key;
                })
                if (searchItem) {
                  ruleObj.formula = ruleObj.formula.replace(new RegExp('\{' + key + '\}','g'), searchItem.name);
                }
              }
            })
            res = ruleObj.formula;
          } else {
            res = ruleObj.formula;
          }
        }
      } catch(err) {
        console.log(err);
      }
      return res;
    }

    initModel(exp: string) {
      let segs: string[] = [];
      let type = 1;
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

        let item: any = [];

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

        const operators: any = this.getOperators(item.type, operator.value);

        const codes = code.split('.');
        let name = '';
        const obj = this.dataItems.forEach(v => {
          if (codes.length > 1) {
            if (v.code === codes[0]) {
              const child = v.properties.find(n => n.code === codes[1]);
              name = child.name
            }
          } else {
            if (v.code === codes[0]) {
              name = v.name
            }
          }
        });
        if (Array.isArray(val)) {
          val = val.map(i => i.name).join();
        }
        conditions.push({
          name,
          operators: operators.find(i => i.value === operator.value).label,
          value: val
        });
      }
      return conditions;
    }

    getOperators(type: DataItemType, code: string) {
      switch (type) {
        case DataItemType.Number:
        case DataItemType.Date:
        case DataItemType.Time:
          return numberDataItemOperators;

        case DataItemType.Logic:
          return logicDataItemOperators;

        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
        case DataItemType.LongText:
          if (code === "sequenceStatus") {
            return this.getOperatorsByCode(code);
          } else {
            return textDataItemOperators;
          }

        case DataItemType.StaffMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.StaffSingle:
        case DataItemType.DeptMulti:
        case DataItemType.DeptSingle:
          return staffDataItemOperators;

        case DataItemType.RelevanceForm:
        case DataItemType.RelevanceFormEx:
          return relevanceFormDataItemOperators;
      }
    }

    getOperatorsByCode(code: string) {
      switch (code) {
        case "sequenceStatus":
          return sequenceStatusOperators;
      }
    }

    handleUpdate(record: any) {
      this.isAdd = false;
      this.showModel = true;
      this.updateData = record
    }

    handleDelete(record: any) {
      DataRuleApi.deleteDataRules({id: record.id}).then(() => {
        this.initData();
      });
    }

    addRule() {
      this.isAdd = true;
      this.showModel = true;
      this.updateData = {
        propertyCode: undefined,
        options: {}
      };
    }

    closeModal() {
      this.showModel = false;
    }

    async backData(data, currControlOptions) {
      data.dataRuleType = 2;
      if (currControlOptions) {
        if (currControlOptions.parentCode) {
          data.schemaCode = currControlOptions.parentCode;
        } else {
          data.schemaCode = currControlOptions.schemaCode;
        }
        if (currControlOptions.code.indexOf(".") > -1) {
          data.propertyCode = currControlOptions.code.split(".")[1];
        } else {
          data.propertyCode = currControlOptions.code;
        }
      }
      if (!data.schemaCode) {
        data.schemaCode = this.bizSchemaCode;
      }
      let res: any = {};
      if (this.isAdd) {
        res = await DataRuleApi.createDataRules(data);
      } else {
        res = await DataRuleApi.updateDataRules(data);
      }
      if (res.errcode === 0) {
        this.closeModal();
        this.initData();
      } else {
        this.$message.error(res.errmsg);
      }
    }
  }
</script>
<style lang='less' scoped>
</style>
