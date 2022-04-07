<template>
  <div class="organizetion-relate">
    <templates direction="vertical" :current="-1" class="common-setting__step">
      <template id="app-list0" v-if="syncOrgList.length < 0">
        <div slot="description">
          <img src="@/assets/images/nodata.png" alt="" />
          <p style="text-indent: 106px">暂无关联组织，请联系管理员</p>
        </div>
      </template>
      <!-- 钉钉集成维护和企业微信集成 -->
      <template v-else>
        <!-- 钉钉集成维护 -->
        <template
          v-if="
            (syncParams.relatedType === 'DINGTALK' ||
            syncParams.relatedType === 'OTHER') && syncParams.syncType === 'PULL'
          "
        >
          <template id="app-list1">
            <div slot="description">
              <div class="guide">
                <div class="organizetion-relate__header">
                  <span>钉钉集成</span>
                  <span class="header__tips">
                    组织机构同步使用，需在钉钉中自建应用，开通通讯录权限，并获取应用消息填写在下方
                    <slot name="settingTips" />
                  </span
                  >
                </div>
                <div class="organizetion-relate__form">
                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span
                        >AppKey
                        <a-tooltip
                          :title="'tips：创建的应用的唯一标识，获取地址：钉钉后台，工作台-自建应用--应用设置-基础信息，\
                                  可获取Appkey、APPSecret和AgentId'"
                        >
                          <a-icon type="question-circle-o" /> </a-tooltip
                        >:
                      </span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.appkey || '--'
                      }}</span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>AppSecret:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">
                        <password-span
                          :value="syncParams.appSecret"
                          :fn="showSecret"
                        />
                      </span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>AgentId:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.agentId || '--'
                      }}</span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>回调地址:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span
                        class="organizetion-relate__right--edit"
                        v-if="isNotShowRU"
                      >
                        {{ syncParams.redirectUri || '--' }}
                      </span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>通讯录</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span
                        class="organizetion-relate__right--edit"
                        v-if="isNotShowRU"
                      >
                        {{ getBook(syncParams.syncConfigModels) || '--' }}
                      </span>
                    </a-col>
                  </a-row>
                  <a-row class="organizetion-relate__item" v-for="item in getEnableBook" :key="item.key">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>{{item.name || '--'}}</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span
                        class="organizetion-relate__right--edit"
                      >
                        {{ item.rootId || '--' }}
                      </span>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </div>
          </template>
          <template id="app-list2">
            <div slot="description">
              <div class="guide">
                <div class="organizetion-relate__header">
                  <span>门户访问设置</span>
                  <span class="header__tips"
                    >门户钉钉扫码登录配置，若未配置，系统门户扫码不可用</span
                  >
                  <slot name="settingTips" />
                </div>
                <div class="organizetion-relate__form">
                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span
                        >CorpId
                        <a-tooltip
                          :title="'tips：钉钉企业的唯一标识，获取地址：钉钉后台，工作台-自建应用-开发信息-开发账号管理-企业自用账号信息'"
                        >
                          <a-icon type="question-circle-o" /> </a-tooltip
                        >:
                      </span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.corpId
                      }}</span>
                    </a-col>
                  </a-row>
                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span
                        >SSOSecret
                        <a-tooltip
                          :title="'tips：钉钉企业的唯一标识，获取地址：钉钉后台，工作台-自建应用-开发信息-开发账号管理-企业自用账号信息'"
                        >
                          <a-icon type="question-circle-o" /> </a-tooltip
                        >:
                      </span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.corpSecret
                      }}</span>
                    </a-col>
                  </a-row>
                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>扫码登录 appID</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.scanAppId
                      }}</span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span> 扫码登录 appSecret : </span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">
                        <password-span
                          :value="syncParams.scanAppSecret"
                          :fn="showSecret"
                        />
                      </span>
                    </a-col>
                  </a-row>
                  <a-row class="check-dingtalk__item btn-group-row" v-if="isSuperAdmin">
                    <a-col
                      :span="layout.left"
                      class="check-dingtalk__left"
                    ></a-col>
                    <a-col :span="layout.right" class="check-dingtalk__right">
                      <div class="btn-group">
                        <a-tooltip v-if="canDelete">
                          <span slot="title">组织下有人员、部门和角色组(除默认分组)时不可删除该组织</span>
                          <a-button
                            v-if="isSuperAdmin"
                            class="btn-group__btn"
                            @click="handleDeleteDept"
                            :disabled="canDelete"
                          >
                            删除
                          </a-button>
                        </a-tooltip>
                        <template v-else>
                          <a-button
                            v-if="isSuperAdmin"
                            class="btn-group__btn"
                            @click="handleDeleteDept"
                            :disabled="canDelete"
                          >
                            删除
                          </a-button>
                        </template>
                        <a-button
                          type="primary"
                          :disabled="!syncParams.enabled"
                          class="btn-group__btn"
                          @click="() => (this.showAddDepart = true)"
                          >编辑</a-button
                        >
                        <disabled-user
                          :disabled="syncParams.enabled"
                          :isDisabled="syncParams.isEnableOperat"
                          :id="id"
                          @getOrgList="closeAddDepart"
                        />
                      </div>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </div>
          </template>
        </template>
        <!-- 企业微信集成 -->
        <template v-else-if="syncParams.relatedType === 'WECHAT'">
          <template id="app-list1">
            <div slot="description">
              <div class="guide">
                <div class="organizetion-relate__header">
                  <span>微信集成</span>
                </div>
                <div class="organizetion-relate__form">
                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>CorpId:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.corpId
                      }}</span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>Provider_Secret:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">
                        <password-span
                          :value="syncParams.corpSecret"
                          :fn="showSecret"
                        />
                      </span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>AppSecret:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">
                        <password-span
                          :value="syncParams.appSecret"
                          :fn="showSecret"
                        />
                      </span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>AgentId:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span class="organizetion-relate__right--edit">{{
                        syncParams.agentId
                      }}</span>
                    </a-col>
                  </a-row>

                  <a-row class="organizetion-relate__item">
                    <a-col
                      :span="layout.left"
                      class="organizetion-relate__left"
                    >
                      <span class="required">*</span>
                      <span>回调地址:</span>
                    </a-col>
                    <a-col
                      :span="layout.right"
                      class="organizetion-relate__right"
                    >
                      <span
                        class="organizetion-relate__right--edit"
                        v-if="isNotShowRU"
                      >
                        {{ syncParams.redirectUri || '--' }}
                      </span>
                    </a-col>
                  </a-row>

                  <a-row class="check-dingtalk__item btn-group-row" v-if="isSuperAdmin">
                    <a-col
                      :span="layout.left"
                      class="check-dingtalk__left"
                    ></a-col>
                    <a-col :span="layout.right" class="check-dingtalk__right">
                      <div class="btn-group">
                        <a-tooltip v-if="canDelete">
                          <span slot="title">组织下有人员、部门和角色组(除默认分组)时不可删除该组织</span>
                          <a-button
                            v-if="isSuperAdmin"
                            class="btn-group__btn"
                            @click="handleDeleteDept"
                            :disabled="canDelete"
                          >
                            删除
                          </a-button>
                        </a-tooltip>
                        <template v-else>
                          <a-button
                            v-if="isSuperAdmin"
                            class="btn-group__btn"
                            @click="handleDeleteDept"
                            :disabled="canDelete"
                          >
                            删除
                          </a-button>
                        </template>
                        <a-button
                          :disabled="!syncParams.enabled"
                          type="primary"
                          class="btn-group__btn"
                          @click="() => (this.showAddDepart = true)"
                          >编辑</a-button
                        >
                        <disabled-user
                          :disabled="syncParams.enabled"
                          :isDisabled="syncParams.isEnableOperat"
                          :id="id"
                          @getOrgList="closeAddDepart"
                        />
                      </div>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </div>
          </template>
        </template>

        
      </template>

      <slot name="filerStorage" />
    </templates>
    <!-- 其他组织 -->
    <template v-if="syncParams.relatedType === 'CUSTOMIZE'">
      <div>
        <div class="portal-setting__header">
          <span>基本信息</span>
        </div>
        <a-row class="custom-row">
          <a-col :span="layout.left">
            <span>组织名称</span>
          </a-col>
          <a-col :span="layout.right" class="color85">{{syncParams.name}}</a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col :span="layout.left">
            <span>组织类型编码</span>
          </a-col>
          <a-col :span="layout.right" class="color85">{{syncParams.customizeRelateType}}</a-col>
        </a-row>
         <a-row class="custom-row">
          <a-col :span="layout.left">
            <span>增量回调地址</span>
          </a-col>
          <a-col :span="layout.right" class="color85">{{ syncParams.redirectUri || '--' }}</a-col>
        </a-row>
        <div class="custom-params" v-if="Object.keys(JSON.parse(syncParams.syncConfig)).length">自定义集成参数</div>
        <div class="custom-wrapper" v-if="Object.keys(JSON.parse(syncParams.syncConfig)).length">
          <a-row class="custom-row" >
            <a-col :span="layout.left">
              <span style="font-size: 12px;">组织集成凭证项</span>
            </a-col>
            <a-col :span="layout.right">
              <span style="font-size: 12px;">组织集成凭证值</span></a-col>
          </a-row>
          <a-row class="custom-row" v-for="(val, key, index) in JSON.parse(syncParams.syncConfig)" :key="index">
            <a-col :span="layout.left">
              <span>{{key || '--'}}</span>
            </a-col>
            <a-col :span="layout.right">{{val || '--'}}</a-col>
          </a-row>
        </div>
        <div>
          <a-col :span="layout.left">
          </a-col>
          <a-col :span="layout.right">
            <a-button
            v-if="isSuperAdmin"
            :disabled="!syncParams.enabled"
            type="primary"
            class="btn-group__btn"
            @click="() => (this.showAddDepart = true)"
            >编辑</a-button>
          </a-col>
          
        </div>
      </div>
    </template>
    <!-- 自维护组织 -->
    <template v-else-if="syncParams.syncType === 'PUSH'">
      <div class="check-dingtalk">
        <div class="check-dingtalk__header">
          <span>基本信息</span>
          <div class="header__tips"><slot name="settingTips" /></div>
        </div>
        
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>上级部门</span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ (syncParams.parentDept && syncParams.parentDept.name) || '--' }}</span>
          </a-col>
        </a-row>

        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              CorpId
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.corpId || '--' }}</span>
          </a-col>
        </a-row>
        <div class="check-dingtalk__header">
          <span>自维护向钉钉同步</span>
          <div class="header__tips">云枢与钉钉绑定所需参数<slot name="settingTips" /></div>
        </div>
        
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>SSOSecret</span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.ssoSecret || '--' }}</span>
          </a-col>
        </a-row>

        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              AgentId
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.agentId || '--' }}</span>
          </a-col>
        </a-row>
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              AppKey
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.appKey || '--' }}</span>
          </a-col>
        </a-row>
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              AppSecret
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.appSecret || '--' }}</span>
          </a-col>
        </a-row>
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              扫码登录 appID
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.scanAppId || '--' }}</span>
          </a-col>
        </a-row>
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              扫码登录 appSecret
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.scanAppSecret || '--' }}</span>
          </a-col>
        </a-row>
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              回调地址
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.synRedirectUri || '--' }}</span>
          </a-col>
        </a-row>
        <a-row class="check-dingtalk__item">
          <a-col :span="layout.left" class="check-dingtalk__left">
            <!-- <span class="required">*</span> -->
            <span>
              PC端首页登陆地址
            </span>
          </a-col>
          <a-col :span="layout.right" class="check-dingtalk__right">
            <span class="check-dingtalk__right--edit">{{ syncParams.pcServerUrl || '--'}}</span>
          </a-col>
        </a-row>
      </div>
      <a-row class="check-dingtalk__item" style="margin-top: 38px;">
        <a-col :span="layout.left" class="check-dingtalk__left">
        </a-col>
        <a-col :span="layout.right" class="check-dingtalk__right">
          <div class="btn-group">
            <a-tooltip v-if="canDelete">
              <span slot="title">组织下有人员、部门和角色组(除默认分组)时不可删除该组织</span>
              <a-button
                v-if="isSuperAdmin"
                class="btn-group__btn"
                @click="handleDeleteDept"
                :disabled="canDelete"
              >
                删除
              </a-button>
            </a-tooltip>
            <template v-else>
              <a-button
                v-if="isSuperAdmin"
                class="btn-group__btn"
                @click="handleDeleteDept"
                :disabled="canDelete"
              >
                删除
              </a-button>
            </template>
            <a-button
              v-if="isSuperAdmin"
              :disabled="!syncParams.enabled"
              type="primary"
              class="btn-group__btn"
              @click="() => (this.showAddDepart = true)"
            >编辑</a-button>

            <disabled-user
              :disabled="syncParams.enabled"
              :isDisabled="isSuperAdmin&&syncParams.isEnableOperat"
              :id="id"
              @getOrgList="closeAddDepart"
            />
            <!-- <a-button @click="connect">连接测试</a-button> -->
          </div>
        </a-col>
      </a-row>
      
    </template>

    <a-drawer
      title="编辑关联组织"
      :destroyOnClose="true"
      :visible="showAddDepart"
      @ok="closeAddDepart"
      @close="closeAddDepart"
      :width="860"
      wrapClassName="edit-relative-org-drawer"
    >
      <add-organization
        :isDisabled="syncParams.isEnableOperat"
        :info="syncParams"
        @close="closeAddDepart"
      />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Component, Vue, PropSync, Prop, Watch } from "vue-property-decorator";
