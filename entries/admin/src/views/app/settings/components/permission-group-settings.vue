<template>
  <div>
    <div class="model-bar">
      <div class="header-bar">
        <h4 class="model-title" @click="cancel">{{ $t('languages.appSettings.permissionSetting') }}</h4>
        <div class="model-name-wrap" v-if="groupName">
          <span class="model-name">{{ groupName }}</span>
          <i class="icon aufontAll h-icon-all-close close" @click="close"></i>
        </div>
      </div>
    </div>

    <div class="group-settings-wrap">
    <!-- 模型名称 -->
    <div class="model-menu" v-resize.east>
      <div class="menu-tree" v-resize.east>
        <div class="menu-title">模型
        </div>
        <div class="menu-content">
          <div
            class="menu-item" 
            :class="{ 'active' : childItem.key === modelKey ? true : false }"
            v-for="childItem in childrenList"
            :key="childItem.key"
            @click="choiceModal(childItem.key)"
            >
             {{ childItem.name }}
            <!-- <a-tooltip>
              <span slot="title">表示您有模型权限设置修改，但未保存</span>
              <span class="change-info" v-if="childItem.key === modelKey && isModify"></span>
            </a-tooltip> -->
          </div>
        </div>
      </div>
    </div>
    <!-- 权限设置 -->
    <div class="model-settings">
      <template>
        <div 
          v-for="(item,index) in list" 
          :key="index"
          class="panel-content"
        >

          <template>
            <div v-for="(childItem, childIndex) in item.children" :key="childIndex">
              <div
                v-if="childItem.key === modelKey"
                class="permission-group-panel-wrapper" 
              >
                <div class="permission-group-panel-item">
                  <div class="item-title">
                    <span>
                      <div class="permission-group-panel-item">模型权限</div>
                      <span class="sub-title">{{ $t('languages.appSettings.visible') }}</span>
                      <a-switch 
                        :checked="childItem.visible"
                        v-if="childItem.visible !== undefined"
                        @change="e => setField(childItem,'visible',e)"
                      >
                      </a-switch>
                    </span>
                  </div>
                </div>


                <div 
                  class="permission-group-panel-item" 
                  v-if="childItem.dataPermissionType !== undefined && childItem.nodeType !== 'Page' && childItem.nodeType !== 'Report'"
                >
                  <div class="item-list">
                    <h4>{{ $t('languages.appSettings.dataPermission') }}</h4>
                    <a-radio-group v-model="childItem.dataPermissionType" @change="(e) => { dataPermissionSelect(childItem, e.target.value, index, childIndex) }">
                      <a-radio :value="1">{{ $t('languages.appSettings.AllVisible') }}</a-radio>
                      <a-radio :value="3">{{ $t('languages.appSettings.OnlySelf') }}</a-radio>
                      <a-radio :value="2">{{ $t('languages.appSettings.MyDepartment') }}</a-radio>
                      <a-radio v-if="groupDataInfo.authorType === 1" :value="5">{{ $t('languages.appSettings.RoleManagerRange') }}</a-radio>
                      <a-radio :value="4">{{ $t('languages.appSettings.Customize') }}</a-radio>
                    </a-radio-group>
                    <!-- 自定义显示条件 -->
                    <dataitem-condition
                      ref="condition"
                      :permission="childItem"
                      @updateCondition="handleConditionData"
                    ></dataitem-condition>
                  </div>
                </div>
                <div 
                  class="permission-group-panel-item"
                  v-if="childItem.actionPermission && childItem.nodeType !== 'Page' && childItem.nodeType !== 'Report'"
                >
                  <div class="item-list">
                    <h4>{{ $t('languages.appSettings.permissionAction') }}</h4>
                    <a-checkbox-group :value="getChoice(childItem.actionPermission)" @change="(e) => { actionPermissionSelect(e, childItem.actionPermission) }">
                      <a-checkbox value="creatable">{{ $t('languages.appSettings.Add') }}</a-checkbox>
                      <a-checkbox value="editable">{{ $t('languages.appSettings.Edit') }}</a-checkbox>
                      <a-checkbox value="deletable">{{ $t('languages.appSettings.Delete') }}</a-checkbox>
                      <a-checkbox value="importable">{{ $t('languages.appSettings.Import') }}</a-checkbox>
                      <a-checkbox value="exportable">{{ $t('languages.appSettings.Export') }}</a-checkbox>
                      <a-checkbox value="printAble">{{ $t('languages.appSettings.PrintQr') }}</a-checkbox>
                      <a-checkbox value="editOwnerAble">{{ $t('languages.appSettings.UpdateOwner') }}</a-checkbox>
                      <a-checkbox value="batchPrintAble">{{ $t('languages.appSettings.printTemp') }}</a-checkbox>
                      <a-checkbox value="batchUpdateAble">{{ $t('languages.appSettings.batchUpdate') }}</a-checkbox>
                    </a-checkbox-group>
                  </div>
                </div>

                <!-- 表单数据权限 -->
                <div 
                  class="permission-group-panel-item" 
                  style="padding-top: 0px;"
                  v-if="childItem.dataPermissionType !== undefined && childItem.nodeType !== 'Page' && childItem.nodeType !== 'Report'"
                >
                  <div class="item-list _item-list" style="flex-direction: column;">
                   <h4 style="width: 100%;margin-bottom:0;color: rgba(0,0,0,0.65)">表单数据项权限</h4>
                    <!-- <p>
                      <span class="form_data_title">{{ $t('languages.appSettings.FormDataPermission') }}</span>
                      <span>
                        <a-checkbox 
                          :checked="childItem.setPermission"
                          @change="e => setPermission(childItem, 'setPermission', e.target.checked)"
                        >
                          设置表单数据权限
                        </a-checkbox>
                      </span>
                    </p> -->

                    <section class="data-permission-handler__tabs" v-if="childItem.propertityPermissionGroups">
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
                </div>

              </div>
            </div>

          </template>

        </div>
      </template>
      <div class="option-bar">
          <a-button @click="cancel" style="margin-right: 10px;">取消</a-button>
          <a-button @click="submit" type="primary">保存</a-button>
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
// 权限组配置页面
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State, namespace } from 'vuex-class';
import DataitemConditionModal from '@/components/apps/settings/dataitem-condition-modal.vue';

