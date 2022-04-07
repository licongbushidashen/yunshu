<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-08-24 17:59:37
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-10-15 11:48:18
-->
<template>
  <div class="data-dictionary">
    <div class="header">
      <div class="left">
        <a-button
          class="add"
          @click="
            addClassVisible = true;
            addClassTitle = '新增接口配置';
          "
          v-if="rootAdmin"
        >
          新建
        </a-button>
      </div>
      <div class="right">
        <div class="query-box">
          <a-input-search
            placeholder="请输入clientid关键字"
            v-model="keyWords"
            class="w240"
            @keyup.13="changeIsBeginSerch"
            @search="changeIsBeginSerch"
            :allowClear="true"
          >
          </a-input-search>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="list-wrapper">
        <div class="data-dictionary-list">
          <a-table
            :columns="columns"
            :pagination="false"
            :dataSource="data"
            :loading="loading"
            size="small"
            :rowKey="(record) => record.id"
            bordered
            :ellipsis="true"
            :scroll="{ y: scrollHeight }"
          >
            <!-- 序号 -->
            <template slot="index" slot-scope="text, record">
              <template>
                {{ record.index }}
              </template>
            </template>

            <template slot="clientId" slot-scope="text, record">
              <template>
               <div class="table-scope-text" title="点击复制" @click="onCopy(record.clientId)">
                  {{ record.clientId }}
               </div>
              </template>
            </template>

              <template slot="clientSecret" slot-scope="text, record">
              <template>
                <div class="table-scope-text" title="点击复制" @click="onCopy(record.clientSecret)">
                  {{ record.clientSecret }}
               </div>
              </template>
            </template>

            <!-- 操作 -->
            <template slot="operation" slot-scope="text, record">
              <div class="operation-btns">
                <i
                  class="icon aufontAll h-icon-all-edit-o edit"
                  @click="editManager(record)"
                ></i>
                <i
                  class="icon aufontAll h-icon-all-delete-o"
                  @click="deleteManager(record.clientId)"
                ></i>
              </div>
            </template>
          </a-table>
        </div>
        <!-- 分页 -->
        <div class="pagination-box">
          <a-pagination
            show-quick-jumper
            :default-current="1"
            :total="total"
            @change="pageChange"
            @showSizeChange="onShowSizeChange"
            :page-size-options="pageSizeOptions"
            show-size-changer
            :showTotal="showTotal"
            :pageSize="searchParams.pageSize"
          >
            <template slot="buildOptionText" slot-scope="props">
              <span>{{ props.value }}条/页</span>
              <!-- <span v-if="props.value === '50'">全部</span> -->
            </template>
          </a-pagination>
        </div>
      </div>
    </div>

    <!-- 新建/修改配置 -->
    <a-modal
      v-model="addClassVisible"
      width="800px"
      :title="addClassTitle"
      @cancel="cancelClass"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @ok="saveNewClass"
      okText="确定"
    >
      <div class="modal-wrapper">
        <a-form-model
          ref="ruleForm"
          :model="form"
          :rules="rules"
          labelAlign="left"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-form-model-item label="authorities" prop="authorities">
            <a-radio-group v-model="form.authorities">
              <a-radio value="openapi"> openapi </a-radio>
              <a-radio value="api"> api </a-radio>
            </a-radio-group>
          </a-form-model-item>

          <a-form-model-item label="clientId" prop="clientId">
            <a-input
              v-model="form.clientId"
              allow-clear
              :maxLength="50"
              :disabled="addClassTitle.includes('修改')"
            />
            <div class="input-hint">
              用于唯一标识每一个客户端，只能中文和英文组合，不得大于50个字符
            </div>
          </a-form-model-item>

          <a-form-model-item
            label="ClientSecret"
            class="ClientSecret"
            v-show="addClassTitle.includes('修改')"
          >
            <a-textarea v-model="form.clientSecret" :rows="4" disabled />
            <i
              class="icon aufontAll h-icon-all-copy-o"
              @click="onCopy(form.clientSecret)"
              title="一键复制"
            ></i>
          </a-form-model-item>

          <a-form-model-item
            label="authorizedGrantTypes"
            prop="authorizedGrantTypes"
          >
            <a-select mode="multiple" v-model="form.authorizedGrantTypes" :showArrow="true">
              <a-select-option value="authorization_code">
                authorization_code
              </a-select-option>
              <a-select-option value="password"> password </a-select-option>
              <a-select-option value="refresh_token">
                refresh_token
              </a-select-option>
              <a-select-option value="implicit"> implicit </a-select-option>
              <a-select-option value="client_credentials">
                client_credentials
              </a-select-option>
            </a-select>
            <div class="input-hint">指定客户端支持的grant_type</div>
          </a-form-model-item>

          <a-form-model-item
            label="registeredRedirectUris"
            v-show="form.authorizedGrantTypes.includes('authorization_code')"
          >
            <a-input v-model="form.registeredRedirectUris" allow-clear />
            <div class="input-hint">客户端的重定向URI，不设置可能不可登陆</div>
          </a-form-model-item>

          <a-form-model-item
            label="accessTokenValiditySeconds"
            prop="accessTokenValiditySeconds"
          >
            <a-input
              v-model="form.accessTokenValiditySeconds"
              allow-clear
              :min="1"
            />
            <div class="input-hint">
              设置客户端access_token的有效时间值（单位：秒）
            </div>
          </a-form-model-item>

          <a-form-model-item
            label="refreshTokenValiditySeconds"
            prop="refreshTokenValiditySeconds"
          >
            <a-input
              v-model="form.refreshTokenValiditySeconds"
              allow-clear
              :min="1"
            />
            <div class="input-hint">
              设置客户端refresh_token的有效时间值（单位：秒）
            </div>
          </a-form-model-item>
        </a-form-model>
      </div>
    </a-modal>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import dataDictionaryApi from "@/apis/system/data-configuration.api";
