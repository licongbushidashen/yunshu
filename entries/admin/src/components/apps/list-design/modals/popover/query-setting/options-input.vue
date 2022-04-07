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
            <div class="input-wrap">
              <a-input
                class="input"
                :disabled="true"
                v-model="option.value"
                maxlength="200"
                :placeholder="$t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')"
              />
            </div>
          </li>
        </ul>
      </div>
    </a-col>
  </a-row>
</template>
<script lang="ts">
  import {
    Component, Vue, Prop, Watch, Emit
  } from 'vue-property-decorator';
  @Component({
    name: 'OptionsInput'
  })
  export default class OptionsInput extends Vue {
    @Prop() options !:any;

    created() {}
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
            width: 100%;
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