import DataitemCondition from '@/components/apps/settings/dataitem-condition.vue';

import h3Panel from '@/components/apps/settings/panel.vue';
import DataItem from '../../data-permission/data-item.vue';
import permissionApi from '@/apis/system/permission.api';
import * as dataPermissionApi from '@/apis/data-permission';

import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import moment from 'moment';
const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'permission-group-settings',
  components: {
    h3Panel,
    DataitemConditionModal,
    DataitemCondition,
    DataItem
  }
})

export default class PermissionGroupSettings extends Vue {

  list: any[] = []

  record: BPM.System.AppFunctionPermissionModel = {} as any;

  groupDataInfo: any = {}

  @AppCenterModule.State('appInfo') appInfo: any;

  modelKey: string = ''

  @Prop({
    default: ''
  })
  groupId!: string;

  @Prop({
    default: ''
  })
  groupName!:string

  visibleType = {
    staffs: true,
    isExternalUser: true,
    roles: false,
    rolesRange: false,
  };

  get childrenList() {
    return this.list.reduce((stat: any, item: any) => {
      if(item.children) {
        stat = [ ...stat, ...item.children]
      }
      return stat
    }, [])
  }

  handleConditionData(val: any) {
    if (val && Array.isArray(val.conditions)) {
      val.conditions.forEach((c:any) => {
        if (c.propertyType === 3 && c.value && typeof c.value === 'object') {
          c.value = moment(c.value).format('YYYY-MM-DD HH:mm:ss');
        }
      });
    }
    const target = this.findModelByKey(this.modelKey)
    if(target) {
      target.filterType = val.type; 
      target.conditions = val.conditions
    }
  }

  getChoice(actions: any) {
    let selected: Array<any> = []
    for(let key in actions) {
      // console.log(key)
      if(actions[key]) selected.push(key)
    }
    return selected
  }

