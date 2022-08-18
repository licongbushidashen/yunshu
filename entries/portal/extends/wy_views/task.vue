<template>
  <div style="    height: 100%;     overflow-y: auto;">
    <div class="wy_tabs">
      <ul>
        <li
          v-for="(item, index) in dcdb"
          :key="index"
          @click="change(item, index)"
        >
          <span :class="falg == index + 1 ? 'active' : ''">{{
            item.label
          }}</span>
          <span
            v-if="$store.state.wynum > 0 && index == 0"
            style="background: rgb(186, 5, 5);border-radius: 50%;width: 24px;height: 24px;line-height: 24px; display: inline-block;
                    position: absolute;
                    top: 6px;
                    right: 23px;
                    font-size: 12px;
                        text-align: center;
                    color: rgb(255, 255, 255);"
            >{{ $store.state.wynum }}</span
          >
          <span
            v-if="$store.state.wynum1 > 0 && index == 1"
            style="background: rgb(186, 5, 5);border-radius: 50%;width: 24px;height: 24px;line-height: 24px; display: inline-block;
                    position: absolute;
                    top: 6px;
                    right: 23px;
                    font-size: 12px;
                        text-align: center;
                    color: rgb(255, 255, 255);"
            >{{ $store.state.wynum1 }}</span
          >
        </li>
      </ul>
    </div>
    <unfinished v-if="falg == 1" />
    <workItem v-if="falg == 2" />
    <myYb v-if="falg == 3" />
    <myread v-if="falg == 4" />
    <MyWorkflow v-if="falg == 5" />
  </div>
</template>
<script>
import {
  workflowCenterApi,
  workflowCenter as workflowCenterParams,
  homeApi
} from "@cloudpivot/api";
import workItem from "./myUnReadWorkItem.vue";
import unfinished from "./unfinished.vue";
import myYb from "./myYb.vue";
import MyWorkflow from "./my-workflow.vue";
import myread from "./myread.vue";
export default {
  components: { workItem, unfinished, myYb, myread, MyWorkflow },
  data() {
    return {
      falg: 1,
      dcdb: [
        { label: "我的待办", val: 1 },
        { label: "我的待阅", val: 2 },
        { label: "我的已办", val: 3 },
        { label: "我的已阅", val: 4 },
        { label: "我的督办件", val: 5 }
      ]
    };
  },
  mounted() {},
  methods: {
    change(item, index) {
      this.numall();
      this.falg = item.val;
    },
    async numall() {
      // const res = await OAuthApi.getUserInfo();
      // let num = await axios.get(
      //   `/weiyuapi/authine-lowCode/RuntimeForm/getWaitToRead?gh=${(res.data
      //     ? res.data.userId
      //     : "") || "000814"}`,
      //   {}
      // );
      // // let num = await axios.get(
      // //   `/weiyuapi/authine-lowCode/RuntimeForm/getWaitToRead?gh=000814`,
      // //   {}
      // // );
      // let data = num.data;
      const res = await homeApi.getWorkCount("DB");
      if (res.errcode === 0) {
        this.$store.state.wynum = res.data.workItemCount;
        this.$store.state.wynum1 = res.data.circulateItemCount;
      }
    }
  },
  beforeDestroy() {}
};
</script>
<style lang="less" scoped>
.wy_tabs {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
  margin-top: 10px;
  height: 70px;
  line-height: 70px;
  padding-left: 40px;
  ul {
    display: flex;
    li {
      position: relative;
      color: #000;
      font-size: 17px;
      &:hover {
        color: #be0404;
        cursor: pointer;
      }
      &::after {
        content: "";
        display: inline-block;
        height: 20px;
        width: 1px;
        background: #e0e0e0;
        position: relative;
        top: 4px;
        margin: 0px 20px;
      }
    }
    li:last-child {
      &::after {
        width: 0px;
      }
    }
    .active {
      color: #be0404;
      position: relative;
      // &::before {
      //   content: "";
      //   display: block;
      //   position: absolute;
      //   width: 0;
      //   height: 0;
      //   top: 45px;
      //   left: 43%;
      //   border-width: 8px 8px 0;
      //   border-style: solid;
      //   border-color: #e4e4ec transparent transparent; /*黄 透明 透明 */
      // }
      // &::after {
      //   content: "";
      //   display: block;
      //   position: absolute;
      //   top: 43px;
      //   left: 43%;
      //   border-left: 8px solid transparent;
      //   border-right: 8px solid transparent;
      //   border-top: 8px solid #fff;
      // }
    }
    .active {
      color: #be0404;
    }
  }
}
</style>