import { State, namespace, Mutation } from "vuex-class";
import systemApi from "@/apis/system/system-manager.api";
import PasswordSpan from "@/components/global/password-span.vue";
import AddOrganization from "./add-organization.vue";
import DisabledUser from "./disabled-user.vue";
import OrgApi from "@/apis/organization";
import MainCheck from "./main-check.vue";
import MainSetting from "./main-setting.vue";
import env from "@/env.ts";

const UserModule = namespace("System/User");

@Component({
  name: "organizetion-relate",
  components: {
    AddOrganization,
    PasswordSpan,
    DisabledUser,
    MainCheck,
    MainSetting
  },
})
export default class CheckDingtalk extends Vue {
  @UserModule.State("loginedUserInfo") loginedUserInfo!: any;
  @PropSync("info") syncInfo!: any;
  @PropSync("orgList") syncOrgList!: any;
  @Prop() id!: any;

  @Watch('id', {
    immediate: true
  })
  setOptions(val: string) {
    if(!val) return
    if(this.isSuperAdmin) {
      this.doDeleteCheck()
    }
  }

  layout = {
    left: 5,
    right: 15,
  };
  showAddDepart: boolean = false;
  // 关闭新增关联组织弹窗
  closeAddDepart() {
    this.showAddDepart = false;
    this.$emit("getOrgList");
  }
  corpId: string = "";

