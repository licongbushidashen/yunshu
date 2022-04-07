<template>
  <div class="add-method">
    <section class="add-method__block">
      <div class="add-method__form">
        <h3 class="add-method__title">基本信息</h3>
        <div class="add-method__item">
          <span class="label-required">方法编码：</span>
          <p v-show="method">
            <template v-if="id">{{ form.code }}</template>
            <form-input :disabled="isOperation(service)"
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
            <form-input :disabled="isOperation(service)" v-model="form.name" placeholder="请填写" :rules="rules.name" />
          </p>
        </div>
      </div>

      <div class="add-method__form">
        <div class="add-method__title">属性名称</div>
        <div class="add-method__item">
          <span class="label-required">返回值类型</span>
          <p>
            <!--
              TODO: 添加返回值类型字段
            -->
            <a-select :disabled="isOperation(service)" allowClear v-model="configs.returnType">
              <a-select-option
                v-for="key in Object.keys(returnTypes)"
                :value="returnTypes[key]"
                :key="key"
              >{{ key }}</a-select-option>
            </a-select>
          </p>
        </div>

        <div v-if="isSap(service)">
          <div class="add-method__item add-method__item--full add-method__item--top">
            <span class="label-required">函数名：</span>
            <p>
              <form-input :disabled="isOperation(service)"
                v-model="configs.functionName"
                :maxLength="200"
                :rules="rules.functionName"
              />
            </p>
          </div>
          <div v-show="configs.returnType === returnTypes.SingleObject" class="add-method__item add-method__item--full add-method__item--top">
            <span class="label-required">结构体：</span>
            <p>
              <form-input v-if="configs.returnType === returnTypes.SingleObject" :disabled="isOperation(service)"
                v-model="configs.structName"
                :maxLength="200"
                :rules="rules.structName"
              />
            </p>
          </div>
          <div v-show="configs.returnType === returnTypes.List" class="add-method__item add-method__item--full add-method__item--top">
            <span class="label-required">表名：</span>
            <p>
              <form-input v-if="configs.returnType === returnTypes.List" :disabled="isOperation(service)"
                v-model="configs.tableName"
                :maxLength="200"
                :rules="rules.tableName"
              />
            </p>
          </div>
        </div>
        <div v-else>
          <div v-if="countSqlVisible" class="add-method__item add-method__item--full add-method__item--top">
            <span class="label-required">Sql总记录数语句：</span>
            <p>
              <form-input :disabled="isOperation(service)"
                v-model="configs.countSql"
                :textarea="true"
                placeholder="eg: select count(1) as count from tablename where 1=1"
                :maxLength="2000"
                :autosize="{ minRows:3,maxRows:3 }"
                :rules="rules.countSql"
              />
            </p>
          </div>
          <div class="add-method__item add-method__item--full add-method__item--top">
            <span class="label-required">Sql语句：</span>
            <p>
              <form-input :disabled="isOperation(service)"
                v-model="configs.sql"
                :textarea="true"
                :maxLength="2000"
                :autosize="{ minRows:3,maxRows:3 }"
                :rules="rules.sql"
                @change="onSqlContentChange"
              />
            </p>
          </div>
        </div>
      </div>

      <!-- tab -->
      <a-tabs v-model="currentTab" @change="resetFormInput">
        <a-tab-pane tab="传入参数" key="input">
          <!-- 传入参数 -->
          <div class="add-method__table">
            <a-table
              :columns="columns"
              :dataSource="inputParameters"
              :pagination="false"
              :scroll="{ y: 500 }"
              :locale="{emptyText: ''}"
              size="small"
              ref="argTable"
              class="sql_param_not_data"
              rowKey="sortKey"
            >
              <!-- 表头 -->
              <span class="text-ellipsis" slot="indexTitle">序号</span>
              <span class="text-ellipsis resize" slot="codeTitle">参数名称</span>
              <span class="text-ellipsis resize" slot="nameTitle">显示名称</span>
              <span class="text-ellipsis resize" slot="bizPropertyTypeTitle">参数类型</span>
              <span class="text-ellipsis resize" slot="descriptionTitle">描述</span>
              <span class="text-ellipsis resize" slot="actionTitle">操作</span>
              <!-- 表体 -->
              <form-input :disabled="isOperation(service)"
                slot="code"
                slot-scope="text,record"
                v-model="record.code"
                :rules="rules.value"
                :ref="`form-input-arg-code-${record.sortKey}`"
                placeholder="请输入"
              />
              <form-input :disabled="isOperation(service)"
                slot="name"
                slot-scope="text,record"
                v-model="record.name"
                :rules="rules.value"
                :ref="`form-input-arg-name-${record.sortKey}`"
                placeholder="请输入"
              />
              <a-select
                slot="bizPropertyType"
                slot-scope="text,record"
                v-model="record.bizPropertyType"
                :options="bizPropertyTypes"
                @change="()=>{record.description=''}"
              />
              <template slot="description" slot-scope="text,record">
                <template v-if="record.bizPropertyType == 2">
                  <a-input :disabled="isOperation(service)"
                    type="text"
                    style="width: 100%;"
                    v-model="record.description"
                    :maxLength="15"
                    @change="()=>{
                      record.description = record.description.replace(/[^\d]/g,'');
                    }"
                    placeholder="请输入"></a-input>
                </template>
                <template v-else-if="record.bizPropertyType == 3">
                  <a-date-picker
                    style="width: 100%;"
                    format="YYYY-MM-DD HH:mm:ss"
                    v-model="record.description"
                    placeholder="请选择时间" />
                </template>
                <template v-else-if="record.bizPropertyType == 4">
                  <a-select placeholder="请选择" :disabled="isOperation(service)" allowClear style="width: 100%;" v-model="record.description">
                    <a-select-option key="1" value="true">true</a-select-option>
                    <a-select-option key="2" value="false">false</a-select-option>
                  </a-select>
                </template>
                <a-textarea
                  v-else
                  class="add-method__textarea"
                  v-model="record.description"
                  :maxLength="200"
                  :autosize="{minRows:1,maxRows:5}"
                  placeholder="请输入"
                />
              </template>
              <span slot="action" slot-scope="text,record">
                <i class="icon aufontAll h-icon-all-delete-o" @click="popItem(record)" />
              </span>
            </a-table>
          </div>
        </a-tab-pane>
        <a-tab-pane tab="返回值" key="output">
          <!-- 返回值 -->
          <div class="add-method__table">
            <a-table
              :columns="outputColumns"
              :dataSource="outputParameters"
              :pagination="false"
              :scroll="{ y: 500 }"
              :locale="{emptyText: ''}"
              size="small"
              ref="resultTable"
              class="sql_param_not_data"
              rowKey="sortKey"
            >
              <!-- 表头 -->
              <span class="text-ellipsis" slot="indexTitle">序号</span>
              <span class="text-ellipsis resize" slot="codeTitle">参数名称</span>
              <span class="text-ellipsis resize" slot="nameTitle">显示名称</span>
              <span class="text-ellipsis resize" slot="bizPropertyTypeTitle">参数类型</span>
              <span class="text-ellipsis resize" slot="descriptionTitle">描述</span>
              <span class="text-ellipsis resize" slot="actionTitle">操作</span>
              <!-- 表体 -->
              <form-input :disabled="isOperation(service)"
                slot="code"
                slot-scope="text,record"
                v-model="record.code"
                :rules="rules.value"
                :ref="`form-input-res-code-${record.sortKey}`"
                placeholder="请输入"
              />
              <form-input :disabled="isOperation(service)"
                slot="name"
                slot-scope="text,record"
                v-model="record.name"
                :rules="rules.value"
                :ref="`form-input-res-name-${record.sortKey}`"
                placeholder="请输入"
              />
              <a-select
                slot="bizPropertyType"
                slot-scope="text,record"
                v-model="record.bizPropertyType"
                :options="bizPropertyTypes"
                @change="()=>{record.description=''}"
              />
              <template slot="description" slot-scope="text,record">
                <template v-if="record.bizPropertyType == 2">
                  <a-input :disabled="isOperation(service)"
                    type="text"
                    style="width: 100%;"
                    v-model="record.description"
                    :maxLength="15"
                    @change="()=>{
                      record.description = record.description.replace(/[^\d]/g,'');
                    }"
                    placeholder="请输入"></a-input>
                </template>
                <template v-else-if="record.bizPropertyType == 3">
                  <a-date-picker
                    style="width: 100%;"
                    format="YYYY-MM-DD HH:mm:ss"
                    v-model="record.description"
                    placeholder="请选择时间" />
                </template>
                <template v-else-if="record.bizPropertyType == 4">
                  <a-select placeholder="请选择" :disabled="isOperation(service)" allowClear style="width: 100%;" v-model="record.description">
                    <a-select-option key="1" value="true">true</a-select-option>
                    <a-select-option key="2" value="false">false</a-select-option>
                  </a-select>
                </template>
                <a-textarea
                  v-else
                  class="add-method__textarea"
                  v-model="record.description"
                  :maxLength="200"
                  :autosize="{minRows:1,maxRows:5}"
                  placeholder="请输入"
                />
              </template>
              <span slot="action" slot-scope="text,record">
                <i class="icon aufontAll h-icon-all-delete-o" @click="popItem(record)" />
              </span>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </section>
    <p class="add-method__btn">
      <span @click="addItem">
        <i class="icon aufontAll h-icon-all-plus-o" />
        <span>新增数据</span>
      </span>
    </p>
    <div class="add-method__footer">
      <template v-if="isOperation(service)">
        <a-button type="default" @click="$emit('close')">关闭</a-button>
      </template>
      <template v-else>
        <a-button @click="saveAndTest" :loading="loading">保存并连接测试</a-button>
        <a-button type="primary" @click="save()">保存</a-button>
      </template>
    </div>
    <!-- 底线 -->
    <div class="add-method__blank" ref="footLine"></div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
  namespace, State, Action, Mutation
} from 'vuex-class';

