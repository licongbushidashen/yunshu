<template>
  <div class="user-picker" v-show="visible">
    <div class="user-picker-header">
      <div class="input-box">
       <search-bar
        :value="keyword"
        @cancel="cancelSearch"
        @search="search"
      />
      </div>
    </div>

    <div class="user-picker-body">
      <h3-scroll
        ref="scroll"
        :loadMore="loadMore"
        :pageSize="15"
        :noMoreMessage="$t('cloudpivot.formComment.mobile.loadAll')"
        v-show="isEmpty"
      >
        <div class="member-list">
          <ul>
            <li
              v-for="(item, index) in members"
              :key="index"
              @click="selectUser(item)"
            >
              <div
                class="select-box"
                :class="item.selected ? 'selected' : ''"
              >
                <i v-if="item.selected" class="icon aufontAll h-icon-all-check"></i>
              </div>

              <div class="avatar">
                <img v-if="item.imgUrl" :src="item.imgUrl" />
                <i v-else class="icon aufontAll h-icon-all-normal_smile default-avatar"></i>
              </div>

              <div class="user-name">
                {{ item.name }}
              </div>
            </li>
          </ul>
        </div>
      </h3-scroll>
      <Empty v-show="!isEmpty"></Empty>
    </div>

    <div class="user-picker-footer">
      <div class="user-picker-footer-left">
        <span>{{ $t('cloudpivot.formComment.mobile.selected') }} </span>
        <span class="has-select">{{ `${selectedNum}${$t('cloudpivot.formComment.mobile.person')}` }}</span>
      </div>

      <div>
        <button class="j-button" @click="submit">{{ $t('cloudpivot.formComment.mobile.sure') }}</button>
        <!-- <button class="j-button" @click="closeee">关闭</button> -->
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {H3SearchBar, H3Button} from 'h3-mobile-vue';

import * as FormCommentIns from '@cloudpivot/api'

import  FastClick  from  'fastclick'

import common from '@cloudpivot/common/mobile';
import commonT from '@cloudpivot/common';
import mobile from '@cloudpivot/form/src/renderer/components/mobile';
@Component({
name: 'CompName',
components: {
  H3SearchBar,
  H3Button,
  SearchBar: common.components.Searchbar,
  Empty: common.components.Empty,
  H3Scroll: mobile.H3Scroll,
},
directives: {
    // ControlBack : commonT.directives.controlBack,
  }
})
export default class UserPicker extends Vue {
  @Prop() schemaCode !:any;

  @Prop() bizObjectId !:any;

  @Prop() workflowInstanceId !:any;

  @Prop({
    default: false
  })
  visible!: boolean;

  keyword:string = '';

  isEmpty:boolean = true;

  page:number = 0;

  pageSize:number = 15;

  members:any = [];

  selectedUsers:any[] = [];

  get selectedNum(){
    const sUsers:any = this.members.filter((item:any) => item.selected);
    return sUsers.length;
  }

  mounted() {
    FastClick.attach(document.querySelector('.user-picker-body'));
  }

  closeee(){
    this.$emit('close')
  }

  async loadMore(pager: any, done: any){
    this.page = pager.num - 1;

  if (this.page === 0) {
      this.members = [];
    }

    const { bizObjectId, schemaCode, workflowInstanceId, page, pageSize, keyword } = this;
    
    if (!bizObjectId || !schemaCode) return; 

    const params: FormCommentIns.formCommentParams.GetAtUser = {
      bizObjectId,
      schemaCode,
      keyword,
      wfInstanceId: workflowInstanceId,
      page,
      pageSize
    }

    const res:any = await FormCommentIns.FormCommentApi.getAtUsers(params);

   if (done) {
      done(this.pageSize, res.data.totalElements);
    }

    if (res.errcode === 0) {
      const { data} = res;
      // 新增一个辅助属性
      data.content.forEach((item:any) => {
        item.selected = false;
      })
      this.members = this.members.concat(data.content);
      this.isEmpty =  !!this.members.length;
    } else {
      console.error(res.errmsg);
    }
  }

  selectUser(user:any){
    this.members.forEach((m:any) => {
      m.selected = false;
    });
    user.selected = true;
  }

  cancelSearch(){
    this.search('');
  }

  search(kw:any){
    if (kw === this.keyword) {
      return;
    }
    this.keyword = kw;
    // const scroll = this.$refs.scroll as any;
    // scroll.mescroll.resetUpScroll();
    this.isEmpty = true;
    this.loadMore({ num: 1 }, null);
  }

  submit(){
    const { members } = this;
    const data:any = members.filter((m:any) => {
      return m.selected;
    });

    if (data.length <= 0) {
      this.$h3.toast.show({
        text: `${this.$t('cloudpivot.formComment.mobile.choose')}`,
        autoHide: true,
        iconType: "close",
        duration: 1000
      });
    } else {
     this.$emit('ok', data);
    }
  }

  @Watch("visible")
  onVisibleChange(v:boolean) {
      if (v) {
        this.loadMore({ num: 1 }, null);
      }
  }
}
</script>
<style lang='less' scoped>
@import "~@cloudpivot/common/styles/mixins.less";
  .user-picker{
    .input-box {
      width: 100%;
      .px2rem(padding-top, 30px);
      .px2rem(padding-right, 16px);
      .px2rem(padding-bottom, 30px);
      .px2rem(padding-left, 16px);
      & > .picker-input {
        width: 100%;
        background: rgba(244,244,248,1);
        .px2rem(border-radius, 28px);
      }
    }

    .user-picker-body {
      height: 100%;
      touch-action: none;
      /deep/.mescroll {
        .px2rem(top, 130px);
        .px2rem(bottom, 130px);
        height: auto;
      }
      .member-list > ul > li {
        .px2rem(padding-top, 24px);
        .px2rem(padding-right, 30px);
        .px2rem(padding-bottom, 24px);
        .px2rem(padding-left, 30px);
        border-top: 1px solid #EEEEEE;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        & > .select-box {
          .px2rem(width, 44px);
          .px2rem(height, 44px);
          .px2rem(line-height, 44px);
          .px2rem(margin-right, 30px);
          border-radius: 50%;
          border: 1px solid rgba(204,204,204,1);
          text-align: center;

          & > i.icon {
            color: white;
            .px2rem(font-size, 22px);
          }
          &.selected {
            border-color: #2970FF;
            background: #2970FF;
          }
        }
        & > .avatar {
          .px2rem(width, 64px);
          .px2rem(height, 64px);
          .px2rem(margin-right, 30px);
          border-radius: 50%;
          & > img {
            .px2rem(width, 64px);
            .px2rem(height, 64px);
            border-radius: 50%;
          }
          & > .default-avatar {
            .px2rem(width, 64px);
            .px2rem(height, 64px);
            .px2rem(line-height, 64px);
            .px2rem(font-size, 64px);
            color: #36CFC9;
          }
        }
        & > .user-name {
          color: #333333;
          .px2rem(font-size, 30px);
        }
      }
    }

    .user-picker-footer {
      .px2rem(padding, 30px);
      border-top: 1px solid #E4E4E4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      &-left {
      & > .has-select {
        color: #2970FF;
        }
      }
    }
    &  .j-button {
      .px2rem(padding-top, 16px);
      .px2rem(padding-bottom, 16px);
      .px2rem(padding-left, 30px);
      .px2rem(padding-right, 30px);
      .px2rem(font-size, 30px);
      .px2rem(border-radius, 40px);
      background-color: #2970FF;
      color: white;
    }
  }

</style>