import { pattern, nameValidator } from '@/common/utils';
import { create } from '../../../apis/data-rule/data-rule.api';

export interface FormResult {
  authorities: string;
  clientId: string;
  authorizedGrantTypes: any[];
  accessTokenValiditySeconds: string;
  refreshTokenValiditySeconds: string;
  registeredRedirectUris: string;
  shide: string; //ClientSecret
  clientSecret: string;
  id: string;
}

@Component({
  name: "apiConfiguration",
  components: {},
})

export default class apiConfiguration extends Vue {
  //定义参数
  data: any[] = [];
  loading: boolean = false;
  scrollHeight: number = 0;
  keyWords: string = "";
  addClassTitle: string = "新增接口配置";
  addClassVisible: boolean = false;
  form: FormResult = {
    authorities: "openapi",
    clientId: "",
    authorizedGrantTypes: [],
    accessTokenValiditySeconds: "",
    refreshTokenValiditySeconds: "",
    registeredRedirectUris: "",
    shide: "123456",
    clientSecret: "",
    id: "",
  };
  
  rules: any = {};

  columns: any = [
    {
      title: "序号",
      dataIndex: "index",
      scopedSlots: { customRender: "index" },
      align: "center",
      width: 60,
    },
    {
      title: "clientID",
      dataIndex: "clientId",
      scopedSlots: { customRender: "clientId" },
      align: "left",
      width: 160,
      ellipsis: true,
    },
    {
      title: "clientSecret",
      dataIndex: "clientSecret",
      scopedSlots: { customRender: "clientSecret" },
      align: "left",
      width: 240,
      ellipsis: true,
    },

    {
      title: "authorizedGrantTypes",
      dataIndex: "authorizedGrantTypes",
      align: "left",
      width: 240,
      ellipsis: true,
    },
    {
      title: "registeredRedirectUris",
      dataIndex: "registeredRedirectUris",
      align: "left",
      width: 240,
      ellipsis: true,
    },
    {
      title: "accessTokenValiditySeconds",
      dataIndex: "accessTokenValiditySeconds",
      align: "left",
      width: 140,
      ellipsis: true,
    },
    {
      title: "refreshTokenValiditySeconds",
      dataIndex: "refreshTokenValiditySeconds",
      align: "left",
      width: 140,
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "operation",
      align: "left",
      scopedSlots: { customRender: "operation" },
      width: 80,
    },
  ];