import { pattern, nameValidator } from '@/common/utils';

import sqlParser from '@/utils/sql-parser';

import serviceApi from '@/apis/biz-service/service.api';
import FormInput from '@/components/global/form-input/index.vue';
const MethodsModule = namespace('Integration/Methods');
const UserModule = namespace('System/User');
@Component({
  name: 'add-method',
  components: {
    FormInput,
  }
})
export default class AddMethod extends Vue {
  @MethodsModule.State('paramTypes') paramTypes: any;

  @MethodsModule.Action('createMethod') createMethod: any;

  @MethodsModule.Action('updateMethod') updateMethod: any;

  @Prop() method!: any;

  @Prop() service!: any;

  @Prop() currentAdapterType!: number;

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

  // 当前切换到的tab面板，input：传入参数 output：返回值
  currentTab: string = 'input';

  id: string = '';

  loading: boolean = false;

  adapterType: number | undefined = undefined;

  form: BizService.Method.CreateParams = {
    code: '',
    adapterType: undefined,
    configJson: '',
    description: '',
    inputParametersJson: '',
    name: '',
    outputParametersJson: '',
    serviceCode: '',
  };

  // 返回值类型
  returnTypes: any = {
    Void: 'Void',
    SingleObject: 'SingleObject',
    List: 'List'
  }

