
<template>
  <div class="pc-form-comment">
    <h3 class="title">{{ $t('cloudpivot.formComment.pc.writeComment') }}</h3>
    <div class="text-box">
      <div class="textarea-box">
        <!-- <fakeTextarea v-model="comment" :max="2000" :isShowLimit="false" /> -->

        <at
          ref="atPane"
          v-model="comment"
          :members="members"
          :maxlength="maxlength"
          nameKey="name"
          @touchBottom="onTouchBottom"
          @selectUser="onSelectUser"
        >
          <div
            slot="embeddedItem"
            ref="atwhoEditWrap"
            tabindex="0"
            :placeholder="$t('cloudpivot.formComment.pc.member')"
            class="atwho-edit-wrap dp-font34 editWrap"
            contenteditable="true"
            @blur="onAtwhoViewBlur"
            @input="handleInput"
            @mousedown="setDurationStart"
          ></div>
        </at>

      </div>
      <div class="attachment-box">
        <ul>
          <li
            class="file-preview"
            v-for="(item, index) in fileLists"
            :key="index"
            :class="!showImgThumb(item) ? 'file-preview-icon' : ''"
          >
            <template v-if="showImgThumb(item)">
              <img :src="getDownloadUrlPc(item)" />
            </template>
            <template v-else>
              <img v-if="!getIconType(item)" :src="loadingGif" />
              <i
                v-else
                class="icon aufontAll at-type"
                :class="getIconType(item)"
                ></i>
            </template>
            <i
              class="icon aufontAll h-icon-all-close-circle close"
              @click="deleteFile(index)"
            ></i>
          </li>
        </ul>
      </div>
      <div class="text-box-bottom">
        <div class="text-box-bottom-left">
          <div class="upload-area">
            <a-upload
              name="file"
              :multiple="true"
              :fileList="fileList"
              :action="uploadUrl"
              :accept="accept"
              :headers="headers"
              @change="handleChange"
              :beforeUpload="beforeUpload"
            >
              <i class="icon aufontAll h-icon-all-paperclip-o"></i>
            </a-upload>
          </div>
          <span>{{ $t('cloudpivot.formComment.pc.sizeMax') }}</span>
        </div>
        <div class="text-box-bottom-right">
          <span>{{ len>2000?2000:len }}/2000</span>
          <a-button :disabled="!filterHtml(comment).trim() && fileLists.length <= 0 || fileNotAllUploaded" size="small" @click="send('', 'comment')">{{ $t('cloudpivot.formComment.pc.send') }}</a-button>
        </div>
      </div>
    </div>

    <div class="comment-panel">
      <h3 class="title">{{ $t('cloudpivot.formComment.pc.comment') }}<span v-if="num > 0">（{{ num }}）</span></h3>
      <div class="comment" ref="commentWrap">
        <template v-if="commentList.length <= 0">
          <p class="no-comment">{{ $t('cloudpivot.formComment.pc.noComment') }}</p>
        </template>
        <template v-if="commentList.length > 0">
          <div class="comment-list-wrap" ref="commentListWrap">
            <div
              class="comment-item"
              v-for="(item, index) in commentList"
              :key="index"
            >
              <div class="comment-item-left">
                <div class="avatar">
                  <img v-if="item.imgUrl && item.imgUrl.includes('http')" :src="item.imgUrl"/>
                  <img v-else-if="item.imgUrl" :src="getAvatarDownloadUrl(item.imgUrl)" />
                  <i v-else class="icon aufontAll h-icon-all-normal_smile default-avatar"></i>
                </div>
              </div>
              <div class="comment-item-right">
                <div class="username">
                  {{ item.commentatorName }}
                  <i v-if="item.isShowDelBtn" class="fr icon aufontAll h-icon-all-delete-o" @click="deleteComm(item.id)"></i>
                </div>
                <div
                  class="rich-text"
                  :class="item.collspaned ? 'fade' : ''"
                >
                  <span class="text-box" :id="`cc-${item.id}`" v-html="item.text" ></span>
                  <span
                    class="collspan"
                    :class="item.collspaned ? '' : 'static'"
                    v-if="item.isShowColspan"
                    @click="item.collspaned = !item.collspaned"
                  >{{ item.collspaned ? $t('cloudpivot.formComment.pc.expand') : $t('cloudpivot.formComment.pc.collapse')  }}</span>
                </div>
                <div class="attachment-box preview">
                  <ul>
                    <li class="file-preview"
                      v-for="(aitem, aindex) in item.attachmentModelList"
                      :key="aindex"
                      :class="!showImgThumb(item) ? 'file-preview-icon' : ''"
                    >
                      <template v-if="showImgThumb(aitem)">
                        <img :src="getDownloadUrl(aitem)" />
                      </template>
                      <template v-else>
                        <i
                          class="icon aufontAll at-type"
                          :class="getIconType(aitem)"
                          ></i>
                      </template>
                      <div class="op-mask">
                        <span class="op-actions">
                          <template v-if="showImgThumb(aitem)">
                            <i class="icon aufontAll h-icon-all-eye-o preview-icon" @click="preview(aitem)"></i>
                          </template>
                          <i class="icon aufontAll h-icon-all-download-o" @click="downloadFile(aitem)"></i>
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="date-box has-replay">
                  <span class="date">{{ item.createdTime }}</span>
                  <span class="replay-btn" @click="onClickReply(item)">{{ $t('cloudpivot.formComment.pc.reply') }}</span>
                  <div v-show="item.isShowReplay" class="replay-box">
                    <!-- <fakeTextarea v-model="item.reComment" :max="2000" /> -->
                    <at
                      :ref="`atPane${index}`"
                      v-model="item.reComment"
                      :members="members"
                      :maxlength="maxlength"
                      :showPanel="false"
                      nameKey="name"
                      @touchBottom="onTouchBottom(index)"
                      @selectUser="onSelectUser"
                    >
                      <div
                        slot="embeddedItem"
                        :ref="`atwhoEditWrap${index}`"
                        tabindex="0"
                        :placeholder="`${$t('cloudpivot.formComment.pc.reply')}：${replayPlaceholder}`"
                        class="atwho-edit-wrap dp-font34"
                        contenteditable="true"
                        @blur="onAtwhoViewBlur(index)"
                      ></div>
                    </at>
                    <!-- <textarea
                      class="re-textarea"
                      v-model="item.reComment"
                      :placeholder="`回复：${replayPlaceholder}`"
                    ></textarea> -->
                    <p class="len-limit">{{ caculateLen(item) }}/{{ maxlength }}</p>
                    <div class="buttons">
                      <a-button class="cancel" @click="closeRelay(item)" type="default" size="small">{{ $t('cloudpivot.formComment.pc.cancel') }}</a-button>
                      <a-button :disabled="!filterHtml(item.reComment).trim()" type="primary" size="small" @click="replay(item)">{{ $t('cloudpivot.formComment.pc.sure') }}</a-button>
                    </div>
                  </div>
                </div>
                <div class="replay" v-if="item.replys && item.replys.length">
                  <div
                    class="comment-item"
                    v-for="(replayItem, replayIndex) in item.replys"
                    :key="replayIndex"
                  >
                    <div class="comment-item-left">
                      <div class="avatar">
                        <img v-if="replayItem.imgUrl" :src="replayItem.imgUrl" />
                        <i v-else class="icon aufontAll h-icon-all-normal_smile default-avatar"></i>
                      </div>
                    </div>
                    <div class="comment-item-right">
                      <div class="username">
                          {{ replayItem.commentatorName }}
                          <span class="replay-txt">{{ $t('cloudpivot.formComment.pc.reply') }}</span>
                          <i v-if="replayItem.isShowDelBtn" class="fr icon aufontAll h-icon-all-delete-o" @click="deleteComm(replayItem.id)"></i>
                        </div>
                      <div
                        class="rich-text"
                        :class="replayItem.collspaned ? 'fade' : ''"
                      >
                        <span class="text-box" :id="`cc-${replayItem.id}`" v-html="replayItem.text"></span>
                        <span
                          class="collspan"
                          :class="replayItem.collspaned ? '' : 'static'"
                          v-if="replayItem.isShowColspan"
                          @click="replayItem.collspaned = !replayItem.collspaned"
                        >{{ replayItem.collspaned ? $t('cloudpivot.formComment.pc.expand') : $t('cloudpivot.formComment.pc.collapse')  }}</span>
                      </div>
                      <!-- <div class="attechment">附件</div> -->
                      <div class="date-box">
                        <span class="date">{{ replayItem.createdTime }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="more-reply" @click="moreReply(item)" v-if="item.replys.length < item.replyCount">{{ $t('cloudpivot.formComment.pc.moreReplys', {size: item.replySize}) }}</div>
                  <div class="reply-loaded" v-else>{{ $t('cloudpivot.formComment.pc.replyLoaded') }}</div>
                </div>
              </div>
            </div>
            <div class="loading-icon-wrap" v-show="isShowLoading">
              <a-icon class="loading-icon" type="loading" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <a-modal
      title=""
      :width="860"
      :visible="isShowPreview"
      :footer="null"
      @cancel="handleCancel"
    >
      <img class="pre-img" :src="presrc" alt="">
    </a-modal>

  </div>
</template>

<script lang="ts" src="./pc-comment.ts"></script>
<style lang="less">
  @import '../icon-color.less';
  .pc-form-comment {
    width: 100%;
    height: 100%;
    overflow: hidden;
    &  h3.title {
      font-size: 14px;
      color:rgba(0,0,0,.65);
      line-height: 22px;
      font-weight: bold;
      margin: 0 16px;
      margin-bottom: 8px;
    }
    & > .text-box {
      border: 1px solid rgba(217,217,217,1);
      padding: 5px 12px;
      background: white;
      border-radius: 4px;
      margin: 0 16px;
      & > .textarea-box {
      }
      & > .text-box-bottom {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        .text-box-bottom-left {
          & > .upload-area {
            display: inline-block;
            cursor: pointer;
            .ant-upload-list-item-name {
              padding-right: 13px;
              width: 175px !important;
            }
            .icon:hover {
              color: @primary-color;
            }
          }
          & > span {
            margin-left: 8px;
            font-size: 12px;
            color: rgba(0,0,0,.45)
          }
        }
        .text-box-bottom-right {
          & > span {
            margin-right: 8px;
            font-size: 12px;
            color: rgba(0,0,0,.45)
          }
        }
      }
    }
    & > .comment-panel {
      margin-top: 12px;
      height: 100%;
      & > h3.title {
        border-bottom: 1px solid rgba(216,216,216,1);
        line-height: 26px;
      }
      & > .comment {
        padding-bottom: 220px;
        height: calc( 100% - 35px);
        overflow: auto;
        .no-comment {
          text-align: center;
          position: relative;
          top: 20vh;
          font-size: 14px;
          color: rgba(1,1,1,.45);
        }
        .comment-item {
          display: flex;
          margin-bottom: 12px;
          margin: 0 16px;
          margin-bottom: 16px;
          &-left {
            margin-right: 8px;
            .avatar {
              width: 32px;
              height: 32px;
              & > img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
              & > i.default-avatar{
                font-size: 32px;
                line-height: 32px;
                color: #36CFC9;
              }
            }
          }
          &-right {
            flex-grow: 1;
            .username {
              font-size: 12px;
              font-weight: bold;
              color: rgba(0,0,0,0.85);
              .fr {
                float: right;
                color: rgba(0,0,0,0.65);
                font-size: 14px;
                font-weight: 400;
                cursor: pointer;
                &:hover {
                  color: @primary-color;
                }
              }
              & > .replay-txt {
                color: rgba(0, 0, 0, .45);
                font-size: 12px;
                margin-left: 8px;
                font-weight: normal;
              }
            }
            .rich-text {
              color: rgba(0,0,0,0.85);
              font-size: 14px;
              position: relative;
              word-break: break-all;
              .text-box {
                & > span[data-at-embedded] {
                  color: #107fff;
                }
              }
              .collspan {
                text-align: right;
                position: absolute;
                bottom: 2px;
                right: 0;
                width: 25%;
                background: linear-gradient(to right, rgba(255, 255, 255, 0), #f4f6fc  45%);
                color: #2970FF;
                user-select: none;
                cursor: pointer;
                &.static {
                  position: relative;
                  bottom: unset;
                  left: 2px;
                }
              }
            }
            .date-box {
              &.has-replay {
                width: 252px;
              }
              .date {
                font-size: 12px;
                color: rgba(1, 1, 1, .45);
                margin-right: 8px;
              }
              .replay-btn {
                cursor: pointer;
                user-select: none;
                font-size: 12px;
                color: #2970FF;
              }
            }
          }
        }
      }
    }
    .replay {
      margin-top: 16px;
      .comment-item {
        margin-bottom: 12px !important;
        margin-right: 0 !important;
      }
      .more-reply{
        text-align: right;
        font-size: 14px;
        color: @primary-color;
        cursor: pointer;
      }
      .reply-loaded{
        text-align: right;
        font-size: 14px;
        color: rgba(0,0,0,0.45);
      }
    }
    .fade {
      max-height: 65px;
      overflow: hidden;
    }
    .replay-box {
      margin-top: 8px;
      border: 1px solid rgba(217,217,217,1);
      background: white;
      padding: 6px;
      border-radius: 4px;
      .buttons {
        margin-top: 8px;
        text-align: right;
        & > .cancel {
          margin-right: 8px;
        }
      }
      & > .len-limit {
        text-align: right;
        font-size: 14px;
        color: rgba(0, 0, 0, .25);
      }
    }

    .attachment-box {
      margin-bottom: 8px;
      li.file-preview {
        width: 48px;
        height: 48px;
        position: relative;
        border:1px solid rgba(217,217,217,1);
        border-radius: 3px;
        display: inline-block;
        margin-bottom: 8px;
        margin-right: 8px;
        vertical-align: top;
        img {
          width: 100%;
          height: 100%;
        }
        .close {
          font-size: 16px;
          position: absolute;
          top: -8px;
          right: -8px;
          color: #F4454E;
          cursor: pointer;
        }
        & > i.at-type {
          display: block;
          width: 100%;
          text-align: center;
          line-height: 48px;
          font-size: 32px;
        }
        &.file-preview-icon {
          border: none;
          & > i.at-type {
            font-size: 48px!important;
          }
        }
        & > .op-mask {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.45);
          width: 100%;
          height: 100%;
          border-radius: 3px;
          & > .op-actions {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            & > i {
              font-size: 12px;
              color: white;
              cursor: pointer;
              user-select: none;
              &.preview-icon {
                margin-right: 8px;
              }
            }
          }
        }

        &:hover {
          & > .op-mask {
            display: block;
          }
        }
      }
      &.preview {
        margin-top: 8px;
        margin-bottom: 0;
      }
    }
    /deep/.ant-upload-list {
      display: none;
    }
    .atwho-edit-wrap {
        height: 75px;
        overflow-y: auto;
        overflow-x: hidden;
        outline: none;
        color: rgba(0,0,0,0.85);
        -webkit-user-modify: read-write-plaintext-only;
        word-break: break-all;
        span {
          color: #107fff;
        }
        &:empty:before{content: attr(placeholder);color:rgba(0, 0, 0, .25);}
        &:focus{content:none;}
    }
  }

  .pre-img {
    width: 100%;
  }

  .re-textarea {
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    font-size: 14px;
  }

  .loading-icon-wrap {
    text-align: center;
    .loading-icon {
      font-size: 22px;
    }
  }
</style>
