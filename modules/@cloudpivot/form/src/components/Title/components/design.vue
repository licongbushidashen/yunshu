<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from "vue-property-decorator";
function getLabel(control : any, locale : string) {
  if (!control || !control.options) {
    return "";
  }

  let name = control.options.name;
  const name_i18n = control.options.name_i18n;
  if (name_i18n) {
    // const map = JSON.parse(name_i18n);
    const map = name_i18n;
    if (map[locale]) {
      name = map[locale];
    }
  }

  return name;
}
@Component({name: 'FormTitle'})
export default class FormTitle extends Vue {
  @Prop({default:{}})
  control!:any
  render(h:Function) {
    const locale = (this as any).$i18n? (this as any).$i18n.locale:'';
    return h("h2",{
      style: {
        color: 'rgba(0,0,0,.85)',
        fontWeight: 'normal'
      }
    }, `${getLabel(this.control,locale)}`);
  }
}
</script>