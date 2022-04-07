<template>
  <div class="attr-rows">
    <div
      class="attr-row clearfix"
      v-for="(item,index) in attrData"
      :key="index"
    >
      <label class="attr-lab">
        <span>
          {{ item.name }}
        </span>
      </label>
      <div class="attr-val" :class="{'disabled': item.disabled}">
        <template v-if="['label', 'input'].includes(item.type)">
          <label v-if="item.disabled">
            {{ item.value }}
          </label>
          <form-input
            class="input"
            v-else-if="!item.disabled && isChinese"
            v-model="item.value"
            :value="item.value"
            :rules="rule"
            :type="'text'"
            ref="formInput"
            :maxLength="maxLengthCode"
            @change="e => inputChange(e.target.value, item)"
            :tipPosition="'top'"
          />

          <a-input
            class="input"
            v-else-if="!item.disabled && !isChinese"
            v-model="name_i18n[$i18n.locale]"
            :value="name_i18n[$i18n.locale]"
            :type="'text'"
            :maxLength="maxLengthCode"
            @change="e => inputChange(e.target.value, item)"
          />
        </template>

        <template v-else-if = "item.type === 'modal' && item.code === 'setDataSource'">
          <setOptionsModal :schemaCode = "schemaCode" />
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import {
  State, Action, Mutation, namespace
} from 'vuex-class';

import FormInput from '@/components/global/form-input/index.vue';

import { nameValidator } from '@/common/utils';

const ListdesignModule = namespace('Apps/Listdesign');

import setOptionsModal from './setOptionsModals/setOptionsModal.vue'

@Component({
  name: 'list-attribute',
  components: {
    FormInput,
    setOptionsModal
  }
})
export default class AttrRows extends Vue {
  @ListdesignModule.State("queryViewDataSource") queryViewDataSource: any;
  @ListdesignModule.State('name') name: any;

  @ListdesignModule.State('setDataSource') setDataSource: any;

  @ListdesignModule.State('name_i18n') name_i18n: any;

  @ListdesignModule.Mutation('onEdit') onEdit: any;

  @ListdesignModule.Mutation('nameChange') nameChange: any;

  @ListdesignModule.Mutation('codeChange') codeChange: any;

  @ListdesignModule.State('isPublish') isPublish: any;

  @Prop() schemaCode!: string

  souceData:any[] = []

  
  

  get listCode() {
    return this.$route.params.code;
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return this.$i18n.locale === 'zh';
  }

  setOptionsVisible: boolean =  false
  handleOk(){
    this.setOptionsVisible =  false
  }


  attrData:any[] = [];

  rule:any[] =[];

  maxLengthCode:number = 50;

  created() {
    // console.log('name', this.name_i18n);
    this.setRules();
    this.attrData.find((res:any) => res.code === 'code').value = this.listCode;
    this.codeChange(this.listCode);
    this.attrData.find((res:any) => res.code === 'name').value = this.name;
  }

  setRules() {
    this.attrData = [
      {
        name: this.$t('languages.Apps.ListCode'),
        code: 'code',
        disabled: !!this.isPublish,
        value: this.listCode,
        type: 'label'
      },
      {
        name: this.$t('languages.Apps.ListName'),
        code: 'name',
        disabled: false,
        value: this.name,
        type: 'input'
      },
      {
        name: this.$t('languages.Apps.setDataSource'),
        code: 'setDataSource',
        disabled: false,
        value: this.setDataSource,
        type: 'modal'
      }
    ];
    this.rule = [
      {
        required: true,
        message: this.$t('languages.Apps.ListNamePlaceholder')
      },
      {
        validator: nameValidator,
        message: this.$t('languages.Apps.NameRule')
      }
    ];
  }

  inputChange(val:string, inner:any) {
    this.onEdit(true);
    const nameInput:any = this.attrData.find((item:any) => item.code === inner.code);
    if (this.isChinese && nameInput.code === 'name') {
      this.nameChange({ name: val, isupdate: false, name_i18n: this.name_i18n });
    } else {
      this.codeChange(val);
    }
  }

  @Watch('name')
  onNameChange(val:string) {
    this.attrData.find((res:any) => res.code === 'name').value = val.substring(0, 50);
  }

  @Watch('isPublish')
  isPublishChange(val:string) {
    if (val) {
      this.attrData.forEach((item:any) => {
        if (item.code === 'code') {
          item.disabled = val;
        }
      });
    }
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.setRules();
  }
}
</script>
<style lang="less" scoped>
.attr-rows {
  background: #fff;
  .attr-row{
    text-align: left;
    border-bottom: 1px solid #E9E9E9;
    .attr-lab{
      border-right: 1px solid #E9E9E9;
      line-height: 33px;
      width: 33%;
      float: left;
      span{
        margin: 0 8px;
      }
    }
    .attr-val{
      .modal-attr{
        label{
          position: relative;
          padding: 0 21px;
          margin: 0;
          cursor: pointer;
          span{
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
          }
        }
      }

      height: 32px;
      float: left;
      width: 67%;
      & > div.input{
        :before{
          content: "" !important;
        }
        /deep/ input {
          border: 0;
          padding: 4px 21px;
          border-radius: 0;
        }
      }
      label{
        margin: 0 21px;
        display: block;
        height: 33px;
        line-height: 33px;
      }
    }
    .attr-val.disabled {
      background:rgba(245,245,245,1)
    }
  }
  & .input:before{
    content:'';
  }
  
}
</style>
