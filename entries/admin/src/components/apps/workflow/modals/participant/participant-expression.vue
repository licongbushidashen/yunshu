<template>
  <div class="expression-group">
    <div class="expression-group-box">
      <div v-for="(item, index) in dataList" :key="index">
        <!-- 按字段查找主管 -->
        <div v-if="item.type === 0" class="group-item">
          <p class="group-item-header">
            <span class="header-text">按字段查找主管</span>
            <span class="header-icon" @click="removeItem(item,index)">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </p>
          <a-radio-group name="radioGroup"
                         v-model="item.value"
                         @change="convertToExpressChange($event,item)">
            <a-radio :value="item.manager.value">
              <span class="middle">查找</span>
              <a-select
                  v-model="item.manager.selectValue"
                  placeholder="请选择"
                  @change="selectHandleChange($event,item, item.manager.value)"
              >
                <a-select-option
                    v-for="(item, idx) in systemStaff"
                    :key="idx"
                    :value="item.value"
                >{{ `${item.label}${ item.code ? '{'+item.code+'}' : '' }` }}</a-select-option>
              </a-select>
              <span class="middle">主管</span>
            </a-radio>
            <a-radio :value="item.department.value">
              <span class="middle">查找</span>
              <a-select
                  v-model="item.department.selectValue"
                  placeholder="请选择"
                  @change="selectHandleChange($event,item, item.department.value)"
              >
                <a-select-option
                    v-for="(item, idx) in filedStaff"
                    :key="idx"
                    :value="item.value"
                >{{ `${item.label}${ item.code ? '{'+item.code+'}' : '' }` }}</a-select-option>
              </a-select>
              <span class="middle">部门主管</span>
            </a-radio>
          </a-radio-group>
          <div class="group-item-other">
            <p class="item-title">当查找获得以下结果时继续向上查找</p>
            <div class="item-checkbox">
              <a-checkbox-group
                  @change="convertToExpressChange($event,item)"
                  v-model="item.checkedList"
                  :options="plainOptions" />
            </div>
          </div>
        </div>

        <!-- 按指定部门查找主管 -->
        <div v-else-if="item.type === 1" class="group-item">
          <p class="group-item-header">
            <span class="header-text">按指定部门查找主管</span>
            <span class="header-icon" @click="removeItem(item,index)">
              <i class="icon aufontAll h-icon-all-delete-o"></i></span>
          </p>
          <div class="ant-radio-wrapper">
            <span class="middle">查找</span>
            <div class="selector-wrap-dep">
              <staff-selector
                  v-model="item.manager"
                  :options="depSelectorOpts"
                  @ok="onOK"
                  @change="convertToExpressChange($event,item)"
              ></staff-selector>
            </div>
            <span>的主管</span>
          </div>
          <div class="group-item-other">
            <p class="item-title">当查找获得以下结果时继续向上查找</p>
            <div class="item-checkbox">
              <a-checkbox-group @change="convertToExpressChange($event,item)"  v-model="item.checkedList" :options="plainOptions" />
            </div>
          </div>
        </div>

        <!-- 按角色查找 -->
        <div v-else-if="item.type === 2" class="group-item">
          <p class="group-item-header">
            <span class="header-text">按角色查找</span>
            <span class="header-icon" @click="removeItem(item,index)">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </p>
          <div class="ant-radio-wrapper">
            <span class="middle">查找管辖范围包含</span>
            <a-select
                v-model="item.manage"
                placeholder="请选择"
                @change="convertToExpressChange($event,item)">
              <a-select-option
                  :title="`${item.label}${ item.code ? '{'+item.code+'}' : '' }`"
                  v-for="(item, idx) in options"
                  :key="idx"
                  :value="item.value"
              >{{ `${item.label}${ item.code ? '{'+item.code+'}' : '' }` }}</a-select-option>
            </a-select>
            <span class="middle">的角色</span>
            <span style="width:220px;display: inline-block;">
              <role-select
                  :defaultValue="item.role"
                  @select="selectRoleChange($event,item)" />
            </span>
            <span class="middle">成员</span>
          </div>
        </div>

        <!-- 按组织架构查找 -->
        <div v-else-if="item.type === 3" class="group-item">
          <p class="group-item-header">
            <span class="header-text">按组织架构查找</span>
            <span class="header-icon" @click="removeItem(item,index)">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </p>
          <div class="ant-radio-wrapper">
            <span class="middle">查找</span>
            <div class="selector-wrap">
              <staff-selector
                  v-model="item.org"
                  :options="taffSelectorOpts"
                  @ok="onOK"
                  @change="convertToExpressChange($event,item)"
              ></staff-selector>
            </div>
          </div>
        </div>

        <!-- 按直属主管找人 -->
        <div v-else-if="item.type === 4" class="group-item">
          <p class="group-item-header">
            <span class="header-text">按直属主管找人</span>
            <span class="header-icon" @click="removeItem(item,index)">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </span>
          </p>
          <div>
            <div class="ant-radio-wrapper">
              <span class="middle">查找</span>
              <a-select
                  v-model="item.initiator"
                  placeholder="请选择"
                  @change="convertToExpressChange($event, item)"
              >
                <a-select-option
                    v-for="(item, idx) in supervisorOptions"
                    :key="idx"
                    :value="item.value"
                >{{ `${item.label}${ item.code ? '{'+item.code+'}' : '' }` }}</a-select-option>
              </a-select>
              <span class="middle">的第</span>
              <span class="middle-input">
                <a-input-number id="inputNumber"
                                v-model="item.level"
                                :min="0"
                                :max="100000"
                                :formatter="limitNumber"
                                :step="1"
                                @change="convertToExpressChange" />
              </span>
              <span class="middle">级直属主管</span>
            </div>
          </div>
          <!-- <div class="group-item-other">
            <p class="item-title">当查找获得以下结果时继续向上查找</p>
            <div class="item-checkbox">
              <a-checkbox-group @change="convertToExpressChange($event,item)"  v-model="item.checkedList" :options="plainOptions" />
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <p class="add-item">
      <a-dropdown>
        <span class="ant-dropdown-link" @click="e => e.preventDefault()">
          <i class="icon aufontAll h-icon-all-plus-o"></i>
          <span class="add-item-text">{{isNoParticipantorExr ? '添加处理人' : '添加参与者'}}</span>
        </span>
        <a-menu slot="overlay">
          <a-menu-item v-for="(item, index) in findTypes" :key="index">
            <a href="javascript:;" @click="addFindType(item)">{{ item.name }}</a>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </p>
  </div>