  edit: boolean = false;

  params = {
    appSecret: "",
    appkey: "",
    corpId: "",
    corpSecret: "",
    exportHost: "",
    modifiedTime: "",
    name: "",
    orgType: 1,
    orgTypeStr: "",
    parentId: "",
    redirectUri: "",
    relatedType: "0",
    relatedTypeStr: "",
    scanAppId: "",
    scanAppSecret: "",
    syncType: 0,
    syncTypeStr: "",
    ssoSecret: "",
    agentId: "", // 消息推送ID
    pcServerUrl: env.portalHost, // pc端首页地址
    mobileServerUrl: "", // 移动端应用首页地址
    synRedirectUri: env.apiHost, // 增量同步回调地址
    syncConfigModels: [] //通讯录
  };
  get isJustAdmin() {
    return this.$store.state.System.User.isJustAdmin;
  }
  // 处理第一次读不到值得问题
  get syncParams() {
    if (typeof this.syncInfo !== "number" || this.syncOrgList.length === 0) {
      return this.params;
    }
    return this.syncOrgList[this.syncInfo];
  }
  get isSuperAdmin() {
    return (
      this.loginedUserInfo.username === "admin" ||
      this.loginedUserInfo.username === "Admin"
    );
  }

  get isNotShowRU() {
    return !(
      this.syncParams.orgType === "RELEVANCE" &&
      this.syncParams.syncType === "PUSH"
    );
  }
  // 查看appSecret
  showSecret(success: Function) {
    const vm = this;
    if (this.isJustAdmin) {
      this.$confirm({
        title:
          "该信息属于企业高保密信息，相当于个人银行卡及密码，请勿随意传播，请避免企业信息泄露。",
        okText: this.$t("languages.Apps.Continue").toString(),
        cancelText: this.$t("languages.Apps.Cancel").toString(),
        onOk() {
          success();
        },
      });
    } else {
      this.$warning({
        title: "该信息属于企业保密项，如有需要，请联系超级管理员。",
        okText: this.$t("languages.Apps.Good").toString(),
      });
    }
  }

