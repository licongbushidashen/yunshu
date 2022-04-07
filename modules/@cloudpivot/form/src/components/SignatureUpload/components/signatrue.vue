<template>
  <h3-field
    :label="title"
    :labelStyle="labelStyle"
    :required="required"
    :showIcon="false"
    class="signatrue"
    :tip="tip"
  >
    <!-- <div class="signatrue"> -->
    <div class="signatrue--row clearfix">
      <div class="row__file" @click="showSignatrue">
        <div class="field__content">
          <template v-if="!readonly && !img">{{
            $t("cloudpivot.form.renderer.addition")
          }}</template>
          <span v-if="!readonly" class="icon aufontAll">&#xe89b;</span>
        </div>
      </div>
      <div v-if="img" class="img__wrap">
        <img :src="img" @click="$emit('imageClick')" />
        <div class="img__delete" @click="deleteImg" v-if="!readonly">
          <span class="icon aufontAll">&#xe994;</span>
        </div>
      </div>
    </div>

    <div>
      <h3-modal
        v-control-back
        :popupDirection="'left'"
        :appendToBody="true"
        :show="isFocus"
        type="popup"
        :popupScale="100"
      >
        <div class="signatrue-panel">
          <!-- <div class="signatrue-panel__title">
            <div><span>{{ $t('cloudpivot.form.renderer.addSign') }}</span> </div>
            <div @click="back" class="signatrue-panel__title--back"><span class="icon aufontAll">&#xe895;</span>{{ $t('cloudpivot.form.renderer.back') }}</div>
          </div>-->
          <div class="signatrue-panel__content" ref="signatruewrap">
            <h3-signature
              ref="signature"
              :clip="true"
              :maxWidth="1"
              :maxHeight="1"
              :width="signatrueWidth"
              :height="signatrueHeight"
              :onBegin="onBegin"
              @saveAsPng="saveAsPng"
            ></h3-signature>
          </div>
          <div class="signatrue-panel__footer clearfix">
            <div class="button clearfix">
              <div class="left-btn">
                <h3-button :disabled="isRest" @click="reset">{{
                  $t("cloudpivot.form.renderer.reset")
                }}</h3-button>
              </div>
              <div class="right-btn">
                <h3-button type="primary" @click="ok">{{
                  $t("cloudpivot.form.renderer.ok")
                }}</h3-button>
              </div>
            </div>
          </div>
        </div>
      </h3-modal>
    </div>
  </h3-field>
</template>
<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from "vue-property-decorator";
import { H3Modal, H3Signature, H3Button } from "h3-mobile-vue";
import { H3Field } from "h3-mobile-vue";
import ControlBack from "@cloudpivot/form/src/common/directives/control-back";

@Component({
  name: "signatrue",
  components: {
    H3Modal,
    H3Signature,
    H3Button,
    H3Field,
  },
  directives: {
    ControlBack,
  },
})
export default class Signatrue extends Vue {
  @Model("change")
  value!: string;

  @Prop({
    default: false,
  })
  readonly!: boolean;

  @Prop({
    default: "手写签名",
  })
  title!: string;

  @Prop({
    default: false,
  })
  required!: boolean;

  @Prop({
    default: () => ({}),
  })
  labelStyle!: any;

  @Prop({
    default: () => ({}),
  })
  tip?: any;

  isFocus: boolean = false;

  signatrueHeight: number = 0;

  signatrueWidth: number = 0;

  isRest: boolean = true;

  img: string = "";

  signature: any = {};

  mounted() {
    this.img = this.value;
    this.signature = this.$refs.signature;
  }

  show() {
    this.isFocus = true;
  }

  close() {
    this.isFocus = false;
  }

  showSignatrue() {
    if (this.readonly) return;
    this.isFocus ? this.close() : this.show();

    this.$nextTick(() => {
      const content: any = this.$refs.signatruewrap;

      this.signatrueHeight = content.offsetHeight;

      this.signatrueWidth = content.offsetWidth;
    });
  }

  back() {
    this.close();
  }

  reset() {
    this.signature.clear();

    this.isRest = true;
  }

  onBegin() {
    this.isRest = false;
  }

  ok() {
    this.signature.saveAsPng();
  }

  saveAsPng(data: any) {
    // 
    this.img = data;

    this.close();

    this.reset();

    this.$emit("change", this.img);
  }

