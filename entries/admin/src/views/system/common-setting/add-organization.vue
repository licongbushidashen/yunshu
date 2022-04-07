<template>
  <a-form class="add-organization">
    <a-row class="item-wrap">
      <a-col :span="6" class="item-title">上级部门</a-col>
      <a-col :span="18">
        <staff-selector
          :options="deptOpts"
          v-model="parent"
          @change="onChange"
        ></staff-selector>
      </a-col>
    </a-row>

    <a-row class="item-wrap">
      <a-col :span="6" class="item-title">
        <span class="red">*</span>组织名称
      </a-col>
      <a-col :span="18">
        <a-input
          ref="orgNameInput"
          placeholder="组织名称"
          v-model="formInfo.name"
        />
      </a-col>
    </a-row>

    <a-row class="item-wrap">
      <a-col :span="6" class="item-title">组织维护方式</a-col>
      <a-col :span="18">
        <a-radio-group
          @change="syncChange"
          v-model="syncType"
          :disabled="!!info && !formInfo.isEnableEditRelatedDept"
        >
          <a-radio :value="0">钉钉向云枢同步</a-radio>
          <a-radio :value="1">云枢自维护</a-radio>
          <a-radio :value="2">企业微信集成</a-radio>
          <a-radio :value="3">自定义</a-radio>
        </a-radio-group>
      </a-col>
    </a-row>

    <a-row v-if="syncType === 1" class="item-wrap">
      <a-col :span="6" class="item-title">
        <span class="red">*</span>CorpId
      </a-col>
      <a-col :span="18">
        <a-input
          ref="corpId"
          :disabled="isDisabled"
          placeholder="Corpid"
          v-model="formInfo.corpId"
        />
      </a-col>
    </a-row>

    <a-row v-if="syncType === 0" class="item-wrap">
      <a-col :span="6" class="item-title">
        通讯录
      </a-col>
      <a-col>
        <a-checkbox-group
          v-model="bookType"
        >
          <a-checkbox v-for="item in options" :key="item.key" :value="item.key" @change="toggleCheckedBook(item)">{{ item.name }}</a-checkbox>
        </a-checkbox-group>
      </a-col>
      <a-col class="add-book" @click="addBook">
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        添加通讯录
      </a-col>
    </a-row>

    <a-row class="item-wrap" v-if="syncType === 3">
      <a-col :span="6" class="item-title">
        <span class="red">*</span>组织类型编码
        <a-tooltip>
          <template slot="title">必须与同步逻辑中该组织定义的通道类型保持一致，系统方可识别匹配、进行相关路由。如钉钉的通道类型为DINGTALK</template>
          <i class="icon aufontAll h-icon-all-question-circle-o" style="margin-left: 5px"></i>
        </a-tooltip>
      </a-col>
      <a-col :span="18">
        <a-input
          ref="orgNameInput"
          placeholder="组织类型"
          v-model="customType"
        />
      </a-col>
    </a-row>
    <a-row class="item-wrap" v-if="syncType === 3">
      <a-col :span="6" class="item-title">增量回调地址</a-col>
      <a-col :span="18">
         <a-input
            ref="redirectUri"
            placeholder="增量回调地址"
            v-model="formInfo.redirectUri"
          />
      </a-col>
    </a-row>

    <h3 class="vice-title">
      <span v-show="syncType === 3">自定义集成参数</span>
    </h3>
    <div class="custom-params" v-show="syncType === 3">
      <a-row>
        <a-col class="custom-item" :span="10"
          ><span style="font-size: 12px;">组织集成凭证项</span><a-tooltip>
            <template slot="title">可根据组织的数据源接口实现类定义相关参数，如钉钉同步所需的CorpId、SSOSecret、AppKey等</template>
            <i
              class="icon aufontAll h-icon-all-question-circle-o"
              style="margin-left: 5px"
            ></i> </a-tooltip
        ></a-col>
        <a-col class="custom-item" :span="10"
          ><span style="font-size: 12px;">组织集成凭证值</span><a-tooltip>
            <template slot="title">填写左侧凭证项对应的值</template>
            <i
              class="icon aufontAll h-icon-all-question-circle-o"
              style="margin-left: 5px"
            ></i> </a-tooltip
        ></a-col>
        <a-col class="custom-item" :span="2">操作</a-col>
      </a-row>
      <a-row
        type="flex"
        class="align-center"
        v-for="(row, index) in customParamList"
        :key="index"
      >
        <a-col class="custom-item" :span="10">
          <a-input v-model="row.customKey" placeholder="请输入"></a-input>
        </a-col>
        <a-col class="custom-item" :span="10">
          <a-input v-model="row.value" placeholder="请输入"></a-input>
        </a-col>
        <a-col class="custom-item" :span="2">
          <span class="delete" @click="delRow(index)">
            <i class="icon aufontAll h-icon-all-delete-o"></i>
          </span>
        </a-col>
      </a-row>
      <div class="add">
        <span @click="addRows"
          ><i class="icon aufontAll h-icon-all-plus-o"></i>新增</span
        >
      </div>
    </div>
    <a-divider v-show="syncType !== 3" />
    <div class="btn-wrap">
      <a-button type="primary" @click="confirm">保存</a-button>
    </div>

    <div v-show="syncType !== 3">
      <h3 class="vice-title">
        <span v-show="syncType === 0 || syncType === 1">钉钉</span
        ><span v-show="syncType === 2">企业微信</span>集成参数
      </h3>
      <div v-show="syncType === 0 || syncType === 1" class="vice-tips">云枢与钉钉绑定所需参数</div>
      <a-row v-if="syncType !== 1" class="item-wrap">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> CorpId
        </a-col>
        <a-col :span="18">
          <a-input
            ref="corpId"
            :disabled="isDisabled"
            placeholder="Corpid"
            v-model="formInfo.corpId"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span>
          <template v-if="syncType === 2">Provider_Secret</template>
          <template v-else>SSOSecret</template>
        </a-col>
        <a-col :span="18">
          <a-input
            ref="corpSecret"
            :placeholder="syncType === 2 ? 'Provider_Secret' : 'SSOSecret'"
            v-model="formInfo.corpSecret"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> Agentld
        </a-col>
        <a-col :span="18">
          <a-input
            ref="agentId"
            placeholder="Agentld"
            v-model="formInfo.agentId"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap" v-if="syncType !== 2">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> AppKey
        </a-col>
        <a-col :span="18">
          <a-input
            ref="appkey"
            placeholder="AppKey"
            v-model="formInfo.appkey"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> AppSecret
        </a-col>
        <a-col :span="18">
          <a-input
            ref="appSecret"
            placeholder="AppSecret"
            v-model="formInfo.appSecret"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap" v-if="syncType !== 2">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> 扫码登录 appID
        </a-col>
        <a-col :span="18">
          <a-input
            ref="scanAppId"
            placeholder="扫码登录 appID"
            v-model="formInfo.scanAppId"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap" v-if="syncType !== 2">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> 扫码登录 appSecret
        </a-col>
        <a-col :span="18">
          <a-input
            ref="scanAppSecret"
            placeholder="扫码登录 appSecret"
            v-model="formInfo.scanAppSecret"
          />
        </a-col>
      </a-row>

      <a-row class="item-wrap" v-if="syncType !== 1">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> 增量回调地址
        </a-col>
        <a-col :span="18">
          <a-input
            ref="redirectUri"
            placeholder="增量回调地址"
            v-model="formInfo.redirectUri"
          />
        </a-col>
      </a-row>
      <a-row class="item-wrap" v-if="syncType !== 2">
        <a-col :span="6" class="item-title">
          <span v-show="isRequired" class="red">*</span> PC端首页登录地址
        </a-col>
        <a-col :span="18">
          <a-input
            ref="pcServerUrl"
            placeholder="PC端首页登录地址"
            v-model="formInfo.pcServerUrl"
          />
        </a-col>
      </a-row>

      <div v-if="syncType === 0">
        <a-row class="item-wrap" v-for="item in checkedBook" :key="item.key">
          <a-col :span="6" class="item-title">
            <span v-show="isRequired" class="red">*</span>{{item.name}}
          </a-col>
          <a-col :span="18">
            <a-input
              :ref="item.key"
              placeholder="通讯录ID"
              :disabled="item.key=== 'edu' || item.key=== 'citizen'"
              v-model="item.rootId"
            />
          </a-col>
        </a-row>
      </div>

      <div class="btn-wrap">
        <a-button v-if="syncType !== 1" @click="connect">链接测试</a-button>
        <a-button type="primary" @click="confirm">确定</a-button>
      </div>
    </div>
    <a-modal
    title="通讯录设置"
    width="540px"
    :visible="visible"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="handleOk"
    >
      <a-row class="book-list">
        <template>
          <draggable :list="options" :options="dragOptions" handle=".handles">
              <a-row
                v-for="(modulem, index) in options"
                :key="index"
                class="rowStyle"
              >
                <a-col :span="20">
                  <a-input
                    placeholder="请输入自定义通讯录名称"
                    class="input"
                    :disabled="modulem.key === 'edu' || modulem.key === 'citizen'"
                    v-model="modulem.name"
                  />
                </a-col>
                <a-col v-if="modulem.key !== 'edu' && modulem.key !== 'citizen'" :span="4" style="text-align: center">
                  <span class="icon aufontAll handles">&#xe63e;</span>
                  <span class="delete" @click="deleteRow(index)">
                    <a-icon type="delete" />
                  </span>
                </a-col>
              </a-row>
            </draggable>
        </template>
        <a-row class="option-row">
          <a-col :span="24">
            <span @click="addRow" class="addBtn">
              <i class="icon aufontAll h-icon-all-plus-o"></i>
              <span>添加通讯录</span>
            </span>
          </a-col>
        </a-row>
      </a-row>
    </a-modal>
  </a-form>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Emit,
  PropSync,
} from "vue-property-decorator";
import { State, namespace } from "vuex-class";
import StaffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import OrgApi from "@/apis/organization";
import systemApi from "@/apis/system/system-manager.api";
import env from "@/env.ts";
import Draggable from "vuedraggable";
import CheckDingtalk from "./check-dingtalk.vue";
import cloneDeep from "lodash/cloneDeep";

