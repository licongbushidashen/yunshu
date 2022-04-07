<template>
  <div class="mapping">
    <a-drawer
      wrapClassName="mapping-drawer"
      title="数据映射关系设置"
      :closable="true"
      :mask="true"
      :width="850"
      :visible="isShowModal"
      @close="onCancel"
    >
      <div class="mapping-box">
        <a-table :dataSource="tableData" :pagination="false">
          <!-- 父流程 -->
          <a-table-column key="parentWorfklow" data-index="parentWorfklow">
            <span slot="title" class="resize resize-first" v-resize.east="{translateX: 16}">父流程</span>
            <template slot-scope="parentWorfklow">
              <a-select
                class="p-w-section"
                v-model="parentWorfklow.val"
                show-search
                :filter-option="filterOption"
                @change="onWorkflowChange"
                placeholder="请选择"
                :class="{'isEmpty': parentWorfklow.val === ''}"
              > 
                <a-select-option
                  v-for="(w, i) in parentWorfklow.list"
                  :key="i"
                  :value="w.code"
                  :itemtype="w.propertyType"
                  :name="w.name"
                  :title="w.name+'['+w.code+']'"
                  :relativeCode="w.relativeCode"
                  workflowType="parentWorfklow"
                  :index="parentWorfklow.index"
                  :isSheet="w.isSheet"
                >{{ `${w.name}[${w.code}]` }}</a-select-option>
              </a-select>
            </template>
          </a-table-column>

          <!-- 映射方式 -->
          <a-table-column key="mappingWay" data-index="mappingWay">
            <span slot="title" class="resize" v-resize.east="{translateX: 16}">
              映射方式
              <a-tooltip placement="top">
                <span
                  slot="title"
                >父流程和子流程互相映射：父流程传递到子流程，同时子流程结束后将数据回填到父流程(子流程多个时以追加方式传递给父流程，同一子表数据只能选择同一种映射方式)</span>
                <i class="icon aufontAll h-icon-all-question-circle-o"></i>
              </a-tooltip>
            </span>
            <template slot-scope="mappingWay">
              <a-select show-search class="m-w-section" v-model="mappingWay.val" @change="onChangeMapping">
                <template v-for="(m, i) in mappingWay.list">
                  <a-select-option
                    :value="m.value"
                    :key="i"
                    :title="m.name"
                    :index="mappingWay.index"
                    :parentWorfklow="tableData[mappingWay.index].parentWorfklow.val"
                    :subWorkflow="tableData[mappingWay.index].subWorkflow.val"
                    v-if="isIN_OUT_APPEND(tableData[mappingWay.index].parentWorfklow.val, tableData[mappingWay.index].subWorkflow.val, m.value)"
                  >{{ m.name }}</a-select-option>
                </template>
              </a-select>
            </template>
          </a-table-column>

          <!-- 子流程 -->
          <a-table-column key="subWorkflow" data-index="subWorkflow">
            <span slot="title" class="resize" v-resize.east="{translateX: 16}">子流程</span>
            <template slot-scope="subWorkflow">
              <a-select
                class="s-w-section"
                v-model="subWorkflow.val"
                show-search
                :filter-option="filterOption"
                @change="onWorkflowChange"
                placeholder="请选择"
                :class="{'isEmpty': subWorkflow.val === ''}"
              >
                <a-select-option
                  v-for="(s, i) in subWorkflow.list"
                  :key="i"
                  :value="s.code"
                  :name="s.name"
                  :title="s.name+'['+s.code+']'"
                  :index="subWorkflow.index"
                  :itemtype="s.propertyType"
                  :relativeCode="s.relativeCode"
                  workflowType="subWorkflow"
                  :isSheet="s.isSheet"
                >{{ `${s.name}[${s.code}]` }}</a-select-option>
              </a-select>
            </template>
          </a-table-column>

          <a-table-column title key="operationIndex" data-index="operationIndex">
            <template slot-scope="text,record">
              <i @click="deleteItem(record)" class="icon aufontAll h-icon-all-delete-o"></i>
            </template>
          </a-table-column>
        </a-table>
       
      </div>
       <div class="add-item" @click="addItem">
          <i class="icon aufontAll h-icon-all-plus-o"></i> 新增数据
        </div>

      <div class="footer">
        <a-button type="primary" @click="onConfirm" :disabled="isSave">保存</a-button>
      </div>
      <a-alert
        v-if="isShowAlert"
        class="warn-alert"
        message="请先完善当前数据映射关系"
        banner
        @close="onClose"
        closable
      />

      <a-alert
        v-if="isShowErrorAlert"
        class="warn-alert"
        message="业务对象ID是数据记录的唯一标识ID，不允许赋值给业务对象ID"
        banner
        type="error"
        @close="onCloseError"
        closable
      />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, Action, namespace } from 'vuex-class';

import { DataItemType } from '@cloudpivot/form/schema';
import * as WorkflowNameSpace from '@/typings/workflow';

import * as Helper from '../helper/helper';

const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'MappingModal',
})
export default class MappingModal extends Vue {
  @Prop() value!: boolean;

  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem: any;

  @WorkflowModule.State('WorkflowDataItem_all') WorkflowDataItem_all: any;

  @WorkflowModule.State('childWorkflowSchemaCode') childWorkflowSchemaCode: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  @WorkflowModule.Mutation('setPropValue') setPropValue: any;

  @WorkflowModule.Action('getWorkflowDataItem') getWorkflowDataItem: any;

  @WorkflowModule.Action('getWorkflowDataItemNotFiltered')
  getWorkflowDataItemNotFiltered: any;

  isShowModal: boolean = false;

  tableData: any = [];

  tableDataCopy: any = [];

  subWorkflowList: any = [];

  subWorkflowListCopy: any = [];

  mappingWayList: any = [
    { value: 'IN', name: '从父流程映射到子流程' }, // In
    { value: 'IN_OUT', name: '(覆盖)父流程和子流程相互映射' }, // InOut
    { value: 'IN_OUT_APPEND', name: '(追加)父流程和子流程相互映射' }, // IN_OUT_APPEND
  ];

  index: number = -1;

  // 20190604 放开附件和表单， 目前只过滤审批意见和子表
  filterArr: Array<number> = [DataItemType.ApprovalOpinion, DataItemType.Sheet];

  isShowAlert: boolean = false;

  isShowErrorAlert: boolean = false;

  getOperationIndex() {
    this.index += 1;
    return this.index;
  }

