<template>
  <a-modal
    :title="folderModelTitle"
    v-model="showAddFolder"
    :width="446"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    @ok="addMenu"
    @cancel="closeModel"
    class="app-form-modal"
    :maskClosable="false"
    :keyboard="false"
  >
    <a-form
      :autoFormCreate="(form) => { this.form = form }"
      class="app-form"
    >
      <a-form-item
        label="所属分组"
        fieldDecoratorId="catalogues"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
      >
        <a-tree-select
          v-model="group"
          style="width: 92.2%"
          :treeData="tree"
          allowClear
          placeholder="请选择上级分组"
        />
        <a-tooltip>
          <template slot="title">
            不选择上级分组，则默认为根分组
          </template>
          <i class="icon aufontAll h-icon-all-question-circle-o"></i>
        </a-tooltip>

        <!-- <a-input
          class="app-form__input"
          v-model="params.rootId"
          placeholder="请选择所属分组"
          maxLength="50"
        />
       -->
      </a-form-item>
      <a-form-item
        label="分组名称"
        fieldDecoratorId="name"
        :labelCol="formItemLayout.labelCol"
        :wrapperCol="formItemLayout.wrapperCol"
        :fieldDecoratorOptions="rules.folder"
      >
        <a-input
          class="app-form__input"
          v-model="params.name"
          :placeholder="$t('languages.PlaceHolder.InputName')"
          :maxLength="maxLength"
        />
        <i18n-icon/>
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

import { pattern, nameValidator } from '@/common/utils';

import { LanguageTransform } from '@/utils';

import I18nIcon from '@/components/global/i18n-icon.vue';

const MenuModule = namespace('Apps/AppItem');
const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'AddFolderModal',
  components: {
    I18nIcon
  }
})


export default class AddFolderModal extends Vue {
  @AppCenterModule.State('appInfo') appDetails: any;

  @MenuModule.State('appInfo') appInfo: any;

  @MenuModule.Action('addFolders') addFolders: any;

  @MenuModule.State('floders') floders:any;

  @MenuModule.Action('getFolders') getFolders: any;

  @MenuModule.Action('updateFolders') updateFolders: any;

  @MenuModule.State('menuId') menuId: any;

  @Prop() value!: boolean;

  @Prop() folderModel!: any;

  showAddFolder:boolean = false;

  folderModelTitle:any = {};

  defaultFolder:string = '';

  maxLength:number = 50;

  params:any = {
    name: ''
  };
  group = '';

  form: any = {};

  formItemLayout: Common.FormItemLayout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 19
    }
  };
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
  rules: any = {};
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

  /**
   * 设置规则，多语言文案
   */
  setRules() {
    this.rules = {
      folder: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.GroupNameCannotBeBlank')
          },
          {
            validator: nameValidator,
            message: this.$t('languages.Apps.AppNameRule')
          }
        ]
      }
    };
  }

  /**
   * 关闭弹窗
   */
  closeModel() {
    // 关闭模态窗
    this.$emit('input', false);
    this.params.name = '';

    this.group = '';
    this.$emit('resetFolderModel');
    this.form.resetFields();
  }

  /**
   * 新建目录
   */
  addMenu() {
    // 新建目录、编辑目录
    const vm:any = this;
    this.form.validateFields((err: any) => {
      /* 校验必填项和格式 */
      if (!err) {
        const folderTitle = vm.form.getFieldsValue();

        // 处理多语言字段保存
        let name:string = '';
        let nameI18n:any = {};
        if (vm.folderModel && vm.folderModel.name_i18n) {
          try {
            nameI18n = JSON.parse(vm.folderModel.name_i18n);
          } catch {
            nameI18n = {};
          }
        }
        if (vm.$i18n.locale === 'zh') {
          /* eslint-disable-next-line */
          name = folderTitle.name;
          if (!nameI18n.en) {
            nameI18n.en = name;
          }
        } else {
          name = vm.folderModel.name || folderTitle.name;
          nameI18n[vm.$i18n.locale] = folderTitle.name;
        }

        if (!vm.folderModel.id) { // 新增
          const folderParams:Apps.AppItem.AddFolders = {
            appCode: vm.appInfo.appCode,
            name,
            parentId: vm.group ? vm.group : folderTitle.catalogues,
            name_i18n: JSON.stringify(nameI18n)
          };
          vm.addFolders(folderParams);
        } else { // 编辑
          let rootId = '';
          this.floders.map((item: any)=>{
            if (item.code === this.appInfo.appCode){
              rootId = item.id;
            }
          })
          const folderParams:Apps.AppItem.UpdateFolders = {
            id: vm.folderModel.id,
            parentId: vm.group ? vm.group : rootId,
            name,
            name_i18n: JSON.stringify(nameI18n)
          };
          vm.updateFolders(folderParams);
        }
        vm.closeModel();
      }
    });
  }

  /**
   * 多语言名称赋值
   */
  setLangName() {
    const name:string = this.getLangName(this.folderModel);
    this.form.setFieldsValue({
      name,
      catalogues: this.folderModel.parentId
    });
    this.params.name = name;
  }

  /**
   * 获取当前多语言对应显示名
   */
  getLangName(item:any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  beforeMount() {
    this.folderModelTitle = this.$t('languages.Apps.AddGroup');
    this.setRules();
  }

  mounted() {
    if (this.folderModel.id) {
      this.$nextTick(() => {
        this.setLangName();
      });
    }
  }

  @Watch('menuId')
  onMenuIdChange(v: string) {
    this.defaultFolder = v;
  }

  @Watch('value')
  onValueChange(v: boolean) {
    if(v){
      this.getFolders(this.appInfo);
      this.$nextTick(() => {
        if (this.defaultFolder) {
          this.form.setFieldsValue({
            catalogues: this.defaultFolder,
          });
        } else {
          this.form.setFieldsValue({
            catalogues: this.appDetails.id,
          });
        }
      });
    }
    this.showAddFolder = v;
  }

  @Watch('folderModel', { deep: true })
  onFolderModelChange(v: any) {
    this.$nextTick(() => {
      // 
      if (v.id && this.form.setFieldsValue) {
        this.folderModelTitle = this.$t('languages.Apps.EditGroup');
        this.group = v.parentId;
        this.setLangName();
      } else {
        this.folderModelTitle = this.$t('languages.Apps.AddGroup');
      }
    });
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
    this.$emit('resetFolderModel');
  }
}
</script>
<style lang="less" scoped>
.app-form-modal{
  .app-form{
    .app-form__input{
      width: 292px;
    }
  }
}
.h-icon-all-question-circle-o{
  margin-left: 8px;
}
</style>