  //分页 start
  pageSizeOptions: any = ["10", "20", "30", "40", "50"];
  total: number = 0;
  showQuickJumper: boolean = true;
  rootAdmin: boolean = false;
  searchParams: any = {
    pageSize: 20,
    pageNum: 0,
  };
  modelForm: any = {};

  beforeMount() {
    this.setRules();
  }

  /**
   * 自定义验证规则
   */
  setRules(){
      this.rules ={
    authorities: [
      {
        required: true,
        message: "必填",
        trigger: "change",
      },
    ],
    clientId: [
      {
        required: true,
        message: "请输入中英文字符",
        trigger: "blur",
        pattern: pattern('clientId'),
      },
    ],
    authorizedGrantTypes: [
      {
        required: true,
        message: "必填",
        trigger: "change",
      },
    ],
    accessTokenValiditySeconds: [
      {
        required: true,
        message: "请设置有效时间值",
        trigger: "blur",
        pattern: pattern('number'),
      },
    ],
    refreshTokenValiditySeconds: [
      {
        required: true,
        message: "请设置有效时间值",
        trigger: "blur",
        pattern: pattern('number'),
      },
    ],
   };
  }
  

  /**
   * 关键词搜索
   */
  changeIsBeginSerch(){
    this.searchDictionary();
  }

  /**
   * 保存接口配置
   */
  flag : boolean =true; //定义开关

  async saveNewClass() {
    const ruleForm: any = this.$refs['ruleForm'];
    ruleForm.validate(async (valid) => {
      //表单验证通过
      if (valid) {
        if(!this.flag)return;
        this.flag=false;
        let authorizedGrantTypes: string =
          this.form.authorizedGrantTypes.join(",");
        const params: any = { ...this.form };
        params.id=this.addClassTitle.includes("新增")?'':params.id;
        params.authorizedGrantTypes = authorizedGrantTypes;
        let res: any = this.addClassTitle.includes("修改")
          ? await dataDictionaryApi.updateConfiguration(params)
          : await dataDictionaryApi.saveConfiguration(params);
        if (res.errcode === 0) {
          this.$message.success("配置成功");
          this.searchDictionary();
        }  else {
          this.$message.error(res.errmsg);
        }
        this.flag=true;
        this.cancelClass();
      }
    });
  }

  /**
   * 修改接口配置
   */
  editManager(item: any) {
    if (typeof item.authorizedGrantTypes === "string") {
      item.authorizedGrantTypes = item.authorizedGrantTypes.split(",");
    }
    this.$nextTick(()=>{
        this.form={...item};
        this.addClassTitle = "修改接口配置";
        this.addClassVisible = true;
    })
  }

  /**
   * 删除接口配置
   */
  async deleteManager(id: string) {
    this.$confirm({
      title: "该条数据将被永久删除，请谨慎操作！",
      cancelText: "取消",
      okText: "确定",
      onOk: async () => {
        let res: any = await dataDictionaryApi.deleteConfiguration(id);
        if (res.errcode === 0) {
          this.$message.success("删除成功");
          this.searchDictionary();
        } else {
          this.$message.error(res.errmsg);
        }
      },
      onCancel: () => {},
    });
  }