  get WorkflowItemDataCopy() {
    if (!this.WorkflowDataItem) return;
    // 20190724 放开系统数据项
    // let tem_arr = JSON.parse(JSON.stringify(this.WorkflowDataItem));
    const WorkflowDataItem_orign = this.WorkflowDataItem_all.filter(
      (data: any) => data.code !== 'name'
    );
    let tem_arr = JSON.parse(JSON.stringify(WorkflowDataItem_orign));
    const isSubTable: boolean =
      this.curActivityProps.commonSettings.triggerMappingObj.mainTable === 1;
    tem_arr = Helper.releaseSubTableDataItem(tem_arr);

    // 作废代码
    // if (isSubTable) {
    //   const { filterArr } = this;
    //   tem_arr = tem_arr.filter((item:any) => filterArr.indexOf(item.propertyType) < 0)
    //                   .map((item:any) => {
    //                     if (item.code.indexOf('.') > -1) { // 说明是子表数据项
    //                       const pcode:string = item.code.split('.')[0] as string;
    //                       if (pcode === this.curActivityProps.commonSettings.triggerMappingObj.code) {
    //                         return item;
    //                       }
    //                     } else {
    //                       return item;
    //                     }
    //                   }).filter((item:any) => item);

    //   // 取出触发对象之外的子表作为主表数据项
    //   const subTableArr = this.WorkflowDataItem.filter((d: any) => d.propertyType === 8 && d.code !== this.curActivityProps.commonSettings.triggerMappingObj.code);
    //   tem_arr = tem_arr.concat(subTableArr);
    // } else {
    //   const filterArr = [DataItemType.ApprovalOpinion, DataItemType.Sheet];
    //   tem_arr = tem_arr.filter((item:any) => filterArr.indexOf(item.propertyType) < 0);
    // }
    const { filterArr } = this;
    tem_arr = tem_arr.filter(
      (item: any) => filterArr.indexOf(item.propertyType) < 0
    );
    return tem_arr;
  }

