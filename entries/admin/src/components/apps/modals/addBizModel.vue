<template>
  <a-modal
    :title="$t('languages.Apps.AddModel')"
    v-model="showUpdateModel"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="editModel"
    @cancel="closeModel"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-form
      :autoFormCreate="(modelForm) => { this.modelForm = modelForm }"
      class="app-form"
    >
      <a-form-item
        label="所属分组"
        fieldDecoratorId="catalogues"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.catalogues"
      >
        <a-tree-select
          v-model="group"
          style="width: 92.2%"
          :treeData="tree"
          allowClear
          placeholder="请选择上级分组"
        />
        <!-- <a-tooltip>
          <template slot="title">
            不选择上级分组，则输入分组即为根分组
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-tooltip> -->
      </a-form-item>

      <a-form-item
        fieldDecoratorId="modelType"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.modelType"
      >
        <span slot="label">
          模型类型
          <a-tooltip>
            <div slot="title">
              <span>
                树形模型支持数据的树形展示，可作
              </span><br>
              <span>
                为树形控件，树形字典的数据源
              </span>
            </div>
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </span>
        <a-select
          style="width: 92.2%"
          v-model="modelData.modelType"
          allowClear
          placeholder="请选择模型类型"
        >
          <a-select-option v-for="item in modelType" :key="item.key" :value="item.value">
            {{item.title}}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- <a-form-item
        :label="$t('languages.Apps.Catalogues')"
        fieldDecoratorId="catalogues"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <a-select
          :placeholder="$t('languages.Apps.SelectFolder')"
          v-show="floders.length"
          class="app-form__input"
        >
          <template v-for="selectItem in floders">
            <a-select-option :key="selectItem.id" v-model="selectItem.id">{{ getLangName(selectItem) }}</a-select-option>
          </template>
        </a-select>
      </a-form-item> -->
      <a-form-item
        :label="$t('languages.Apps.ModelCode')"
        fieldDecoratorId="modelCode"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.modelCode"
      >
        <a-input
          :placeholder="$t('languages.Apps.InputModelCode')"
          :maxLength="maxLength"
          v-model="modelData.modelCode"
          class="app-form__input"
        />
      </a-form-item>
      <a-form-item
        :label="$t('languages.Apps.ModelName')"
        fieldDecoratorId="modelName"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.modelName"
      >
        <a-input
          :placeholder="$t('languages.Apps.InputModelName')"
          :maxLength="modelNameLength"
          v-model="modelData.modelName"
          class="app-form__input"
        />
        <i18n-icon/>
      </a-form-item>
      <a-form-item
        :label="$t('languages.Apps.Icon')"
        fieldDecoratorId="icon"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <selected-icon @input="changeIcon" class="app-form__input"></selected-icon>
      </a-form-item>

      <a-form-item
        :label="$t('languages.Apps.VisibleRange')"
        fieldDecoratorId="visibleRange"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >

        <a-checkbox-group
          v-model="modelData.visibleRange"
        >
          <a-row>
            <a-col :span="8"><a-checkbox value="pc">{{ $t('languages.Apps.PcVisible') }}</a-checkbox></a-col>
            <a-col :span="12"><a-checkbox value="mobile">{{ $t('languages.Apps.MobileVisible') }}</a-checkbox></a-col>
          </a-row>
        </a-checkbox-group>

      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';

import {
  State, Action, Mutation, namespace
} from 'vuex-class';

import selectedIcon from '@/components/global/select-icon/index.vue';

import I18nIcon from '@/components/global/i18n-icon.vue';

import { pattern, bizModelNameValidator } from '@/common/utils';

import { LanguageTransform } from '@/utils';

const MenuModule = namespace('Apps/AppItem');
const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'AddBizModel',
  components: {
    selectedIcon,
    I18nIcon
  }
})


export default class AddBizModel extends Vue {
  @AppCenterModule.State('appInfo') appDetails: any;

  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.State('floders') floders: any;

  @MenuModule.State('menuId') menuId: any;

  @MenuModule.Action('getFolders') getFolders: any;

  @MenuModule.Action('addBizModel') addBizModel: any;

  @MenuModule.Action('getAppItem') getAppItem: any;

  @Prop({
    type: Boolean
  }) value!: boolean;
  group = '';
  showUpdateModel:boolean = false;

  defaultFolder:string = '';

  modelForm:any = {};

  modelType:any = [
    {
      key: "LIST",
      value: "LIST",
      title: "标准模型"
    },
    {
      key: "TREE",
      value: "TREE",
      title: "树形模型"
    },
  ]

