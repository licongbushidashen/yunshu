<!--
 * @Descripttion: 审批意见弹窗
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-08-26 14:43:14
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-10-15 16:37:29
-->
<template>
  <div class="popupMotail" :class="[isCancel ? 'popupMotail-active' : '']">
      <div class="popupMotail-mask" :class="[isCancel ? 'popupMotail-mask-active' : '']" @click="onChange"></div>
      <div class="popupMotail-contentBox" :class="{'popupMotail-contentBox-active': isCancel,  'popup-viewer-ios-wx': isIOSWX}">
          <div class="popupMptail-title">
            <span>{{$t("cloudpivot.form.renderer.oftenOption")}}</span>
            <span class="popupMptail-title-sum" v-if="realTotle>10">总共<span class="sum-number">{{realTotle}}</span>条</span>
          </div>
          <div class="popupMotail-search" v-if="realTotle>10">
            <div class="popupMotail-search-top">
            <h3-search-bar
          ref="searchInput"
          class="popupMotail-search-input"
          :onChange="onKeyChange"
        />
            </div>
           <div class="popupMotail-result" v-show="keywords.length>0">
             搜索结果：共 <span>{{total}}</span> 条
           </div>
          </div>
          <ul class="popupMotail-list" v-if="realTotle>0">
             <li v-for="(item,index) in commentList" :key="item.id" @click="selectItem(item)">
               <div class="popupMotail-list-left">
                    <i class="icon aufontAll h-icon-all-message-o"></i>
                    <p>{{item.content}}</p>
                 </div>
                <div class="popupMotail-list-right">
                  <i class="icon aufontAll h-icon-all-pen-o" @click.stop="addOpinion(item,index)"></i>
                  <i class="icon aufontAll h-icon-all-delete-o" @click.stop="deleteOpinion(item.id)"></i>
                </div>
             </li>
          </ul>
          <div class="popupMotail-nodata" v-else>
              <img src="../images/empty@2x.png" alt="暂无内容">
              <p>{{$t("cloudpivot.form.renderer.noData")}}</p>
          </div>
          <div class="popupMotail-add" @click="addOpinion({id:''})" v-show="realTotle<10">
            <i class="icon aufontAll h-icon-all-plus-o"></i>
            {{$t("cloudpivot.form.renderer.addDatas")}}
          </div>
      </div>

    </div>
</template>
<script lang='ts'>
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { State } from 'vuex-class';

import { H3Input, H3SearchBar } from 'h3-mobile-vue';

@Component({
  name: 'opinion-model',
  components: {
    H3Input,
    H3SearchBar
  }
})
export default class OpinionModel extends Vue {
  
  @Prop({default: false}) isCancel!: boolean;

  @Prop({default: ()=>[]}) data!: any[];

  realTotle: number =0;

  isIOSWX: boolean = false;

  keywords: string = "";

  commentList: any[] = [];

  tempList : any[] = [];

  total: number =0;


 
  /* 监听data数据变化 */
  @Watch('data')
  onDataChange(v:any) {
    // 查询条件-发生改变时更新store
    this.commentList=v;
    this.realTotle=this.commentList.length;
    this.tempList=[...this.commentList];
  }

  @Watch('commentList')
  onCommentListChange(v:any[]) {
    // 查询条件-发生改变时更新store
    this.total=v.length;
  }

onKeyChange(e){//模糊搜索
   this.keywords=e;
   if(!e){
     this.commentList=this.tempList;
   }else{
     const str: string=e.trim();
     this.commentList=this.commentList.filter(item=>{return item.content.includes(str)})
   }
}
 created(){
    const ua: string = navigator.userAgent;
  }

/**
 * 删除审批意见
 */
deleteOpinion(id:string){
  this.$emit('deleteOpinion', id);
}

 /**
  * 添加审批意见
  */
 addOpinion(item? : any,index?:number){
    if(item && index){
      item.index=index+1;
    }
    this.$emit('addOpinion',item);
 }

  selectItem(item){
    this.$emit('select',item);
    this.onChange();
  }
  onChange(){
    this.$emit('update:isCancel', false);
  }

  openForm(workitem:any) {
    this.$router.push({
      name: 'form-detail',
      query: {
        workitemId: workitem.id,
        workflowInstanceId: workitem.instanceId,
        return: this.$route.fullPath,
        workitemType: 'unfinishedWorkitem'
      }
    }).catch((err: any) => {err});
  }
}
</script>
<style lang='less' scoped>

