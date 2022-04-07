<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
import {labelText} from "@cloudpivot/form/src/schema/system-data-item-codes"
import CreateStaffSelector from "@cloudpivot/form/src/common/components/createStaffSelector.vue"

@Component({
  name: 'DepartmentMultiSelectorDesign',
  components: {
    CreateStaffSelector
  }
})
export default class DepartmentMultiSelectorDesign extends Vue {
  @Prop()
  control!:any // 当前控件的控制器
  render(h:Function) {
    return h('create-staff-selector', {props:{ opts: {disabled:true}
    }})
  }
}
</script>