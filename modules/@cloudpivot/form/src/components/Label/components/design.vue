<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import {labelText} from "@cloudpivot/form/src/schema/system-data-item-codes"
import HLabel from "@cloudpivot/form/src/common/components/label.vue"

@Component({
  name: 'Create',
  components: {
    HLabel:HLabel
  }
})
export default class Create extends Vue {
  @Prop()
  control!:any // 当前控件的控制器
  render(h:Function) {
    return h('h-label', {props:{ text: labelText
    }})
  }
}
</script>