  modelData:any = {
    catalogues: '',
    modelType: '',
    modelName: '',
    icon: '',
    modelCode: '',
    visibleRange: ['pc','mobile']
  };

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 6
    },
    wrapperCol: {
      span: 18
    }
  };

  rules:any = {};

  errCode:string = '';

  existCodes:Array<string> = [];

  errCodeTxt:string = '';

  maxLength:number = 24;

  modelNameLength:number = 50;

  beforeMount() {
    this.setRules();
  }
  convert(x: any, isLeaf: boolean) {
    let children = null;
    if (x.children) {
      children = x.children.map((c : any) => this.convert(c, !c.children));
    }
    return {
      value: x.id,
      key: x.id,
      title: x.name,
      children
    };
  }
  get tree(){ // 不知道为啥replaceFields 无效
    return this.floders.map((item: any)=>{
      if(item.children && item.children.length ){
        return this.convert(item,false);
      }else {
        return {
          value: item.id,
          key: item.id,
          title: item.name,
          children: null
        }
      }
    })

  }
  setRules() {
    this.rules = {
      catalogues: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.PleaseInput')
          }
        ]
      },
      modelType:{
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.PleaseInput')
          }
        ]
      },
      modelCode: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.InputModelCode')
          },
          {
            pattern: pattern('modelcode'),
            message: this.$t('languages.Apps.ModelCodeRule')
          },
          {
            validator: (rules:any, value:any, callback:any) => {
              if (value && this.existCodes.includes(value)) {
                callback(this.errCodeTxt);
              }
              callback();
            }
          }
        ]
      },
      modelName: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.InputModelName')
          },
          {
            validator: bizModelNameValidator,
            message: this.$t('languages.Apps.BizModelNameRule')
          }
        ]
      }
    };
  }

  changeIcon(icon:any) {
    this.modelForm.setFieldsValue({
      icon
    });
  }

  closeModel() {
    // 关闭模态窗
    this.modelData.catalogues = '';
    this.modelData.modelType = '';
    this.modelData.modelCode = '';
    this.modelData.modelName = '';
    this.modelData.icon = '';
    this.modelData.visibleRange = ['pc','mobile'];
    this.$emit('input', false);
    this.modelForm.resetFields();
    this.existCodes = [];
    this.errCodeTxt = '';
  }

  editModel() {
    // 修改、新增业务模型
    const vm:any = this;
    this.modelForm.validateFields((err: any) => {
      if (!err) {
        const modelFormData = vm.modelForm.getFieldsValue();

        // 多语言业务字段保存
        const nameI18n:any = {};
        if (this.$i18n.locale === 'zh') {
          nameI18n.en = modelFormData.modelName;
        } else {
          nameI18n[this.$i18n.locale] = modelFormData.modelName;
        }
        const modelParams:Apps.AppItem.AddBizModel = {
          appCode: vm.appInfo.appCode,
          name: modelFormData.modelName,
          parentId: modelFormData.catalogues,
          modelType: modelFormData.modelType,
          bizSchemaCode: modelFormData.modelCode,
          icon: modelFormData.icon,
          name_i18n: JSON.stringify(nameI18n),
          pcAble: modelFormData.visibleRange.includes('pc'),
          mobileAble: modelFormData.visibleRange.includes('mobile')
        };
        vm.addBizModel(modelParams).then((res: Common.Data) => {
          if (!res.errcode) {
            if (res.data) {
              modelFormData.id = res.data.id;
              modelFormData.code = res.data.code;
            }
            vm.getAppItem(vm.appInfo);
            vm.$emit('getBizModel', modelFormData);
            vm.closeModel();
          } else {
            vm.existCodes.push(modelParams.bizSchemaCode);
            vm.$nextTick(() => {
              vm.errCodeTxt = res.errmsg;
              vm.modelForm.setFieldsValue({ modelCode: modelParams.bizSchemaCode });
              vm.modelForm.validateFields();
            });
          }
        });
      }
    });
  }

  getLangName(item:any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    if (v) {
      this.getFolders(this.appInfo);
      this.$nextTick(() => {
        if (this.defaultFolder) {
          let arr: any = JSON.stringify(this.tree).indexOf(this.defaultFolder) > -1;
          this.modelForm.setFieldsValue({
            catalogues: arr ? this.defaultFolder : '',
            icon: 'h-icon-all-catalogue-o',
            visibleRange: ['pc','mobile']
          });
        } else {
          let arr: any = JSON.stringify(this.tree).indexOf(this.appDetails.id) > -1;
          this.modelForm.setFieldsValue({
            catalogues: arr ? this.appDetails.id : '',
            icon: 'h-icon-all-catalogue-o',
            visibleRange: ['pc','mobile']
          });

          // this.resetlangRow(v.name_i18n);
        }
      });
    }
    this.showUpdateModel = v;
  }

  @Watch('menuId')
  onMenuIdChange(v: string) {
    this.defaultFolder = v;
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }
}
</script>

<style lang="less" scoped>
.app-form{
  .app-form__input{
    width: 275px;
  }
  .ant-checkbox-group {
    width: 100%;
    line-height: 32px;
  }
  .h-icon-all-question-circle-o{
    margin-left: 8px;
  }
  /deep/.ant-form-item-label {
    text-align: left;
  }
}
</style>
