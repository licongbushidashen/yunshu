<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";

@Component({name: 'CTitle'})
export default class CTitle extends Vue {
  @Prop({default:{}})
  control!:any
  render(h:Function) {
    return h("a-rate",{props: {
      disabled:true,
      count: this.control.options.count
    }});
  }
}
</script>