<!--
 * @Author: Fan
 * @Date: 2020-04-16 17:53:56
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'Radio'})
export default class Radio extends Vue {
  @Prop()
  control!:any // 当前控件的控制器
  render(h:Function) {
    return h('a-radio-group', {props:{
      disabled: true,
      options: this.control.options.options ? this.control.options.options.split(';') : []
    }})
  }
}
</script>