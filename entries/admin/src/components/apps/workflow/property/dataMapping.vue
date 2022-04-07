<template>
  <div class="data-mapping-panel">
    <property-widget
      label="映射"
    >
      <ellipsis-input
        slot="right"
        :value="mappingStr"
        @click="showMappingModal"
      />
    </property-widget>

    <mapping-modal
      v-model="isShowModal"
      @confirm="dataMapping"
    />
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';

import { DataItemType } from '@cloudpivot/form/schema';

import PropertyWidget from '../base/propertyWidget.vue';
import ellipsisInput from '../base/ellipsisInput.vue';
import MappingModal from '../modals/mapping.vue';

import * as Helper from '../helper/helper';

const WorkflowModule = namespace('Apps/Workflow');

const AppItemModule = namespace('Apps/AppItem');

@Component({
  name: 'DataMapping',
  components: {
    PropertyWidget,
    ellipsisInput,
    MappingModal
  }
})
export default class DataMapping extends Vue {
  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.State('curActivityID') curActivityID: any;

  @WorkflowModule.State('childWorkflowSchemaCode') childWorkflowSchemaCode: any;  

  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem: any;

  @WorkflowModule.State('WorkflowDataItem_all') WorkflowDataItem_all:any;

  @WorkflowModule.Mutation('setChildWorkflow') setChildWorkflow:any;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  @WorkflowModule.Action('getWorkflowDataItem') getWorkflowDataItem:any;

  @WorkflowModule.Action('getWorkflowDataItemNotFiltered') getWorkflowDataItemNotFiltered:any;

  @AppItemModule.Action('getWorkflowDetail') getWorkflowDetail: any;
  

  @Prop() value !: any;

  isShowModal:boolean = false;

  parentDataItem:any = '';

  childDataItem:any = '';

  mappingStr:string = '';

  // 20190604 放开附件和表单， 目前只过滤审批意见和子表
  filterArr:Array<number> = [DataItemType.ApprovalOpinion];

  subInstanceData_orign:any = [];

  init() {
    if (this.curActivityProps.commonSettings.workflowCode) {
      let _workflowCode:string = '';
      if (this.curActivityProps.commonSettings.workflowCode.indexOf('-') > -1) {
        [, _workflowCode] = this.curActivityProps.commonSettings.workflowCode.split('-');
      }
      // 通过workflowCode获取schemaCode 这样可获取到子流程数据项
      const params: Apps.Workflow.WorkflowCode = { workflowCode: _workflowCode };
      this.getWorkflowDetail(params).then(async (res: any) => {
        if (res.errcode === 0) {
          this.setChildWorkflow(res.data.schemaCode);

          // 拼接显示字符串 mappingStr
          const strArr:Array<string> = [];
          if (this.curActivityProps.workflowDataMaps && this.curActivityProps.workflowDataMaps.length > 0) {
            const scode = { schemaCode: res.data.schemaCode, hasReturn: true };
            let workflowDataitemCopy = JSON.parse(JSON.stringify(this.WorkflowDataItem_all));
            workflowDataitemCopy = Helper.releaseSubTableDataItem(workflowDataitemCopy);

            const { filterArr } = this;
            workflowDataitemCopy = workflowDataitemCopy.filter((item:any) => filterArr.indexOf(item.propertyType) < 0);

            // 获取子流程数据项
            const _sCode = { schemaCode: res.data.schemaCode};
            const data = await this.getWorkflowDataItemNotFiltered(_sCode);
            if (!data || data.length === 0) return;
            // let _list = data.filter((item:any) => (!item.defaultProperty));
            let _list = data;
            this.subInstanceData_orign = JSON.parse(JSON.stringify(data));
            _list = Helper.releaseSubTableDataItem(_list);

            // 20190130 需求变更：过滤掉子表以及审批意见
            _list = _list.filter((item:any) => filterArr.indexOf(item.propertyType) < 0);
            const maps = this.compatibleOldData(this.curActivityProps.workflowDataMaps);
            maps.forEach((map:any) => {
              const pDataItems = workflowDataitemCopy.find((wd:any) => wd.code === map.parentDataName);
              const pname = pDataItems ? pDataItems.name : '';
              const pcode = pDataItems ? pDataItems.code : '';
              const sDataItems = _list.find((wd:any) => wd.code === map.childDataName);
              const sname = sDataItems ? sDataItems.name : '';
              const subcode = sDataItems ? sDataItems.code : '';
              strArr.push(`${pname}[${pcode}]->${sname}[${subcode}]`);
            });
            this.mappingStr = strArr.join('&');
          }
        } else {
          console.log(res);
        }
      });
    }
  }

  /* 
  * 历史数据兼容
  */
  compatibleOldData(maps:any) {
    const _maps:any = [];
    maps.forEach((map:any) => {
      const pDataItems = this.WorkflowDataItem_all.find((wd:any) => wd.code === map.parentDataName && wd.propertyType === 8);
      if (pDataItems) {
        const { subSchema, name, code } = pDataItems;
        if (subSchema && subSchema.properties.length > 0) {
          const temArr:Array<any> = subSchema.properties.filter((dataItem:any) => !dataItem.defaultProperty);
          const cDataItems = this.subInstanceData_orign.find((wd:any) => wd.code === map.childDataName && wd.propertyType === 8);
          temArr.forEach((subItem:any) => {
            const cTemArr = cDataItems.subSchema && cDataItems.subSchema.properties.length ? cDataItems.subSchema.properties.find((cd:any) => cd.code === subItem.code && cd.propertyType === subItem.propertyType): false;
            if (cTemArr) {
              const res = {
                childDataName: `${map.childDataName}.${cTemArr.code}`,
                inOutType: map.inOutType,
                parentDataName: `${map.parentDataName}.${cTemArr.code}`,
              };
              _maps.push(res);
            }
          });
        }
      } else {
        _maps.push(map);
      }
    });
    // 同时修改掉原数据
    this.setPropValue({
      key: 'workflowDataMaps',
      value: _maps,
    });
    return _maps;
  }

  mounted() {
    this.init();
  }

  showMappingModal() {
    this.isShowModal = true;
  }

  dataMapping(str:string) {
    this.mappingStr = str;
  }

  setMappingStr() {
    this.mappingStr = '';
    this.init();
  }

  @Watch('value')
  onValueChange(v:any) {
    if (!v) return;
    this.isShowModal = v;
  }

  @Watch('curActivityID')
  onCurActivityIDChange(v:any) {
    this.mappingStr = '';
    this.init();
  }

  @Watch('childWorkflowSchemaCode')
  onChildWorkflowSchemaCodeChange(v:any,O:any) {
    this.mappingStr = '';
    this.init();
  }
  
}
</script>
<style lang="less" scoped>

</style>
