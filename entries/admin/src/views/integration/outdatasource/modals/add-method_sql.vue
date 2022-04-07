<template>
  <div class="add-method">
    <section class="add-method__block">
      <div class="add-method__form">
        <h3 class="add-method__title">基本信息</h3>
        <div class="add-method__item">
          <span class="label-required">方法编码：</span>
          <p v-show="method">
            <template v-if="id">{{ form.code }}</template>
            <form-input
              v-else
              v-model="form.code"
              placeholder="请填写编码，例：bpmH3_01"
              :rules="rules.code"
            />
          </p>
        </div>
        <div class="add-method__item">
          <span class="label-required">方法名称：</span>
          <p>
            <form-input v-model="form.name" placeholder="请填写" :rules="rules.name" />
          </p>
        </div>
        <!-- 服务类型 -->
        <div class="add-method__item">
          <span>服务类型：</span>
          <p>
            <a-radio-group
              name="radioGroup"
              v-model="form.shared"
            >
              <a-radio :value="false">私有</a-radio>
              <a-radio :value="true">共享</a-radio>
            </a-radio-group>
          </p>
        </div>

        <div class="add-method__item" v-if="form.shared">
          <span>共享人员：</span>
          <p>
            <a-select show-search allowClear mode="multiple" optionFilterProp="title" v-model="form.userIdList">
              <a-select-option
                v-for="(user, index) in appManagers"
                :key="index"
                :value="user.id"
                :title="user.name"
                :disabled="user.disabled"
              >{{ user.name }}</a-select-option>
            </a-select>
          </p>
        </div>        

      </div>

      <div class="add-method__form">
        <div class="add-method__title">属性名称</div>
        <div class="add-method__item add-method__item--full">
          <span class="label-required">数据源</span>
          <p>
            <!-- 
              TODO: 添加返回值类型字段
            -->
            <a-select show-search v-model="dataBaseConnectId">
              <a-select-option
                v-for="item in poolList"
                :value="item.id"
                :key="item.id"
              >{{ item.name }}</a-select-option>
            </a-select>
          </p>
        </div>
        <div class="add-method__item add-method__item--full add-method__item--top">
          <span class="label-required">Sql语句：</span>
          <p>
            <form-input
              v-model="sqlConfig"
              :textarea="true"
              :maxLength="2000"
              :autosize="{ minRows:3,maxRows:3 }"
              :rules="rules.sql"
              @change="onSqlContentChange"
            />
          </p>
        </div>
      </div>

      <div class="add-method__form">
        <div class="add-method__title">Sql参数</div>
        <div class="add-method__item">
        <a-table
          :columns="columns"
          :dataSource="inputParamConfigList"
          :pagination="false"
          :scroll="{ y: 500 }"
          :locale="{emptyText: ''}"
          size="small"
          rowKey="sortKey"
          class="param-table"
        >
          <!-- 表头 -->
          <span class="text-ellipsis" slot="indexTitle">序号</span>
          <span class="text-ellipsis resize" slot="codeTitle">参数名称</span>
          <span class="text-ellipsis resize" slot="nameTitle">显示名称</span>
          <span class="text-ellipsis resize" slot="operatorTitle">
            逻辑关系
            <a-tooltip placement="top" title="请选择SQL中对应参数的逻辑关系">
              <a-icon type="question-circle-o"/>
            </a-tooltip>
            </span>
          <span class="text-ellipsis resize" slot="typeTitle">参数类型</span>
          <span class="text-ellipsis resize" slot="valueTitle">参数值</span>
          <!-- 表体 -->
          
            <!-- :tipPosition="(currentMethodTab === item.methodCode && item.currentParamTab === 'input') && 'top'" -->
            <!-- :noMessage="currentMethodTab !== item.methodCode" -->
          <form-input
            slot="name"
            slot-scope="text,record"
            v-model="record.name"
            :rules="rules.value"
            :ref="`form-input-arg-name-${record.sortKey}`"
          />
          <a-select
            slot="operator"
            slot-scope="text,record"
            :placeholder="$t('languages.PlaceHolder.Select')"
            v-model="record.operator">
            <a-select-option
              v-for="item in operatorList"
              :value="item.value"
              :key="item.value"
              >{{ item.label }}</a-select-option>
          </a-select>
          <a-select
            slot="type"
            slot-scope="text,record"
            v-model="record.type"
            :options="typeList"
            @change="()=>{record.value=''}"
          />
          <template slot="value" slot-scope="text,record">
            <template v-if="record.type == 'NUMBER'">
              <div class="form-input" :class="{'has-error':!record.value}">
                <a-input
                type="text"
                v-model="record.value"
                :maxLength="50"
                @change="()=>{
                  record.value = record.value.replace(/[^\d]/g,'');
                }"
                placeholder="请输入"></a-input>
                <p v-if="!record.value" class="form-input__message">请填写内容</p>
              </div>
            </template>
            <template v-else-if="record.type == 'STRING'">
              <div class="form-input" :class="{'has-error':!record.value}">
                <a-input
                type="text"
                v-model="record.value"
                :maxLength="50"
                @change="()=>{
                  record.value = record.value.trim();
                }"
                placeholder="请输入"></a-input>
                <p v-if="!record.value" class="form-input__message">请填写内容</p>
              </div>
            </template>
            <template v-else>
              <a-date-picker
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm:ss"
                show-time
                v-model="record.value"
                placeholder="请选择日期" />
            </template>
          </template>
        </a-table>
        </div>
      </div>

    </section>
    <div class="add-method__footer">
      <template v-if="isOperation(method)">
        <a-button type="default" @click="$emit('close')">关闭</a-button>
      </template>
      <template v-else>
        <a-button @click="saveAndTest">测试</a-button>
        <a-button type="primary" @click="save()">保存</a-button>
      </template>
    </div>
    <!-- 底线 -->
    <div class="add-method__blank" ref="footLine"></div>
  </div>