  configs: BizService.Method.SqlMethodConfig = {
    sql: '',
    countSql: '',
    returnType: this.returnTypes.Void,
    functionName: '',
    structName: '',
    tableName: ''
  };

  inputParameters: BizService.Method.InputParam[] = [];

  outputParameters: BizService.Method.OutputParam[] = [];

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
      scopedSlots: { customRender: 'code' },
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
      dataIndex: 'bizPropertyType',
      slots: { title: 'bizPropertyTypeTitle' },
      scopedSlots: { customRender: 'bizPropertyType' },
      key: 'bizPropertyType',
      width: 130,
    },
    {
      dataIndex: 'description',
      slots: { title: 'descriptionTitle' },
      scopedSlots: { customRender: 'description' },
      key: 'description',
      width: 180,
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      key: 'action',
      width: 80,
      align: 'right',
    },
  ];

  outputColumns: Array<Common.TableHead> = this.columns.filter((item: Common.TableHead) => item.key !== 'position');

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
        message: '不能以空格开头,50字以内'
      }
    ],
    value: [
      {
        required: true,
        message: '请填写内容'
      },
      {
        validator: nameValidator,
        message: '不能以空格开头,50字以内'
      }
    ],
    description: [
      {
        validator: nameValidator,
        message: '不能以空格开头,50字以内'
      }
    ],
    sql: [{
      required: true,
      message: '请填写Sql语句'
    }],
    functionName: [{
      required: true,
      message: '请填写函数名称'
    }],
    structName: [{
      required: true,
      message: '请填写结构体'
    }],
    tableName: [{
      required: true,
      message: '请填写数据库表名'
    }],
    returnType: [
      {
        required: true,
        message: '请选择返回值类型'
      }
    ],
    countSql: [
      {
        required: true,
        message: '请填写Sql总记录数语句'
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

  get countSqlVisible(){
    return this.configs.returnType !== this.returnTypes.Void && this.configs.returnType !== this.returnTypes.SingleObject;

  }
  get bizPropertyTypes() {
    const { xuanrenkongjian, attachment, StaffMulti,DeptSingle,DeptMulti,StaffSingle,StaffDeptMix  } = this.enums;
    /* 参数类型不可选：附件 */
    return this.paramTypes.filter((item: any) => ![xuanrenkongjian,StaffMulti,DeptSingle,DeptMulti,StaffSingle,StaffDeptMix,  attachment].includes(item.value));
  }

  isSap(record: BizService.Service.Item) {
    return record ? /^sap/i.test(record.adapterCode) : false;
  }

  /**
 * 删除条目
 */
  popItem(record: any) {
    if (this.currentTab === 'input') {
      const inputParameters: BizService.Method.InputParam[] = this.inputParameters
        .filter((item: any) => item.sortKey !== record.sortKey)
        .map((item: any, index: number) => {
          item.index = index + 1;
          return item;
        });
        this.inputParameters = inputParameters;
    } else {
      const outputParameters: BizService.Method.OutputParam[] = this.outputParameters
        .filter((item: any) => item.sortKey !== record.sortKey)
        .map((item: any, index: number) => {
          item.index = index + 1;
          return item;
        });
        this.outputParameters = outputParameters;
    }
  }

  /**
 * 添加条目
 */
  addItem() {
    const item: BizService.Method.InputParam = {
      code: '',
      name: '',
      bizPropertyType: 0,
      description: '',
      index: -1,
      sortKey: Date.now().toString(),
    };
    if (this.currentTab === 'input') {
      item.index = this.inputParameters.length + 1;
      this.inputParameters.push(item);
    } else {
      item.index = this.outputParameters.length + 1;
      this.outputParameters.push(item);
    }
    this.$nextTick(() => {
      // 新建按钮滚动至可视区域
      const dom: any = this.$refs.footLine;
      dom.scrollIntoView();
      // 表格内部滚动至底部
      try {
        const aTable: any = this.currentTab === 'input' ? this.$refs.argTable : this.$refs.resultTable;
        const table: any = aTable.$el.getElementsByClassName('ant-table-body')[0];
        table.scrollTop = table.scrollHeight;
      } catch (error) {
        console.log(error);
      }
    });
  }

  /**
 * 校验表单填写内容
 */
  validateForm() {
    return new Promise((resolve, reject) => {
      let hasError: boolean = false;
      const list: any[] = [];
      if (this.currentTab === 'input') {
        Object.entries(this.$refs).forEach(([key, value]) => {
          if (value && /^form-input-arg/.test(key)) {
            list.push(this.$refs[key]);
          }
        });
      } else {
        Object.entries(this.$refs).forEach(([key, value]) => {
          if (value && /^form-input-res/.test(key)) {
            list.push(this.$refs[key]);
          }
        });
      }
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
    if (this.currentTab !== 'input') {
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-arg/.test(key)) {
          list.push(this.$refs[key]);
        }
      });
    } else {
      Object.entries(this.$refs).forEach(([key, value]) => {
        if (value && /^form-input-res/.test(key)) {
          list.push(this.$refs[key]);
        }
      });
    }
    list.forEach((node: any) => {
      node.reset();
    });
  }

  /**
 * 保存方法
 * @param callback 保存后回调
 */
  save(callback?: Function) {
    // console.log(callback, 'callback');
    // 校验
    if (!this.configs.returnType) {
      this.configs.returnType = this.returnTypes.Void;
    }
    // 校验表单
    this.validateForm()
      .then(async () => {
        if(/sap/i.test(this.service.adapterCode)) {
          delete this.configs.sql;
          delete this.configs.countSql;
        }else {
          delete this.configs.functionName;
          delete this.configs.structName;
          delete this.configs.tableName;
        }
        this.form.configJson = JSON.stringify(this.configs);
        this.form.inputParametersJson = JSON.stringify(this.inputParameters.map((param: any) => {
          const {
            code, name, configJson, bizPropertyType, description,
          } = param;
          return {
            code, name, configJson, bizPropertyType, description,
          };
        }));
        this.form.outputParametersJson = JSON.stringify(this.outputParameters.map((param: any) => {
          const {
            code, name, configJson, bizPropertyType, description,
          } = param;
          return {
            code, name, configJson, bizPropertyType, description,
          };
        }));
        let res: any = null;
        if (this.id) {
          res = await this.updateMethod({
            ...this.form,
            id: this.id,
          });
        } else {
          res = await this.createMethod(this.form);
        }
        if (res && res.errcode === 0) {
          /**
           * 如果为更新，则检查是否有关联业务方法并提示手动更新 2019-06-20
           */
          let bindCount: number = 0;
          if (this.id) {
            bindCount = await this.checkBindStatusAndAlert();
          }
          /**
           * 新建后返回的数据重新初始化到界面，以便再次编辑
           */
          if (res.data) {
            this.initialData(res.data);
          }
          console.log(bindCount, 'bindCount');
          if (callback) {
            callback();
          } else {
            this.$emit('submit', bindCount);
          }
        } else {
          const errmsg = res.errcode === 500105 ? '方法编码重复' : res.errmsg;
          this.$message.error(errmsg);
          this.loading = false;
        }
      })
      .catch((err) => {
        console.log(err)
        this.loading = false;
      });
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
 * 保存并测试连接
 */
  saveAndTest() {
    this.loading = true;
    this.save(() => {
      const value:any = {
        ...this.form,
        adapterType: this.adapterType || this.currentAdapterType,
      }
      this.$emit('test', value);
      this.loading = false;
    });
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

  parserSqlTask: any = null;

  onSqlContentChange() {
    clearTimeout(this.parserSqlTask);
    this.parserSqlTask = setTimeout(() => {
      this.parserSqlContent();
    }, 500);
  }

  /**
   * 解析sql语句，提取入参
   */
  parserSqlContent() {
    const res = sqlParser(this.configs.sql);
    const {
      inputParams
    } = res;
    // 将入参自动更新到当前入参列表
    if (Array.isArray(inputParams) && inputParams.length) {
      this.updateParamListByCodes(inputParams, 'inputParameters')
    }
  }

  /**
   * 通过解析到的code列表重置 传入/返回 参数列表
   */
  updateParamListByCodes(codes: Array<string>, dataKey: string) {
    const targetList = this[dataKey];
    const paramsList = codes.map((code: string, idx: number) => {
      const existItem = targetList.find((param: BizService.Method.InputParam) => param.code === code);
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
          bizPropertyType: 0,
          description: '',
          index,
          sortKey: Date.now().toString() + idx,
        }
      }
    });
    this.$set(this, dataKey, paramsList);
  }

  /**
 * 初始化数据
 */
  initialData(data: BizService.Method.Item) {
    Object.keys(this.form).forEach((key: string) => {
      this.$set(this.form, key, (data as any)[key] || '');
    });
    this.parseJson(data.configJson, 'configs');
    this.parseJson(data.inputParametersJson, 'inputParameters');
    this.parseJson(data.outputParametersJson, 'outputParameters');
    if (this.inputParameters.length) {
      this.inputParameters.forEach((item: any, index: number) => {
        item.index = index + 1;
        item.sortKey = Date.now().toString() + index;
      });
    }
    if (this.outputParameters.length) {
      this.outputParameters.forEach((item: any, index: number) => {
        item.index = index + 1;
        item.sortKey = Date.now().toString() + index;
      });
    }
    this.id = data.id;
    this.adapterType = data.adapterType || this.currentAdapterType;
  }

  mounted() {
    if (this.method && this.method.id) {
      this.initialData(this.method);
      if (!this.configs.returnType) {
        this.configs.returnType = this.returnTypes.Void;
      }
    }
    this.form.serviceCode = this.service.code;
  }
}
</script>
<style lang="less" scoped>
.sql_param_not_data /deep/ .ant-table-tbody .ant-table-row{
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
}
</style>
