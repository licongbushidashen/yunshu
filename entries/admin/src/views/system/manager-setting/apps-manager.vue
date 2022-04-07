<template>
  <div class="apps-manager">
    <div class="apps-manager__header clearfix">
      <div class="apps-manager__left">
        <a-input
          :placeholder="'搜索用户账号或用户姓名'"
          v-model="manageParams.searchWord"
          class="w240"
          @change="handleSearch"
        >
          <a-icon
            v-if="manageParams.searchWord"
            slot="suffix"
            type="close-circle"
            class="del-icon delete"
            @click="clearKeyWords"
          />
          <a-icon slot="suffix" type="search" class="del-icon" />
        </a-input>
      </div>
      <div class="apps-manager__right">
        <a-button type="primary" @click="visible = !visible; id = ''">
          <a-icon type="plus" />
          <span>新增管理员</span>
        </a-button>
      </div>
    </div>
    <div class="apps-manager__content">
      <p class="content__tips">子管理员：对已配置的应用范围内的应用、授予数据管理权限的应用和组织管理范围内的组织拥有管理权限</p>
      <a-table
        :columns="columns"
        size="small"
        :pagination="false"
        :loading="false"
        :locale="{emptyText: $t('languages.NoRelevantData')}"
        :scroll="{ y: 500 }"
        :dataSource="dataSource"
      >
        <span slot="indexTitle">{{ $t('languages.NO') }}</span>
        <span slot="usernameTitle" class="resize">用户账号</span>
        <span slot="nameTitle" class="resize">用户姓名</span>
        <span slot="departmentNameTitle" class="resize">所属组织</span>
        <span slot="appManageTitle" class="resize">新建应用权限</span>
        <span slot="appPackagesTitle" class="resize">应用名称</span>
        <span slot="departmentsTitle" class="text-ellipsis resize">组织管理范围</span>
        <span slot="actionTitle" class="resize">操作</span>

        <!-- <p
          slot="appPackages"
          slot-scope="text, record">
          <span>{{ text }} </span>
          <span
            v-for="(app, index) in text"
            :key="index"
          >
            {{ app.name }}
          </span>
          <span>
            {{ text.join(',') }}
          </span>
        </p>-->
        <p slot="departmentName" slot-scope="text, record" class="text-ellipsis">
          <span :title="text">{{ text }}</span>
        </p>

        <p slot="departments" slot-scope="text, record" class="text-ellipsis">
          <span :title="text">{{ text }}</span>
        </p>

        <p slot="name" slot-scope="text, record">
          <span v-hight-light="{'keyWords': manageParams.searchWord, 'value': text }"></span>
        </p>

        <p slot="username" class="text-ellipsis" slot-scope="text, record">
          <span v-hight-light="{'keyWords': manageParams.searchWord, 'value': text }"></span>
        </p>

        <p slot="appManage" slot-scope="text, record" class="text-ellipsis">{{ text ? '开启' : '关闭' }}</p>

        <p slot="appPackages" slot-scope="text, record" class="text-ellipsis">
          <span :title="text">{{ text }}</span>
        </p>

         <!-- 所属组织 -->
         <p
          slot="departmentNameTitle"
          class="text-ellipsis"
          slot-scope="text, record"
        >
          <span :title="record.oldDepartmentName">{{record.departmentName}}</span>
        </p>

        <div class="action right" slot="action" slot-scope="text, record">
          <i class="icon aufontAll h-icon-all-edit-o edit" @click="editManager(record.id)"></i>
          <a-popconfirm
            placement="left"
            :cancelText="$t('languages.Apps.Cancel')"
            :okText="$t('languages.Apps.Ok')"
            v-if="dataSource.length"
            title="确定要删除当前管理员么?"
            @confirm="() => deleteManager(record.id)"
          >
            <a href="javascript:;">
              <i class="icon aufontAll h-icon-all-delete-o"></i>
            </a>
          </a-popconfirm>
        </div>
      </a-table>
    </div>

    <div class="userExt__footer">
      <div v-show="totalElements > 0">
        <a-pagination
          :defaultPageSize="manageParams.size"
          :total="totalElements"
          :showTotal="total => `共${totalElements}条`"
          :current="manageParams.page + 1"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="pageChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
    </div>

    <add-app-manager :visible="visible" v-if="visible" @submit="submit" @cancel="cancel" :id="id" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import systemApi from '@/apis/system/system-manager.api';

