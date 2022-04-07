
<template>
  <div class="permission-setting">
    <h3>{{ $t('cloudpivot.report.PermissionSetting') }}</h3>
    <p>{{ $t('cloudpivot.report.PermissionDesc')}}</p>
    <h4>{{ $t('cloudpivot.report.PermissonRangeSetting') }}</h4>
    <div class="permission-setting__row">
      <div>
        <a-radio-group v-model="visibleType" @change="onVisibleTypeChange">
          <a-radio value="ALL_VISIABLE">{{ $t('cloudpivot.report.AllAdminVisible') }}</a-radio>
          <a-radio value="PART_VISIABLE">{{ $t('cloudpivot.report.AccessByGroup') }}</a-radio>
        </a-radio-group>
      </div>
    </div>

    <div v-show="visibleType === 'PART_VISIABLE'" class="overflow__x">
      <a-table :loading="listLoading" :columns="columns" :dataSource="permissonGroups" :pagination="false" rowKey="id">
        <!-- 权限组显示 -->
        <template v-slot:objectList="objectList">
          {{ formatDataSource(objectList) }}
        </template>
        <!-- 使用者 -->
        <template v-slot:userScope="userScope">
          {{ formatUser(userScope) }}
        </template>
        <template slot="operation" slot-scope="text, record">
          <!-- 编辑权限组 -->
          <a-icon type="edit" @click="() => handleEdit(record.id, record)" />
          <!-- 删除权限组 -->
          <a-popconfirm
            :title="$t('languages.appSettings.ConfirmDelete')"
            :okText="$t('languages.appSettings.OK')"
            :cancelText="$t('languages.appSettings.cancel')"
            placement="left"
            @confirm="() => handleDelete(record.id)"
          >
            <a-icon type="delete" />
          </a-popconfirm>
        </template>
      </a-table>

      <div class="flex__title">
        <div class="actions">
          <div class="handle-add" @click="handleAdd">
            <i class="icon aufontAll h-icon-all-plus-o"></i>
            {{ $t('cloudpivot.report.AddPermissionGroup') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 添加或编辑侧边窗口 -->
    <a-drawer
      @close="closeDrawer"
      :closable="true"
      :title="FormTitle"
      :visible="showForm"
      placement="right"
      width="500"
      wrapClassName="user-info-drawer"
    >
      <permission-form 
      ref="perForm"
      :subManagers="subManagers"
      :dataSteamList="dataSteamList"
      @formViewChange="handleFormViewChange"
      :target="target"
      ></permission-form>
    </a-drawer>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Drawer } from '@h3/antd-vue';
// import permissionApi from '@/apis/system/permission.api';
import PermissionForm from './permission-form.vue';
import systemApi from '@/apis/system/system-manager.api';
// import reportApi from '@/apis/report/data-source-api';

import * as BizSql from '@/apis/biz-sql/index';

@Component({
  name: 'permission-setting',
  components: {
    ADrawer: Drawer,
    PermissionForm
  }
})
export default class PermissionSetting extends Vue {
  groupId: string = '';      // 当前权限组ID

  target: any = {};   // 当前选中的对象 

  showForm: boolean = false;  // 编辑、新增弹窗显示

  visibleType = "ALL_VISIABLE";   // 数据流权限范围设置 1所有  2按组

  columns: any[] = [];

  permissonGroups: any[] = [];  // 权限组列表

  subManagers: any[] = [];     // 子管理员列表

  listLoading: boolean = true; // 列表加载

  @Prop({default: []})
  dataSteamList!: any[]  // 数据源列表

  // 弹框名称
  get FormTitle() {
    return this.groupId === '' ? '权限添加' : '权限编辑'
  }

  // 数据流回显
  formatDataSource(records: any) {
    if(this.dataSteamList.length === 0) return records
    const result=  records.split(',').reduce((stat: any, item: any) => {
      this.dataSteamList.map((sub: any) => {
        if(sub.id === item)
        stat.push(sub.name)
      })
      return stat
    }, []).join('、')
    return result
  }

  // 回显用户姓名
  formatUser(records: any) {
    if(this.subManagers.length === 0) return records
    const result=  records.split(',').reduce((stat: any, item: any) => {
      this.subManagers.map((sub: any) => {
        if(sub.id === item)
        stat.push(sub.name)
      })
      return stat
    }, []).join('、')
    return result
  }

  // 设置列表行
  setColumns() {
    this.columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 126
      },
      {
        title: '权限组',
        dataIndex: 'name',
        width: 152
      },
      {
        title: '数据流',
        dataIndex: 'objectList',
        width: 188,
        scopedSlots: { customRender: "dataSource" }
      },
      {
        title: '使用者',
        dataIndex: 'userScope',
        width: 191,
        scopedSlots: { customRender: "userScope" },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' },
        width: 138
      }
    ];
  }

  // 查询权限组
  load() {
    // 查询权限组列表
    // this.listLoading = true
    // reportApi.permissonGroupsList({}).then(res => {

    //   console.log(res)
    //   this.listLoading = false
    //   const { errcode, data } = res as any
    //   if (errcode === 0 && res.data) {
    //     this.permissonGroups = data.datasourceList
    //     this.visibleType = data.visibleType === 1 ? 'ALL_VISIABLE' : data.visibleType === 2 ? 'PART_VISIABLE' : ''
    //     this.permissonGroups.forEach((item: any, i) => {
    //       item.index = i + 1;
    //       // if (item.objectList) {
    //       //   item.dataSource = JSON.parse(item.dataSource).map((x: any) => x.name).join(',');
    //       // }
    //       // if (item.users) {
    //       //   item.users = JSON.parse(item.users).map((x: any) => x.name).join(',');
    //       // }
    //       Object.entries(item).forEach((d: any) => {
    //         const [key, value] = d;
    //         if (typeof value !== 'boolean' && !value) {
    //           item[key] = '- -';
    //         }
    //       });
    //     });
    //   }
    // })
  }

  handleAdd() {
    this.groupId = '';
    this.target = {}
    this.showForm = true;
  }

  handleEdit(groupId: string, record: any) {
    this.groupId = groupId;
    this.target = record
    this.showForm = true;
  }

  // 删除权限组
  handleDelete(groupId: string) {
    // const params = {
    //   groupId
    // }
    // reportApi.deletePermissonGroups(params).then((res: any) => {
    //   if (res.errcode === 0) {
    //     this.load();
    //     let that = this;
    //     setTimeout(function () {
    //       that.$message.success('已删除');
    //     }, 500);
    //   } else {
    //     this.$message.error('删除失败');
    //   }
    // })
  }

  // 控制form显示隐藏
  handleFormViewChange(view) {
    this.showForm = view
  }

  // 可见范围修改
  onVisibleTypeChange(e: any) {
    const type = e.target.value;
    const params = {
      appCode: this.$route.params.appCode,
      visibleType: type
    };
    // console.log(params)
    // reportApi.updateVisibleType(params);
  }

  // 获取子管理员列表
  async getManagetList() {
    const vm: any = this;
    const res:any = await BizSql.getAppManagers('');
    vm.subManagers = res.data
  }

  // 初始化高级数据源页面所需配置内容
  init() {
    this.setColumns();
    this.getManagetList();
  }


  closeDrawer() {
    // 右上角关闭时清除表单
    this.showForm = false
    const vueIns = this.$refs.perForm as any
    vueIns.cancel()
  }

  mounted() {

    this.init()
    if (!this.permissonGroups.length) {
      this.load();
    }
  }
}
</script>