const UserModule = namespace("System/User");

export interface CustomItem {
  customKey: string;
  value: string;
}

@Component({
  name: "add-organization",
  components: {
    StaffSelector,
    Draggable
  },
})
export default class Error extends Vue {
  @Prop({ default: 0 }) info!: any;
  @Prop() isDisabled!: boolean;

  @UserModule.State("loginedUserInfo") loginedUserInfo!: any;
  // @Prop() showAddDepart!:any = false;
  dragOptions: any = {
    animation: 150,
    ghostClass: "ghostClass",
    forceFallback: true,
    fallbackClass: "dragClass",
    touchStartThreshold: 20,
    delay: 100,
  };
  options:Array<any> = [
    {
      name: '家校通讯录',
      key: 'edu',
      rootId: '-7',
      enable: false
    },
    {
      name: '居民通讯录',
      key: 'citizen',
      rootId: '-7',
      enable: false
    }
  ];
  parentDepart: Array<any> = [];
  value: any = 1;
  syncType: number = 0;
  customParamList: Array<CustomItem> = [
    {
      customKey: "",
      value: "",
    },
  ];
  customType: string = "";
  formInfo: any = {
    agentId: "",
    appSecret: "",
    appkey: "",
    corpId: "",
    corpSecret: "",
    exportHost: "",
    mobileServerUrl: "",
    modifiedTime: "",
    name: "",
    orgType: "1",
    orgTypeStr: "",
    parentId: "",
    redirectUri: "", // 回调域名
    relatedType: "0",
    relatedTypeStr: "",
    scanAppId: "",
    scanAppSecret: "",
    syncType: 0,
    syncTypeStr: "",
    ssoSecret: "",
    pcServerUrl: env.portalHost,
    adminServerUrl: "",
    ssoServerUrl: "",
    syncConfig: {},
    syncConfigModels: []
  };
  parent: any = null;
  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: "请选择部门",
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: [],
  };
  bookType: Array<any> = [];    //已经勾选的通讯录Key值
  visible: boolean = false; //编辑通讯录弹窗是否显示
  checkedBook: Array<any> = []  //已经勾选的通讯录项

  get isRequired() {
    return this.syncType === 0 || this.syncType === 2;
  }

  @Watch('bookType')
  onBookTypeChange() {
    this.formInfo.syncConfigModels = this.options.map(item => {
      if(this.bookType.includes(item.key)) {
        item.enable = true
      }else{
        item.enable = false
      }
      return item;
    })
    this.checkedBook = this.options.filter(item => this.bookType.includes(item.key)).map(i => {
      i.enable = true
      return i
    });
  }

  @Watch("syncType")
  onSyncTypeChange(v) {
    this.formInfo.syncType = v === 1 ? "PUSH" : "PULL";

    // 微信的组织类型是1，钉钉的组织类型是0
    if (v === 2) {
      this.formInfo.relatedType = "WECHAT";
    } else if (v === 0) {
      this.formInfo.relatedType = "DINGTALK";
    } else if (v === 1) {
      // 自维护暂时写死DINGTALK
      this.formInfo.relatedType = "DINGTALK";
    }
  }

  @PropSync("showAddDepart") syncShowAddDEpart!: any;
  @PropSync("orgList") syncOrgList!: any;
  @Emit()
  cancel() {}
  created() {
    // 如果是编辑的话需要更新数据
    if (this.info) {
      if (this.info.syncType === "PUSH") {
        this.syncType = 1;
      } else {
        if (this.info.relatedType === "WECHAT") {
          this.syncType = 2;
        } else if (this.info.relatedType === "DINGTALK") {
          this.syncType = 0;
        } else if(this.info.relatedType === "CUSTOMIZE") {
          this.syncType = 3;
        }
      }

      // if (this.info.relatedType === 'WECHAT') {
      //   this.syncType = 2;
      // } else if (this.info.relatedType === 'DINGTALK') {
      //   this.syncType = 0;
      // } else {
      //   this.syncType = 1;
      // }

      this.formInfo = { ...this.formInfo, ...this.info };
      this.formInfo.syncType = this.formInfo.syncType === "PUSH" ? 1 : 0;
      this.parent = this.info.parentDept;
      //自定义类型下没有通讯录信息，不判断则报错
      this.formInfo.syncConfigModels = this.formInfo.syncConfigModels?this.formInfo.syncConfigModels:[];
      this.checkedBook = this.formInfo.syncConfigModels.filter(item => item.enable === true);
      this.options = this.formInfo.syncConfigModels;
      this.bookType = this.checkedBook.map(i => { return i.key })
      this.deptOpts.isInit = true;
      this.customType = this.info.customizeRelateType;
      this.info.syncConfig = this.info.syncConfig ? this.info.syncConfig : '{}';
      // @ts-ignore
      this.customParamList = Object.entries(JSON.parse(this.info.syncConfig)).map(item => {
        return { customKey: item[0], value: item[1] }
      });
      if (this.parent) {
        this.deptOpts.selected = [this.parent];
      }
    }
    // 无部门
    if (!this.formInfo.parentId) {
      this.formInfo.parentId = "none";
    }
  }
  mounted() {
    // this.getPortalSetting();
  }

  handleOk() {
    const empty = this.options.find(item => item.name === '')
    if(empty) {
      this.$message.error('名称不能为空')
      return
    }
    this.visible = false;
  }

  bookTypeChange() {

  }

  closeModal() {
    this.visible = false
    this.options = this.options.filter(item => item.name);
  }

  addRow() {
    const el: any = this.$refs.condionwrap;
    const obj = {
      key: `other${this.options.length + 1}`,
      name: "",
      rootId: '',
      enable: false
    };
    this.options.push(obj);
    console.log(this.options, "this.options");
    setTimeout(() => {
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 10);
  }

  // 父级组织id
  onChange(depart: any) {
    if (depart.length > 0) {
      this.formInfo.parentDept = depart[0];
      this.formInfo.parentId = depart[0].id;
    } else {
      this.formInfo.parentDept = null;
      this.formInfo.parentId = "none";
    }
  }

  addBook() {
    this.visible = true;
  }

  toggleCheckedBook(item){
    switch (item.key) {
      case 'edu':
        let idx = this.bookType.findIndex((x) => x === 'citizen');
        if(idx>-1){
          this.bookType.splice(idx, 1);
        }
        break;
      case 'citizen':
        let eduidx = this.bookType.findIndex((x) => x === 'edu');
        if(eduidx>-1){
          this.bookType.splice(eduidx, 1);
        }
        break;
      default:
        break;
    }
  }

  deleteRow(index: number) {
    this.options.splice(index, 1);
    this.checkedBook = this.options.filter(item => this.bookType.includes(item.key)).map(i => {
      i.enable = true
      return i
    });
     this.bookType = this.checkedBook.map(i => { return i.key });
  }
  /**
   * @desc 组织同步切换
   */
  syncChange(...args) {
    // console.log('...arges', args)
  }

  // 参数错误提示
  errMpas() {
    // 钉钉集成参数错误提示
    const dingTalkErrMpas: any = {
      corpId: "请输入CorpId",
      corpSecret: "请输入SSOSecret",
      agentId: "请输入AgentId",
      appkey: "请输入Appkey",
      appSecret: "请输入AppSecret",
      scanAppId: "请输入扫码登录AppID",
      scanAppSecret: "请输入扫码登录AppSecret",
      redirectUri: "请输入增量回调地址",
      pcServerUrl: "请输入PC端首页登录地址",
    };

    const wechatErrMpas: any = {
      corpId: "请输入CorpId",
      agentId: "请输入AgentId",
      corpSecret: "请输入Provider_Secret",
      appSecret: "请输入AppSecret",
      redirectUri: "请输入增量回调地址",
    };

    return this.syncType === 2 ? wechatErrMpas : dingTalkErrMpas;
  }
  /**
   * 检验钉钉集成参数必填
   * */
  checkDingtalkParams(): boolean {
    const { isRequired, formInfo, errMpas } = this;

    // 如果是非必填，不做校验
    if (!isRequired) return true;

    const errArr = errMpas();

    const needCheckKeys: string[] = Object.keys(errArr) as string[];

    const allkeys: Array<string> = Object.keys(formInfo) as Array<string>;

    let isOk: boolean = true;
    for (let i = 0; i < needCheckKeys.length; i++) {
      const k: string = needCheckKeys[i] as string;
      if (!formInfo[k]) {
        isOk = false;
        this.$message.error(errArr[k]);
        (this.$refs[k] as any).focus();
        break;
      } else {
        isOk = true;
      }
    }

    return isOk;
  }

  addRows() {
    const newRow = {
      customKey: "",
      value: "",
    };
    const newList = [...this.customParamList, newRow];
    this.customParamList = newList;
  }

  delRow(index) {
    const newList = this.customParamList.filter((item, i) => i !== index);
    this.customParamList = newList;
  }

  // 确认提交或者保存
  confirm() {
    if(this.formInfo.name === ''){
      this.$message.error("组织名称必填");
      return;
    }
    if (this.syncType === 3 && !this.customType.trim()) {
      this.$message.error("组织类型编码必填");
      return;
    }

    let params = this.formInfo;
    if(this.syncType !== 0) {
      delete params.syncConfigModels
    } else {
      const empty = this.formInfo.syncConfigModels.find(item => item.rootId === '')
      if(empty) {
        this.$message.error('通讯录ID不能为空')
        return
      }
      this.formInfo.syncConfigModels = this.options;
    }
    let { parentId, name, syncType } = params;
    delete params.parentDept;
    // if (!parentId) {
    //   return this.$message.error('请选择上级部门')
    // }
    if (!name && syncType === 0) {
      this.$message.error("请输入组织名称");
      (this.$refs.orgNameInput as any).focus();
      return;
    }

    if (!this.checkDingtalkParams()) {
      return;
    }

    // 处理父组织为空
    if (parentId === "none") {
      params.parentId = "";
    }

    // 自定义
    if (this.syncType === 3) {
      let obj: any = {}
      this.customParamList.filter((item) => {
        obj[item.customKey] = item.value;
      });
      params.syncConfig = JSON.stringify(obj);
      params.relatedType = 'CUSTOMIZE';
      params.customizeRelateType = this.customType
    } 
    // else {
    //   delete params.syncConfig
    // }

    // 重置数据 去除前后空格，  接口参数 和 表单数据
    Object.keys(this.formInfo).forEach((key: string) => {
      if (typeof this.formInfo[key] === "string") {
        this.formInfo[key] = this.formInfo[key].trim();
        params[key] = params[key].trim();
      }
    });
    if(typeof params.syncConfig === 'object'){
      params.syncConfig = JSON.stringify(params.syncConfig)
    }

    // 如果是编辑
    if (this.info) {
      return this.update(params);
    }
    this.save(params);
    // this.cancel()
  }
  // 新增保存
  async save(params: any) {
    console.log(env, 'env');
    // 如果没有关联组织，第一个添加的为主组织
    if (this.syncOrgList.length === 0) {
      params.orgType = 0;
    }
    // params.pcServerUrl = env.portalHost; // pc端首页地址
    params.mobileServerUrl = params.pcServerUrl ? `${params.pcServerUrl}/mobile` : env.portalHost + `/mobile`; // 移动端应用首页地址
    // params.synRedirectUri = env.apiHost; // 增量同步回调地址
    params.synRedirectUri = params.redirectUri; // 增量同步回调地址

    // @ts-ignore
    let { errcode, errmsg, data } = await OrgApi.addOrgan(params);
    if (errcode !== 0) {
      this.$message.error(errmsg);
    } else {
      this.$message.success(errmsg);
      this.$emit("close");
    }
  }
  // 编辑保存
  async update(params: any) {
    params.mobileServerUrl = `${params.pcServerUrl}/mobile`; // 移动端应用首页地址
    params.synRedirectUri = params.redirectUri; // 增量同步回调地址
    // @ts-ignore
    let { errcode, errmsg, data } = await OrgApi.updateOrgan(params);
    if (errcode !== 0) {
      this.$message.error(errmsg);
    } else {
      this.$message.success(errmsg);
      this.$emit("close");
    }
  }
  /**
   * @desc 获取父级部门
   */
  async getDepart(deptIds: string) {
    // @ts-ignore
    let res: any = await OrgApi.getOrgDepartmentInfo({
      deptIds,
    });

    if (res.errcode !== 0) {
      this.$message.error(res.errmsg);
    } else {
      this.parent = res.data.myDepartment[0];
    }
  }
  getPortalSetting() {
    const vm: any = this;
    systemApi.getPortalSetting().then((res: any) => {
      if (res.data) {
        vm.formInfo = { ...vm.formInfo, ...res.data };
      }
    });
  }
  // 连接测试
  connect() {
    if (!this.checkDingtalkParams()) {
      return;
    }
    const vm: any = this;
    vm.formInfo.mobileServerUrl = `${vm.formInfo.pcServerUrl}/mobile`;
    /* 设置传参 */
    const { oauthHost, redirectHost } = env;
    vm.formInfo.adminServerUrl = redirectHost;
    vm.formInfo.ssoServerUrl = oauthHost + "/login";
    // vm.formInfo.redirectUri = oauthHost + "/login";
    vm.formInfo.synRedirectUri = vm.formInfo.redirectUri;

    systemApi.checkPortalSetting(vm.formInfo).then((res: any) => {
      if (res.errcode === 0) {
        vm.$message.success("连接成功！", 2);
      } else {
        vm.$message.error(res.errmsg, 2);
      }
    });
  }
}
</script>

