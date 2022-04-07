
<template>
  <div class="form-actions">
    
    <!-- 表单留痕按钮 -->
    <!-- <a-tooltip v-if="showTrack">
      <template slot="title">
        {{ $t("cloudpivot.list.pc.FormTrack") }}
      </template>
      <a-icon class="form-track" type="history" 
        @click="proxyAction(showTrack)"
      />
    </a-tooltip> -->

    <a-button
      :ref="ac.code+'Action'"
      v-for="(ac, index) in actions"
      v-show="ac.visible !== false && ac.code !== 'formTrack' && ac.code !== 'FORMTRACK' "
      :key="ac.code"
      :disabled="ac.disabled === true"
      :type="index === 0 ? 'primary' : 'default'"
      @click="(e) => proxyAction(ac,e)"
      :class="[ ac.code ]"
    >{{ ac.text }}
    </a-button>

    <div
      class="prints-drop-down animated fadeIn"
      v-show="toShowPrints && setPdfConf"
      :style="printBtnListStyle"
      @click="printBtn($event)"
    >
      <div class="item-print">系统默认模板</div>
      <div class="item-print">打印模板</div>
    </div>
  </div>
</template>


<script lang="ts">

  import {
    Component, Vue, Prop, Watch
  } from 'vue-property-decorator';

  import {
    Button, Tooltip, Icon
  } from '@h3/antd-vue';

  import { FormAction } from '../../form-action';

  import { FormActionButton } from '../../form-action-modal';


  @Component({
    name: 'form-actions',
    components: {
      AButton: Button,
      ATooltip: Tooltip,
      AIcon: Icon
    }
  })
  export default class FormActions extends Vue {
    @Prop()
    actions !: FormActionButton[];

    @Prop({ type: Boolean }) toShowPrints!: Boolean;

    @Prop({ type: Boolean }) setPdfConf!: Boolean;
    printBtnListStyle = {} // 打印按钮下拉框 样式
    onAction(ac: any) {
      this.$emit('action', ac);
    }
    // 按钮点击代理
    proxyAction(ac: any, e) {
      // 打印按钮的下拉框 跟随 打印按钮
      // 当只有一个打印按钮时， 如果下拉框跟随按钮的话， 会遮住一部分， 这里直接-35px
      if (ac.code == "print" && !Object.keys(this.printBtnListStyle).length) {
        let pl = e.target
        this.printBtnListStyle = {left: (pl.offsetLeft - 35) +'px'}
        this.$nextTick(() => {
          this.onAction(ac)
        })
      } else {
        this.onAction(ac)
      }
    }

    printBtn(e: any) {
      this.$emit('propPrintClick', e.target.innerText);
    }

    @Watch('actions')
    changActions() {
      console.log(this.actions)
      setTimeout(() => {
        console.log(this.$refs['printAction'])
      })
    }

    get showTrack() {
      return this.actions.find((item: any) => item.code === 'formTrack' || item.code ==='FORMTRACK')
    }
  }

</script>


<style lang="less" scoped>
  .form-actions {
    // flex-grow: 1;
    display: flex;
    margin-left: 16px;
    text-align: right;
    position: relative;

    button {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }

    button.formTrack {
      margin-right: 0;
    }

    // 取消高亮
    .noHover{
      color: rgba(0, 0, 0, 0.65);
      background-color: #fff;
      border-color: #d9d9d9;
    }
    .noHover:hover{
      border: 1px solid #5291FF;
      color: #5291FF;
    }

    .form-track {
      font-size: 16px;
      margin-top: 8px;
      margin-right: 16px;
      transform: rotateY(180deg);
       rgba(0, 0, 0, 0.65)        
      &:hover {
        color: @primary-color;
      }
    }
  }
  .prints-drop-down {
    width: 116px;
    height: 72px;
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgba(30,85,255,0.15);
    background: #fff;
    position: absolute;
    // top: 55px;
    bottom: 100%;
    transform: translateY(-8px);
    z-index: 999;
    .item-print {
      text-align: left;
      height: 32px;
      line-height: 32px;
      padding: 5px 15px;
      &:hover {
        cursor: pointer;
        background: rgba(240,247,255,1);
        transition: 0.3s all;
      }
    }
  }
</style>
