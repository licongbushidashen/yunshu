<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :width="760"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="addManager"
    @cancel="closeModel"
    :maskClosable="false"
    wrapClassName="add-app-manager-model"
    :keyboard="false"
  >
    <div class="add-app-manager">
      <!-- 管理员 -->
      <a-row class="add-app-manager__item">
        <a-col :span = "layout.left" class="add-app-manager__left">
          <span class="label-required">子管理员:</span>
        </a-col>
        <a-col :span = "layout.right" class="add-app-manager__right">
          <template v-if="id">
            <span v-for="(u,idx) in users" :key="idx">{{ u.name }}</span>
          </template>
          <staff-selector
            v-else
            v-model="users"
            :options="taffSelectorOpts"
            :params="staffParams"
            @ok="addUsers"
            @change="selectChange"
          >
          </staff-selector>
          <!-- <div v-if="validate.users">
            <span class="error">管理员不能为空</span>
          </div> -->
        </a-col>
      </a-row>

      <!-- <a-row class="add-data-manager__item">
        <a-col :span = "layout.left" class="add-app-manager__left">
          <span>权限配置:</span>
        </a-col>
      </a-row> -->

      <a-tabs>
        <a-tab-pane key="1" tab="前台权限">
          <!-- 应用范围 -->
          <a-row class="add-app-manager__item item-title">
            <a-col :span = "layout.left" class="add-app-manager__left">
              <span>应用范围:</span>
            </a-col>
            <a-col :span = "layout.right" class="add-app-manager__right">
            </a-col>
          </a-row>
          <!-- 添加应用 -->
          <a-row class="add-app-manager__item">
            <app-range v-model="frontPerMap" :id="id" :operateType="operateType"></app-range>
          </a-row>
        </a-tab-pane>

        <a-tab-pane key="2" tab="后台权限">
          <!-- 新建应用权限 -->
          <a-row class="add-data-manager__item">
            <a-col :span = "layout.left" class="add-app-manager__left">
              <span>新建应用权限:</span>
            </a-col>
            <a-col :span = "layout.right" class="add-data-manager__right">
              <!-- 当前用户为子管理员 -->
              <a-radio-group
                  name="radioGroup"
                  v-model="appManage"
                  :disabled="isOnlyAppAdmin && true"
                >
                <!-- 管理员并且无权限 -->
                  <a-radio :value="true">开启</a-radio>
                  <a-radio :value="false">关闭</a-radio>
                </a-radio-group>
            </a-col>
          </a-row>
          <!-- 应用管辖范围 -->
          <a-row class="add-data-manager__item">
            <a-col :span = "layout.left" class="add-data-manager__left">
              <span class="text-color">应用管辖范围:</span>
            </a-col>
            <a-col :span = "layout.right" class="add-data-manager__right">
              <apps-select
                class="apps-select"
                v-model="selectData"
                customWidth="100%"
              />
            </a-col>
          </a-row>
          <!-- 组织管理范围 -->
          <a-row class="add-data-manager__item">
            <a-col :span = "layout.left" class="add-app-manager__left">
              <span>组织管辖范围:</span>
            </a-col>
            <a-col :span = "layout.right" class="add-data-manager__right">
              <staff-selector
                :options="stuffOrOrgSelectorOpts"
                :params="staffParams"
                :keepDeptIds="keepDeptIds"
                convertKey="unitId"
                v-model="departments"
                @ok="addDepartments"
              >
              </staff-selector>
            </a-col>
          </a-row>
          <!-- 角色管理权限 -->
          <a-row class="add-data-manager__item">
            <a-col :span = "layout.left" class="add-app-manager__left">
              <span>角色管辖权限:</span>
            </a-col>
            <a-col :span = "layout.right" class="add-data-manager__right">
              <a-radio-group
                  name="radioGroup"
                  v-model="roleManage"
                  :disabled="isOnlyAppAdmin"
                >
                  <a-radio :value="true">开启</a-radio>
                  <a-radio :value="false">关闭</a-radio>
                </a-radio-group>
            </a-col>
          </a-row>

          <!-- 数据字典权限 -->
          <a-row class="add-data-manager__item">
            <a-col :span = "layout.left" class="add-app-manager__left">
              <span>数据字典权限:</span>
            </a-col>
            <a-col :span = "layout.right" class="add-data-manager__right">
              <a-radio-group
                  name="radioGroup"
                  v-model="dataDictionaryManage"
                  :disabled="isOnlyAppAdmin"
                >
                  <a-radio :value="true">开启</a-radio>
                  <a-radio :value="false">关闭</a-radio>
                </a-radio-group>
            </a-col>
          </a-row>

        </a-tab-pane>
      </a-tabs>

    </div>
  </a-modal>