  dataPermissionSelect(item: any, val:number,index?: number,childIndex?: number) {
    // console.log(item, val, index, childIndex)
    const condition:any = this.$refs.condition
    if(val === 4){
      condition[0].show()
      this.openConditionModal(item);
    } else {
      condition[0].cancel()
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
    record = conditionValueCache;
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

  // 新建表单数据权限
  async addPropertityPermissionGroups(record){
    console.log('record===>', record)
    let formData = []
    let res = await dataPermissionApi.getDataItemList({
      schemaCode: record.schemaCode
    })
    if(res.errcode === 0){
        // @ts-ignore
        
        // @ts-ignore
        formData = res.data.filter((item: any) => !item.defaultProperty && item.published)
        console.log('formData===>', formData)

        const dataItems: any[] = [];
        formData.forEach((item: any) => {
          const name_i18n: any = typeof item.name_i18n === 'string' && item.name_i18n ? JSON.parse(item.name_i18n) : '';
          dataItems.push({
            name: item.name,
            name_i18n: '',
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
                let sub_name_i18n: any = typeof subItem.name_i18n === 'string' && subItem.name_i18n ? JSON.parse(subItem.name_i18n) : '';
                if(typeof sub_name_i18n === 'object'){
                  sub_name_i18n = JSON.stringify(sub_name_i18n)
                }
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
                  schemaCode: subItem.schemaCode
                });
              }
            });
          }
        });
        console.log('dataItems===>',dataItems)
        let resData = this.initAdd(dataItems)
        this.$set(record, 'propertityPermissionGroups', resData)

        console.log('record===>>>', record)
        console.log('res001===>>>', resData)