<style lang="less" scoped>
@import "~@/components/shared/ant-table.less";

.permission-setting {
  text-align: left;
  padding: 0 24px;
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.65);
  overflow: auto;
  height: 100%;

  .overflow__x {
    overflow-x: auto;
  }

  h3 {
    font-size: 16px;
    font-weight: 500;
    color: #000;
    margin-bottom: 13px;
  }

  p {
    line-height: 24px;
    color: rgba(102, 102, 102, 0.85);
    font-size: 12px;
  }

  /deep/.ant-table-body {
    color: rgba(0, 0, 0, 0.85);
  }

  h4 {
    font-weight: 500;
    color: #000;
    margin-bottom: 21px;
    margin-top: 31px;
  }
  .permission-setting__row {
    margin-bottom: 19px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
  }

  .actions {
    text-align: center;
    margin-top: 14px;
    margin-right: 8px;
    // height: 80px;
    // padding-bottom: 16px;
    // & > button {
    //   border: 0;
    // }
    .handle-add {
      color: @primary-color;
      text-align: center;
      margin-top: 8px;
      user-select: none;
      cursor: pointer;
      margin-bottom: 20px;
    }
  }

  i.anticon {
    font-size: 14px;
    margin-right: 17px;
    cursor: pointer;
  }

  &__row {
    display: flex;
  }
  .desc {
    padding-top: 4px;
  }
}

.desc {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>

<style lang="less">
.permission-group-drawer {
  .ant-drawer-title {
    font-weight: 600;
  }
  .ant-drawer-body {
    height: calc(100% - 57px - 52px);
    padding: 24px !important;
  }
  .ant-drawer-wrapper-body{
    overflow: inherit!important;
  }
  .ant-drawer-body{
    overflow: scroll;
  }
}
.ant-table-thead > tr > th:not(:first-child)::after {
  display: none;
}
</style>