</template>

<script lang="ts">
import systemApi from '@/apis/system/system-manager.api';
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import AppPackage from '../manager-setting/app-package.vue';
import AppRange from '../manager-setting/app-range.vue';
import AppsSelect from '../manager-setting/apps-select.vue';

const UserModule = namespace('System/User');

@Component({
  name: 'add-app-manager',
  components: {
    StaffSelector,
    AppPackage,
    AppsSelect,
    AppRange
  }
})

export default class AddAppManager extends Vue {
  @Prop() visible!: boolean;
  @Prop() id!: string;
  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;
  @UserModule.State('isAdmin') isAdmin!: boolean;

  selectData:Array<string> = []; // 运用app

  copySelectData:Array<string> =[];


  layout = {
    left: 4,
    right: 20
  }

  taffSelectorOpts = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
  }

    // 选人与选组织
  stuffOrOrgSelectorOpts = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    showPart: true,
    maxTagCount: 3
  }

  departments = []; // 组织或角色

  keepDeptIds: string = '';

  users: any = [];
  userId: string = '';

  appManage: boolean | null = null;
  dataDictionaryManage:boolean = false

  roleManage: boolean | null = null;

  treeData = [];

  validate = {
    users: false,
    apps: false
  }

  operateType: string = '';

  frontPerMap: Array<any> = []
  // [
  //   {"index":0,"departments":[{"id":"afeb204e76d14c3b0176d178522b14d1","remarks":null,"createdTime":"2021-01-05 15:34:52","modifiedTime":"2021-04-16 18:36:32","deleted":false,"createdBy":"2c9280a26706a73a016706a93ccf002b","modifiedBy":null,"extend1":null,"extend2":null,"extend3":null,"extend4":null,"extend5":null,"name":"22","managerId":"1","parentId":"","calendarId":null,"sortKey":null,"leaf":false,"sourceId":"8_1","queryCode":"8_1","dingDeptManagerId":null,"parent":null,"children":[],"employees":null,"unitType":1,"isShow":true,"deptType":2,"corpId":"ceshi1","enabled":true,"relatedOrgType":null,"relatedSyncType":null,"isCorpRootNode":false,"displayOption":true,"hasPermission":true,"type":1,"departments":null,"partTimerDepartment":null}],"appPackage":["yagnweitest","chensm1"],"operatable":true},
  //   {"index":1,"departments":[],"appPackage":["AMS","mandy"],"operatable":true}
  // ]