  deleteImg() {
    if (this.readonly) return;
    this.img = "";

    this.isRest = false;

    this.$emit("change", this.img);
  }

  @Watch("value")
  onValueChange(val: string) {
    if (val) {
      this.img = val;
    }
  }
}
</script>
<style lang="less" scoped>
.scale-hairline-common(@color, @top, @right, @bottom, @left) {
  content: "";
  position: absolute;
  background-color: @color;
  display: block;
  z-index: 1;
  top: @top;
  right: @right;
  bottom: @bottom;
  left: @left;
}
.hairline(@direction, @color: @border-color-base) when (@direction = "bottom") {
  border-bottom: 1px solid @color;

  html:not([data-scale]) & {
    @media (min-resolution: 2dppx) {
      border-bottom: none;

      &::after {
        .scale-hairline-common(@color, auto, auto, 0, 0);
        width: 100%;
        height: 1px;
        transform-origin: 50% 100%;
        transform: scaleY(0.5);

        @media (min-resolution: 3dppx) {
          transform: scaleY(0.33);
        }
      }
    }
  }
}

.hairline(@direction, @color: @border-color-base, @radius: 0)
  when
  (@direction = "all") {
  border: 1px solid @color;
  border-radius: @radius;

  html:not([data-scale]) & {
    @media (min-resolution: 2dppx) {
      position: relative;
      border: none;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 200%;
        height: 200%;
        border: 1px solid @color;
        border-radius: @radius * 2;
        transform-origin: 0 0;
        transform: scale(0.5);
        box-sizing: border-box;
        pointer-events: none;

        // @media (min-resolution: 3dppx) {
        //   width: 300%;
        //   height: 300%;
        //   border-radius: @radius * 3;
        //   transform: scale(0.33);
        // }
      }
    }
  }
}

.signatrue {
  position: relative;
  .hairline("bottom", #eee);
  text-align: left;
  background: #fff;
  &--row {
    .row__file {
      font-size: 15px;
      // padding: 10px 15px;
      display: flex;
      text-align: left;
      .field__label {
        width: 106px;
        flex: none;
        position: relative;
        .required {
          left: -8px;
          top: 0;
          position: absolute;
          //  color:red;
        }
      }
      .field__content {
        color: #999;
        flex: 1;
        .icon {
          font-size: 12px;
          float: right;
          line-height: 15px;
        }
      }
    }

    .img__wrap {
      margin: 0 15px;
      position: relative;
      float: left;
      .hairline("all", rgba(221, 221, 221, 1));
      border-radius: 0.08rem;
      margin-bottom: 0.346rem;
      img {
        width: 2rem;
        height: 2rem;
      }
      .img__delete {
        color: #666;
        width: 0.64rem;
        height: 0.64rem;
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
<style lang="less">
.signatrue-panel {
  height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  &__title {
    flex: none;
    position: relative;
    text-align: center;
    color: #333;
    font-size: 0.48rem;
    font-weight: 500;
    &--back {
      position: absolute;
      left: 0;
      top: 0;
      font-size: 0.42rem;
      color: @primary-color;
      span {
        padding-left: 0.4rem;
        padding-right: 0.16rem;
      }
    }
  }
  &__content {
    overflow: hidden;
    flex: 1;
  }
  &__footer {
    //  display: flex;
    .button {
      float: left;
      z-index: 100;
      width: 100%;
      // display: flex;
      // margin: 0 auto;
      margin-bottom: 0.213rem;
      & > div {
        width: 4rem;
        // float:left;
        flex: 1;
        &.right-btn {
          float: right;
          margin-right: 0.507rem;
        }
        &.left-btn {
          float: left;
          margin-left: 0.507rem;
        }
        .h3-button {
          // margin-left: 0.49rem;
          // margin-right: 0.49rem;
          height: 1.07rem;
          line-height: 1.07rem;
          border-radius: 0.667rem;
          &.h3-button-primary {
            background-color: @primary-color;
          }
          &.h3-button-primary,
          &.h3-button-primary::before {
            border: none;
          }
          &:not(.h3-button-primary) {
            overflow: visible;
          }
          &:not(.h3-button-primary)::before {
            border-radius: 50px !important;
          }
        }
      }
    }
  }
}
</style>