import AddAppManager from '../modals/add-app-manager.vue';

@Component({
  name: 'apps-manager',
  components: {
    AddAppManager
  }
})
export default class AppsManager extends Vue {
  visible: boolean = false;

  dataSource = [];

  id: string = '';

  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
      width: 60,
      key: 'index',
      align: 'center',
    },
    {
      dataIndex: 'username',
      slots: { title: 'usernameTitle' },
      scopedSlots: { customRender: 'username' },
      width: '13%',
      key: 'username'
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
      width: '13%',
      key: 'name'
    },
    {
      dataIndex: 'departmentNameTitle',
      slots: { title: 'departmentNameTitle' },
      scopedSlots: { customRender: 'departmentNameTitle' },
      key: 'departmentNameTitle',
      width: '13%'
    },
    {
      dataIndex: 'appManage',
      slots: { title: 'appManageTitle' },
      scopedSlots: { customRender: 'appManage' },
      key: 'appManage',
      width: '13%'
    },
    {
      dataIndex: 'appPackages',
      slots: { title: 'appPackagesTitle' },
      scopedSlots: { customRender: 'appPackages' },
      key: 'appPackages',
      width: '13%'
    },
    // 组织范围
    {
      dataIndex: 'departments',
      slots: { title: 'departmentsTitle' },
      scopedSlots: { customRender: 'departments' },
      width: '15%',
      key: 'departments'
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      key: 'action',
      align: 'right',
    }
  ]

  created() {
    this.getManagetList();
  }

  clearKeyWords() {
    this.manageParams.searchWord = '';
    this.getManagetList();
  }

  manageParams: any = {
    managerType: 2,
    listShow: true,
    searchWord: '',
    page: 0,
    size: 20
  }

  totalElements:number = 0

  pageSizeOptions: Array<string> = ["10", "20", "50", "100"];

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.manageParams.page = page - 1;
    this.manageParams.size = pageSize;
    this.getManagetList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.manageParams.page = 0;
    this.manageParams.size = pageSize;
    this.getManagetList();
  }


  
  // 获取管理员列表
  getManagetList() {
    const vm: any = this;
    systemApi.getListManager(this.manageParams).then((res: any) => {
      if (!res.errcode && res.data) {
        vm.dataSource = res.data.content;
        vm.totalElements = res.data.totalElements;
        if (vm.dataSource ===null){
          vm.dataSource = [];
        };
        vm.dataSource.forEach((item: any, index: number) => {
          item.index = index + 1;
          item.appPackages = item.appPackages.map((apppackage: any) => apppackage.name).join(', ');
          item.departments = item.departments.map((departments: any) => departments.name).join(', ');
          if (!item.departments) {
            item.departments = "";
          }
          if (!item.departmentName) {
            item.departmentName = [];
          }
          item.departmentName.reverse();
          Object.entries(item).forEach((data: any) => {
            const [key, value] = data;
            if (typeof value !== 'boolean' && !value) {
              item[key] = '- -';
            }
          });
          // 所属组织超过三级 中间以省略号代替
          if (item.departmentName.length > 3) {
            const arr: Array<string> = [
              item.departmentName[0],
              '...',
              item.departmentName[item.departmentName.length - 1]
            ];
            item.oldDepartmentName = item.departmentName;
            item.departmentName = arr;
          }
          item.departmentName = item.departmentName.join('/');
          if(Array.isArray(item.oldDepartmentName)){
            item.oldDepartmentName = item.oldDepartmentName.join('/');
          }
        });
        // vm.filterDataSource();
      } else {
        vm.dataSource = [];
        vm.totalElements = 0;
        // vm.filterDataSource();
      }
    });
  }

  /**
   * 删除管理员
   */
  deleteManager(val: any) {
    const vm: any = this;
    const params = {
      id: val
    };
    systemApi.deleteManager(params).then((res: any) => {
      if (res.errcode === 0) {
        vm.$message.success('删除成功!', 2);
        vm.getManagetList();
      } else {
        vm.$message.error(res.errmsg, 2);
      }
    });
  }


  editManager(id: string) {
    this.id = id;
    this.visible = !this.visible;
  }


  timer: any = null
  handleSearch() {
    if(this.timer !== null){
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.manageParams.page = 0
      this.getManagetList();
    }, 500)
  }

  /**
   * 保存数据
   */
  submit(val: any) {
    const vm: any = this;
    const params: BPM.System.CreatedAppManagerParams = {
      users: [],
      appPackages: [],
      departments: [],
      id: vm.id,
      appManage: val.appManage,
      roleManage: val.roleManage,
      adminGroups: val.adminGroups,
      dataDictionaryManage: val.dataDictionaryManage
    };

    params.users = val.users.map((res: any) => ({ id: res.id }));

    for (let i = 0, len = val.appPackages.length; i < len; i++) {
      const item: any = val.appPackages[i];
      const { name, code, dataManage } = item;
      
      if (!code) continue;
      
      params.appPackages.push({
        name,
        code,
        dataManage,
        adminId: vm.id,
        id: ''
      });
    }

    params.departments = val.departments.map((res: any) => ({
      adminId: vm.id,
      id: res.id,
      name: res.name,
      queryCode: res.queryCode ? res.queryCode : '',
      unitType: res.unitType,
      unitId: res.unitId ? res.unitId : res.id
    }))

    if (vm.id) {
      
      params.notAuthDepartments = val.notAuthDepartments.map((res: any) => ({
        adminId: vm.id,
        id: res.id,
        name: res.name,
        queryCode: res.queryCode ? res.queryCode : '',
        unitType: res.unitType,
        unitId: res.unitId ? res.unitId : res.id
      }))

      console.log('编辑', params);

      systemApi.upDateappsManager(params).then((res: any) => {
        if (res.errcode === 0) {
          vm.getManagetList();
          vm.id = '';
          vm.$message.success(res.errmsg); 
        } else {
          vm.$message.error(res.errmsg, 2);
        }
      });
    } else {
      console.log('新增', params);
      systemApi.createdappsManager(params).then((res: any) => {
        if (res.errcode === 0) {
          vm.getManagetList();
          vm.id = '';
          vm.$message.success(res.errmsg); 
        } else {
          vm.$message.error(res.errmsg, 2);
        }
      });
    }

    this.visible = !this.visible;
  }

  cancel() {
    this.visible = !this.visible;
  }
}
</script>
<style lang="less" scoped>
.apps-manager {
  padding-bottom: 50px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 74px);
  &__header {
    .apps-manager__left {
      .delete {
        margin-right: 6px;
        color: rgba(0, 0, 0, 0.25);
      }
      .w240 {
        width: 240px;
      }
      float: left;
      input {
        width: 240px;
      }
    }
    .apps-manager__right {
      float: right;
    }
  }
  &__content {
    flex: 1;
    .content__tips {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      padding-bottom: 2px;
      line-height: 20px;
    }
    padding-top: 16px;
    // /deep/.ant-table-thead span {
    //   font-weight: 600;
    //   color: rgba(0,0,0,0.65);
    // }
    /deep/.ant-table-body {
      max-height: calc(100vh - 230px - 60px) !important;
      color: rgba(0, 0, 0, 0.85);
    }
    .highlight {
      color: @primary-color;
    }
    .action {
      .edit {
        margin-right: 18px;
      }
    }
  }
}

.userExt__footer {
  background: #ffff;
  padding: 10px 0;
  width: 100%;
  text-align: right;
}

</style>