<style lang="less">
.add-organization {
  .item-wrap {
    display: flex;
    align-items: center;
    height: 50px;
  }
  .item-title {
    text-align: left;
    padding-right: 16px;
    display: flex;
    align-items: center;
  }
  .red {
    color: red;
  }
  .btn-wrap {
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 12px;
    border-top: 1px solid #d9d9d9;
    background: white;
    button {
      margin: 0 6px;
    }
  }
  .vice-title {
    font-size: 14px;
    line-height: 1;
    margin: 24px 0 5px;
    font-weight: bold;
  }
  .vice-tips {
    display: inline-block;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  .custom-params {
    background: #fafafa;
    padding: 8px 24px 16px;
    .custom-item {
      margin-right: 16px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      .delete {
        cursor: pointer;
      }
    }
    .add {
      margin-top: 8px;
      text-align: center;
      color: #17bc94;
      cursor: pointer;
    }
    .align-center {
      align-items: center;
    }
  }

}
.book-list {
  background-color: rgba(244,245,248,.65);
  border-radius: 4px;
  margin-top: 5px;
  .rowStyle {
    line-height: 32px;
    margin: 10px 0;
    padding: 0 0 0 20px;
    .opt-setting {
      color: #17bc94;
      cursor: pointer;
    }
  }
  .handles {
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    margin-right: 10px;
    cursor: move;
  }
  .option-row {
    color: #17bc94;
    text-align: center;
    margin-bottom: 10px;
  }
}
.add-book {
  color: #17bc94;
}

</style>
