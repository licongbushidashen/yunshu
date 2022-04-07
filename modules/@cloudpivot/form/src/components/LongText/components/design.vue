<!--
 * @Author: Fan
 * @Date: 2020-04-18 21:56:55
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'LongTextDesign'})
export default class LongTextDesign extends Vue {

  render(h:Function) {
    return h('a-textarea', {props:{
      disabled: true,
      placeholder: "请输入"
    }})
  }
}
</script>