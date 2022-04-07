<template>
  <a-row class="row-wrap">
    <a-col :span="5">
      <label class="title">{{ $t('languages.Apps.OptionSetting') }}</label>
    </a-col>
    <a-col :span="19">
      <div class="add-option-wrap">
        <ul
          ref="condionwrap"
        >
          <li
            class="clearfix"
            v-for="(option, index) in options"
            :key="index"
          >
            <div class="default">
              <a-checkbox :checked="option.default" @change="(e)=>{changeCheckbox(index,e)}" />
            </div>
            <div class="input-wrap">
              <a-input
                class="input"
                v-model="option.value"
                maxlength="200"
                :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
              />
            </div>
            <div class="delete" @click="deleteRow(index)">
              <span><i class="icon aufontAll h-icon-all-delete-o"></i></span>
            </div>
          </li>
        </ul>
        <div class="add">
          <span @click="addRow">
            <span><i class="icon aufontAll h-icon-all-plus-o"></i></span>
            <span>{{ $t('languages.Apps.FormDesignPage.AddOptins') }}</span>
          </span>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Watch, Emit
} from 'vue-property-decorator';
@Component({
  name: 'CheckboxOptions'
})
export default class CheckboxOptions extends Vue {
  @Prop() options !:any;

  created() {}

changeCheckbox(index, event) {
  this.options[index].default = event.target.checked;
}

  addRow() {
    const option = {
      default: false,
      value: ''
    };
    this.options.push(option);
    this.$nextTick(() => {
      const scrollDiv = document.getElementsByClassName('popover-wrap')[0];
      const el:any = this.$refs.condionwrap;
      const scrollDivHeight = el.scrollHeight;
      scrollDiv.scrollTo(0, scrollDivHeight);
    });
  }

  deleteRow(index:number) {
    this.options.splice(index, 1);
  }
}
</script>
<style lang="less">
  .row-wrap{
    .ant-col-5 {
      label{
        color: rgba(0, 0, 0, .65);
      }
    }
    .ant-col-19{
      .add-option-wrap{
        .add{
          color: @primary-color;
          text-align: center;
          cursor: pointer;
          span{
            margin-right: 8px;
          }
        }
         li{
          margin-bottom: 16px;
          .default{
            float: left;
            margin-top: 4px;
            margin-right: 6px;
          }
          .input-wrap{
            float: left;
            .input{
              width: 200px;
            }
          }
          .delete{
            float: left;
            margin-top: 4px;
            margin-left: 6px;
          }
        }
      }
    }
  }
</style>