  getBook(arr: any) {
    arr = arr ? arr : [];
    return arr.filter(item => item.enable === true).map(i => i.name).join('，')
  }

  get getEnableBook() {
    this.syncParams.syncConfigModels = this.syncParams.syncConfigModels ? this.syncParams.syncConfigModels : [];
    return this.syncParams.syncConfigModels.filter(item => item.enable === true);
  }

  connect() {
    const vm: any = this;

    let otherParms: any = window.localStorage.getItem("$_orgParams");
    otherParms = !!otherParms ? JSON.parse(otherParms) : {};

    let params: any = { ...vm.params, ...vm.syncParams, ...otherParms };
    // debugger;
    systemApi.checkPortalSetting(params).then((res: any) => {
      if (res.errcode === 0) {
        vm.$message.success("连接成功！", 2);
      } else {
        vm.$message.error(res.errmsg, 2);
      }
    });
  }

  // 删除组织机构
  handleDeleteDept(item: any) {
    const param = {
      id: this.syncParams.id
    }
    const _this = this
    _this.$confirm({
      title: '删除组织后不可还原，是否确定要删除该组织?',
      okText: (this as any).$t("languages.Apps.Ok").toString(),
      cancelText: (this as any).$t("languages.Apps.Cancel").toString(),
      onOk() {
        _this.deleteOrg(param)
      }
    })
  }