        this.changeDatas[record.schemaCode] = record
      }
    
  }

  changeDatas: object = {}
  // 记录修改过的表单数据权限
  propertityPermissionGroupsChange(changeData){
    this.changeDatas[changeData.schemaCode] = changeData
    console.log('changeData===>', changeData)
  }

  // 返回可配置数据
  getCurrentDataItems(data, bizPermType){
    if(!data){
      return data
    }
    return data.filter(el => el.bizPermType === bizPermType)
  }

  /**
   * 初始化新建的数据项权限基础数据
   */
  initAdd(dataItems) {
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
    console.log('77777777777777777======>',[...addDataItems, ...viewDataItems, ...editDataItems])

    return [...addDataItems, ...viewDataItems, ...editDataItems]
  }


  // 暂存删除的表单数据权限
  temporaryStorage: object = {}

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


  cancel() {
    const histroyData:any = {
      name: this.groupDataInfo.name,
      id: this.groupId
    }
    this.$emit('viewModelSettings', false, "", histroyData)
  }

  close() {
    const histroyData:any = {
      name: "",
      id: ""
    }
    this.$emit('viewModelSettings', false, "", histroyData)
  }

  submit() {

    const params: any = {
      appCode: this.$route.params.appCode || this.appInfo.code,
    };
    
    
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
    list = JSON.parse(JSON.stringify(list))
    for (let i = 0; i < list.length; i++) {
      let list_i = list[i];
      if (list_i.conditions) {
        for (let j = 0; j < list_i.conditions.length; j++) {
          let conditions_j = list_i.conditions[j];
          if((conditions_j.operatorType === 11 || conditions_j.operatorType === 12) && (conditions_j.value === '[]' || conditions_j.value.length === 0) ) {
            conditions_j.value = ''
          }
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

    params.dataPermissionGroups = list;
    
    console.log(params)

    if (!params.dataPermissionGroups.length) {
      delete params.dataPermissionGroups;
    }

    // 拦截表单设置了自定义但没有设置condition的情况
    if (params && params.dataPermissionGroups && params.dataPermissionGroups.length) {
      const hassNoConditionForms: Array<string | number> = [];
      params.dataPermissionGroups.map((item: any) => {
        if(item.dataPermissionType === 4){ // 自定义数据权限
          if(!item.conditions || item.conditions.some(el => el.value === '')){
            hassNoConditionForms.push(item.name)
          }
        }

        // item.dataPermissionType === 4 && !item.conditions ? hassNoConditionForms.push(item.name) : ''
      });
      // console.log(hassNoConditionForms);
      if (hassNoConditionForms.length) {
        // this.$message.error(`${hassNoConditionForms.join('、')}表单数据权限请设置`);
        this.$message.error(this.$t('languages.appSettings.PlzSelectFormPermission', { form: hassNoConditionForms.join('、') }) as string);
        return;
      }
    }

    if(this.groupDataInfo.authorType === 0) {
      params.departments = this.groupDataInfo.departments
    }
    if(this.groupDataInfo.authorType === 1) {
      params.roles = this.groupDataInfo.roles
    }
    params.name = this.groupDataInfo.name

    console.log('88===>',params)

    const p = permissionApi.updateGroup(params);

    p.then((res:any) => {
      if (res.errcode === 0) {
        if(Object.keys(this.changeDatas).length || Object.keys(this.temporaryStorage).length){
          if(Object.keys(this.changeDatas).length){
            // 保存表单数据权限
            this.isUpdataPermissionOver = false
            this.updataFormDataPermission(res.data.id, params)
          }

          if(Object.keys(this.temporaryStorage).length){
            // 删除表单数据权限
            this.isDeletePermissionOver = false
            this.deleteFormDataPermission()
          }
          
        }{
          // this.$message.success(this.$t('languages.appSettings.saveSuccessfully') as string);
          // this.$emit('ok')
          // 操作成功后重置当前dataCopy的值
          const now = this.childrenList.find((elment: any) => elment.id === this.modelKey)
          this.dataCopy = cloneDeep(now)
        }
      } else {
        this.$message.error(res.errmsg as string);
      }
    });
    let that = this;
    setTimeout(function(){
    },500)
  }

  isUpdataPermissionOver:boolean = true // 更新完毕表单数据权限
  isDeletePermissionOver:boolean = true // 删除完毕表单数据权限
  
  // 更新表单数据权限
  async updataFormDataPermission(id: any, query: any){
    let count = 0
    for (const key in this.changeDatas) {
      count ++ 
      let currentItem = this.changeDatas[key]

      const schemaCode = currentItem.schemaCode

      let addPerms:any[] = []
      let viewPerms:any[] = []
      let editPerms:any[] = []
      currentItem.propertityPermissionGroups.forEach((element: any) => {
        let item = {
          bizPermType: element.bizPermType,
          groupId: element.groupId,
          id: element.id,
          name: element.name,
          name_i18n: '',
          propertyCode: element.propertyCode,
          propertyType: element.propertyType,
          required: element.required,
          schemaCode: element.schemaCode || schemaCode,
          visible: element.visible,
          writeAble: element.writeAble,
          parentCode: element.schemaCode || '',
          parentName: element.parentName || ''
        }

        if(element.bizPermType === 1){
          addPerms.push(item)
        }else if(element.bizPermType === 2){
          viewPerms.push(item)
        }else{
          editPerms.push(item)
        }
      });

      let result:any = await dataPermissionApi.getPermissions({schemaCode: currentItem.schemaCode})
      
      let objId: any = result.data.find((item: any) => {
          return item.appPermGroupId === id
        }
      )

      let params: any = {
        enabled: true,
        schemaCode: currentItem.schemaCode,
        permProperties: [
          ...addPerms,
          ...viewPerms,
          ...editPerms,
        ],
        id: objId ? objId.id : '',
        appPermGroupId: this.groupDataInfo.id || id,
        name: query.name,
        departments: query.departments ? query.departments : '',
        roles: query.roles ? query.roles : '',
        appCode: query.appCode ? query.appCode : ''
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

  convert(x: BPM.System.AppFunctionPermissionModel, i: number) {

    if(x.propertityPermissionGroups) {
      x.propertityPermissionGroups.forEach((el:any) => {
        let item = x.propertityPermissionGroups.find((obj:any) => {
          return obj.propertyCode === el.schemaCode
        })
        if(item && !el.parentName){
          el.parentName = item.name
          el.parentCode = item.propertyCode
        }
      });
    }
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

  choiceModal(key: string) {
    this.modelKey = key
  }

  // 根据key查找对应的模型对象
  findModelByKey(key: string) {
    let targetModel: any = {}
    this.list.forEach((item:any) => {
      if(item.children) {
        const result = item.children.find((subItem: any) => subItem.id === key)
        if(result)return targetModel = result
      }
    })
    return targetModel   
  }

  dataCopy: any = null   

  get dataNow() {
    return this.childrenList.find((item: any) => item.key === this.modelKey)
  }


  // 菜单变化时触发自定义规则视图
  @Watch('modelKey', {
    immediate: true
  })
  onModelChange(after: string, before: string) {

    const tar = this.childrenList.find((item: any) => item.key === after)
    if(tar) {
      this.setPermission(tar, 'setPermission', true)
      this.dataCopy = cloneDeep(tar)
    }
  }
  

  get isModify() {

    if(this.modelKey === '') return false
    const nowData = this.childrenList.find((item: any) => item.key === this.modelKey)
    try {
      if(isEqual(this.dataCopy, nowData)) {
        return false
      } else {
        return true
      }
    } catch (error) { 
    }
  }


  @Watch('groupId', {
    immediate: true
  })
  onGroupIdChange(groupId: string) {
    this.fetchListData(groupId)
  }


  // 获取数据列表
  fetchListData(groupId: string) {
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
        this.modelKey = this.list.reduce((stat: any, item: any, index: number) => {
          if(item.children && index === 0) {
            stat = item.children[0].key
          }          
          return stat
        }, '')

      }
    });
  }


  actionPermissionSelect(selected: Array<string>, actions: any) {
    actions.edit = true;
    for(let key in actions) {
      selected.includes(key) ? actions[key] = true : actions[key] = false    
    }
  }

  setField(record: any, key: string, value: any) {
    record.edit = true;
    record[key] = value;
  }  

}
</script>


<style lang="less" scoped>

   .header-bar {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e8e8e8;
      .model-title {
        font-size: 18px;
        font-weight: bolder;
        padding: 15px 24px;
        color:rgba(0, 0, 0, 0.65);
        cursor: pointer;
        &:hover {
          color: #17BC94;
        }
      }
    }

    .model-name-wrap {
      height: 58px;
      line-height: 58px;
      border-bottom: 2px solid #17BC94;
      .model-name {
        font-size: 18px;
        color: #17BC94;
        font-weight: bolder;
        margin-left: 20px;
        margin-right: 8px;
        cursor: pointer;
      }
      .close {
        cursor: pointer;
        font-size: 18px;
        color: #AAA;
      }
    }


.group-settings-wrap{
  text-align: left;
  color: rgba(0, 0, 0, 0.65);
  // height: 100%;
  height: calc(100vh - 64px);
  display: flex;
  .model-menu{
    width: 224px;
    padding-right: 1px;
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    z-index: 2;
    height: calc(100vh - 64px);
    .menu-tree {
      height: calc(100vh - 64px);
      position: relative;
      .menu-title {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        margin-top: 10px;
        font-weight: 600;
      }
      .menu-content {
        overflow: auto;
        height: calc(100vh - 184px);
      }

      .menu-item {
        height: 40px;
        line-height: 40px;
        padding: 0px 16px !important;
        margin-top: 10px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        &.active {
          background: #f4f5f8;
          border-left: 1px solid #e8e8e8;
        }
      }
    }
  }
  .model-settings {
    padding-bottom: 122px;
    position: relative;
    overflow-y: auto;
    flex: 1;
    .option-bar {
      position: fixed;
      // left: 0;
      bottom: 0;
      width: calc(100vw - 448px);
      height: 52px;
      line-height: 52px;
      text-align: center;
      border-top: 1px solid #e8e8e8;
      background-color: #fff;
    }
  }
}

._item-list{
  display: flex;
  flex-direction: column;
  p{
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
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
// .panel-content+.panel-content{
//   margin-top: 16px;
// }
.permission-group-panel-wrapper{
  margin: 0 14px 0 16px;
  border-top: 1px solid #E8E8E8;
  .permission-group-panel-item{
    padding: 12px 0;
    .item-title{
      font-weight:600;
      display: flex;
      flex-direction: row;
      flex-wrap: no-wrap;
      justify-content: space-between;
      align-items: center;
      .sub-title {
        margin-right: 20px;
      }
    }
    .ant-checkbox-wrapper {
      margin-bottom: 8px;
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
  // display: flex;
  // flex-direction: row;
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
  h4 {
    margin-bottom: 16px;
    font-weight: bolder;
    color: rgba(0, 0, 0, 0.65);
  }
}
/deep/.h3-panel-header>span{
  font-weight: 600;
}
/deep/.item-title .ant-checkbox + span{
  padding-right: 0;
  color:rgba(0,0,0,0.65);
}

.menu-item {
  position: relative;
  .change-info {
    display: block;
    height: 10px;
    width: 10px;
    border: 1px solid orange;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translate(0, -50%);
  }
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
<style lang="less">
.data-permission-handler__tabs {
  .ant-tabs-bar {
    margin-bottom: 0;
    border-bottom: none;
  }
  .ant-table-thead {
    background:#FAFAFA;;

  }
}
  
</style>