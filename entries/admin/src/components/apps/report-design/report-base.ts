
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';


@Component
export default class ReportBase extends Vue {

  corpId = 'a';

  objectId = '';

  get reportCode() {
    return this.$route.params.reportCode;
  }

  get appCode() {
    return this.$route.params.appCode;
  }

  get token() {
    return localStorage.getItem('token')
  }

  get config() {
    return {
      token: this.token,
      reportCode: this.reportCode,
      appCode: this.appCode
    }
  }

}