  // 删除组织机构
  async deleteOrg(params) {
    // @ts-ignore
    let result: any = await OrgApi.deleteOrgan(params);
    if (result.errcode === 0) {
      this.$message.success(result.errmsg);
      // 刷新列表并回到第一个选项
      this.$emit('refreshList')
    } else {
      this.$message.error(result.errmsg);
    }
  }

  canDelete: boolean = true

  // 查询是否可删
  doDeleteCheck() {
    const params: any = {
      id: this.syncParams.id
    }
    OrgApi.deleteCheck(params).then((res: any) => {
      let { errcode, errmsg } = res;
      if (errcode === 0) {
        this.canDelete = !res.data
      } else {
        this.canDelete = true
        this.$message.error(errmsg);
      }
    });    
  }

  mounted() {
    if (this.syncInfo) {
      this.params = { ...this.params, ...this.syncInfo };
    }
  }
}
</script>

<style lang="less" scoped>
.organizetion-relate {
  text-align: left;
  margin-left: 6px;
  .btn-group {
    display: flex;
  }
  .custom-row {
    color: rgba(0, 0, 0, 0.65);
    // line-height: 32px;
    margin-bottom: 16px;
  }
  .custom-params {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    margin-bottom: 20px;
    padding-top: 4px;
  }
  &__header {
    padding-bottom: 20px;
    position: relative;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }
    .header__tips {
      display: inline-block;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      padding-left: 8px;
    }
  }
  &__form {
    .form__title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      margin: 20px 0;
    }
    .organizetion-relate__item {
      margin-bottom: 16px;
      div {
        float: left;
      }
      .organizetion-relate__left {
        span {
          color: rgba(0, 0, 0, 0.65);
        }
        position: relative;
        .required {
          left: -6px;
          color: #f5222d;
          position: absolute;
        }
        // line-height: 32px;
      }

      .organizetion-relate {
        color: rgba(0, 0, 0, 0.85);
        &--edit {
          line-height: 32px;
        }
        .example {
          font-size: 12px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.45);
          line-height: 22px;
        }
      }
    }
  }
}

