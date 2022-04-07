<template>
  <div>
    <a-spin :spinning="spinning" tip="Loading..." >
    <div class="title-row">
      <a-button @click="addRule" block style="width: 100px" type="link">+ 新建规则</a-button>
      <div class="title-tip"><i class="icon aufontAll h-icon-all-exclamation-circle-o"></i>
        <span>在提交数据时满足以下校验规则的数据才允许提交，多条规则之间请避免输入互斥条件，以免校验出错</span>
      </div>
    </div>
    <data-item-list :columns="columns" :dataSource="list" :noSort="true">
      <span class="resize" slot="nameTitle">校验数据项</span>
      <span class="resize" slot="typeTitle">校验类型</span>
      <span class="resize" slot="actionTitle"></span>
      <p
        :title="text"
        class="text-ellipsis"
        slot="name"
        slot-scope="{ record, text }"
      >
        <a-tooltip placement="top">
          <template #title>
            <span>{{ text }}</span>
          </template>
          <span v-hight-light="{'value': record.name || record.propertyCode }" v-if="record.name || record.propertyCode"></span>
        </a-tooltip>
      </p>
      <p slot="checkType" slot-scope="{ record, text }">{{formulaTypeList[text]}}
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
          <i v-if="record.checkType !== 4" class="icon aufontAll h-icon-all-delete-o"></i>
        </a-popconfirm>
      </span>
    </data-item-list>
    </a-spin>
    <add-verify-rules :list="list" :isAdd="isAdd" :modalData="updateData" :visible.sync="showModel" :bizSchemaCode="bizSchemaCode" @backData="backData"
                      @closeModal="closeModal"/>      
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import DataItemList from "@/components/apps/model/data-item-list.vue";
  import {DataItemType,} from "@/components/apps/form-design/typings";
  import AddVerifyRules from "@/views/app/data-rule-calculation/addVerifyRules.vue";
  import * as DataRuleApi from '@/apis/data-rule';
  import {namespace} from 'vuex-class';

  const DataModelModule = namespace('Apps/DataModel');
  @Component({
    name: "VerifyRules",
    components: {
      DataItemList,
      AddVerifyRules
    },
  })
  export default class VerifyRules extends Vue {
    @DataModelModule.State('dataItem') dataItems: any;
    @DataModelModule.State('dataItemList') dataItemList: any;
    @DataModelModule.Action('getFormRuleList') getFormRuleList: any;
    @DataModelModule.State("formRuleList") formRuleList: any;
    @DataModelModule.Action('getDataItemList') getDataItemListX: any;
    @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;
    @Prop() activeKey: any;
    @Prop() columns: any;

    showModel: boolean = false;
    isAdd: boolean = true;
    updateData: any = {
      propertyCode: undefined,
      name: '',
      checkType: undefined,
      schemaCode: '',
      options: {}
    };

    list: any[] = [];
    spinning: boolean = false;
    formulaTypeList: any = {
      1: '正则校验',
      2: '提交校验',
      3: '空行校验',
      4: '文本最大长度校验',
      5: '去重'
    };

    get bizSchemaCode() {
      return this.$route.params.bizSchemaCode;
    }

    created() {
      this.setBizSchemaCodeX(this.bizSchemaCode);
    }

    initData() {
      this.spinning = true;
      this.getDataItemListX().then(() => {
        this.getFormRuleList().then(() => {
          this.list = this.formRuleList.filter(x => x.dataRuleType === 1).map(i => {
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
          });
          this.spinning = false;
        })
        .catch(() => {
          this.spinning = false;
        })
      })
    }

    mounted() {
      this.initData();
    }

    handleUpdate(record: any) {
      this.isAdd = false;
      this.showModel = true;
      if(record.options &&  record.options.verifyFormula && typeof record.options.verifyFormula === 'string'){
        record.options.verifyFormula = JSON.parse(record.options.verifyFormula);
      }
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
        name: '',
        checkType: undefined,
        schemaCode: '',
        options: {}
      };
    }

    closeModal() {
      this.showModel = false;
      this.initData();
    }

    async backData(data,currControlOptions) {
      data.dataRuleType = 1;
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
      }
    }
    
  }
</script>
<style lang='less' scoped>
  .title-row {
    display: flex;
    align-items: center;
    
    .title-tip {
      margin-left: 20px;
      
      i {
        font-size: 12px;
      }
      
      span {
        margin-left: 8px;
        font-size: 12px;
      }
    }
  }
</style>