// [{"index":0,"departments":[{"id":"afeb204e76d14c3b0176d178522b14d1","remarks":null,"createdTime":"2021-01-05 15:34:52","modifiedTime":"2021-04-16 18:36:32","deleted":false,"createdBy":"2c9280a26706a73a016706a93ccf002b","modifiedBy":null,"extend1":null,"extend2":null,"extend3":null,"extend4":null,"extend5":null,"name":"22","managerId":"1","parentId":"","calendarId":null,"sortKey":null,"leaf":false,"sourceId":"8_1","queryCode":"8_1","dingDeptManagerId":null,"parent":null,"children":[],"employees":null,"unitType":1,"isShow":true,"deptType":2,"corpId":"ceshi1","enabled":true,"relatedOrgType":null,"relatedSyncType":null,"isCorpRootNode":false,"displayOption":true,"hasPermission":true,"type":1,"departments":null,"partTimerDepartment":null}],"appPackage":["yagnweitest","chensm1"],"operatable":true},{"index":1,"departments":[],"appPackage":["AMS","mandy"],"operatable":true}]

  get filterFrontPerMap() {
    const filterData = this.frontPerMap.map((item: any) => {
      let obj = {}
      for(let key in item ) {
        if(key !== 'appList') {
          obj[key] = item[key]
        }
        if(key === 'departments') {
          item[key] = item[key].map((element:any) => {
            const { id, name, adminId, remarks, modifiedBy, modifiedTime, queryCode, unitId, createdBy, deleted, unitType, createdTime } = element
            element = {
              adminId,
              id,
              name,
              queryCode,
              unitId,
              unitType
            }
            return element
          })
          obj[key] = item[key]
        }

        if(key === 'appPackages') {
          obj[key] = item[key]
        }

      }
      return obj
    })
    return filterData
  }


  get curCorpId(){
    return `${this.users[0] ? (this.users[0] as any).corpId : ''}`;
  }

  get staffParams() {
    let params: any = { filterType: 'related' };
    
    // @ts-ignore
    let { users, curCorpId } = this;
    if (users.length > 0) {
      // @ts-ignore
      params.corpId = curCorpId
    }

    if (this.isOnlyAppAdmin) {
      params.filterType = 'admin';
      const selectUserIds: any = [];

      for (const item of users) {
        selectUserIds.push(item.id);
      }

      params.selectUserIds = selectUserIds.join(',');
    }
    return params
  }

  get modalTitle(){
    if (this.id) {
      return '编辑子管理员'; 
    } else {
      return '添加子管理员';
    }
  }

  created() {
    if (!this.id) {
      this.operateType = 'add';
    }
  }

  addDepartments(val:any) {
    this.departments = val;
  }

  clearChoose() {
    this.users = [];
    this.selectData = [];
  }

  // 后台权限提交
  backPermission() {
    if (this.users.length === 0) {
      this.$message.info('子管理员不能为空');
      return;
    }
    
    const notAuthDepartments: any[] = [];
    const departments: any[] = [];

    for(let i = 0, len = this.departments.length; i < len; i++) {

      const item: any = this.departments[i];

      if (!this.keepDeptIds.includes(item.unitId)) {
        departments.push(item);
      } else {
        notAuthDepartments.push(item);
      }
    };

    const obj: any = {
      users: this.users,                          // 子管理员id
      appPackages: this.unique(this.selectData),  // 后台应用管理范围
      departments: departments,                   // 后台组织管理范围
      notAuthDepartments: notAuthDepartments,     // ?
      appManage: this.appManage,                  // 新建应用权限
      roleManage: this.roleManage,                // 角色管理权限
      adminGroups: this.filterFrontPerMap,        // 前台权限
      dataDictionaryManage: this.dataDictionaryManage //数据字典权限
    };

    // 前台权限应用范围和组织范围必须都填写才能提交
    const emptyApp:boolean = obj.adminGroups.some((item: any) => item.appPackages === undefined && !item.deleted )
    const emptyDep:boolean = obj.adminGroups.some((item: any) => item.departments.length === 0 && !item.externalLinkVisible && !item.deleted) //当外链数据和组织范围都是空并且删除状态为false时无法提交.
    if(emptyApp) {
      this.$message.info('请配置应用管辖范围');
      return
    } else if(emptyDep) {
      this.$message.info('请配置组织管辖范围或外链数据范围');
      return
    }
    // obj.adminGroups = obj.adminGroups.filter((item: any) => item.appPackages !== "" )
    // 提交时
    if(obj.appPackages.length === 0 && obj.departments.length === 0 && obj.adminGroups.length === 0) {
      this.$message.info('子管理员权限配置为空，不可保存，请前往配置');
      return;
    }

    console.log(obj)

    this.$emit('submit', obj);
    this.clearChoose();
  }

  addManager() {
    //前、后台权限提交
    this.backPermission()
  }

  unique(arr) {
    const res = new Map();
    return arr.filter((arr) => !res.has(arr.code) && res.set(arr.code, 1));
  }

  closeModel() {
    this.operateType = '';
    this.clearChoose();
    this.$emit('cancel');
  }

  selectChange() {
    if (this.users.length) {
      this.validate.users = false;
    } else {
      this.validate.users = true;
    }
  }

  addUsers(val:any) {
    this.users = val;

    this.departments = [];
  }

  // 给应该权限按钮复制
  gaveAppManage(val: boolean | null) {
    this.appManage = val
  }

  @Watch('id', {
    immediate: true
  })
  async onIdChange(val: any) {
    await this.getDetail();
  }

  async getDetail() {
    const vm: any = this;
    // 应用权限的变量的值
    let appManage: boolean | null = null
    let roleManage: boolean | null = null
    let frontMap: Array<any> = []
    // 添加
    if (!vm.id) {
      vm.users = [];

      roleManage = false
      appManage = false
      // 判断当前用户是否是仅仅是子管理员
      if(this.isOnlyAppAdmin) {
        // 获取用户新建应用的权限
        const res: any = await systemApi.getSystemManagerAppInfo()
        if (res.errcode === 0) {
          appManage = res.data
        }
      }
    } else {  // 编辑
      const params: any = {
        id: vm.id,
        editShow: true
      };
      const res: any = await systemApi.getManagerInfo(params);
      const data: any = res.data;

      if (data) {
        vm.userId = data.userId;
        vm.selectData = this.getAppPackage(data.appPackages);
        vm.copySelectData = JSON.parse(JSON.stringify(vm.selectData));
        //   .map((res:any) => {
        //   return code;
        // });
        vm.departments = data.departments;
        vm.users = [{
          id: data.userId,
          name: data.name,
          imgUrl: data.imgUrl,
          corpId: data.corpId
        }];

        console.log(data.adminGroups)

        vm.frontPerMap  = data.adminGroups.map((element:any, index: number) => {
          element.appPackages = element.appPackages
          element.departments = element.departments
          element.operatable = true
          element.index = index
          return element
        })
        console.log(vm.frontPerMap);
        
  
        appManage = data.appManage
        roleManage = data.roleManage ? data.roleManage : false

        vm.operateType = 'edit';

        this.setKeepDeptIds();
        this.dataDictionaryManage = data.dataDictionaryManage || false
      }
    }

    // 确定当前应用权限的状态
    this.gaveAppManage(appManage)
    this.roleManage = roleManage
  }

  async setKeepDeptIds(){
    let sType:string = '';
    const { departments, userId } = this;
    
    if (!departments.length) return;

    const types:number[] = departments.map((i:any) => i.unitType) as number[]; // 1 部门  3 人员
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

    const targetIds:string[] = departments.map((staff:any) => {
      if (staff.unitType === 1) return staff.unitId;
    }).filter((i:any) => !!i);


    const params: any = { targetIds: targetIds.join(','), selectUserId: userId};

    const res:any = await systemApi.checkEditPerm(params);
    const { data } = res;

    this.keepDeptIds = data.map((i:any) => {
        if(!i.op) { return i.targetId; }
    }).filter((i:any) => !!i);
  }

  getAppPackage(data) {
    const result: any = [];
    data.map((item, index) => {
      result.push({
        ...item,
        isDataManage: item.operatable,
        index: index
      });
    });

    return result;
  }
  
}
</script>
<style lang="less" scoped>
.add-app-manager{
  &__dataItem {
    margin-top: 16px;
  }

  .add-app-manager__left {
    height: 32px;
    line-height: 32px;
    font-family:PingFangSC-Medium,PingFang SC;
    font-weight:500;
    color:rgba(0,0,0,0.85);
    span{
      left: 8px;
    }
  }
  .add-data-manager__item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  &__item{
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    .add-app-manager__right { 
      .add-app-manager__select{
        width: 100%;
      }
      &>span{
        height: 32px;
        line-height: 32px;
      }
    }

    &.item-title {
      margin-bottom: 0;
    }
  }
  .text-color {
    color: rgba(0, 0, 0, 0.85);
  }
  .apps-select {
    span {
      width: 100%;
    }
  }
}
</style>

<style lang="less">
.add-app-manager-model {
  .ant-modal-body {
    max-height: 650 - 55 - 53 - 48px;
    overflow-y: auto;
  }
}

</style>
