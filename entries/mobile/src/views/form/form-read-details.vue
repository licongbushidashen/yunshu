<template>
  <div>
    <h3-tab :lineWidth="2" :customBarWidth="'24px'" v-model="currentIndex">
      <h3-tab-item :selected="currentIndex === 0">未阅</h3-tab-item>
      <h3-tab-item :selected="currentIndex === 1">已阅</h3-tab-item>
    </h3-tab>
    <div class="tab-content">
      <div class="form-approval-details" v-show="currentIndex === 0">
        <header class="circulationsCount">{{noreadusers.length}}人未阅</header>
        <div
          v-for="(user, i) in noreadusers"
          :key="i"
          class="form-approval-details__user"
        >
          <h3-avatar
            v-if="user.approvaler.imgUrl && user.approvaler.imgUrl.includes('http')"
            :src="user.approvaler.imgUrl"
          ></h3-avatar>
          <h3-avatar
            v-else-if="user.approvaler.imgUrl"
            :src="getDownloadUrl(user.approvaler.imgUrl)"
          ></h3-avatar>
          <i v-else class="icon aufontAll h-icon-all-normal_smile"></i>
          <div class="form-approval-details__info">
            <label>{{
              user.trustor && user.trustor.id
                ? `${user.name}${$t("languages.common.trust", {
                    name: user.trustor.name,
                  })}`
                : user.approvaler.name
            }}</label>
            <span>{{ user.dept || $t("languages.common.unknown") }}</span>
          </div>
        </div>
      </div>
      <div class="form-approval-details" v-show="currentIndex === 1">
        <header class="circulationsCount">{{readUsers.length}}人已阅</header>
        <div
          v-for="(user, i) in readUsers"
          :key="i"
          class="form-approval-details__user"
        >
          <h3-avatar
            v-if="user.approvaler.imgUrl && user.approvaler.imgUrl.includes('http')"
            :src="user.approvaler.imgUrl"
          ></h3-avatar>
          <h3-avatar
            v-else-if="user.approvaler.imgUrl"
            :src="getDownloadUrl(user.approvaler.imgUrl)"
          ></h3-avatar>
          <i v-else class="icon aufontAll h-icon-all-normal_smile"></i>
          <div class="form-approval-details__info">
            <label>{{
              user.trustor && user.trustor.id
                ? `${user.name}${$t("languages.common.trust", {
                    name: user.trustor.name,
                  })}`
                : user.approvaler.name
            }}</label>
            <span>{{ user.dept || $t("languages.common.unknown") }}</span>
          </div>
          <div class="form-approval-details__info-approvalTime">
            {{user.approvalTime}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { H3Tab, H3TabItem, H3Avatar } from "h3-mobile-vue";
@Component({
  name: "read-detail",
  components: {
    H3Tab,
    H3TabItem,
    H3Avatar,
  },
})
export default class ReadDetail extends Vue {
  currentIndex: number = 0;

  readUsers = [];

  noreadusers = [];

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem("token");
  }

  getDownloadUrl(refId: string) {
    let url = `${this.apiHost}/api/aliyun/download?refId=${refId}`;
    if (this.token) {
      url += "&T=" + this.token;
    }
    return url;
  }

  created() {
    const params: any = this.$route.params as any;
    this.readUsers = params.user?params.user.filter((item) => item.workActionType===11):[];
    this.noreadusers = params.user?params.user.filter((item) => item.workActionType===10):[];
  }
}
</script>
<style lang="less" scoped>
@import "~@/styles/mixins.less";
@import "~@/styles/mixins/hairline.less";
.form-approval-details {
  height: 100%;
  border-color: #f7f8fc;
  &__user {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    .hairline("bottom", #eeeeee);
    position: relative;
    .px2rem(height, 150px);
    img {
      .px2rem(margin-left, 30px);
      .px2rem(margin-right, 30px);
      .px2rem(margin-bottom, 10px);
    }
    & > i.icon {
      .px2rem(font-size, 80px);
      .px2rem(margin-left, 30px);
      .px2rem(margin-right, 30px);
      .px2rem(margin-bottom, 10px);
      color: #ffb131;
    }
  }
  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: left;
    label {
      color: #333;
      font-weight: bold;
      .px2rem(font-size, 32px);
      .px2rem(margin-bottom, 16px);
    }
    span {
      color: rgba(0, 0, 0, 0.65);
      .px2rem(font-size, 26px);
    }
  }
  &__info-approvalTime {
    .px2rem(margin-right, 32px);
    .px2rem(font-size, 32px);
    color: #999999;
  }
  header.circulationsCount{
    .px2rem(height, 75px);
    .px2rem(line-height, 75px);
    .px2rem(padding-left, 30px);
    text-align: left;
    color: #999999;
  }
}
</style>