  get isSave() {
    if (this.tableData.length !== 0) {
      for (let i = 0; i < this.tableData.length; i += 1) {
        if (
          this.tableData[i].parentWorfklow.val === '' ||
          this.tableData[i].subWorkflow.val === ''
        ) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  // 因为规则经常变化，所以显示的值需要重新设置
  judgeMap(val: any, list: any) {
    const item: any = list.find((i: any) => i.code === val);

    if (item) return val;

    return '';
  }

  // 获取子流程数据项
  async getChildDataItem() {
    // 当没有选择子流程模板时，不执行
    if (!this.curActivityProps.commonSettings.workflowCode) return;
    const params = { schemaCode: this.childWorkflowSchemaCode };
    const data = await this.getWorkflowDataItemNotFiltered(params);
    if (!data || data.length === 0) return;
    let _list = data.filter((d: any) => d.code !== 'name' && !d.defaultProperty);
    _list = Helper.releaseSubTableDataItem(_list);
    const isSubTable: boolean =
      this.curActivityProps.commonSettings.triggerMappingObj.mainTable === 1;
    const filterArr = [DataItemType.ApprovalOpinion, DataItemType.Sheet];
    _list = _list.filter(
      (item: any) => filterArr.indexOf(item.propertyType) < 0
    );

    this.subWorkflowListCopy = JSON.parse(JSON.stringify(_list));
    this.subWorkflowList = this.subWorkflowListCopy;

    // 还原数据映射关系
    if (
      this.curActivityProps.workflowDataMaps &&
      this.curActivityProps.workflowDataMaps.length > 0
    ) {
      debugger
      const _maps = this.curActivityProps.workflowDataMaps;
      _maps.forEach((map: any, i: number) => {
        // 根据code找到对应的name
        const pDataItems = this.WorkflowItemDataCopy.find(
          (wd: any) => wd.code === map.parentDataName
        );
        if (!pDataItems) return;
        const _pname = pDataItems ? pDataItems.name : '';

        const sItemsDatas = this.subWorkflowList.find(
          (wd: any) => wd.code === map.childDataName
        );
        if (!sItemsDatas) return;
        const _sname = sItemsDatas ? sItemsDatas.name : '';
        const list = this.filterWorkflowList();
        if (!list) return;
        const { parentWorkflowList, childWorkflowList } = list;
        let cLists: any = [];
        let pList: any = [];
        if (pDataItems.propertyType === 0 && pDataItems.code === 'id') {
          // 选择业务对象id 另外一侧有关联表单和短文本
          const handler = (handlingList: any) => {
            const arr: any = [];
            let rCode: string = pDataItems.schemaCode;
            handlingList.forEach((innerList: any) => {
              if (innerList.propertyType === 9) {
                let listRcode: string = innerList.relativeCode;
                if (innerList.code === 'id') {
                  listRcode = innerList.schemaCode;
                }
                if (listRcode === rCode) {
                  arr.push(innerList);
                }
              } else if (innerList.propertyType === 11) {
                let listRcode: string = innerList.relativeCode;
                if (listRcode === rCode) {
                  arr.push(innerList);
                }
              } else {
                arr.push(innerList);
              }
            });
            return arr;
          };
          // 1. 找出短文本和关联表单
          const temList = childWorkflowList.filter(
            (listItem: any) =>
              listItem.propertyType === pDataItems.propertyType ||
              listItem.propertyType === 9 ||
              listItem.propertyType === 11
          );

          // 2. 找出合法的关联表单和短文本，并push进数组中

          cLists = handler(temList);

          // 处理父流程
          const temPList = parentWorkflowList.filter(
            (listItem: any) =>
              (listItem.propertyType === pDataItems.propertyType ||
              (listItem.propertyType === 0 && listItem.code === 'id')) && !listItem.defaultProperty
          );
          pList = handler(temPList);
        } else if (pDataItems.propertyType === 9) {
          // 如果是关联表单，另一侧是合法的关联表单和业务对象id
          const handler = (handlingList: any) => {
            const arr: any = [];
            let rCode: string = pDataItems.relativeCode;
            if (!handlingList) return;
            handlingList.forEach((innerList: any) => {
              if (innerList.propertyType === 0 && innerList.code === 'id') {
                // 业务对象id
                if (rCode === innerList.schemaCode) {
                  arr.push(innerList);
                }
              } else if (innerList.propertyType === 9) {
                if (rCode === innerList.relativeCode) {
                  arr.push(innerList);
                }
              }
            });
            return arr;
          };
          // 1. 找出关联表单和业务对象id
          const temList = childWorkflowList.filter(
            (listItem: any) =>
              listItem.propertyType === pDataItems.propertyType ||
              (listItem.propertyType === 0 && listItem.code === 'id')
          );
          cLists = handler(temList);

          // 处理父流程
          const temPList = parentWorkflowList.filter(
            (listItem: any) =>
              (listItem.propertyType === pDataItems.propertyType ||
              (listItem.propertyType === 0 && listItem.code === 'id')) && !listItem.defaultProperty
          );
          pList = handler(temPList);
        } else if (pDataItems.propertyType === 11) {
          const handler = (handlingList: any) => {
            const arr: any = [];
            let rCode: string = pDataItems.relativeCode;
            if (!handlingList) return;
            handlingList.forEach((innerList: any) => {
              if (innerList.propertyType === 11) {
                if (rCode === innerList.relativeCode) {
                  arr.push(innerList);
                }
              }
            });
            return arr;
          };
          const temList = childWorkflowList.filter(
            (listItem: any) => listItem.propertyType === pDataItems.propertyType && !listItem.defaultProperty
          );
          cLists = handler(temList);

          // 处理父流程
          const temPList = parentWorkflowList.filter(
            (listItem: any) => listItem.propertyType === pDataItems.propertyType && !listItem.defaultProperty
          );
          pList = handler(temPList);
        } else {
          cLists = childWorkflowList.filter(
            (item: any) => [0,12,14].includes(item.propertyType) ? [0,12,14].includes(pDataItems.propertyType) : [13,15].includes(pDataItems.propertyType) || item.propertyType === pDataItems.propertyType && !item.defaultProperty
          );
          pList = parentWorkflowList.filter(
            (item: any) => item.propertyType === pDataItems.propertyType && !item.defaultProperty
          );
        }

        const PMainData: boolean = pDataItems.code.indexOf('.') === -1;
        const CMainData: boolean = sItemsDatas.code.indexOf('.') === -1;
        console.log(pDataItems,sItemsDatas);
        
        cLists = this.handleData(
          cLists,
          pDataItems,
          'parentWorfklow',
          PMainData,
          map.inOutType
        );
        pList = this.handleData(pList, sItemsDatas, 'subWorkflow', CMainData, map.inOutType);
        
        // 20190221 因为附件 inout方式存在问题，故, 当选择附件类型的时候先过滤掉inout方式
        // 20190711 放开限制
        // let _mappingList:any;
        // if (pDataItems.propertyType === 6 || sItemsDatas.propertyType === 6) {
        //   _mappingList = [{ value: 'IN', name: 'In' }];
        // } else {
        //   _mappingList = [
        //     { value: 'IN', name: 'In' },
        //     { value: 'IN_OUT', name: 'InOut' }
        //   ];
        // }
        
        this.tableData.push({
          parentWorfklow: {
            val: map.parentDataName,
            name: _pname,
            list: pList,
            filterList: pList,
            index: i,
          },
          mappingWay: {
            val: map.inOutType,
            list: this.mappingWayList,
            index: i,
            isSheet: true,
          },
          subWorkflow: {
            val: map.childDataName,
            name: _sname,
            list: cLists,
            filterList: cLists,
            index: i,
          },
          operationIndex: i,
        });
      });
    } else {
      // 整合父流程和子流程type和code相同的项
      // this.WorkflowItemDataCopy.forEach((w:any) => {
      //   this.subWorkflowList.forEach((s:any) => {
      //     if ((s.propertyType === w.propertyType) && (s.code === w.code) && !w.defaultProperty && !s.defaultProperty) {
      //       // 20190221 因为附件 inout方式存在问题，故, 当选择附件类型的时候先过滤掉inout方式
      //       // 20190711 放开限制
      //       // let _mappingList:any;
      //       // if (s.propertyType === 6 || w.propertyType === 6) {
      //       //   _mappingList = [{ value: 'IN', name: 'In' }];
      //       // } else {
      //       //   _mappingList = [
      //       //     { value: 'IN', name: 'In' },
      //       //     { value: 'IN_OUT', name: 'InOut' }
      //       //   ];
      //       // }
      //       const _index = this.getOperationIndex();
      //       this.tableData.push({
      //         parentWorfklow: {
      //           val: w.code,
      //           name: w.name,
      //           list: [w],
      //           index: _index
      //         },
      //         mappingWay: {
      //           val: this.mappingWayList[0].value,
      //           list: this.mappingWayList,
      //           index: _index
      //         },
      //         subWorkflow: {
      //           val: s.code,
      //           name: s.name,
      //           list: [s],
      //           index: _index
      //         },
      //         operationIndex: _index
      //       });
      //     }
      //   });
      // });
    }

    if (this.tableData.length === 0) {
      this.addItem();
    }

    this.tableDataCopy = JSON.parse(JSON.stringify(this.tableData));

    this.setIndex();
    this.filterMappingOnly();
  }

  // 筛选流程字段
  filterOption(input, option) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  /**
   * 对象数组根据某个字段进行排序 - 字符串
   * @params property 排序字段
   * */
  compare(property: string) {
    return (a: any, b: any) =>
      (a[property] as string).localeCompare(b[property] as string);
  }

  /*
   * 根据子表唯一映射过滤列表，子表映射子表存在一对一唯一映射
   */
  hasMapppingData: any = [];
  filterMappingOnly() {
    this.hasMapppingData = [];
    this.tableData.forEach((item: any) => {
      if (!item.parentWorfklow.val || !item.subWorkflow.val) return;
      // 父子流程映射都为子表的映射关系记录
      if (
        item.parentWorfklow.val.indexOf('.') > -1 &&
        item.subWorkflow.val.indexOf('.') > -1
      ) {
        const pCode = item.parentWorfklow.val.split('.')[0] as string;
        const cCode = item.subWorkflow.val.split('.')[0] as string;
        const mData = this.hasMapppingData.find(
          (d: any) => d.parentWorfklow === pCode && d.subWorkflow === cCode
        );
        if (mData) {
          mData.locked = true;
        } else {
          const obj = {
            parentWorfklow: pCode,
            subWorkflow: cCode,
            locked: false,
          };
          this.hasMapppingData.push(obj);
        }
      }
    });
    // 根据唯一映射原则过滤tableData里的list
    this.tableData.forEach((item: any) => {
      if (item.parentWorfklow.val && item.subWorkflow.val) {
        if (
          item.parentWorfklow.val.indexOf('.') > -1 &&
          item.subWorkflow.val.indexOf('.') > -1
        ) {
          const pCode = item.parentWorfklow.val.split('.')[0] as string;
          const cCode = item.subWorkflow.val.split('.')[0] as string;
          let mData: any = null;
          const pHasMapping: any = [];
          const cHasMapping: any = [];
          this.hasMapppingData.forEach((d: any) => {
            if (d.parentWorfklow === pCode && d.subWorkflow === cCode) {
              mData = d;
            }
            pHasMapping.push(d.parentWorfklow);
            cHasMapping.push(d.subWorkflow);
          });
          if (mData && mData.locked) {
            item.parentWorfklow.list = item.parentWorfklow.filterList.filter(
              (f: any) => pCode === f.code.split('.')[0]
            );
            item.subWorkflow.list = item.subWorkflow.filterList.filter(
              (f: any) => cCode === f.code.split('.')[0]
            );
          } else {
            item.parentWorfklow.list = item.parentWorfklow.filterList.filter(
              (f: any) =>
                pCode === f.code.split('.')[0] ||
                !pHasMapping.includes(f.code.split('.')[0])
            );
            item.subWorkflow.list = item.subWorkflow.filterList.filter(
              (f: any) =>
                cCode === f.code.split('.')[0] ||
                !cHasMapping.includes(f.code.split('.')[0])
            );
          }
        }
      } else if (item.parentWorfklow.val || item.subWorkflow.val) {
        const type = item.parentWorfklow.val ? 'parentWorfklow' : 'subWorkflow';
        const typeObj = item.parentWorfklow.val
          ? 'subWorkflow'
          : 'parentWorfklow';
        if (item[type].val.indexOf('.') === -1) return;
        const code = item[type].val.split('.')[0] as string;
        let mappingCode: string = '';
        const hasMapping: any = [];
        this.hasMapppingData.forEach((d: any) => {
          if (d[type] === code) {
            mappingCode = d[typeObj];
          }
          hasMapping.push(d[typeObj]);
        });
        let currentMappingVal: string = item.mappingWay.val;
        if (mappingCode) {
          if (currentMappingVal !== 'IN_OUT_APPEND') {
            item[typeObj].list = item[typeObj].filterList.filter(
              (f: any) => mappingCode === f.code.split('.')[0]
            );
          } else {
            item[typeObj].list = item[typeObj].filterList;
          }
        } else {
          if (currentMappingVal !== 'IN_OUT_APPEND') {
            item[typeObj].list = item[typeObj].filterList.filter(
              (f: any) => !hasMapping.includes(f.code.split('.')[0])
            );
          } else {
            item[typeObj].list = item[typeObj].filterList;
          }
        }
      }
    });
    console.log(this.hasMapppingData);
  }

  handleData(
    arr: any,
    curRowData: any,
    type: string,
    isMainData: boolean,
    mappingWay: string = ''
  ) {
    // 父子流程映射的时候，主表数据项只能映射到主表数据项。子表数据项只能映射到子表数据（触发对象为子表时，该子表只能映射到主表字段）
    const isSubTable: boolean =
      this.curActivityProps.commonSettings.triggerMappingObj.mainTable === 1;
    if (isSubTable) {
      // 如果是追加模式
      if (mappingWay === 'IN_OUT_APPEND') {
        arr = arr.filter((a: any) => a.code.indexOf('.') > -1);
      } else {
        // 触发对象为子表
        const pcode: string = curRowData.code.split('.')[0] as string;
        const triggerCode: string = this.curActivityProps.commonSettings
          .triggerMappingObj.code;
        const isCurChildSheet = pcode === triggerCode;
        if ((type === 'parentWorfklow' && isMainData) || isCurChildSheet) {
          arr = arr.filter((a: any) => a.code.indexOf('.') === -1);
        } else if (type === 'subWorkflow' && isMainData) {
          arr = arr.filter(
            (a: any) =>
              a.code.indexOf('.') === -1 || a.code.split('.')[0] === triggerCode
          );
        } else if (type === 'subWorkflow' && !isMainData) {
          arr = arr.filter(
            (a: any) =>
              a.code.indexOf('.') > -1 && a.code.split('.')[0] !== triggerCode
          );
        } else {
          arr = arr.filter((a: any) => a.code.indexOf('.') > -1);
        }
      }
    } else {
      // 触发对象为主表
      if (isMainData) {
        arr = arr.filter((a: any) => a.code.indexOf('.') === -1);
      } else {
        arr = arr.filter((a: any) => a.code.indexOf('.') > -1);
      }
    }
    return arr;
  }

  /**
   * 父子流程过滤
   * @params data 源数据
   * @params type 区分父子流程 parentWorfklow subWorkflow
   * @params index 当前行
   * @params selectedItemCode 当前选中项的值
   * */
  handleFilter(type: string, selectedItemCode: any, obj: any) {
    debugger
    let arr: Array<any> = [];
    let _filterList: Array<any> = [];
    const workflowObj =
      type === 'parentWorfklow' ? 'subWorkflow' : 'parentWorfklow';
    const dataCopy = JSON.parse(JSON.stringify(this.tableData));
    const tableDataCopy = JSON.parse(JSON.stringify(this.tableDataCopy));

    const {
      itemtype,
      index,
      workflowType,
      name,
      relativeCode,
    } = obj.data.attrs;

    const curRowData = tableDataCopy[index][type].list.find(
      (item: any) => item.code === selectedItemCode
    ); // 找出当前这行的数据
    if (!curRowData) return;

    // 父子流程映射的时候，关联表单关联的是同一个模型才能做映射，否则不允许映射。
    // 业务对象id的schemaCode与关联表单的relativeCode相同才能映射
    // 20190806 迭代18 单独处理业务对象id
    if (curRowData.propertyType === 0 && curRowData.code === 'id') {
      // 选择业务对象id 另外一侧有关联表单和短文本
      // 1. 找出短文本和关联表单
      const temList = tableDataCopy[index][workflowObj].list.filter(
        (listItem: any) =>
          listItem.propertyType === itemtype ||
          listItem.propertyType === 9 ||
          listItem.propertyType === 11
      );
      let rCode: string = relativeCode;
      if (curRowData.code === 'id') {
        rCode = curRowData.schemaCode;
      }
      // 2. 找出合法的关联表单和短文本，并push进数组中
      temList.forEach((list: any) => {
        if (list.propertyType === 9) {
          let listRcode: string = list.relativeCode;
          if (list.code === 'id') {
            listRcode = list.schemaCode;
          }
          if (listRcode === rCode) {
            arr.push(list);
          }
        } else if (list.propertyType === 11) {
          let listRcode: string = list.relativeCode;
          if (listRcode === rCode) {
            arr.push(list);
          }
        } else {
          arr.push(list);
        }
      });
    } else if (curRowData.propertyType === 9) {
      // 如果是关联表单，另一侧是合法的关联表单和业务对象id
      // 1. 找出关联表单和业务对象id
      const temList = tableDataCopy[index][workflowObj].list.filter(
        (listItem: any) =>
          listItem.propertyType === itemtype ||
          (listItem.propertyType === 0 && listItem.code === 'id')
      );
      // 2. 找出合法的关联表单和业务对象id
      let rCode: string = relativeCode;
      temList.forEach((list: any) => {
        if (list.propertyType === 0 && list.code === 'id') {
          // 业务对象id
          if (rCode === list.schemaCode) {
            arr.push(list);
          }
        } else if (list.propertyType === 9) {
          if (rCode === list.relativeCode) {
            arr.push(list);
          }
        }
      });
    } else if (curRowData.propertyType === 11) {
      let rCode: string = relativeCode;
      const temList = tableDataCopy[index][workflowObj].list.filter(
        (listItem: any) => listItem.propertyType === itemtype
      );
      console.log(JSON.stringify(temList));
      temList.forEach((list: any) => {
        if (list.propertyType === 11) {
          if (rCode === list.relativeCode) {
            arr.push(list);
          }
        }
      });
    } else {
      console.log('itemtype', itemtype )
      arr = tableDataCopy[index][workflowObj].list.filter(
        (item: any) => {
          if([0,12,13,14,15].includes(item.propertyType)) {
            return [0,12,14].includes(item.propertyType) ? [0,12,14].includes(itemtype) : [13,15].includes(itemtype)
          } else {
            console.log(item.propertyType, itemtype)
            return item.propertyType === itemtype
          }
        }
      );
    }

    const isMainData: boolean = curRowData.code.indexOf('.') === -1; // 当前这行的数据是主表字段
    const mappingVal = this.tableData[index]['mappingWay'].val;
    arr = this.handleData(arr, curRowData, type, isMainData, mappingVal);

    _filterList = JSON.parse(JSON.stringify(arr));

    // 同一父流程子表字段只能映射同一子流程的子表字段，不支持跨子表映射
    if (!isMainData) {
      const code: string = curRowData.code.split('.')[0] as string;
      let mappingCode: string = '';
      const hasMapping: any = [];
      this.hasMapppingData.forEach((item: any) => {
        if (type === 'parentWorfklow' && item.parentWorfklow === code) {
          mappingCode = item.subWorkflow;
        } else if (type === 'subWorkflow' && item.subWorkflow === code) {
          mappingCode = item.parentWorfklow;
        }
        const hasCode =
          type === 'subWorkflow' ? item.parentWorfklow : item.subWorkflow;
        hasMapping.push(hasCode);
      });
      if (mappingCode) {
        // 已存在子表数据项映射子表数据项
        if (mappingVal !== 'IN_OUT_APPEND') {
          arr = arr.filter((a: any) => a.code.split('.')[0] === mappingCode);
        }
      } else {
        // 不存在子表数据项映射子表数据项
        if (mappingVal !== 'IN_OUT_APPEND') {
          arr = arr.filter(
            (a: any) => !hasMapping.includes(a.code.split('.')[0])
          );
        }
      }
    }

    return { data: arr, index: index, filterList: _filterList };
  }

  onWorkflowChange(value: any, obj: any) {
    console.log(obj);
    debugger
    if (
      !value ||
      !obj ||
      this.subWorkflowListCopy.length === 0 ||
      this.WorkflowItemDataCopy.length === 0
    ) {
      return;
    }
    // this.onTableDataChange(this.tableData);

    const dataCopy = JSON.parse(JSON.stringify(this.tableData));
    const tableDataCopy = JSON.parse(JSON.stringify(this.tableDataCopy));
    const selectedItemCode = value; // 当前选中的值
    const {
      workflowType,
      name,
      itemtype,
      relativeCode,
      isSheet = false,
    } = obj.data.attrs;
    let arr: any = [];
    let filterList: any = [];
    let _index: number = -1;
    const workflowObj =
      workflowType === 'parentWorfklow' ? 'subWorkflow' : 'parentWorfklow';
    if (workflowType === 'parentWorfklow') {
      const res = this.handleFilter('parentWorfklow', value, obj) as any;
      arr = res.data;
      _index = res.index;
      filterList = res.filterList;
    } else {
      const res = this.handleFilter('subWorkflow', value, obj) as any;
      console.log('res', res)
      arr = res.data;
      _index = res.index;
      filterList = res.filterList;
    }

    // 20190221 因为附件 inout方式存在问题，故, 当选择附件类型的时候先过滤掉inout方式
    // 20190711 放开限制
    // if (itemtype === 6) {
    //   dataCopy[_index].mappingWay.list = [{ value: 'IN', name: 'In' }];
    // } else {
    //   dataCopy[_index].mappingWay.list = [
    //     { value: 'IN', name: 'In' },
    //     { value: 'IN_OUT', name: 'InOut' }
    //   ];
    // }

    // 回写时在选择，类型不同变空值
    const beChangedItem: any = dataCopy[_index][workflowObj].list.find(
      (item: any) => item.code === dataCopy[_index][workflowObj].val
    );
    const beChangedType: number = beChangedItem
      ? (beChangedItem.propertyType as number)
      : -1;
    if (
      beChangedType !== -1 &&
      itemtype !== DataItemType.RelevanceForm &&
      beChangedType !== DataItemType.RelevanceForm &&
      value !== 'id'
    ) {
      //单选，多选映射不清除父流程选项
      if (itemtype !== beChangedType && ![0, 12, 13, 14, 15].includes(itemtype)) {
        dataCopy[_index][workflowObj].val = '';
        console.log('清空了', itemtype, beChangedType, beChangedItem);
      }
    }

    dataCopy[_index][workflowObj].list = arr;
    dataCopy[_index][workflowType].name = name;
    dataCopy[_index][workflowObj].filterList = filterList;

    // 父流程切换到子表数据选择追加在切换到主表数据清空映射方式
    if (!isSheet && dataCopy[_index]['mappingWay'].val === 'IN_OUT_APPEND') {
      dataCopy[_index]['mappingWay'].val = '';
    }

    // 判断子流程val值是不是在List里面
    if (dataCopy[_index]['subWorkflow'].val) {
      const flag = dataCopy[_index]['subWorkflow'].list.find(
        (d: any) => d.code === dataCopy[_index]['subWorkflow'].val
      );
      flag ? '' : (dataCopy[_index]['subWorkflow'].val = '');
    }

    if (workflowType === 'parentWorfklow') {
      let flag: boolean = true;
      if (value && value.indexOf('.') > -1) {
        // 找到同一个子表的第一条数据
        const parentSplit = value.split('.')[0] as string;
        const parentArr = this.tableData.find((d: any) => {
          if (
            d.parentWorfklow.val.indexOf(parentSplit) > -1 &&
            d.parentWorfklow.val !== value
          ) {
            return d;
          }
        });

        // 是否是同一种映射方式 不是就清空子流程数据
        if (parentArr && parentArr['mappingWay'].val !== dataCopy[_index]['mappingWay'].val) {
          dataCopy[_index]['subWorkflow'].list = [];
          dataCopy[_index]['subWorkflow'].filterList = [];
          dataCopy[_index]['subWorkflow'].name = '';
          dataCopy[_index]['subWorkflow'].index = _index;
          dataCopy[_index]['mappingWay'].val = '';
        }
      }
    }

    this.tableData = dataCopy;
    this.filterMappingOnly();
  }

  onChangeMapping(value: any, obj: any) {
    if (
      !value ||
      !obj ||
      this.subWorkflowListCopy.length === 0 ||
      this.WorkflowItemDataCopy.length === 0
    ) {
      return;
    }
    // this.onTableDataChange(this.tableData);

    const { index, parentWorfklow, subWorkflow } = obj.data.attrs;
    // const list = this.filterWorkflowList();
    // if (!list) return;
    // const { parentWorkflowList, childWorkflowList } = list;

    const parentType = this.WorkflowItemDataCopy.find(
      (d: any) => d.code === parentWorfklow
    );
    const childType = this.subWorkflowListCopy.find(
      (d: any) => d.code === subWorkflow
    );

    // 追加方式时只显示子表数据
    if (value === 'IN_OUT_APPEND' && !childType && !parentType) {
      this.tableData[index].subWorkflow.list = this.tableData[
        index
      ].subWorkflow.list.filter((item) => {
        return item.code.indexOf('.') > -1;
      });
      this.tableData[index].parentWorfklow.list = this.tableData[
        index
      ].parentWorfklow.list.filter((item) => {
        return item.code.indexOf('.') > -1;
      });
      return false
    }

    // 判断父流程已选择同一子表只能有一种映射方式
    let flag: boolean = true;
    if (parentWorfklow && parentWorfklow.indexOf('.') > -1) {
      // 找到同一个子表的第一条数据
      const parentSplit = parentWorfklow.split('.')[0] as string;
      const parentArr = this.tableData.find((d: any) => {
        if (
          d.parentWorfklow.val.indexOf(parentSplit) > -1 &&
          d.parentWorfklow.val !== parentWorfklow
        ) {
          return d;
        }
      });

      // 是否是同一种映射方式 不是就清空父子流程数据
      if (parentArr && parentArr['mappingWay'].val !== value) {
        this.tableData[index]['parentWorfklow'].val = '';
        this.tableData[index]['subWorkflow'].val = '';
        flag = false;
      }
    }

    if (!flag) {
      const list = this.filterWorkflowList();
      if (!list) return;
      const { parentWorkflowList, childWorkflowList } = list;
      this.tableData[index].subWorkflow.list = childWorkflowList;
      this.tableData[index].parentWorfklow.list = parentWorkflowList;
      return false;
    }

    if ((parentType && !childType) || (parentType && childType)) {
      this.onWorkflowChange(parentWorfklow, {
        data: {
          attrs: {
            workflowType: 'parentWorfklow',
            name: parentType.name,
            index: index,
            itemtype: parentType.propertyType,
            relativeCode: parentType.relativeCode,
            isSheet: parentType.hasOwnProperty('isSheet')
              ? parentType.isSheet
              : false,
          },
        },
      });
    } else if (childType && !parentType) {
      this.onWorkflowChange(subWorkflow, {
        data: {
          attrs: {
            workflowType: 'subWorkflow',
            name: childType.name,
            index: index,
            itemtype: childType.propertyType,
            relativeCode: childType.relativeCode,
            isSheet: childType.hasOwnProperty('isSheet')
              ? childType.isSheet
              : false,
          },
        },
      });
    } else {
      const list = this.filterWorkflowList();
      if (!list) return;
      const { parentWorkflowList, childWorkflowList } = list;
      this.tableData[index].subWorkflow.list = childWorkflowList;
      this.tableData[index].parentWorfklow.list = parentWorkflowList;
    }
  }

  setIndex() {
    let data: any = [];
    this.tableData.forEach((item: any, index: number) => {
      item.mappingWay.index = index;
      item.parentWorfklow.index = index;
      item.subWorkflow.index = index;
    });
    this.tableDataCopy.forEach((item: any, index: number) => {
      item.mappingWay.index = index;
      item.parentWorfklow.index = index;
      item.subWorkflow.index = index;
    });
  }

  // 数据项去重
  filterWorkflowList() {
    if (!this.tableData) return;
    const parentWorkflows: Array<string> = [];
    const childWorkflows: Array<string> = [];

    // 找出所有已选的项
    this.tableData.forEach((td: any) => {
      parentWorkflows.push(td.parentWorfklow.val);
      childWorkflows.push(td.subWorkflow.val);
    });

    // 过滤父流程
    const parentWorkflowList = this.WorkflowItemDataCopy.filter(
      (wd: any) => !parentWorkflows.includes(wd.code) && !wd.defaultProperty
    );
    const childWorkflowList = this.subWorkflowListCopy.filter(
      (wd: any) => !childWorkflows.includes(wd.code) && !wd.defaultProperty
    );
    if (!parentWorkflowList || !childWorkflowList) return;
    return { parentWorkflowList, childWorkflowList };
  }

  addItem() {
    if (this.isSave) {
      this.isShowAlert = true;
      return;
    }
    const _index =
      this.tableData.length > 0
        ? this.tableData.length
        : this.getOperationIndex();

    // 数据项去重
    const list = this.filterWorkflowList();
    if (!list) return;
    const { parentWorkflowList, childWorkflowList } = list;
    const item = {
      parentWorfklow: {
        val: '',
        name: '',
        list: parentWorkflowList,
        filterList: [],
        index: _index,
      },
      mappingWay: {
        val: this.mappingWayList[0].value,
        list: this.mappingWayList,
        index: _index,
      },
      subWorkflow: {
        val: '',
        name: '',
        list: childWorkflowList,
        filterList: [],
        index: _index,
      },
      operationIndex: _index,
    };
    this.tableData.push(item);
    this.tableDataCopy.push(item);

    this.setIndex();
  }

  deleteItem(record: any) {
    const index = this.tableData.findIndex(
      (item: any) => item.parentWorfklow.val === record.parentWorfklow.val
    );
    this.tableData.splice(index, 1);
    this.tableDataCopy.splice(index, 1);

    // 将删除的项添加回所有的list中

    // 当前行的code
    const parentWorkflowCode = record.parentWorfklow.val;
    const childWorkflowCode = record.subWorkflow.val;

    // 当前行对应的流程item
    const parentWorkflow = this.WorkflowItemDataCopy.find(
      (wd: any) => wd.code === parentWorkflowCode
    );
    const childWorkflow = this.subWorkflowListCopy.find(
      (wd: any) => wd.code === childWorkflowCode
    );

    if (!parentWorkflow || !childWorkflow) return;
    const parentWorkflowType: number = parentWorkflow.propertyType as number;
    const childkflowType: number = childWorkflow.propertyType as number;
    this.tableData.forEach((td: any) => {
      const isExistParentWorkflow = td.parentWorfklow.list.find(
        (wd: any) => wd.code === parentWorkflowCode
      );
      let isTypeSame: boolean = true;
      let isCanPush: boolean = true;
      if (td.parentWorfklow.val) {
        // 每一行的父流程的propertyType
        const _type: number = td.parentWorfklow.list.find(
          (innerItem: any) => innerItem.code === td.parentWorfklow.val
        ).propertyType;
        if (
          parentWorkflowType === DataItemType.RelevanceForm ||
          parentWorkflowType === DataItemType.RelevanceFormEx
        ) {
          // 关联表单
          const deletedItemRcode: string = parentWorkflow.relativeCode as string; // 被删除行父流程关联表单所关联的模型
          if (
            _type === DataItemType.RelevanceForm ||
            _type === DataItemType.RelevanceFormEx
          ) {
            const curRowItemRcode: string = td.parentWorfklow.list.find(
              (innerItem: any) => innerItem.code === td.parentWorfklow.val
            ).relativeCode as string;
            if (deletedItemRcode === curRowItemRcode) {
              isTypeSame = true;
            } else {
              isTypeSame = false;
            }
          }
        } else if (
          parentWorkflowType === DataItemType.ShortText &&
          parentWorkflow.code === 'id'
        ) {
          // 被删除行父流程是业务关联id
          const deletedItemScode: string = parentWorkflow.schemaCode as string; // 被删除行父流程业务对象id的schemaCode
          if (
            _type === DataItemType.RelevanceForm ||
            _type === DataItemType.RelevanceFormEx
          ) {
            const curRowItemRcode: string = td.parentWorfklow.list.find(
              (innerItem: any) => innerItem.code === td.parentWorfklow.val
            ).relativeCode as string;
            if (deletedItemScode === curRowItemRcode) {
              isTypeSame = true;
            } else {
              isTypeSame = false;
            }
          }
        } else {
          isTypeSame = parentWorkflowType === _type;
        }

        const isMainData: boolean = parentWorkflowCode.indexOf('.') === -1;
        const isSubTable: boolean =
          this.curActivityProps.commonSettings.triggerMappingObj.mainTable ===
          1;
        if (isSubTable) {
          // 触发对象为子表
          const pcode: string = parentWorkflowCode.split('.')[0] as string;
          const triggerCode: string = this.curActivityProps.commonSettings
            .triggerMappingObj.code;
          const isCurChildSheet = pcode === triggerCode;
          if (isMainData || isCurChildSheet) {
            isCanPush = td.parentWorfklow.val.indexOf('.') === -1;
          } else {
            isCanPush = td.parentWorfklow.val.indexOf('.') > -1;
          }
        } else {
          // 触发对象为主表
          if (isMainData) {
            isCanPush = td.parentWorfklow.val.indexOf('.') === -1;
          } else {
            isCanPush = td.parentWorfklow.val.indexOf('.') > -1;
          }
        }
      }

      if (!isExistParentWorkflow && isTypeSame && isCanPush) {
        td.parentWorfklow.list.push(parentWorkflow);
      }

      const isExistChildWorkflow = td.subWorkflow.list.find(
        (wd: any) => wd.code === childWorkflowCode
      );
      if (!isExistChildWorkflow && isTypeSame && isCanPush) {
        td.subWorkflow.list.push(childWorkflow);
      }
    });

    this.tableDataCopy.forEach((td: any) => {
      const isExistParentWorkflow = td.parentWorfklow.list.find(
        (wd: any) => wd.code === parentWorkflowCode
      );
      let isTypeSame: boolean = true;
      // 每一行的父流程的propertyType
      const _item: any = td.parentWorfklow.list.find(
        (innerItem: any) => innerItem.code === td.parentWorfklow.val
      );
      const _type: number = _item ? _item.propertyType : _item;
      if (
        parentWorkflowType === DataItemType.RelevanceForm ||
        parentWorkflowType === DataItemType.RelevanceFormEx
      ) {
        // 关联表单
        const deletedItemRcode: string = parentWorkflow.relativeCode as string; // 被删除行父流程关联表单所关联的模型
        if (
          _type === DataItemType.RelevanceForm ||
          _type === DataItemType.RelevanceFormEx
        ) {
          const curRowItemRcode: string = td.parentWorfklow.list.find(
            (innerItem: any) => innerItem.code === td.parentWorfklow.val
          ).relativeCode as string;
          if (deletedItemRcode === curRowItemRcode) {
            isTypeSame = true;
          } else {
            isTypeSame = false;
          }
        }
      } else if (
        parentWorkflowType === DataItemType.ShortText &&
        parentWorkflow.code === 'id'
      ) {
        // 被删除行父流程是业务关联id
        const deletedItemScode: string = parentWorkflow.schemaCode as string; // 被删除行父流程业务对象id的schemaCode
        if (
          _type === DataItemType.RelevanceForm ||
          _type === DataItemType.RelevanceFormEx
        ) {
          const curRowItemRcode: string = td.parentWorfklow.list.find(
            (innerItem: any) => innerItem.code === td.parentWorfklow.val
          ).relativeCode as string;
          if (deletedItemScode === curRowItemRcode) {
            isTypeSame = true;
          } else {
            isTypeSame = false;
          }
        }
      } else {
        isTypeSame = parentWorkflowType === _type;
      }

      if (!isExistParentWorkflow && isTypeSame) {
        td.parentWorfklow.list.push(parentWorkflow);
      }

      const isExistChildWorkflow = td.subWorkflow.list.find(
        (wd: any) => wd.code === childWorkflowCode
      );
      if (!isExistChildWorkflow && isTypeSame) {
        td.subWorkflow.list.push(childWorkflow);
      }
    });

    this.setIndex();
    this.filterMappingOnly();
  }

  // 迭代18 校验业务对象id和关联表单映射方式
  // 将inout看成从右到左写入
  // 所有写入业务对象id的映射关系，都是不合法的
  checkTableData(): boolean {
    let isOk: boolean = true;
    // 不合法的项
    const IllegalLists: Array<any> = this.tableData
      .map((data: any) => {
        const inObjectId: boolean =
          data.subWorkflow.val === 'id' && data.mappingWay.val === 'IN';
        const inOutObjectId: boolean =
          data.parentWorfklow.val === 'id' && data.mappingWay.val === 'IN_OUT';

        if (inObjectId || inOutObjectId) {
          return data;
        }
      })
      .filter((item: any) => item);
    isOk = IllegalLists.length <= 0;
    return isOk;
  }

  onCancel() {
    this.tableData = [];
    this.subWorkflowListCopy = [];
    this.isShowAlert = false;
    this.isShowErrorAlert = false;
    this.$emit('input', false);
  }

  onConfirm() {
    const isDataOk: boolean = this.checkTableData();
    if (!isDataOk) {
      // 存在不合法数据
      this.isShowAlert = false;
      this.isShowErrorAlert = true;
      return;
    }
    // 数据合成
    const arr: Array<WorkflowNameSpace.workflowDataMap> = [];
    const mappingStrArr: Array<string> = [];
    this.tableData.forEach((data: any) => {
      const parentWorfklowCode: string = data.parentWorfklow.val;
      const childWorfklowCode: string = data.subWorkflow.val;

      arr.push({
        parentDataName: parentWorfklowCode,
        childDataName: childWorfklowCode,
        inOutType: data.mappingWay.val,
      });
      mappingStrArr.push(
        `${data.parentWorfklow.name}[${data.parentWorfklow.val}]->${data.subWorkflow.name}[${data.subWorkflow.val}]`
      );
    });
    console.log(arr)
    // 更新数据
    this.setPropValue({ key: 'workflowDataMaps', value: arr });
    this.$emit('confirm', mappingStrArr.join('&'));
    this.onCancel();
  }

  onClose() {
    this.isShowAlert = false;
  }

  onCloseError() {
    this.isShowErrorAlert = false;
  }

  /**
   * 判断映射方式是否显示追加选项
   *
   * @event
   * @param {string} prve 父流程value
   * @param {string} next 子流程value
   * @param {string} type 映射方式value
   * @return {boolean}
   */
  isIN_OUT_APPEND(prve: string, next: string, type: string): boolean {
    if (type === 'IN_OUT_APPEND') {
      const prveValue = this.WorkflowItemDataCopy.find(
        (d: any) => d.code === prve
      );
      const nextValue = this.subWorkflowListCopy.find(
        (d: any) => d.code === next
      );
      const prveSheet =
        prveValue && prveValue.hasOwnProperty('isSheet')
          ? prveValue.isSheet
          : false;
      const nextSheet =
        nextValue && nextValue.hasOwnProperty('isSheet')
          ? nextValue.isSheet
          : false;
      if (
        (prveSheet && !nextValue) ||
        (nextSheet && !prveValue) ||
        (!prveValue && !nextValue) ||
        (prveSheet && nextSheet)
      ) {
        return true;
      }
      return false;
    }
    return true;
  }

  @Watch('value')
  onValueChange(val: any) {
    this.isShowModal = val;
    this.tableData = [];
    if (this.childWorkflowSchemaCode && val) {
      this.getChildDataItem();
    }
  }

  // @Watch('tableData', {
  //   deep: true,
  // })
  onTableDataChange(val: any) {
    // 获取父流程子表数据
    const WorkflowDataItem_orign = this.WorkflowDataItem_all.filter(
      (data: any) => data.propertyType === 8
    );
    let tem_arr = JSON.parse(JSON.stringify(WorkflowDataItem_orign));
    let sheetArr: object[] = [];

    // 有子表数据
    if (tem_arr && tem_arr.length) {
      tem_arr.forEach((d: any) => {
        let mappingWay = val.find(
          (t: any) => t['parentWorfklow'].val.indexOf(d.code) > -1
        );
        mappingWay ? sheetArr.push(mappingWay) : '';
      });
    }

    // 同一子表只能选择同一种映射方式
    val.forEach((d: any) => {
      sheetArr.forEach((s: any) => {
        let sheetName = s['parentWorfklow'].val.split('.')[0];
        if (sheetName && d['parentWorfklow'].val.indexOf(sheetName) > -1) {
          d['mappingWay'].val = s['mappingWay'].val;
        }
      });
    });
  }
}
</script>
<style lang="less" scoped>
.mapping-box {
  max-height: calc(100% - 75px);
  overflow: auto;
  padding-bottom: 130px;
}
/deep/.ant-table-tbody > tr > td {
  padding: 3px 16px;
  color: rgba(0, 0, 0, 0.85);
}
/deep/.ant-table-thead > tr > th {
  padding: 8px 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
}
.p-w-section {
  width: 220px;
}
.s-w-section {
  width: 210px;
}
.m-w-section {
  width: 220px;
}
.icon {
  cursor: pointer;
  font-weight: normal;
}
.add-item {
  color: @primary-color;
  text-align: center;
  margin-top: 8px;
  user-select: none;
  cursor: pointer;
}
.footer {
  text-align: center;
  position: absolute;
  height: 50px;
  line-height: 50px;
  bottom: 0;
  width: 100%;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  text-align: center;
}
.resize {
  display: inline-block;
  height: 22px;
  width: calc(100% + 32px);
  padding: 0 16px;
  -webkit-transform: translateX(-16px);
  transform: translateX(-16px);
  border-left: 1px solid #e8e8e8;
  font-weight: 600;
}
.resize-first {
  border-left: none;
}

/deep/.ant-table-placeholder {
  display: none;
}

.ant-drawer-body {
  position: relative;
  .warn-alert {
    position: absolute;
    top: 57px;
    left: 0;
    width: 100%;
  }
}

/deep/.isEmpty .ant-select-selection__placeholder{
  display: block !important;
}
</style>