@baseFontSize: 75px;
.px2rem(@name, @px) {
    @{name}: @px/@baseFontSize * 1rem;
}

.popupMotail {
	width: 100vw;
	position: fixed;
	left: 0;
	bottom: 0;
	right: 0;
	top: 0;
	overflow: hidden;
	z-index: 99;
	height: 100%;
  transform: scale(0);
  &.popupMotail-active{
    transform: scale(1);
  }
  .popupMotail-mask{
    display: block;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0,0,0,.4);
    -webkit-transition: opacity .3s;
    transition: opacity .3s;
    &.popupMotail-mask-active{
      opacity: 1;
    }
 }
 .popupMotail-contentBox{
    display: block;
    position: absolute;
    bottom: env(safe-area-inset-bottom);
    width: 100%;
    height: auto;
    left: 0;
    background-color: #fff;
    transform: translateY(100%);
    -webkit-transition: -webkit-transform .3s ease;
    transition: -webkit-transform .3s ease;
    transition: transform .3s ease;
    &.popupMotail-contentBox-active{
      transform: translateY(0);
    }
    .popupMptail-title{
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .px2rem(padding-left, 30px);
      .px2rem(padding-right, 30px);
      .px2rem(height, 90px);
      color: #666;
      .px2rem(font-size, 30px);
      border-bottom: 4px solid #f3f3f7;
      >.popupMptail-title-sum{
        color: #6D7278;
        .px2rem(font-size, 24px);
        line-height: 1em;
        >.sum-number{
          color: #2970FF;
          margin: 0 2px;
        }
      }
    }
    .popupMotail-nodata{
      .px2rem(padding-top, 30px);
      .px2rem(padding-bottom, 40px);
      >img{
        .px2rem(width, 320px);
      }
      >p{
        .px2rem(margin-top, 14px);
        color: #999;
        .px2rem(font-size, 30px);
      }
    }
    .popupMotail-search-top{
      width: 100%;
      .px2rem(padding-left, 30px);
      .px2rem(padding-right, 30px);
      display: flex;
      align-items: center;
      .popupMotail-search-input{
          flex: 1;
          .px2rem(height, 60px);
          .px2rem(margin-top, 16px);
          .px2rem(margin-bottom, 16px);
          /deep/.h3-search-input {
          background-color: #F7F8FC;
          border-radius: 0.37rem;
        }
        /deep/.h3-search-cancel {
          color: #F4454E;
        }
      }
      .cancel{
       color: #F4454E;
       .px2rem(font-size, 32px);
       padding-top: 10px;
      }
    }
    .popupMotail-result{
      width: 100%;
      .px2rem(height, 80px);
      background-color: #F7F8FC;
      .px2rem(padding-left, 30px);
      color: #999;
      .px2rem(font-size, 26px);
      text-align: left;
      display: flex;
      align-items: center;
      >span{
          color: #2970FF;
          margin: 0 2px;
      }

    }
    .popupMotail-list{
      .px2rem(max-height, 450px);
      overflow: auto;
      >li{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
         .px2rem(padding-left, 30px);
         .px2rem(padding-right, 30px);
         .px2rem(height, 90px);
         border-top: 1px solid #f7f8fc;
         .px2rem(font-size, 30px);
          &:active{
            background-color: #f5f5f9 !important;
          }
         >.popupMotail-list-left{
           color: #333;
           flex: 1;
           display: flex;
           align-items: center;
           >i{
             .px2rem(margin-right, 20px);
           }
           >p{
             white-space: nowrap;
             overflow: hidden;
             text-overflow: ellipsis;
             .px2rem(width, 530px);
             text-align: left;
             margin: 0;
           }
         }
         .popupMotail-list-right{
           .px2rem(width, 100px);
           display: flex;
           justify-content: space-between;
           align-items: center;
           color: #b6b6b6;
         }
      }
    }
    .popupMotail-add{
      width: 100%;
      border-top: 5px solid #f4f4f8;
      .px2rem(height, 88px);
      color: #2970FF;
      .px2rem(font-size, 34px);
      display: flex;
      align-items: center;
      justify-content: center;
      >i{
        .px2rem(font-size, 34px);
        .px2rem(margin-right, 8px);
      }
    }
 }
}
.popup-viewer-ios-wx{
  .px2rem(bottom, 100px)!important;
}
</style>