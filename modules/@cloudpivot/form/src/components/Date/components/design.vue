<!--
 * @Author: Fan
 * @Date: 2020-04-19 19:33:49
 * @description: 
 * @LastEditors: Fan
 -->
<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
@Component({name: 'Calendar'})
export default class Calendar extends Vue {

  render(h:Function) {
    return h('a-date-picker', {props:{
      disabled: true,
      placeholder: "请输入"
    }})
  }
}
</script>