.check-dingtalk {
  text-align: left;
  // margin-top: 20px;
  &__header {
    a {
      display: inline-block;
      font-size: 12px;
      color: @primary-color;
      padding-left: 8px;
    }
    position: relative;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }
  }
  .header__tips {
    display: inline-block;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    padding-left: 8px;
    margin-bottom: 20px;
  }
  &__item {
      margin-bottom: 16px;
      div {
        float: left;
      }
      .check-dingtalk__left {
        span {
          color: rgba(0, 0, 0, 0.65);
        }
        position: relative;
        // line-height: 32px;
      }

      .check-dingtalk__right {
        color: rgba(0, 0, 0, 0.85);
        // &--edit {
        //   line-height: 32px;
        // }
      }
    }
}

.portal-setting {
  text-align: left;
  &__header {
    margin-bottom: 20px;
    a {
      display: inline-block;
      font-size: 12px;
      color: @primary-color;
      padding-left: 8px;
    }
    position: relative;
    // font-size:18px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
      // padding-left: 14px;
      // &:before{
      // 	content: "";
      // 	position: absolute;
      // 	height: 20px;
      // 	width: 0;
      // 	top: 3px;
      // 	left: 0;
      // 	border-left: 3px solid @primary-color;
      // }
    }
  }
  .header__tips {
    display: inline-block;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    padding-left: 8px;
  }
  &__form {
    .portal-setting__item {
      margin-bottom: 16px;
      div {
        float: left;
      }
      .portal-setting__left {
        span {
          color: rgba(0, 0, 0, 0.65);
        }
        position: relative;
        .required {
          left: -6px;
          color: #f5222d;
          position: absolute;
        }
        // line-height: 32px;
      }
      .portal-setting__right {
        // line-height: 32px;
        color: rgba(0, 0, 0, 0.85);
        // &--edit {
        //   line-height: 32px;
        // }
      }
    }
  }
}
.custom-wrapper{
  padding: 16px 16px 1px;
  margin-bottom: 16px;
  margin-left: -16px;
  position: relative;
  &::after{
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 50%;
    background-color: #f4f5f8;
    z-index: 0;
  }
  .custom-row{
    position: relative;
    z-index: 1;
  }
}
.color85{
  color: rgba(0, 0, 0, 0.85);
}
</style>

<style lang="less">
.edit-relative-org-drawer {
  .ant-drawer-wrapper-body {
    height: calc(100% - 57px) !important;
  }

  .ant-drawer-body {
    height: auto !important;
  }
}
</style>