</template>
<script lang="ts">
import serviceApi from '@/apis/biz-service/service.api';
import * as BizSql from '@/apis/biz-sql/index';
import { nameValidator, pattern } from '@/common/utils';
import FormInput from '@/components/global/form-input/index.vue';
import sqlParser from '@/utils/sql-parser';
import moment from 'moment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  namespace
} from 'vuex-class';
import { Tooltip } from "@h3/antd-vue";

const DSMethodsModule = namespace('Integration/OutdatasourceMethods');
const UserModule = namespace('System/User');
@Component({
  name: 'add-method',
  components: {
    FormInput,
    ATooltip: Tooltip
  }
})
export default class AddMethod extends Vue {
  @DSMethodsModule.State('paramTypes') paramTypes: any;

  @DSMethodsModule.Action('createDatasourceMethods') createDatasourceMethods: any;

  @DSMethodsModule.Action('updateDatasourceMethods') updateDatasourceMethods: any;

  @DSMethodsModule.Action('getParamTypes') getParamTypes: any;

  @Prop() datasourceCategoryId?: string;
  
  @Prop() poolList!: any;

  @Prop() method!: any;

  @Prop() service!: any;

  @Prop() sourceItem!: any;

  @UserModule.State('isJustAdmin') isJustAdmin!: boolean;

  @UserModule.State('loginedUserInfo') loginedUserInfo!: any;

    /**
   * 按钮操作权限
   */
  isOperation(e: any): boolean {
    if (!e || !Object.keys(e).length) {
      return false;
    }
    if (this.isJustAdmin || e.createdBy === this.loginedUserInfo.id || this.loginedUserInfo.permissions.includes('SYS_MNG')) {
      // 历史数据不做处理 admin账号、方法创建人不做处理
      return false;
    } else {
      return true;
    }
  }

  dataBaseConnectId: string = this.poolList.length>0?this.poolList[0].id:"";

  sqlConfig: string = '';

  id: string = '';

  adapterType: number | undefined = undefined;
  // @ts-ignore
  form: BizService.Datasource.CreateParams = {
    code: '',
    name: '',
    datasourceCategoryId: '',
    sqlConfig: '',
    dataBaseConnectId: '',
    shared: false,
    // 选择的用户id列表
    userIdList: [],
    inputParamConfig: '', //Sql参数
  };

  userIdList: any[] | null = [];

  appManagers:any[] = [];

  // 规则
  rules: any = {
    code: [
      {
        required: true,
        message: '请填写方法编码'
      },
      {
        pattern: pattern('code'),
        message: '以字母开头,包括字母或下划线或数字,不超过28个字符'
      }
    ],
    name: [
      {
        required: true,
        message: '请填写方法名称'
      },
      {
        validator: nameValidator,
        message: '仅限50个字符以内，并不能以空格开头'
      }
    ],
    value: [
      {
        required: true,
        message: '请填写内容'
      },
      {
        validator: nameValidator,
        message: '不能以空格开头'
      }
    ],
    sql: [{
      required: true,
      message: '请填写Sql语句'
    }],
    dataBaseConnectId: [
      {
        required: true,
        message: '请选择数据库连接池'
      }
    ]

  };

