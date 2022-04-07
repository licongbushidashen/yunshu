
<template>
  <div class="permission-group-form">
    <h4>{{ $t('languages.appSettings.AddPermissionGroup') }}</h4>

    <a-row type="flex">
      <a-col :span="4">{{ $t('languages.appSettings.GroupName') }}</a-col>
      <a-col :span="20" :class="{ error:error.name }">
        <a-input v-model="name" :maxLength="50"></a-input>
        <div class="message" v-show="error.name">{{ $t('languages.Apps.NameRule') }}</div>
      </a-col>
    </a-row>

    <a-row type="flex">
      <a-col :span="4">{{ $t('languages.appSettings.SetType') }}</a-col>
      <a-col :span="20" class="checkbox">
        <a-radio-group v-model="setType" @change="onSetTypeChange">
          <a-radio :value="0">{{ $t('languages.appSettings.AsOrg') }}</a-radio>
          <a-radio :value="1">{{ $t('languages.appSettings.AsRole') }}</a-radio>
        </a-radio-group>
        <!--<div class="message" v-show="error.staffs">{{ $t('languages.appSettings.IncludeRule') }}</div>-->
      </a-col>
    </a-row>
    <a-row type="flex" v-if="visibleType.isExternalUser">
      <a-col :span="4">{{ $t('languages.appSettings.IncludeOrg') }}</a-col>
      <a-col :span="20" :class="{ error:error.staffs }">
        <staff-selector :keepDeptIds="keepDeptIds" v-model="staffs" :options="staffSelectorOpts" :params="{filterType : 'admin'}"></staff-selector>
        <div class="message" v-show="error.staffs">{{ $t('languages.appSettings.IncludeRuleOrg') }}</div>
      </a-col>
    </a-row>

    <a-row type="flex" v-if="visibleType.roles">
      <a-col :span="4">{{ $t('languages.appSettings.IncludeRole') }}</a-col>
      <a-col :span="20" :class="{ error:error.roles }">
        <!-- <role-tree 
          v-model="roles"
          :placeholder="$t('languages.appSettings.PlzSelectRole')"
          :treeCheckable="true"
        /> -->
        <role-select class="roleSelect" :multiple="true" defaultValueKey="id" :defaultValue="roles" @select="selectRole"></role-select>
        <div class="message" v-show="error.roles">{{ $t('languages.appSettings.IncludeRule') }}</div>
      </a-col>
    </a-row>

    <a-row type="flex" v-if="visibleType.isExternalUser">
      <a-col :span="4">
        {{ $t("languages.appSettings.externalUser") }}
        <a-tooltip :title="$t('languages.appSettings.externalUserTips')" style="margin-left:8px;">
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </a-col>
      <a-col
        :span="20"
        class="checkbox"
        :class="{ error:error.isExternalUser }"
      >
        <a-checkbox v-model="isExternalUser"></a-checkbox>
        <div class="message" v-show="error.isExternalUser">{{ $t('languages.appSettings.IncludeRuleOrg') }}</div>
      </a-col>
    </a-row>

    <!--<template v-if="groupId">-->
    <template>
      <h4>{{ $t('languages.appSettings.permissionSetting') }}</h4>
      <div 
        v-for="(item,index) in list" 
        :key="index"
        class="panel-content"
        @click="collapse(index)"
      >
        <h3-panel
          :title="item.name"
          :collapsible="true"
          :collapsed="index === curIndex"
          
        >
          <div 
            class="permission-group-panel-wrapper" 
            v-for="(childItem,childIndex) in item.children" 
            :key="childIndex"
          >
            <div class="permission-group-panel-item">
              <div class="item-title">
                <span>{{ childItem.name }}</span>
                <span>
                  <a-checkbox 
                    :checked="childItem.visible"
                    v-if="childItem.visible !== undefined"
                    @change="e => setField(childItem,'visible',e.target.checked)"
                  >
                    {{ $t('languages.appSettings.visible') }}
                  </a-checkbox>
                </span>
              </div>
            </div>

            <!-- 表单数据权限 -->
            <!-- <div 
              class="permission-group-panel-item" 
              v-if="childItem.dataPermissionType !== undefined && childItem.nodeType !== 'Page' && childItem.nodeType !== 'Report'"
            >
              <div class="item-list _item-list" style="flex-direction: column;">
                <p>
                  <span class="form_data_title">{{ $t('languages.appSettings.FormDataPermission') }}</span>
                  <span>
                    <a-checkbox 
                      :checked="childItem.setPermission"
                      @change="e => setPermission(childItem, 'setPermission', e.target.checked)"
                    >
                      设置表单数据权限
                    </a-checkbox>
                  </span>
                </p>

                <section class="data-permission-handler__tabs" v-if="childItem.setPermission && childItem.propertityPermissionGroups">
                  <a-tabs :animated="false" v-model="childItem.bizPermType">
                    <a-tab-pane tab="新增时" key="1">
                      <data-item :tableHeight="height" @propertityPermissionGroupsChange="propertityPermissionGroupsChange(childItem)" :dataItems="getCurrentDataItems(childItem.propertityPermissionGroups, 1)" :bizPermType="childItem.bizPermType"/>
                    </a-tab-pane>
                    <a-tab-pane tab="查看时" key="2"> 
                      <data-item :tableHeight="height" :dataItems="getCurrentDataItems(childItem.propertityPermissionGroups, 2)" :bizPermType="childItem.bizPermType"/>
                    </a-tab-pane>
                    <a-tab-pane tab="编辑时" key="3">
                      <data-item :tableHeight="height" :dataItems="getCurrentDataItems(childItem.propertityPermissionGroups, 3)" :bizPermType="childItem.bizPermType"/>
                    </a-tab-pane>
                  </a-tabs>
                </section>
              </div>
            </div> -->


            <div 
              class="permission-group-panel-item" 
              v-if="childItem.dataPermissionType !== undefined && childItem.nodeType !== 'Page' && childItem.nodeType !== 'Report'"
            >
              <div class="item-list">
                <span>{{ $t('languages.appSettings.dataPermission') }}</span>
                <ul>
                  <li 
                    :class="childItem.dataPermissionType == 1 ? 'active' : ''"
                    @click="dataPermissionSelect(childItem,1)"
                  >
                    {{ $t('languages.appSettings.AllVisible') }}
                  </li>
                  <li 
                    :class="childItem.dataPermissionType == 3 ? 'active' : ''"
                    @click="dataPermissionSelect(childItem,3)"
                  >
                    {{ $t('languages.appSettings.OnlySelf') }}
                  </li>
                  <li 
                    :class="childItem.dataPermissionType == 2 ? 'active' : ''"
                    @click="dataPermissionSelect(childItem,2)"
                  >
                    {{ $t('languages.appSettings.MyDepartment') }}
                  </li>
                  <li 
                    :class="childItem.dataPermissionType == 5 ? 'active' : ''" 
                    v-if="visibleType.rolesRange"
                    @click="dataPermissionSelect(childItem,5)"
                  >
                    {{ $t('languages.appSettings.RoleManagerRange') }}
                  </li>
                  <li 
                    :class="childItem.dataPermissionType == 4 ? 'active' : ''"
                    @click="dataPermissionSelect(childItem,4,index,childIndex)"
                  >
                    {{ $t('languages.appSettings.Customize') }}
                  </li>
                </ul>
              </div>
            </div>
            <div 
              class="permission-group-panel-item"
              v-if="childItem.actionPermission && childItem.nodeType !== 'Page' && childItem.nodeType !== 'Report'"
            >
              <div class="item-list">
                <span>{{ $t('languages.appSettings.permissionAction') }}</span>
                <ul>
                  <li 
                    :class="childItem.actionPermission.creatable ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'creatable')"
                  >
                    {{ $t('languages.appSettings.Add') }}
                  </li>
                  <li 
                    :class="childItem.actionPermission.editable ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'editable')"
                  >
                    {{ $t('languages.appSettings.Edit') }}
                  </li>
                  <li 
                    :class="childItem.actionPermission.deletable ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'deletable')"
                  >
                    {{ $t('languages.appSettings.Delete') }}
                  </li>
                  <li
                    :class="childItem.actionPermission.importable ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'importable')"
                  >
                    {{ $t('languages.appSettings.Import') }}
                  </li>
                  <li 
                    :class="childItem.actionPermission.exportable ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'exportable')"
                  >
                    {{ $t('languages.appSettings.Export') }}
                  </li>
                  <li 
                    :class="childItem.actionPermission.printAble ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'printAble')"
                  >
                    {{ $t('languages.appSettings.PrintQr') }}
                  </li>
                  <li 
                    :class="childItem.actionPermission.editOwnerAble ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'editOwnerAble')"
                  >
                    {{ $t('languages.appSettings.UpdateOwner') }}
                  </li>
                  <li 
                    :class="childItem.actionPermission.batchPrintAble ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'batchPrintAble')"
                  >
                    {{ $t('languages.appSettings.printTemp') }}
                  </li>

                  <!-- 批量修改功能暂时延期下个迭代 -->
                  <li 
                    :class="childItem.actionPermission.batchUpdateAble ? 'active' : ''"
                    @click="actionPermissionSelect(childItem.actionPermission,'batchUpdateAble')"
                  >{{ $t('languages.appSettings.batchUpdate') }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </h3-panel>
      </div>
      <dataitem-condition-modal
        ref="conditionModal"
        :permission="record"
        @ok="onConditionModalOk"
        @cancel="onConditionModalCancel"
      ></dataitem-condition-modal>
    </template>

    <div class="ant-drawer-btn">
      <a-button class="cancel-btn" @click="cancel">{{ $t('languages.appSettings.cancel') }}</a-button>
      <a-button type="primary" @click="save" :disabled="canDoubleClick">{{ $t('languages.appSettings.save') }}</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import { State, namespace } from 'vuex-class';

import moment from 'moment';

import { Row, Col } from '@h3/antd-vue';

import h3Panel from './panel.vue';

import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';

import permissionApi from '@/apis/system/permission.api';

import DataitemConditionModal from './dataitem-condition-modal.vue';

import { formApi } from "@cloudpivot/api";

import common from "@cloudpivot/common/pc";
import DataItem from '../../../views/app/data-permission/data-item.vue';

const AppCenterModule = namespace('Apps/AppCenter');

import * as dataPermissionApi from '@/apis/data-permission';

@Component({
  name: 'permission-group-form',
  components: {
    ARow: Row,
    ACol: Col,
    h3Panel,
    StaffSelector,
    DataitemConditionModal,
    RoleSelect: common.components.RoleSelect,
    DataItem
  }
})

export default class PermissionGroupForm extends Vue {
  @AppCenterModule.State('appInfo') appInfo: any;

  @Prop({
    default: ''
  })
  groupId!: string;

  isExternalUser:boolean = false;

  canDoubleClick:boolean = false;//防止多次点击保存按钮重复请求接口 true：按钮失效不可点，false：按钮生效可点

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择组织或用户'
  };

  name = '';

  setType = 0 as any;

  staffs = '' as any;

  roles = '' as any;

  record: BPM.System.AppFunctionPermissionModel = {} as any;

  error: any = {};

  // 当前自定义的模型索引
  curPerssionIndex: any = 0;

  // 当前自定义的app索引
  curAppIndex: any = 0;

  visibleType = {
    staffs: true,
    isExternalUser: true,
    roles: false,
    rolesRange: false,
  };

  columns: any[] = [];

  list: any[] = [];

  curIndex: number = 0;

  beforeIndex: number | undefined;

  beforeChildIndex: number | undefined;

  beforeDataPermissionType: number = 0;

  keepDeptIds:string[] = [];

  conditionValueCache: any = {};

  setColumns() {
    this.columns = [
      {
        title: this.$t('languages.appSettings.function') as any,
        width: 240,
        fixed: 'left',
        dataIndex: 'name'
      },
      {
        title: this.$t('languages.appSettings.visible') as any,
        width: 90,
        dataIndex: 'visible',
        scopedSlots: { customRender: 'visible' }
      },
      {
        title: this.$t('languages.appSettings.dataPermission') as any,
        width: 520,
        dataIndex: 'dataPermissionType',
        scopedSlots: { customRender: 'dataPermissionType' }
      },
      {
        width: 520,
        title: this.$t('languages.appSettings.permissionAction') as any,
        dataIndex: 'actionPermission',
        scopedSlots: { customRender: 'actionPermission' }
      }
    ];
  }

 /**
   * 选中角色
   */
  selectRole(role: any, evt: Event) {
    this.roles = role;
  }
  collapse(val: number) {
    this.curIndex = val;
  }

  getExpandIcon(props: any) {
    // console.log(props);
  }

  onSetTypeChange(e: any) {
    const type = e.target.value;
    this.setTypeChange(type);
    // permissionApi.updateAppPackage(params);
  }

  setTypeChange(type: any) {
    if(type === 0){
      this.$set(this.visibleType, 'staffs', true);
      this.$set(this.visibleType, 'isExternalUser', true);
      this.$set(this.visibleType, 'roles', false);
      this.$set(this.visibleType, 'rolesRange', false);
    }else {
      this.$set(this.visibleType, 'staffs', false);
      this.$set(this.visibleType, 'isExternalUser', false);
      this.$set(this.visibleType, 'roles', true);
      this.$set(this.visibleType, 'rolesRange', true);
      this.isExternalUser = false;
    }
  }

  dataPermissionSelect(item: any, val:number,index?: number,childIndex?: number) {

    if(val === 4){
      this.curPerssionIndex = childIndex;
      this.curAppIndex = index;
      this.openConditionModal(item);
      //选“自定义”取消没有保存后，焦点重新回到上一个
      this.beforeIndex = index;
      this.beforeChildIndex = childIndex;
      this.beforeDataPermissionType = item.dataPermissionType;
    }
    item.edit = true;
    item.dataPermissionType = val;
  }
  
  openConditionModal(record: any) {
    
    const conditionValueCache = JSON.parse(JSON.stringify(record));

    if (record && Array.isArray(conditionValueCache.conditions)) {
      conditionValueCache.conditions.forEach((c:any) => {
        if (c.propertyType === 3 && c.value && typeof c.value === 'string') {
          c.value = moment(c.value);
        }
      });
    }
    this.record = conditionValueCache;
    // this.conditionValueCache = conditionValueCache;
    (this.$refs.conditionModal as DataitemConditionModal).show();
  }

  onConditionModalOk(val: any) {
    
    if (val && Array.isArray(val.conditions)) {
      val.conditions.forEach((c:any) => {
        if (c.propertyType === 3 && c.value && typeof c.value === 'object') {
          c.value = moment(c.value).format('YYYY-MM-DD HH:mm:ss');
        }
      });
    }
    this.record.filterType = val.type;
    this.record.conditions = val.conditions;

    // 确定时要更新当前数据模型列表数据
    const curPerssion: any = this.list[this.curAppIndex] && this.list[this.curAppIndex].children && this.list[this.curAppIndex].children[this.curPerssionIndex];

    if (curPerssion) {
     curPerssion.filterType = val.type; 
     curPerssion.conditions = val.conditions;
    }

  }

  onConditionModalCancel() {
    // this.record = '' as any;
    if(this.beforeIndex !== undefined && this.beforeChildIndex !== undefined){
      this.list[this.beforeIndex].children[this.beforeChildIndex].dataPermissionType = this.beforeDataPermissionType;
    }
  }

  // 返回可配置数据
  getCurrentDataItems(data, bizPermType){
    if(!data){
      return data
    }
    return data.filter(el => el.bizPermType === bizPermType)
  }


  changeDatas: object = {}
  // 记录修改过的表单数据权限
  propertityPermissionGroupsChange(changeData){
    this.changeDatas[changeData.schemaCode] = changeData
    console.log('changeData==>', changeData)
  }


  isUpdataPermissionOver:boolean = true // 更新完毕表单数据权限
  isDeletePermissionOver:boolean = true // 删除完毕表单数据权限
  // 更新表单数据权限
  updataFormDataPermission(id){
    let count = 0
    for (const key in this.changeDatas) {
      count ++ 
      let currentItem = this.changeDatas[key]

      let addPerms:any[] = []
      let viewPerms:any[] = []
      let editPerms:any[] = []
      currentItem.propertityPermissionGroups.forEach(element => {
        let item = {
          bizPermType: element.bizPermType,
          groupId: element.groupId,
          id: element.id,
          name: element.name,
          name_i18n: '{}',
          propertyCode: element.propertyCode,
          propertyType: element.propertyType,
          required: element.required,
          schemaCode: element.schemaCode,
          visible: element.visible,
          writeAble: element.writeAble
        }

        if(element.bizPermType === 1){
          addPerms.push(item)
        }else if(element.bizPermType === 2){
          viewPerms.push(item)
        }else{
          editPerms.push(item)
        }
      });
      let params = {
        enabled: true,
        roles: this.setType === 0 ? JSON.stringify(this.staffs) : undefined,
        departments: this.setType === 1 ? JSON.stringify(this.roles) : undefined,
        schemaCode: currentItem.schemaCode,
        permProperties: [
          ...addPerms,
          ...viewPerms,
          ...editPerms,
        ],
        id: "afeb204e79b0d8050179b0e0937c0003",
        name: this.name,
        name_i18n: '{"zh":"'+ this.name +'"}',
        appPermGroupId: this.groupDataInfo.id || id
      }
      dataPermissionApi.updatePermission(params).then((res: any) => {
        if (res.errcode === 0) {
          count--
          if(count === 0){
            this.$message.success(this.$t('languages.appSettings.saveSuccessfully') as string);
            this.isUpdataPermissionOver = true
            if(this.isDeletePermissionOver){
              this.$emit('ok')
            }
          }
        }else {
          this.$message.error(res.errmsg);
        }
      });
    }
  }
  // 删除表单数据权限
  deleteFormDataPermission(){
    let count = 0
    for (const key in this.temporaryStorage) {
      count ++ 
      let currentItem = this.temporaryStorage[key]
      console.log('需要删除的currentItem===>', currentItem)
      if(currentItem.propertityPermissionGroups[0] && currentItem.propertityPermissionGroups[0].groupId){
        dataPermissionApi.deletePermission({
          groupId: currentItem.propertityPermissionGroups[0].groupId
        }).then((res: any) => {
          if (res.errcode === 0) {
            count--
            if(count === 0){
              this.$message.success(this.$t('languages.appSettings.saveSuccessfully') as string);
              this.isDeletePermissionOver = true
              if(this.isUpdataPermissionOver){
                this.$emit('ok')
              }
            }
          }else {
            this.$message.error(res.errmsg);
          }
        });
      }
    }
  }

  // 配置表单数据权限显示控制
  setPermission(record: any, key: string, value: any){
    this.$set(record, key, value)
    if(!value){
      this.temporaryStorage[record.schemaCode] = record
    }else{
      delete this.temporaryStorage[record.schemaCode]
      if(!record.propertityPermissionGroups){
        // alert('还没配置表单数据权限')
        this.addPropertityPermissionGroups(record)
      }
    }
  }
  // 暂存删除的表单数据权限
  temporaryStorage: object = {}

  // 新建表单数据权限
  async addPropertityPermissionGroups(record){
    console.log('record===>', record)
    let formData = []
    let res = await dataPermissionApi.getDataItemList({
      schemaCode: record.schemaCode
    })
    console.log('9999999===>',res)
    if(res.errcode === 0){
        // @ts-ignore
        
        // @ts-ignore
        formData = res.data.filter((item: any) => !item.defaultProperty && item.published)
        console.log('formData===>', formData)

        const dataItems: any[] = [];
        formData.forEach((item: any) => {
          const name_i18n: any = typeof item.name_i18n === 'string' && item.name_i18n ? JSON.parse(item.name_i18n) : {};
          dataItems.push({
            name: item.name,
            name_i18n: '{}',
            propertyEmpty: item.propertyEmpty,
            propertyCode: item.code,
            propertyType: item.propertyType,
            required: false,
            visible: true,
            writeAble: true,
            hasSubSchema: item.subSchema && Array.isArray(item.subSchema.properties),
          });
          if (item.subSchema && Array.isArray(item.subSchema.properties)) {
            item.subSchema.properties.forEach((subItem: any) => {
              if (!subItem.defaultProperty) {
                const sub_name_i18n: any = typeof subItem.name_i18n === 'string' && subItem.name_i18n ? JSON.parse(subItem.name_i18n) : {};
                dataItems.push({
                  name: subItem.name,
                  name_i18n: sub_name_i18n,
                  propertyEmpty: subItem.propertyEmpty,
                  propertyCode: subItem.code,
                  propertyType: subItem.propertyType,
                  required: false,
                  visible: true,
                  writeAble: true,
                  parentCode: item.code, // 父级数据项code
                  parentName: item.name, // 父级数据项name
                  parentNameI18n: name_i18n, // 父级数据项name_i18n
                });
              }
            });
          }
        });
        console.log('dataItems===>',dataItems)
        let resData = this.initAdd(dataItems)
        this.$set(record, 'propertityPermissionGroups', resData)

        console.log('record===>>>', record)
        console.log('res001==>>>', resData)

        this.changeDatas[record.schemaCode] = resData
      }
    
  }

  
  /**
   * 初始化新建的数据项权限基础数据
   */
  initAdd(dataItems) {
    // ;
    // 默认可见/可写
    let addDataItems = JSON.parse(JSON.stringify(dataItems));
    addDataItems.forEach((item: any) => {
      item.visible = true;
      item.writeAble = true;
      item.required = item.propertyEmpty;
      item.bizPermType = 1
    });
    let viewDataItems = JSON.parse(JSON.stringify(dataItems));
    viewDataItems.forEach((item: any) => {
      item.visible = true;
      item.bizPermType = 2
    });
    let editDataItems = JSON.parse(JSON.stringify(dataItems));
    editDataItems.forEach((item: any) => {
      item.visible = true;
      item.writeAble = true;
      item.required = item.propertyEmpty;
      item.bizPermType = 3
    });
    console.log('77777777777777777=====>',[...addDataItems, ...viewDataItems, ...editDataItems])

    return [...addDataItems, ...viewDataItems, ...editDataItems]
  }


  groupDataInfo: any = {}
  @Watch('groupId', {
    immediate: true
  })
  onGroupIdChange(groupId: string) {
    let appCode: string = '';
    if (!groupId) {
      appCode = this.$route.params.appCode || this.appInfo.code;
    }
    permissionApi.getGroup(groupId,appCode).then((res) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      }
      
      const { data } = res;
      

      if (data) {
        this.groupDataInfo = data // 存储当前权限组数据
        this.name = data.name;
        this.isExternalUser = data.externalUser;
        this.setType = data.authorType;
        this.setTypeChange(this.setType);
        this.staffs = data.departments ? JSON.parse(data.departments) : '';
        this.roles = data.roles ? JSON.parse(data.roles) : '';
        const list: any[] = [];
        let obj: any = {
          name: this.appInfo.name,
          children: []
        }
        data.dataPermissionGroups
          .forEach((x, i) => {
            if (x.functionCode === x.schemaCode) {
              obj.key = x.functionCode
              obj.children.push(this.convert(x, i));

            } else {
              const key = x.functionCode;
              let group = list.find((y: any) => y.key === key);
              if (!group) {
                group = {
                  key,
                  name: x.functionName,
                  children: []
                };
                list.push(group);
              }
              group.children.push(this.convert(x, i));
            }
          });
        //当模型没有分组时，取应用名称作为模型的分组 并且要把他们归并到一个组
        if(obj.children.length > 0){
          list.unshift(obj)
        }

        this.list = list

        // 通过接口判断当前组织是否可编辑
        this.setKeepDeptIds();
      }
    });
  }

  /**
   * 判断选人控件是否可编辑
   * */ 
  async setKeepDeptIds(){
    let sType:string = '';
    const { staffs } = this;
    
    if (!staffs.length) return;

    const types:number[] = staffs.map((i:any) => i.unitType) as number[]; // 1 部门  3 人员
    const isAllDept:boolean = types.every((i:number) => i === 1 );
    const isAllStaff:boolean = types.every((i:number) => i === 3 );
    const bothDeptAndStaff:boolean = types.some((i:number) => i === 3 || i === 1);
    
    if (isAllDept) { // 全部部门
      sType = 'DEPT';
    } else if (isAllStaff) { // 全部人员
      sType = 'USER';
    } else if (bothDeptAndStaff) { // 二者均有
      sType = 'DEPT_USER';
    }

    const targetIds:string[] = staffs.map((staff:any) => {
      if (staff.unitType === 1) return staff.id;
    }).filter((i:any) => !!i);

    const userIds:string[] = staffs.map((staff:any) => {
      if (staff.unitType === 3) return staff.id;
    }).filter((i:any) => !!i);

    const params: any = { targetIds: targetIds.join(','), userIds:userIds.join(','), sourceType: sType };

    const res:any = await formApi.getStaffOperateAble(params);
    const { data } = res;

    this.keepDeptIds = data.map((i:any) => {
        if(!i.op) { return i.targetId; }
    }).filter((i:any) => !!i);

  }

  convert(x: BPM.System.AppFunctionPermissionModel, i: number) {
    return {
      id: x.id || x.schemaCode + i,
      key: x.id || x.schemaCode + i,
      edit: false,
      name: x.schemaName || x.functionName,
      functionCode: x.functionCode,
      schemaCode: x.schemaCode,
      visible: x.visible,
      filterType: x.filterType,
      conditions: x.conditions,
      dataPermissionType: x.dataPermissionType,
      nodeType: x.nodeType,
      actionPermission: {
        creatable: x.creatable,
        deletable: x.deletable,
        editable: x.editable,
        exportable: x.exportable,
        importable: x.importable,
        printAble: x.printAble,
        editOwnerAble: !!x.editOwnerAble, // 老数据可能为null
        batchPrintAble: x.batchPrintAble,
        batchUpdateAble: x.batchUpdateAble
      },
      propertityPermissionGroups: x.propertityPermissionGroups,
      setPermission: !!x.propertityPermissionGroups,
      bizPermType: '1'
    };
  }

  setField(record: any, key: string, value: any) {
    record.edit = true;
    record[key] = value;
  }


  actionPermissionSelect(item: any, key: string) {
    // debugger
    item.edit = true;
    // item[key] = !item[key];
    this.$set(item, key, !item[key])
  }

  setAction(record: any, ap: any, key: string, value: any) {
    record.edit = true;
    ap[key] = value;
  }

  validate() {
    let valid = true;
    if (!/^[^ ]\S{0,50}/.test(this.name)) {
      this.$set(this.error, 'name', true);
      valid = false;
    } else {
      this.$set(this.error, 'name', false);
    }

    // if ((!this.staffs || !this.staffs.length)
    //   && (!this.roles || !this.roles.length)
    //   && !this.isExternalUser
    // ) {
    //   this.$set(this.error, 'staffs', true);
    //   this.$set(this.error, 'roles', true);
    //   this.$set(this.error, 'isExternalUser', true);
    //   valid = false;
    // } else {
    //   this.$set(this.error, 'staffs', false);
    //   this.$set(this.error, 'roles', false);
    //   this.$set(this.error, 'isExternalUser', false);
    // }
    if(this.setType === 0){
      if ((!this.staffs || !this.staffs.length)
              && !this.isExternalUser
      ) {
        this.$set(this.error, 'staffs', true);
        this.$set(this.error, 'isExternalUser', true);
        this.$set(this.error, 'roles', false);
        valid = false;
      } else {
        this.$set(this.error, 'staffs', false);
        this.$set(this.error, 'isExternalUser', false);
        this.$set(this.error, 'roles', false);
      }
    }else{
      if (!this.roles || !this.roles.length){
        this.$set(this.error, 'roles', true);
        this.$set(this.error, 'staffs', false);
        this.$set(this.error, 'isExternalUser', false);
        valid = false;
      } else {
        this.$set(this.error, 'roles', false);
        this.$set(this.error, 'staffs', false);
        this.$set(this.error, 'isExternalUser', false);
      }
    }
    return valid;
  }

  cancel() {
    this.$emit('cancel');
  }

   save() {
    if (!this.validate()) {
      return;
    }

    const params: any = {
      appCode: this.$route.params.appCode || this.appInfo.code,
      name: this.name,
      externalUser: this.isExternalUser
    };
    if(this.setType === 0){
      if (this.staffs && this.staffs.length) {
        params.departments = JSON.stringify(this.staffs.map((s: any) => ({
          id: s.id,
          name: s.name,
          unitType: s.unitType
        })));
      }
    }else{
      if (this.roles && this.roles.length) {
        params.roles = JSON.stringify(this.roles.map((r: any) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          groupId: r.groupId,
          groupName: r.groupName
        })));
      }
    }


    if (this.groupId) {
      params.id = this.groupId;
    }else{
      params.id = '';
    }
    
    const map = (x: any, i: number) => {
      
      const temp = Object.assign({}, x, x.actionPermission);
      delete temp.actionPermission;
      if (!temp.conditions) {
        temp.conditions = null;
      }
      temp.id = temp.key !== temp.schemaCode + i ? temp.key : null;
      delete temp.key;
      delete temp.edit;
      return temp;
    };

    let list = this.list.filter(x => !x.children)
      .map(map);

    list = this.list.filter(x => x.children).flatMap(x => x.children).map(map).concat(list);

    for (let i = 0; i < list.length; i++) {
      let list_i = list[i];
      if (list_i.conditions) {
        for (let j = 0; j < list_i.conditions.length; j++) {
          let conditions_j = list_i.conditions[j];
          if (((conditions_j.operatorType === 11 || conditions_j.operatorType === 12) && typeof conditions_j.value === 'object')) {
            list[i].conditions[j].value = JSON.stringify(conditions_j.value);
          }
          // 防止选人控件初始值为数组, 这里作为条件需传参字符串
          if (conditions_j.propertyType === 5 && Array.isArray(conditions_j.value)) {
            list[i].conditions[j].value = conditions_j.value.join();
          }
        }
      }
    }

    // const record: any = this.record;
    
    // 更新对应的考核平台过滤条件
    // if (list.length) {
    //   const curPerssion: any = list[this.curPerssionIndex];

    //   if (curPerssion && record.conditions) curPerssion.conditions = record.conditions;
    // }

    params.dataPermissionGroups = list;

    if (!params.dataPermissionGroups.length) {
      delete params.dataPermissionGroups;
    }

    // 拦截表单设置了自定义但没有设置condition的情况
    if (params && params.dataPermissionGroups && params.dataPermissionGroups.length) {
      const hassNoConditionForms: Array<string | number> = [];
      params.dataPermissionGroups.map((item: any) => {
        item.dataPermissionType === 4 && !item.conditions ? hassNoConditionForms.push(item.name) : ''
      });
      // console.log(hassNoConditionForms);
      if (hassNoConditionForms.length) {
        // this.$message.error(`${hassNoConditionForms.join('、')}表单数据权限请设置`);
        this.$message.error(this.$t('languages.appSettings.PlzSelectFormPermission', { form: hassNoConditionForms.join('、') }) as string);
        return;
      }
    }

    // const p = this.groupId
    //   ? permissionApi.updateGroup(params)
    //   : permissionApi.createGroup(params);
    const p = permissionApi.updateGroup(params);

    p.then((res) => {
      if (res.errcode === 0) {
        
        
        if(Object.keys(this.changeDatas).length || Object.keys(this.temporaryStorage).length){
          if(Object.keys(this.changeDatas).length){
            // 保存表单数据权限
            this.isUpdataPermissionOver = false
            // @ts-ignore
            this.updataFormDataPermission(res.data.id)
          }

          if(Object.keys(this.temporaryStorage).length){
            // 删除表单数据权限
            this.isDeletePermissionOver = false
            this.deleteFormDataPermission()
          }
          
        }{
          this.$message.success(this.$t('languages.appSettings.saveSuccessfully') as string);
          this.$emit('ok')
        }
      } else {
        this.$message.error(res.errmsg as string);
      }
    });
    this.canDoubleClick = true;
    let that = this;
    setTimeout(function(){
      that.canDoubleClick = false;
    },500)
  }


  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t('Languages.Apps.PlzSetOrgOrUser') as string;
  }

  mounted() {
    this.setColumns();
  }

  @Watch('$i18n.locale')
  onLanguageChange(l:string) {
    this.placeHolderLang();
    this.setColumns();
  }

  @Watch('record')
  rolesChange(val: any) {
    // console.log(val)
    if(val.conditions && val.conditions.length > 0){
      let condition=val.conditions;
      for(let i=0;i<condition.length;i++){
        if(condition[i].operatorType===11 || condition[i].operatorType===12){
          if((typeof condition[i].value) === 'string' ){
            this.record.conditions[i].value=JSON.parse(condition[i].value);
          }
        }
      }
    }
  }

  @Watch('list', { deep: true })
  OnListChange(val: any,...arg) {
    console.log('val=====>', val, arg)
  }


  bizPermType: string = '1';
  height = 500;

  setTableHeight() {
    const roleSelect:any = this.$refs.roleSelect;
    const staffsSelect:any = this.$refs.staffsSelect;
    let h:number = 37;
    if (roleSelect) {
      h = roleSelect.$el.clientHeight;
      
    }else if(staffsSelect){
      h = staffsSelect.$el.clientHeight;
    }
    const docH = document.body.clientHeight;
    this.height = docH - h - 336;
  }
}
</script>