</template>
<script lang="ts">
import {Component, Vue, Prop, Watch} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import StaffSelector from '@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import common from '@cloudpivot/common/pc';
const WorkflowModule = namespace('Apps/Workflow');
import staticFindTypes from './findTypes';
import {convertExpress, convertList} from './convertHelp';
import cloneDeep from 'lodash/cloneDeep';
@Component({
  name: 'Expression',
  components: {
    StaffSelector,
    RoleSelect: common.components.RoleSelect
  }
})
export default class Expression extends Vue {
  @WorkflowModule.State('WorkflowDataItem') WorkflowDataItem: any;

  @Prop() value: any;
  @Prop({default: false}) isNoParticipantorExr?:boolean;

  /* 查找类型 */
  findType: string = '';

  // 选人控件配置项
  taffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: false,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择部门、人员'
  }

  // 选人控件配置项-部门 单选
  depSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择部门'
  }

  // 选人控件是否禁用
  selectorDisabled: boolean = true;

  // 系统选人控件
  systemStaff: any[] = [
    {
      label: '发起人部门',
      value: 'Originator.OU'
    },
  ];

  plainOptions:any = [
    {
      label: '没有找到主管',
      value: 'noSupervisor',
    },
    {
      label: '找到的主管是发起人',
      value: 'initiator',
    }];

  checkedList:any = [];

  findTypes:any = [
    {
      type: 0,
      name: '按字段找主管'
    },
    {
      type: 1,
      name: '按指定部门找主管'
    },
    {
      type: 2,
      name: '按角色找人'
    },
    {
      type: 3,
      name: '按组织机构找人'
    },
    {
      type: 4,
      name: '按直属主管找人'
    },
  ];

  dataList: any = [];

  // 数据项可选列表： 选人控件
  get options() {
    return [
      { label: '发起人', value: 'Originator' },
      { label: '发起人部门', value: 'Originator.OU' },
    ].concat(this.filedStaff);
  }

  // 直属主管
  get supervisorOptions () {
    console.log(this.filedStaff)
    return [
      { label: '发起人', value: 'Originator' },
    ];
  }

  get filedStaff() {
    const that = this as any;
      const UserData = that.WorkflowDataItem
          // @ts-ignore
          .filter((item: Apps.Datamodel.ChildeDataItem) => [5,50,51,60,61].includes(item.propertyType * 1) && item.published)
          .map((item: Apps.Datamodel.ChildeDataItem) => ({
            label: item.name,
            value: item.code,
            propertyType: item.propertyType,
            code: item.code
          }));
      // NOTE：筛选出子表中的选人控件进行展示
      const childSheets = that.WorkflowDataItem
          .filter((item: Apps.Datamodel.ChildeDataItem) => `${item.propertyType}` === '8' && item.published);
      childSheets.forEach((item: any) => {
        if (item.subSchema && item.subSchema.properties) {
          item.subSchema.properties.forEach((subItem: any) => {
            if (`${subItem.propertyType}` === '5' && subItem.published) {
              UserData.push({
                label: `${item.name}.${subItem.name}`,
                value: `${item.code}.${subItem.code}`,
                code: `${item.code}.${subItem.code}`
              });
            }
          });
        }
      });
      return UserData;
  }
  // methods 正则替换小数点
  limitNumber(value:any) {
    if (typeof value === 'string') {
      return !isNaN(Number(value)) ? value.replace(/\./g, '') : 0;
    } else if (typeof value === 'number') {
      return !isNaN(value) ? String(value).replace(/\./g, '') : 0;
    } else {
      return 0;
    }
  }

  //  下拉事件
  selectHandleChange(value: string, target: any, currentValue?:any) {
    target.value = currentValue;
    this.convertToExpress(this.dataList);
  }

  convertToExpressChange(value: string, target: any) {
    this.convertToExpress(this.dataList);
  }

  // 角色事件
  selectRoleChange(value: any, target: any) {
    console.log(value, target);
    target.role = value;
    const index:number = this.dataList.indexOf(target);
    this.$set(this.dataList, index, target);
    this.convertToExpress(this.dataList);
  }

  // 把当前数据转换为表达式
  convertToExpress(data:any) {
    console.log(this.dataList, 'this.dataList')
    const list:any = convertExpress(data);
    console.log(list, 'list');
    if (Array.isArray(list) && list.length > 0) {
      const expressList = list.filter((item:any) => item);
      let _express:any = '';
      if (expressList.length > 1) {
        _express = list.join('+');
      } else if (expressList.length === 1) {
        _express = list.join('');
      }
      console.log('表达式结果：', _express);
      this.$emit('input', { ...this.value, expression: _express });
    } else {
      this.$emit('input', { ...this.value, expression: '' });
    }
  }

  // 添加新类型
  addFindType(inner:any) {
    const staticData = cloneDeep(staticFindTypes);
    const newItem:any = staticData.find((item:any) => item.type === inner.type);
    console.log(newItem, 'newItem');
    if (newItem) {
      this.dataList.push(newItem);
    }
    this.convertToExpress(this.dataList);
  }

  // 删除类型
  removeItem(item:any, index:number) {
    this.dataList.splice(index, 1);
    this.convertToExpress(this.dataList);
  }

  // 选人控件弹窗确定事件
  onOK(item: any) {
    console.log(item, 'item');
  }

  // 选人控件清空事件
  clearChoose() {}

  // 初始化数据
  initExpress (dataValue:any) {
    const list:any = convertList(dataValue);
    this.dataList = list;
  }

  mounted() {
    this.initExpress(this.value.expression)
  }

}
</script>
<style lang="less" scoped>
.expression-group {
  /deep/.ant-radio-wrapper {
    display: block;
    margin-bottom: 16px;
    margin-right: 0;
    .middle-input{
      display: inline-block;
      width: 220px;
      margin: 0 8px;
      .ant-input-number{
        width: 100%;
        font-size: 16px;
      }
    }
    .middle {
      line-height: 32px;
      display: inline-block;
    }
    .selector-wrap {
      display: inline-block;
      margin-left: 8px;
      width: 100%;
      vertical-align: middle;
      max-width: 575px;
      max-height: 160px;
    }
    .selector-wrap-dep{
      display: inline-block;
      margin: 0 8px;
      vertical-align: middle;
      max-width: 575px;
      max-height: 160px;
      width: 200px;
    }
  }
  /deep/.ant-select,
  /deep/.ant-cascader-picker,
  /deep/.role-selector__input {
    width: 200px;
    margin: 0 8px;
    vertical-align: middle;
  }
  /deep/.h3-organization {
    &,
    .h3-organization__label {
      min-height: 32px;
      max-height: inherit;
      padding-bottom: 0;
    }
  }

  /deep/.h3-organization__label {
    overflow-y: auto;
    > div {
      white-space: normal;
    }
  }
  h3 {
    margin-bottom: 16px;
    font-size: 16px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 24px;
    //&:last-of-type {
    //  margin-top: 40px;
    //}
  }
}
.group-item{
  margin-bottom: 10px;
  .group-item-header{
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .header-text{
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    line-height: 32px;
  }
  .header-icon{
    cursor: pointer;
  }
  .group-item-other{
    background: #F8F8F8;
    border-radius:4px;
    padding: 16px 10px;
  }
  .item-title{
    color: rgba(0, 0, 0, 0.45);
    line-height: 34px;
    font-size: 14px;
  }
  .item-checkbox{
    line-height: 22px;
    /deep/.ant-checkbox-wrapper{
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
    }
  }
}
.add-item{
  color: #17BC94;
  font-size: 14px;
  cursor: pointer;
}
.add-item-text{
  padding-left: 4px;
}
</style>
