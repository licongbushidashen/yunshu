
<template>
 <span v-if="readonly">{{ text }}</span>
  <h3-input-number 
    v-else
    :ctrl="ctrl"
    :isMobile="mobile"
    :controlOpts="controlOpts"
    :class="{'mobileShow': mobile}"
    v-model="val"
    :placeholder="(mobile && readonlyFormula) ? '' :placeholder"
    :disabled="readonlyFormula" style="width:100%"
    @keydown="onKeydown"
    @change="onChange"
    @blur="onBlur"
    @format="format"
    @focus="onFocus"/>
</template>

<script lang="ts">
import { Subscription } from "rxjs";
import { Component, Vue, Prop, Watch, Inject } from "vue-property-decorator";
import { NumberControl } from "h3-forms";
import { NumberOptions, NumberFormatType } from "@cloudpivot/form/schema";
import { NumberInputControl } from "@cloudpivot/form/src/common/controls/input-controls/number-input-control";
import H3InputNumber from './h3-input-number.vue';
import numberFilter from "@cloudpivot/form/utils/number-filter";
import * as numberFormatter from "@cloudpivot/form/utils/number-formatter";
@Component({
  name: "input-number",
  components: {
    H3InputNumber
  },
  filters: {
    number: numberFilter
  }
})
export default class PcInputNumber extends NumberInputControl {
  val: any = "";

  text: string  = "";

  subscription?: Subscription;

  focused = false;

  @Prop({
    default: false
  })
  mobile!: boolean

  setControl() {
    const _ctrl = this.ctrl as NumberControl;

    console.log('setControl', _ctrl)
    this.val = _ctrl.hasValue ? _ctrl.value : "";

    // if (_ctrl.hasValue) {
    this.formatNumber();
    // }
  }

  formatNumber() {
    if (!this.readonly) {
      if (!this.focused && this.$el) {
        const input = this.$el.querySelector("input");
        if (input) {
          this.format(input);
        }
      }
    } else {
      //查看模式
      if(typeof this.formatter() === 'string' && this.formatter().includes("%")){
        this.text = this.numberToDisplay(this.accMul(this.val,100),'format1')
      }else{
        this.text = this.formatter();
      }
    }
  }

  handleValueChange(value: any): void {
    const _ctrl = this.ctrl as NumberControl;

    this.$emit("change", _ctrl.value);
    this.val = _ctrl.hasValue ? (_ctrl.value as any) : null;
    this.formatNumber();
  }


  // @Watch("val", {
  //   immediate: true
  // })
  // onValueChange(val: any) {
  //   if (val !== "" && val !== null) {
  //     val = Number(val);
  //   }
  //   if (typeof val === "number" && !Number.isNaN(val)) {
  //     // this.ctrl.value = val;
  //     this.setValue(this.typeTrans(val));
  //     this.val = this.typeTrans(val);
  //   } else {
  //     this.ctrl.value = null;
  //     this.val = "";
  //   }
  // }

  onChange(val: any) {
    if (val !== "" && val !== null) {
      val = Number(val);
    }
    if (typeof val === "number" && !Number.isNaN(val)) {
      this.setValue(this.typeTrans(val));
      this.val = this.typeTrans(val);
    } else {
      this.val = "";
      this.setValue(null);
    }
  }

  onKeydown(evt: KeyboardEvent) {
    const ft = this.controlOpts.format1;
    if (ft === NumberFormatType.Int || ft === NumberFormatType.Ratio) {
      if (evt.key === ".") {
        evt.preventDefault();
      }
    }
  }

  onBlur(evt: KeyboardEvent) {
    this.focused = false;
    const input = evt.target as HTMLInputElement;
    this.format(input);
    this.$emit("blur");
  }
  

  onFocus(evt: KeyboardEvent) {
    this.focused = true;
    if(this.controlOpts.format1 && this.controlOpts.format1.includes("ratio") &&
    typeof super.formatter() ==='string'){
      this.changeFormat1();
    }
    setTimeout(() => {
      const input = evt.target as HTMLInputElement;
      input.value = this.val;
    }, 100);
    this.$emit("focus");
  }

  format(input: HTMLInputElement) {
    let format = super.formatter();
    this.setValue(this.ctrl.value);
    if(this.controlOpts.format1 && this.controlOpts.format1.includes("ratio") &&
    typeof format ==='string' && this.val) {
      setTimeout(() => {
        let val = this.numberToDisplay(this.accMul(this.val,100),'format');
        return input.value = val;
      }, 100);
    } else{
      // 设置500ms 兼容ie浏览器有时无法渲染格式化值问题
      setTimeout(() => {
        return input.value = format;
      }, 100);
    }
  }

  /*
    *乘法函数，用来得到精确的乘法结果
    *说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
    *调用：accMul(arg1,arg2)
    *返回值：arg1乘以arg2的精确结果
  */
  accMul(arg1, arg2) {
    var m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) {}
    try {
      m += s2.split(".")[1].length
    } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  }
  
  /**
   * 前端处理百分数显示
   */
  changeFormat1(){
    if(!this.controlOpts.isFlag){
            switch(this.controlOpts.format1){
              case 'ratio' :
               this.controlOpts.format1=NumberFormatType.Ratio3;
                break;
              case 'ratio.tenths' :
               this.controlOpts.format1=NumberFormatType.Ratio4;
                break;
              case 'ratio.percentile' :
               this.controlOpts.format1=NumberFormatType.Ratio5;
                break;
              case 'ratio.Millimeter' :
               this.controlOpts.format1=NumberFormatType.Ratio6;
                break;
              case 'ratio.tenThousand' :
               this.controlOpts.format1=NumberFormatType.Ratio7;
                break;
              case 'ratio.hundredThousand' :
               this.controlOpts.format1=NumberFormatType.Ratio8;
                break;
              case 'ratio.millionDecimals' :
               this.controlOpts.format1=NumberFormatType.Ratio9;
                break;
            }
            this.controlOpts.isFlag=true;
          }
  }

  numberToDisplay(value:any,filed){
    let result:any = value;
    switch(this.controlOpts[filed]){
      case 'ratio': 
        result = numberFormatter.ratio.formatter(result, {
          precision: 0,
        });
        break;
      case 'ratio.tenths' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 1,
        });
        break;
      case 'ratio.percentile' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 2,
        });
        break;
      case 'ratio.Millimeter' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 3,
        });
        break;
      case 'ratio.tenThousand' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 4,
        });
        break;
      case 'ratio.hundredThousand' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 5,
        });
        break;
      case 'ratio.millionDecimals' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 6,
        });
        break;
      case 'ratio.tenMillionDecimals' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 7,
        });
        break;
      case 'ratio.billionDecimals' :
        result = numberFormatter.ratio.formatter(result, {
          precision: 8,
        });
        break;
    }
    return result;
  }
  // doFormat() {
  //   if (typeof this.ctrl.value === "number") {
  //     const input = this.$el.querySelector("input");
  //     if (input) {
  //       this.format(input);
  //     }
  //   }
  // }

  // mounted() {
  //   this.$nextTick(() => {
  //     this.doFormat();
  //   })
  // }

  destroyed() {
    super.destroyed();
  }

  // @Watch("readonly")
  // onWritableChange() {
  //   if (!this.ctrl.readonly) {
  //     this.$nextTick(() => {
  //       this.doFormat();
  //     });
  //   }
  // }
}
</script>

<style lang="less">
.mobileShow {
  input {
    background: #ffffff;
  }
}
</style>