  // 枚举信息： 选人控件5、附件6、子表8
  enums: any = {
    xuanrenkongjian: 5,
    attachment: 6,
    zibiao: 8,
    StaffMulti: 51, // 人员多选
    DeptSingle: 60, // 部门单选
    DeptMulti: 61, // 部门单选
    StaffSingle: 50, // 人员单选
    StaffDeptMix: 5 // 混合选人
  };

  //参数类型元数据
  typeList: any = [{
    label:'文本',
    value:'STRING'
  },{
    label:'数值',
    value:'NUMBER'
  },{
    label:'日期',
    value:'DATE'
  }];

  //逻辑关系元数据
  operatorList:any = [{
    label: '等于',
    value: 'EQUAL'
  },{
    label: '不等于',
    value: 'NOTEQUAL'
  },{
    label: '属于',
    value: 'IN'
  }, {
    label: '不属于',
    value: 'NOTIN'
  }, {
    label: '小于',
    value: 'BELOW'
  },{
    label: '小于等于',
    value: 'NOTABOVE'
  },{
    label: '大于',
    value: 'ABOVE'
  }, {
    label: '大于等于',
    value: 'NOTBELOW'
  }];

  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      key: 'index',
      width: 78,
      align: 'center',
    },
    {
      dataIndex: 'code',
      slots: { title: 'codeTitle' },
      key: 'code',
      width: 150,
    },
    {
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
      key: 'name',
      width: 150,
    },
    {
      dataIndex: 'operator',
      slots: { title: 'operatorTitle' },
      scopedSlots: { customRender: 'operator' },
      key: 'operator',
      width: 120,
    },
    {
      dataIndex: 'type',
      slots: { title: 'typeTitle' },
      scopedSlots: { customRender: 'type' },
      key: 'type',
      width: 110,
    },
    {
      dataIndex: 'value',
      slots: { title: 'valueTitle' },
      scopedSlots: { customRender: 'value' },
      key: 'value',
      width: 190,
    },
  ];
  inputParamConfigList:BizService.Method.sqlParam[] = []; //报表动态参数

  /**
 * 校验表单填写内容
 */
  validateForm() {
    return new Promise((resolve, reject) => {
      let hasError: boolean = false;
      const list: any[] = [];

      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-arg/.test(key)) {
          list.push(this.$refs[key]);
        }
      });

      const inputs: any[] = this.$vnode.componentInstance
        ? this.$vnode.componentInstance.$children.filter((el: any) => el.$el.className.includes('form-input'))
        : [];
      list.push(...inputs);
      list.forEach((node: any) => {
        const unValidated: boolean = node.validateValue({ target: { value: node.content } });
        if (unValidated) {
          hasError = true;
        }
      });

      if (hasError) {
        reject(new Error('validate failed'));
      } else {
        resolve();
      }
    });
  }

  resetFormInput() {
    const list: any[] = [];
    list.forEach((node: any) => {
      node.reset();
    });
  }

  /**
 * 保存方法
 * @param callback 保存后回调
 */
  save(callback?: Function) {
    // 校验表单
    this.validateForm()
      .then(async () => {
        this.form.datasourceCategoryId = this.datasourceCategoryId;
        this.form.dataBaseConnectId = this.dataBaseConnectId;
        this.form.sqlConfig = this.sqlConfig;

        let operatorNull = this.inputParamConfigList.some((record: any) => !record.operator);
        if(operatorNull){
          this.$message.error('请选择逻辑关系！');
          return;
        }

        let recordNull = this.inputParamConfigList.some((record: any) => (record.type === 'STRING' || record.type === 'NUMBER') && !record.value);
        if(recordNull){
          this.$message.error('请填写内容！');
          return;
        }

        let dateNull = this.inputParamConfigList.some((record: any) => record.type === 'DATE' && !record.value);
        if(dateNull){
          this.$message.error('请选择日期！');
          return;
        }
        this.form.inputParamConfig = JSON.stringify(this.inputParamConfigList.map((item:any) => {
          let value:any = [];
          if(item.type === 'DATE'){
            value = [moment(item.value)];
          } else{
            if(item.value && item.value.indexOf(',') > -1){
              value = item.value.split(',');
            } else{
              value = [item.value];
            }
          }
          return {
            code: item.code,
            name: item.name,
            operator: item.operator,
            type: item.type,
            value: value
          }
        }));
        if (!this.form.shared) {
          this.form.userIdList = [];
        }
        let res: any = null;
        
        if (this.id) {
          res = await this.updateDatasourceMethods({
            ...this.form,
            id: this.id,
          });
        } else {
          res = await this.createDatasourceMethods(this.form);
        }
        if (res && res.errcode === 0) {
          /**
           * 如果为更新，则检查是否有关联业务方法并提示手动更新 2019-06-20
           */
          let bindCount: number = 0;
          if (this.id) {
            // bindCount = await this.checkBindStatusAndAlert();
          }
          /**
           * 新建后返回的数据重新初始化到界面，以便再次编辑
           */
          if (res.data) {
            this.initialData(res.data);
          }
          if (callback) {
            callback();
          } else {
            this.$emit('submit', bindCount);
          }
        } else {
          const errmsg = res.errcode === 500105 ? '方法编码重复' : res.errmsg;
          this.$message.error(errmsg);
        }
      })
      .catch(() => { });
  }

  checkBindStatusAndAlert() {
    console.log('check bind status');
    return serviceApi.getServiceBizBindInfo({
      serviceCode: this.service.code,
      serviceMethodCode: this.method.code
    }).then((res: any) => {
      console.log('check result:', res);
      if (res.errcode === 0 && res.data) {
        // this.$warning({
        //   title: '更新提示',
        //   content: '更新成功！该集成方法关联的业务方法需手动更新。',
        //   okText: this.$t('languages.Apps.Ok').toString(),
        // });
        // this.$message.success('更新成功！该集成方法关联的业务方法需手动更新。');
        return res.data;
      }
    });
  }

  /**
 * 测试连接
 */
  saveAndTest() {
    this.validateForm().then(()=>{
      this.form.datasourceCategoryId = this.datasourceCategoryId;
      this.form.dataBaseConnectId = this.dataBaseConnectId;
      this.form.sqlConfig = this.sqlConfig;

      let operatorNull = this.inputParamConfigList.some((record: any) => !record.operator);
      if(operatorNull){
        this.$message.error('请选择逻辑关系！');
        return;
      }

      let recordNull = this.inputParamConfigList.some((record: any) => (record.type === 'STRING' || record.type === 'NUMBER') && !record.value);
      if(recordNull){
        // this.$message.error('请填写内容！')
        return;
      }

      let dateNull = this.inputParamConfigList.some((record: any) => record.type === 'DATE' && !record.value);
      if(dateNull){
        this.$message.error('请选择日期！');
        return;
      }

      this.form.inputParamConfig = JSON.stringify(this.inputParamConfigList.map((item:any) => {
        let value:any = [];
        if(item.type === 'DATE'){
          value = [moment(item.value)];
        } else{
          if(item.value && item.value.indexOf(',') > -1){
            value = item.value.split(',');
          } else{
            value = [item.value];
          }
        }
        return {
          code: item.code,
          name: item.name,
          operator: item.operator,
          type: item.type,
          value: value
        }
      }));

      this.$emit('test', {
        ...this.form
      });
    }).catch(() => { });
  }

  /**
 * 解析编辑时带入的方法数据
 */
  parseJson(jsonString: string, argName: string) {
    try {
      this.$set(this, argName, JSON.parse(jsonString));
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 通过解析到的code列表重置 传入/返回 参数列表 
   */
  updateParamListByCodes(codes: Array<string>, dataKey: string) {
    const targetList = this[dataKey];
    const paramsList = codes.map((code: string, idx: number) => {
      const existItem = targetList.find((param: BizService.Method.sqlParam) => param.code === code);
      const index = idx + 1;
      if (existItem) {
        return {
          ...existItem,
          index
        }
      } else {
        return {
          code,
          name: code,
          operator: undefined,
          type: 'STRING',
          value: '',
          index,
          sortKey: Date.now().toString() + idx,
        }
      }
    });
    console.log(paramsList);
    this.$set(this, dataKey, paramsList);
  }

  /**
 * 初始化数据
 */
  initialData(data: BizService.Datasource.Item) {
    this.dataBaseConnectId=data.dataBaseConnectId;
    this.sqlConfig=data.sqlConfig;
    Object.keys(this.form).forEach((key: string) => {
      this.$set(this.form, key, (data as any)[key] || '');
    });
    if(data.configJson){
      this.parseJson(data.configJson, 'configs');
    }
    //显示动态参数列表
    if(data.inputParamConfig){
      this.parseJson(data.inputParamConfig, 'inputParamConfigList');
      if (this.inputParamConfigList.length) {
        this.inputParamConfigList.forEach((item: any, index: number) => {
          let value:any;
          if(item.value.length >0){
            value = item.value[0];
          }
          if(item.value.length >1){
            value = item.value.join(',');
          }
          item.index = index + 1;
          item.sortKey = Date.now().toString() + index;
          item.value = value;
        });
      }
    }

    this.id = data.id;
    this.$set(this.form, 'shared', data.shared || false);
    this.$set(this.form, 'userIdList', data.userIdList || []);
  }

  mounted() {
    this.getParamTypes();
    this.getAPPManagers();

    if (!this.form.userIdList) {
      this.form.userIdList = [];
    }

    if (this.method && this.method.id) {
      this.initialData(this.method);
    }
  }

    /**
   * 获取应用管理员
   * */ 
  async getAPPManagers(){
    const selectUserIds:string = this.method.userIdList ? this.method.userIdList.join(',') : '';
    // console.log(this.method)
    const res:any = await BizSql.getAppManagers(selectUserIds);
    const { errcode, data, errmsg } = res;
    data.forEach((item:any) => {
      item.disabled = !item.select;
    })
    if (errcode === 0)  {
      this.appManagers = data || [];
    } else {
      this.$message.error(errmsg)
    }
  }

  parserSqlTask: any = null;

  onSqlContentChange() {
    if(!this.sqlConfig) return;
    clearTimeout(this.parserSqlTask);
    this.parserSqlTask = setTimeout(() => {
      this.parserSqlContent();
    }, 500);
  }

    /**
   * 解析sql语句，提取入参
   */
  parserSqlContent() {
    const res = sqlParser(this.sqlConfig);
    const {
      inputParams
    } = res;
    // 将入参自动更新到当前入参列表
    if (Array.isArray(inputParams)) {
      this.updateParamListByCodes(inputParams, 'inputParamConfigList');
    }
  }
}
</script>
<style lang="less" scoped>
.param-table /deep/ .ant-table-tbody .ant-table-row{
  height: 70px;
}
.add-method {
  &__title {
    font-weight: 600;
  }
  &__form {
    padding-bottom: 24px;
    &:not(:only-child) {
      &:not(:first-child) {
        padding-top: 24px;
        border-top: 1px solid #e8e8e8;
      }
    }
  }
  &__item {
    display: flex;
    align-items: center;
    margin-top: 20px;
    color: rgba(0, 0, 0, 0.65);
    &--full {
      > p {
        flex: 1;
      }
    }
    &--top {
      align-items: flex-start;
    }
    > span {
      display: inline-block;
      width: 130px;
      margin-right: 5px;
    }
    > p {
      width: 306px;
    }
    /deep/.ant-select {
      width: 100%;
    }
  }
  &__footer {
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    line-height: 50px;
    border-top: 1px solid #e8e8e8;
    text-align: center;
    background: #fff;
    button:not(:last-child) {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
  &__btn {
    padding: 14px 0;
    background-color: #fff;
    text-align: center;
    user-select: none;
    span {
      display: inline-block;
      cursor: pointer;
    }
    i {
      margin-right: 9px;
      font-size: 12px;
    }
    color: @primary-color;
  }
  &__table {
    // /deep/.ant-table-thead span {
    //   display: block;
    //   height: 22px;
    //   line-height: 22px;
    //   font-weight: 600;
    //   color: rgba(0,0,0,0.65);
    // }
    /deep/.ant-select {
      width: 100%;
    }
    /deep/.ant-table-body {
      color: rgba(0, 0, 0, 0.85);
      max-height: inherit !important;
    }
    /deep/.ant-table-footer {
      padding: 0;
      background: none;
    }
    /deep/.ant-table-placeholder {
      display: none;
    }
  }
  /deep/.ant-tabs {
    color: rgba(0, 0, 0, 0.65);
  }
  .form-input{
    position: relative;
    .form-input__message {
      position: absolute;
      left: 0;
      right: 0;
      padding-top: 2px;
      font-size: 12px;
      font-family: PingFang-SC-Regular;
      font-weight: 400;
      color: #f5222d;
    }
  }
}
</style>
