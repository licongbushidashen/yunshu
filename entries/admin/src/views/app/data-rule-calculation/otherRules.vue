<template>
  <div>
    <a-spin :spinning="spinning" tip="Loading..." >
    <a-button @click="addRule" block style="width: 100px" type="link">+ 新建规则</a-button>
    <data-item-list :columns="columns" :dataSource="list" :noSort="true">
      <span class="resize" slot="nameTitle">规则数据项</span>
      <span class="resize" slot="typeTitle">规则类型</span>
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
          <span v-hight-light="{'value': text }" v-if="text"></span>
        </a-tooltip>
      </p>
      <p slot="checkType" slot-scope="{ record, text }">{{
        formulaTypeList[record.options && record.options.requiredFormula !== 'true' ? 3 : 2]
        }}
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
    <add-other-rules :isAdd="isAdd" :list="list" :modalData="updateData" :visible.sync="showModel" :bizSchemaCode="bizSchemaCode"
                     @backData="backData" @closeModal="closeModal"
                     type="other"/>
  </div>
</template>

<script lang='ts'>
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import {namespace} from 'vuex-class';
  import DataItemList from "@/components/apps/model/data-item-list.vue";
  import AddOtherRules from "@/views/app/data-rule-calculation/addOtherRules.vue";
  import {DataItemType,} from "@/components/apps/form-design/typings";
  import * as DataRuleApi from '@/apis/data-rule';
  const DataModelModule = namespace('Apps/DataModel');

  @Component({
    name: "OtherRules",
    components: {
      DataItemList,
      AddOtherRules
    },
  })
  export default class OtherRules extends Vue {
    @DataModelModule.State('dataItem') dataItems: any;
    @DataModelModule.State('dataItemList') dataItemList: any;
    @DataModelModule.Action('getFormRuleList') getFormRuleList: any;
    @DataModelModule.State("formRuleList") formRuleList: any;
    @DataModelModule.Action('getDataItemList') getDataItemListX: any;
    @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;
    @Prop() activeKey: any;
    @Prop() columns: any;
    formulaTypeList: any = {
      2: '必填',
      3: '满足条件必填'
    };
    showModel: boolean = false;
    isAdd: boolean = true;
    updateData: any = {
      propertyCode: undefined,
      name: '',
      schemaCode: '',
      options: {}
    };

    list: any[] = [];
    spinning: boolean = false;
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
            this.list = this.formRuleList.filter(x => x.dataRuleType === 4).map(i => {
              console.log(this.dataItemList);
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
      .catch(() => {
        this.spinning = false;
      })
    }

    mounted() {
      this.initData();
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
        name: '',
        schemaCode: '',
        options: {}
      };
    }

    closeModal() {
      this.showModel = false;
      this.initData();
    }

    async backData(data, currControlOptions) {
      data.dataRuleType = 4;
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
</style>
