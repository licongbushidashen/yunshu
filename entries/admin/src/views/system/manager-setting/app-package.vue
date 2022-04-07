<template>
    <div class="app-package">
        <a-table class="app-table" :columns="dataColumns" :pagination="false" :dataSource="selectData" :locale="{emptyText: ' '}">
          <span class="td-title" slot="dataItemTitle">应用名称</span>
          <span class="td-title" slot="dataManageTitle">数据管理权限</span>
          <span class="td-title" slot="actionTitle">操作</span>
          
          <span slot="dataItem" slot-scope="text, record">
            <a-input v-if="!record.operatable" :disabled="!record.operatable" v-model="record.name" >
              <a-icon class="disabled-down-icon" slot="suffix" type="down" />
            </a-input>
            <a-select 
              v-else
              :showSearch="true"
              class="app-select"
              optionFilterProp="children"
              v-model="record.code"
              @change="onChangeApp"
              @focus="selectItem(record.index, record.code)"
              placeholder="请选择"
            >
              <a-select-option 
                v-for="option of record.appList"
                :key="option.code" 
                :value="option.code"
                >
                {{ option.name }}
              </a-select-option>
            </a-select>
          </span>

          <span slot="dataManage" slot-scope="text, record">
            <a-checkbox class="checkbox" :disabled="!record.operatable || !record.isDataManage" v-model="record.dataManage"></a-checkbox>
          </span>
          <span slot="operatable" slot-scope="text, record">
            <i class="icon aufontAll h-icon-all-delete-o delete-btn" v-if="record.operatable" @click="deleteApp(record)"></i>
            <a-popover placement="topLeft" v-else>
              <template slot="content">
                <span class="top-left-tip">您不是该应用的管理员，<br />无法进行操作</span>
              </template>
              <i class="icon aufontAll h-icon-all-delete-o delete-btn disabled"></i>
            </a-popover>
          </span>
        </a-table>

        <a-button class="add-appBtn" type="link" @click="addApp">+ 添加应用</a-button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch, Model } from 'vue-property-decorator';
import { State, Action, Mutation, namespace } from 'vuex-class';
import appsApi from '@/apis/apps';
import systemApi from '@/apis/system/system-manager.api';

const UserModule = namespace('System/User');

@Component({
  name: 'app-package'
})
export default class AppPackage extends Vue {
    @Model('change') selectData! : any;
    @Prop() id!: string;
    @Prop() operateType!: string;