<style lang="less" scoped>
._item-list{
  display: flex;
  flex-direction: column;
  p{
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}
.permission-group-form {
  // position: relative;
  // min-height: 100%;
  margin-bottom: 70px;
  // /deep/.ant-table-thead span {
  //   font-weight: 600;
  //   color: rgba(0,0,0,0.65);
  // }
  /deep/.ant-table-body {
    color: rgba(0,0,0,0.85);
  }
  .ant-drawer-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 52px;
    line-height: 52px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    background-color: #fff;
    .cancel-btn{
      margin-right: 16px;
    }
  }
  h4 {
    font-weight: 600;
    color: #000;
    margin-bottom: 16px;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  a {
    color: @primary-color;
    font-size: 14px;
  }
  /deep/.ant-row-flex {
    margin: 20px 0;
    align-items: flex-start;
  }

  .ant-col-4 {
    display: flex;
    align-items: center;
    height: 32px;
    color: rgba(0,0,0,0.65);
  }
  .ant-col-20.checkbox {
    line-height: 32px;
  }
  .setting-groups {
    display: flex;
  }
  .error {
    /deep/.ant-select-selection,
    /deep/.h3-organization__label {
      border: 1px solid #f5222d;
    }

    & > .message {
      color: #f5222d;
      font-size: 12px;
    }
  }
}
.panel-content+.panel-content{
  margin-top: 16px;
}
.permission-group-panel-wrapper{
  margin: 0 14px 0 16px;
  border-top: 1px solid #E8E8E8;
  .permission-group-panel-item{
    margin: 16px 0;
    .item-title{
      font-weight:600;
      display: flex;
      flex-direction: row;
      flex-wrap: no-wrap;
      justify-content: space-between;
      align-items: center;
    }
  }
}
.panel-content .permission-group-panel-wrapper:last-of-type .permission-group-panel-item:last-of-type{
  margin-bottom: 0;
}
.permission-group-panel-wrapper:first-of-type{
  border-top: none;
}
.item-list{
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: flex-start;
  align-items: center;
  color:rgba(0,0,0,0.65);
  span.form_data_title{
    min-width: 8em;
    align-self: flex-start;
    justify-self: flex-start;
    line-height: 44px;
  }
  ul{
    margin-left: 16px;
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    justify-content: flex-start;
    align-items: center;
    font-size: 12px;
    li{
      border:1px solid #ffffff;
      margin-right: 8px;
      padding: 1px 7px;
      cursor: pointer;
    }
    li.active{
      border:1px solid #17BC94;
      color:#17BC94;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      -ms-border-radius: 4px;
      border-radius: 4px;
    }
  }
}
/deep/.h3-panel-header>span{
  font-weight: 600;
}
/deep/.item-title .ant-checkbox + span{
  padding-right: 0;
  color:rgba(0,0,0,0.85);
}
</style>

<style lang="less">
// 修改新增权限组 select 框之间的对齐问题，在scope不生效
.permission-group-form {
  .ant-select-allow-clear .ant-select-selection--multiple .ant-select-selection__rendered {
    margin-right: 11px !important;
  }

  .ant-select-selection--multiple .ant-select-selection__rendered {
    margin-left: 11px !important;
  }
}

// 表格每个 tr 的第一个 td样式
.permission-group-form table tr td:nth-of-type(1) {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ant-select-tree-dropdown {
  max-height: 60vh !important;
}
.ant-select-tree li span.ant-select-tree-checkbox{
  display: none;
}
.ant-select-tree li span.ant-select-tree-checkbox + .ant-select-tree-node-content-wrapper{
  width: calc(100% - 24px);
}
.ant-select-tree>.ant-select-tree-treenode-checkbox-checked>.ant-select-tree-node-content-wrapper,
.ant-select-tree-child-tree .ant-select-tree-treenode-checkbox-checked .ant-select-tree-node-content-wrapper{
  background-color:#FAFAFA !important;
  font-weight: bold;
}
.ant-select-tree>.ant-select-tree-treenode-checkbox-checked>.ant-select-tree-node-content-wrapper::after,
.ant-select-tree-child-tree .ant-select-tree-treenode-checkbox-checked .ant-select-tree-node-content-wrapper::after{
  content: "\E98F";
  color: #17BC94;
  position: absolute;
  right: 8px;
  display: inline-block;
  font-family: "aufontAll" !important;
  font-weight: bold;
}
.ant-select-tree-node-content-wrapper{
  background-color: #ffffff !important;
}
.ant-select-tree-node-content-wrapper:after{
  content:'';
}

</style>
