<template>
  <div
    style="
      position: absolute;
      top: -999;
      left: -999;
      z-index: -99;
      visibility: hidden;
    "
  >
    <!-- <div> -->
    <section class="content padding-20mm" :style="PageContentStyleObject">
      <div class="header"></div>
      <div :style="ItemStyleObject">
        <div :style="EleStyleObject">
          <table
            ref="tempPrintHTMLEleRef"
            v-if="EleIsColumn"
            :style="EleColumnTableStyleObject"
          >
            <tr :style="EleColumnTrStyleObject">
              <td :style="EleColumnTdLeftStyleObject">
                <div
                  :style="`width: ${pxToMM(printEle.leftKey.widthValue)}mm;`"
                >
                  {{ printEle.leftKey.innerTxt }}
                </div>
              </td>
              <td :style="EleColumnTdRightStyleObject">
                <div
                  :style="`width: ${pxToMM(printEle.rightValue.widthValue)}mm;`"
                >
                  <template
                    v-if="
                      printEle.picUrl &&
                      isImg_row(printEle.ctrlType, printEle.id, 1, 1, 1)
                    "
                  >
                    <img
                      :style="`height: ${pxToMM(
                        printEle.heightValue
                      )}mm; width: ${pxToMM(
                        printEle.rightValue.widthValue
                      )}mm;`"
                      :src="printEle.picUrl  || printEle.response.data.base64ImageStr"
                      @load="sheetColOnload(printEle.id, 1, 1, 1)"
                      alt
                    />
                  </template>
                  <template v-else>{{ printEle.rightValue.innerTxt }}</template>
                </div>
              </td>
            </tr>
          </table>
          <table
            ref="tempPrintHTMLEleRef"
            v-else-if="EleIsSheet"
            cellspacing="0"
            cellpadding="0"
            class="sheet"
            width="100%"
            :style="ElsSheetStyleObject"
          >
            <tr :style="EleSheetHead">
              <td
                v-for="(col, index) in printEle.columns"
                :key="index"
                :style="getColStyle(col, printEle)"
              >
                {{ col.name }}
              </td>
            </tr>
            <tr
              v-for="(row, index) in printEle.value"
              :key="index"
              :style="`height:${pxToMM(printEle.bodyHeight)}mm`"
            >
              <td
                v-for="(col, colIndex) in printEle.columns"
                :key="colIndex"
                :style="getRowStyle(col.rowSettings, printEle)"
                :class="{ picleft: col.name === '图片' }"
              >
                <template
                  v-if="
                    col.isSequence ||
                    (col.rowSettings.bindSource &&
                      col.rowSettings.bindSource.code === 'sequence')
                  "
                  >{{ index + 1 }}</template
                >
                <template v-else-if="!col.rowSettings.bindSource"
                  ><!--空白列-->
                  <span> </span>
                </template>
                <template
                  v-else-if="isString_row(row[col.rowSettings.bindSource.code])"
                >
                  <span>
                    {{ row[col.rowSettings.bindSource.code] }}
                  </span>
                </template>
                <template v-else>
                  <span
                    v-for="(arrItem, arrItemIndex) of row[
                      col.rowSettings.bindSource.code
                    ]"
                    :key="arrItemIndex"
                  >
                    <template
                      v-if="
                        isImg_row(
                          arrItem.type,
                          arrItem.uid,
                          index,
                          colIndex,
                          arrItemIndex
                        )
                      "
                    >
                      <img
                        :src="getImgUrl(arrItem)"
                        class="sheetImg"
                        :style="{
                          width: `${
                            (pxToMM(printEle.columns[colIndex].widthValue) -
                              10) /
                            2
                          }mm`,
                        }"
                        @load="
                          sheetColOnload(
                            arrItem.uid,
                            index,
                            colIndex,
                            arrItemIndex
                          )
                        "
                        @error="
                          sheetColImgError(
                            arrItem.uid,
                            index,
                            colIndex,
                            arrItemIndex
                          )
                        "
                      />
                    </template>
                    <label v-else-if="isAttachment_row(arrItem.type)">
                      {{ arrItem.name }}
                      <br />
                    </label>
                  </span>
                </template>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="footer"></div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import common from "@cloudpivot/common";
import dateFormat from "@cloudpivot/common/src/utils/date";
import { renderer, schema } from "@cloudpivot/form";
const { getPxFromMm, getMmFromPx } = common.utils.BusinessFunctions;
import { UploadControl } from "@cloudpivot/form/src/common/controls/upload-control";
@Component({
  name: "temp-pre-view",
})
export default class TempPrintHtml extends Vue {
  @Prop({ default: {} }) printEle: any;
  @Prop({
    default: {
      eleType: "pageSettings",
      direction: 1,
      _papersize: {
        id: 1,
        scale: "A4",
        widthTomm: 210,
        heightTomm: 297,
        widthTopx: "595",
        heightTopx: "842",
      },
      _pagemargin: {
        UpTomm: 20,
        DownTomm: 20,
        LeftTomm: 17,
        RightTomm: 17,
        UpTopx: 57,
        DownTopx: 57,
        LeftTopx: 48,
        RightTopx: 48,
      },
      _headerfooter: {
        header: {
          marginTopTomm: 10,
          marginTopTopx: 28,
          align: "",
          items: { key: [], value: [] },
        },
        footer: {
          marginTopTomm: 10,
          marginTopTopx: 28,
          align: "",
          items: { key: [], value: [] },
        },
      },
      bgImg: {
        uid: "",
        name: "",
        status: "",
        url: "",
      },
      isPrintBgImg: false,
    },
  })
  pageSettings: any;
  setting = {
    width: 210,
    height: 297,
    paddingX: 48,
    paddingY: 56,
  };
  sheetRows: Number = 0;

  pageImgCount: any = {}; // 统计组件所有图片的数量
  isImg_row(type, uid, index, colIndex, arrItemIndex) {
    if (type === schema.FormControlType.Image) {
      this.pageImgCount[`${uid}_${index}_${colIndex}_${arrItemIndex}`] = 1;
      return true;
    }
    return false;
  }
  isAttachment_row(type) {
    return type === schema.FormControlType.Attachment;
  }
  isString_row(value) {
    return typeof value === "string";
  }
  pageImgLoad: any = 0;
  sheetColOnload(uid, index, colIndex, arrItemIndex) {
    ++this.pageImgLoad;
    this.$nextTick(() => {
      let len = Object.keys(this.pageImgCount).length;
      if (len === this.pageImgLoad + this.pageImgloadError) {
        console.log("图片加载完成!");
        this.castCalcResult();
      }
    });
  }
  pageImgloadError: any = 0;
  sheetColImgError(uid, index, colIndex, arrItemIndex) {
    ++this.pageImgloadError;
    console.error("子表内图片加载失败!", uid, index, colIndex, arrItemIndex);
    this.$nextTick(() => {
      let len = Object.keys(this.pageImgCount).length;
      if (len === this.pageImgLoad + this.pageImgloadError) {
        this.castCalcResult();
      }
    });
  }
  get sheetColHasImg() {
    return Object.keys(this.pageImgCount).length;
  }
  get pageStyle() {
    // -1 防止计算多页时因为浮点精度多出一页的情况
    let widthPx = this.setting.width - this.setting.paddingX * 2;
    let heightPx = this.setting.height - this.setting.paddingY * 2;
    const width = widthPx + "px";
    const height = heightPx + "px";
    // const padding = `${this.this.setting.paddingY - 1}px ${this.
    //   this.setting.paddingX
    // }px`;
    return {
      width,
      height,
    };
  }
  get PageContentStyleObject() {
    if (this.pageSettings._papersize) {
      return {
        background: "white",
        boxShadow: "0 0.5mm 2mm rgba(0,0,0,.3)",
        margin: "5mm auto",
        width: `${this.pageSettings._papersize.widthTomm}mm`,
        // height: `${this.pageSettings._papersize.heightTomm - 16}mm`,
        // pageBreakBefore: "auto",
        // pageBreakAfter: "always",
      };
    } else {
      return {};
    }
  }
  get ItemStyleObject() {
    return {
      marginLeft: this.pageSettings._pagemargin.LeftTomm + 3 + "mm",
      marginRight: this.pageSettings._pagemargin.RightTomm + "mm",
      marginTop: this.pageSettings._pagemargin.UpTomm + "mm",
      marginBottom: this.pageSettings._pagemargin.DownTomm + "mm",
      position: "absolute",
    };
  }
  get EleStyleObject() {
    return {
      position: "absolute",
      left: `${this.pxToMM(this.printEle.left)}mm`,
      top: `${this.pxToMM(this.printEle.top)}mm`,
      display: "inline-flex",
      "min-height": `${this.pxToMM(this.printEle.heightValue)}mm`,
    };
  }

  get PageHeightPx() {
    if (
      this.pageSettings._papersize &&
      this.pageSettings._papersize.heightTopx
    ) {
      return getPxFromMm(this.pageSettings._papersize.heightTomm - 12);
      // return this.pageSettings._papersize.heightTopx
    } else {
      return 0;
    }
  }
  get EleColumnTableStyleObject() {
    return {
      borderSpacing: 0,
      padding: 0,
      maxWidth: "100%",
      // overflow: 'hidden',
      height: this.pxToMM(this.printEle.heightValue) + "mm",
    };
  }

  get EleColumnTrStyleObject() {
    return {
      minHeight: this.pxToMM(this.printEle.heightValue) + "mm",
    };
  }

  get EleColumnTdLeftStyleObject() {
    if (!this.printEle.leftKey) return {};
    return {
      borderWidth:
        this.pxToMM(parseInt(this.printEle.leftKey.borderWidthValue, 10)) +
        "mm",
      borderStyle: this.printEle.leftKey.borderTypeValue,
      borderColor: this.printEle.leftKey.borderColorValue,
      background: this.printEle.leftKey.fillColorValue,
      fontSize: this.printEle.leftKey.fontSizeValue + "pt",
      color: this.printEle.leftKey.fontColorValue,
      fontWeight: this.printEle.leftKey.fontIsWeight ? "bold" : "",
      fontStyle: this.printEle.leftKey.fontIsItalic ? "italic" : "",
      textDecoration: this.printEle.leftKey.fontIsUnderline ? "underline" : "",
      textAlign: this.printEle.leftKey.fontLCRNeat,
      verticalAlign: this.printEle.leftKey.fontTCBNeat,
      wordBreak: "break-all",
      wordWrap: "break-word",
    };
  }
  get EleColumnTdRightStyleObject() {
    if (!this.printEle.rightValue) return {};
    return {
      borderWidth:
        this.pxToMM(parseInt(this.printEle.rightValue.borderWidthValue, 10)) +
        "mm",
      borderStyle: this.printEle.rightValue.borderTypeValue,
      borderColor: this.printEle.rightValue.borderColorValue,
      background: this.printEle.rightValue.fillColorValue,
      fontSize: this.printEle.rightValue.fontSizeValue + "pt",
      color: this.printEle.rightValue.fontColorValue,
      fontWeight: this.printEle.rightValue.fontIsWeight ? "bold" : "",
      fontStyle: this.printEle.rightValue.fontIsItalic ? "italic" : "",
      textDecoration: this.printEle.rightValue.fontIsUnderline
        ? "underline"
        : "",
      textAlign: this.printEle.rightValue.fontLCRNeat,
      verticalAlign: this.printEle.rightValue.fontTCBNeat,
      wordBreak: "break-all",
      wordWrap: "break-word",
    };
  }

  get EleIsColumn() {
    return !!this.printEle.eleType.includes("column");
  }
  get EleIsSheet() {
    return !!this.printEle.eleType.includes("sheet");
  }
  get ElsSheetStyleObject() {
    return {
      width: this.pxToMM(this.printEle.widthValue + 126) + "mm",
      padding: 0,
      "border-collapse": "collapse",
      "border-spacing": 0,
      "background-color": this.printEle.backgroundColor,
      "page-break-after": "always",
    };
  }

  get EleSheetHead() {
    return {
      height: `${this.pxToMM(this.printEle.headHeight)}mm`,
    };
  }

  getColStyle(col: any, item: any) {
    const style = this.buildStyleOf(col);
    this.handleCellStyle(item, col, style);
    return style;
  }
  buildStyleOf(settings: any) {
    const style: any = {
      "font-size": `${settings.fontSize}pt`,
      "text-align": settings.horizontalAlign,
      "vertical-align": settings.verticalAlign,
      "word-break": "break-all",
      "word-wrap": "break-word",
      // height
    };
    if (settings.fontItalic) {
      style["font-style"] = "italic";
    }
    if (settings.fontBold) {
      style["font-weight"] = "bold";
    }
    if (settings.fontUnderline) {
      style["text-decoration"] = "underline";
    }
    if (settings.fontColor) {
      style["color"] = settings.fontColor;
    }
    if (settings.backgroundColor) {
      style["background-color"] = settings.backgroundColor;
    }
    return style;
  }
  handleCellStyle(item: any, col: any, style: any) {
    style.width = `${this.pxToMM(col.widthValue)}mm`;
    style.border = `${this.pxToMM(parseInt(item.borderWidth, 10))}mm solid ${
      item.borderColor
    }`;
    return style;
  }
  getRowStyle(col: any, item: any) {
    const style = this.buildStyleOf(col.rowSettings || col);
    this.handleCellStyle(item, col, style);
    return style;
  }

  pxToMM(px: number) {
    // return Math.floor((px / 72) * 2.54 * 1000000) / 100000;
    return getMmFromPx(+px);
  }
  destroyed() {
    this.sheetRows = 0;
    this.pageImgCount = {};
    this.pageImgLoad = 0;
  }
  created() {}
  mounted() {
    this.$nextTick(() => {
      if (!this.sheetColHasImg) {
        this.castCalcResult();
      }
    });
  }
  // DOM渲染完成, 抛出计算结果
  castCalcResult() {
    let upTopx = getPxFromMm(this.pageSettings._pagemargin.UpTomm / 2);
    let downTopx = getPxFromMm(this.pageSettings._pagemargin.DownTomm / 2);
    // 页面内容展示区域实际高度
    // let pageContentHeight = this.PageHeightPx-this.pageSettings._pagemargin.UpTopx-this.pageSettings._pagemargin.DownTopx
    let pageContentHeight = this.PageHeightPx - upTopx - downTopx;
    // 元素内容展示高度
    let eleContentHeight = (this.$refs["tempPrintHTMLEleRef"] as any)
      .scrollHeight;
    // 元素默认内容高度
    let eleDefaultHeight = this.printEle.heightValue;
    // 元素距离页面顶部的高度
    let eleTopHeight = this.printEle.top;

    if (eleContentHeight <= eleDefaultHeight) {
      this.$emit("calcResult", {
        id: this.printEle.id,
        value: this.printEle.value,
        calcDiff: 0,
      });
    } else {
      // 元素自己不会分页情况
      this.$emit("calcResult", {
        id: this.printEle.id,
        value: this.printEle.value,
        calcDiff: pageContentHeight - eleTopHeight - eleContentHeight,
        pageContentHeight, // 页面内容展示区域实际高度
        eleDefaultHeight, // 元素默认内容高度
        eleContentHeight, // 元素内容展示高度
        PageHeightPx: this.PageHeightPx, // 页面高度
        downTopx: downTopx,
        pageUpToPx: upTopx,
        headerHeight: this.printEle.headHeight,
        sheetHeaderPagingAttr:
          this.printEle.sheetHeaderPagingAttr === "every" ? true : false, // 是否 分页展示表单头
      });
    }
  }
  
  getImgUrl(arrItem: any){
    let picurl = arrItem.url;
    let data = arrItem.response.data;
    let base64 = data.base64ImageStr;
    let refIdUrl = UploadControl.service.getDownloadUrlByRefId(data.refId)
    return picurl || base64 || refIdUrl;
  }
}
</script>
<style>
body::-webkit-scrollbar {
  display: none;
}
body {
  -ms-overflow-style: none;
}
</style>