    dataColumns: any = [
    {
      dataIndex: 'code',
      width: 250,
      key: 'code',
      slots: { title: 'dataItemTitle' },
      scopedSlots: { customRender: 'dataItem' }
    },
    {
      dataIndex: 'dataManage',
      width: 130,
      key: 'dataManage',
      slots: { title: 'dataManageTitle' },
      scopedSlots: { customRender: 'dataManage' }
    },
    {
      key: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'operatable' },
    },
  ];

  appList: any = [];

  itemIndex: number = 0;
  selectDdataIndex: number = 0;

  @Watch('operateType', {immediate: true})
  async onOperateTypeChange(operateType) {
    if (!operateType) return;

    await this.getAppList();

    if (operateType === 'add') {
      
      if (!this.selectData.length) {
        this.generateSelectData();
      }

      return;
    };
    
    if (operateType === 'edit') {
      this.setAppPackageDataManage()

      this.addAppListToSelectData();
    }
    
  }


  /**
   * 获取表格行
   */
  selectItem(index: number, code: string) {
    this.itemIndex = index;

    const idx: number = this.selectData.findIndex(item => item.code === code);
    this.selectData[idx].appList = this.getOwnerAppList(code)
  }

  /**
   * 添加已过滤的应用到下拉列表
   */
  addAppListToSelectData() {
    for (const item of this.selectData) {
      this.$set(item, 'appList', this.getOwnerAppList(item.code))
    }
  }

  /**
   * 生成空应用项
   */
  generateSelectData() {
    let index = this.selectData.length;

    this.selectData.push({
      index: index++,
      code: null,
      dataManage: false,
      name: null,
      operatable: true,
      isDataManage: false,
      appList: this.getOwnerAppList()
    });
  }

  /**
   * 过滤已选的应用
   */
  getOwnerAppList(ownerCode?: any) {
    const cloneAppList: any = Array.isArray(this.appList) && JSON.parse(JSON.stringify(this.appList));
    
    for (let i = 0, len = this.selectData.length; i < len; i++) {
      const item = this.selectData[i];
      
      // 如果是自己，则跳出
      if (ownerCode && item.code === ownerCode) continue;

      const index = cloneAppList.findIndex((AppItem) => AppItem.code === item.code);
      
      if (index < 0) continue;

      // 把除了已选择的应用删除
      cloneAppList.splice(index, 1);
    }

    return cloneAppList;

  }

  /**
   * 选中应用
   */
  async onChangeApp(code: string) {
    
    const appPackegeItem: any = this.getAppPackage(code);
    const params: any = appPackegeItem.params;
    const appPackege: any = appPackegeItem.appPackege;

    await this.setAppPackage(params, appPackege);
    
    
  }
  
  /**
   * 设置所有回选的数据的数据管理权限
   */
  async setAppPackageDataManage() {
    const params: any = [];

    for (const item of this.selectData) {
      params.push({
          name: item.name,
          code: item.code,
          adminId: this.id,
          id: ''
      });
    }

    const isDataManage: any = await this.getDataManage(params);

    for (const item of this.selectData) {
      item.isDataManage = isDataManage[item.code];
    }

  }

  /**
   * 设置应用数据
   */
  async setAppPackage(params: any, appPackege: any) {
    const isDataManage: any = await this.getDataManage(params);
    
    for (const item of this.selectData) {
      if (item.index === this.itemIndex) {
        item.isDataManage = isDataManage[appPackege.code];
        item.dataManage = false;
        item.name = appPackege.name;
        item.code = appPackege.code;
      }
    }
  }

  /**
   * 当前用户选择的应用是否拥有数据管理员权限
   */
  async getDataManage(params: any) {
    let isDataManage: any = {};
    const res: any = await systemApi.getDataManage(params);

    if (res.errcode === 0) {
      isDataManage = res.data;
    }

    return isDataManage
  }

  /**
   * 获取选中的应用和参数
   */
  getAppPackage(code: string) {
    let result: any = {};

    for (const item of (this.appList as any)) {
        if (item.code === code) {
            result.appPackege = item;
            result.params = [{
                name: item.name,
                code: item.code,
                adminId: this.id,
                id: ''
            }]
            break;
        }
    }

    return result;
  }

  /**
   * 添加应用
   */
  addApp() {
    this.generateSelectData();
  }

  /**
   * 删除应用
   */
  deleteApp(data) {
    const index = this.selectData.findIndex((item) => item.index === data.index);
    this.selectData.splice(index, 1);
  }

  /**
   * 获取应用列表
   */
  async getAppList() {

    const res:any = await appsApi.getAppList();

    if (res.errcode !== 0) return;

    if (res.data && res.data.length > 0) {

        // 获取接口列表并去重
        const temp = new Map();
        res.data.forEach((r:any) => {  
            temp.set(r.code,{  
                code:r.code,
                name:r.name
            })
        }); 

        this.appList = [];

        // 把新的值给重新赋值给list
        for (let value of temp.values()) {
            this.appList.push(value)
        }

    }
  }
}
</script>

<style lang="less" scoped>
.app-package {
    width: 100%;
    .app-table  {
        /deep/.ant-table-thead > tr > th {
        padding: 8px 8px;
        }

        /deep/.ant-table-tbody > tr > td {
        padding: 4px 2px;
        }
        
        /deep/.ant-table-thead > tr > th {
        .td-title {
            &:before {
            content: '|';
            display: inline-block;
            margin-right: 17px;
            color: rgba(0, 0, 0, 0.15)
            }
        }

        &:first-child {
            .td-title {
            &::before {
                display: none;
            }
            }
        }
        }

        .ant-select {
        width: 100%;
        height: 32px;
        }

        .checkbox,
        .delete-btn {
        display: block;
        margin: 0 auto;
        text-align: center;
        }

        .delete-btn {
          width: 45px;
        }

        .disabled {
            color: rgba(0, 0, 0, 0.25);
            cursor: not-allowed;
        }

        .disabled-down-icon {
          color: rgba(0, 0, 0, 0.25);
          font-size: 12px;
          cursor: not-allowed;
        }

        .top-left-tip {
          font-family:PingFangSC-Regular,PingFang SC;
          font-weight:400;
          color:rgba(0,0,0,1);
          line-height:22px;
        }

        .app-select {
          /deep/ div.ant-select-selection-selected-value {
            max-width: 208px;
          }
        }
    }

    /deep/ .add-appBtn {
        display: block;;
        margin: 10px auto 0 auto;
    }

    .add-appBtn {
        display: block;;
        margin: 10px auto 0 auto;
    }
}

</style>