  onCopy(certB64) {
    let oInput = document.createElement("input");
    oInput.value = certB64;
    document.body.appendChild(oInput);
    oInput.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
    this.$message.success("复制成功");
    oInput.remove();
  }

  /**
   * 取消重置
   */
  cancelClass() {
    const ruleForm: any = this.$refs['ruleForm'];
    ruleForm.resetFields();
    this.addClassVisible = false;
  }

  created() {
    this.searchDictionary();
  }

  showTotal(total) {
    return "共" + total + "条";
  }

  onShowSizeChange(current, pageSize) {
    this.searchParams.pageSize = pageSize;
    this.searchDictionary();
  }

  pageChange(pageNumber) {
    (this.searchParams.pageNum = 0);
    (this.searchParams.pageNum = pageNumber);
    this.searchDictionary();
  }
  //分页 end

  // 获取列表数据
  async searchDictionary() {
    let params: any = {
      page: this.searchParams.pageNum || 0,
      size: this.searchParams.pageSize || 10,
      clientId:this.keyWords,
    };
    let res: any = await dataDictionaryApi.searchConfiguration(params);
    if (res.errcode === 0) {
      const { data } = res;
      if (Array.isArray(data.content)) {
        data.content.forEach((item, index) => {
          item.index =
            index + 1 + this.searchParams.pageNum * this.searchParams.pageSize;
        });
      }
      this.data = data.content || [];
      this.total = data.totalElements;
    }
  }

  getScrollHeight() {
    // @ts-ignore
    this.scrollHeight = (document.querySelector(".data-dictionary-list").scrollHeight - 32) || 0;
  }

  mounted() {
    this.getScrollHeight();
    let userStr= sessionStorage.getItem("user");
    if(userStr){
      let user: any = JSON.parse(userStr);
      this.rootAdmin = user.permissions && user.permissions.includes("ADMIN");
      if(!this.rootAdmin){
        this.columns=this.columns.filter(item=>item.title !== '操作');
      }
    }
  }
}
</script>

<style lang="less" scoped>
.data-dictionary {
  margin: 0 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  > .header {
    height: 56px;
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
    align-content: center;
    .left {
      button {
        margin-right: 8px;
        &.add {
          color: #fff;
          background-color: #00c293;
        }
      }
    }
  }
  .content {
    flex: 1;
    .list-wrapper {
      height: 100%;
      min-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
      .data-dictionary-list {
        flex: 1;
        overflow: hidden;
        .operation-btns {
          width: 100%;
          text-align: center;
          i {
            cursor: pointer;
            &:hover {
              color: #00c293;
            }
          }
          .edit {
            margin-right: 20px;
          }
        }
      }
    }
    //分页
    .pagination-box {
      text-align: right;
      margin-top: 20px;
      margin-bottom: 10px;
    }
  }
}
.input-hint {
  font-size: 12px;
  color: #aaaaaa;
  line-height: 14px;
  text-align: justify;
  margin-top: 10px;
}
.ClientSecret {
  position: relative;
  .h-icon-all-copy-o {
    position: absolute;
    right: -20px;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.data-dictionary-list {
  .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
  .ant-table-column-title {
    white-space: nowrap;
  }
  td {
    white-space: nowrap !important;
  }

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table {
    height: 100%;
  }
  .ant-table {
    border-right: 1px solid #e8e8e8;
  }
  .ant-table-small.ant-table-bordered .ant-table-content {
    border-right: none;
  }
}
.add-data-dictionary-modal .ant-modal-body {
  padding: 0 45px;
}
.modal-wrapper {
  padding: 20px;
  .ant-table-small > .ant-table-content > .ant-table-body {
    margin: 0;
  }
  .content {
    max-height: 500px;
    overflow: auto;
  }
}
.ant-table-body::-webkit-scrollbar {
  width: 1px !important;
}

.edit-row {
  background: rgb(232, 252, 244);
}
.table-scope-text{
  color: #00c293;
  cursor: pointer;
}
</style>