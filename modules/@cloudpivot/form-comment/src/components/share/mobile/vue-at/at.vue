<script>
import {
  closest, getOffset, getPrecedingRange,
  getRange, applyRange,
  scrollIntoView, getAtAndIndex
} from './util'
import AtTemplate from './atTemplate.vue'
export default {
  name: 'At',
  mixins: [AtTemplate],
  props: {
    value: {
      type: String, // value not required
      default: null
    },
    at: {
      type: String,
      default: null
    },
    ats: {
      type: Array,
      default: () => ['@']
    },
    suffix: {
      type: String,
      default: ' '
    },
    loop: {
      type: Boolean,
      default: true
    },
    allowSpaces: {
      type: Boolean,
      default: true
    },
    tabSelect: {
      type: Boolean,
      default: false
    },
    avoidEmail: {
      type: Boolean,
      default: true
    },
    showUnique: {
      type: Boolean,
      default: true
    },
    hoverSelect: {
      type: Boolean,
      default: true
    },
    members: {
      type: Array,
      default: () => []
    },
    nameKey: {
      type: String,
      default: ''
    },
    filterMatch: {
      type: Function,
      default: (name, chunk, at) => {
        // match at lower-case
        return name.toLowerCase()
          .indexOf(chunk.toLowerCase()) > -1
      }
    },
    deleteMatch: {
      type: Function,
      default: (name, chunk, suffix) => {
        return chunk === name + suffix
      }
    },
    scrollRef: {
      type: String,
      default: ''
    },
    embeddedItemTemplate: {
      type: Function
    },
    maxlength: {
      type: Number
    }
  },

  data () {
    return {
      // at[v-model] mode should be on only when
      // initial :value/v-model is present (not nil)
      bindsValue: this.value != null,
      customsEmbedded: false,
      hasComposition: false,
      atwho: null
    }
  },
  computed: {
    atItems () {
      return this.at ? [this.at] : this.ats
    },
  },
  watch: {
    'atwho.cur' (index) {
      if (index != null) { // cur index exists
        this.$nextTick(() => {
          this.scrollToCur()
        })
      }
    },
    value (value, oldValue) {
      if (this.bindsValue) {
        this.handleValueUpdate(value)
      }
    }
  },
  mounted () {
    if (typeof this.embeddedItemTemplate === 'function') {
      this.customsEmbedded = true
    }
    if (this.bindsValue) {
      this.handleValueUpdate(this.value)
    }
  },

  methods: {
    itemName (v) {
      const { nameKey } = this
      return nameKey ? v[nameKey] : v
    },
    isCur (index) {
      return index === this.atwho.cur
    },
    handleValueUpdate (value) {
      const el = this.$el.querySelector('[contenteditable]')
      if (value !== el.innerHTML) { // avoid range reset
        el.innerHTML = value
        this.dispatchInput()
      }
    },
    dispatchInput () {
      let el = this.$el.querySelector('[contenteditable]')
      let ev = new Event('input', { bubbles: true })
      el.dispatchEvent(ev)
    },

    handleItemHover (e) {
      if (this.hoverSelect) {
        this.selectByMouse(e)
      }
    },
    handleItemClick (e) {
      this.selectByMouse(e)
      this.insertItem()
    },
    handleDelete (e) {
      const range = getPrecedingRange()
      if (range) {
        // fixme: Very bad code from me
        if (this.customsEmbedded && range.endOffset >= 1) {
          let a = range.endContainer.childNodes[range.endOffset]
            || range.endContainer.childNodes[range.endOffset - 1]
          if (!a || a.nodeType === Node.TEXT_NODE && !/^\s?$/.test(a.data)) {
            return
          } else if (a.nodeType === Node.TEXT_NODE) {
            if (a.previousSibling) a = a.previousSibling
          } else {
            if (a.previousElementSibling) a = a.previousElementSibling
          }
          let ch = [].slice.call(a.childNodes)
          ch = [].reverse.call(ch)
          ch.unshift(a)
          let last
          ;[].some.call(ch, c => {
            if (c.getAttribute && c.getAttribute('data-at-embedded') != null) {
              last = c
              return true
            }
          })
          if (last) {
            e.preventDefault()
            e.stopPropagation()
            const r = getRange()
            if (r) {
              r.setStartBefore(last)
              r.deleteContents()
              applyRange(r)
              this.handleInput()
            }
          }
          return
        }

        const { atItems, members, suffix, deleteMatch, itemName } = this
        const text = range.toString()
        const { at, index } = getAtAndIndex(text, atItems)

        if (index > -1) {
          const chunk = text.slice(index + at.length)
          const has = members.some(v => {
            const name = itemName(v)
            return deleteMatch(name, chunk, suffix)
          })
          if (has) {
            e.preventDefault()
            e.stopPropagation()
            const r = getRange()
            if (r) {
              r.setStart(r.endContainer, index)
              r.deleteContents()
              applyRange(r)
              this.handleInput()
            }
          }
        }
      }
    },
    handleKeyDown (e) {
      if (e.keyCode === 8) {
        this.handleDelete(e)
      }
    },

    // compositionStart -> input -> compositionEnd
    handleCompositionStart () {
      this.hasComposition = true
    },
    handleCompositionEnd () {
      this.hasComposition = false
      this.handleInput()
    },
    filterHtml(str){
    const reg =  new RegExp('<[^>]+>','gi');  //过滤所有的html标签，不包括内容
    if(typeof str !='string'){  //不是字符串
        return str;
    }

    return str.replace(reg,'');
  },
    getHtmlLen(html){
      html = this.filterHtml(html)
      let oDiv = document.createElement('div');
      html = html.replace(/amp;/g, '');
      oDiv.innerHTML = html.replace(/[\%\^\&\*\(\$]/g, '文');
      return oDiv.innerHTML.length;
    },
    handleInput (keep) {
      if (this.hasComposition) return
      this.$nextTick(() => {
        const el = this.$el.querySelector('[contenteditable]')
        if (el.innerHTML === '<br>') { // 有时候回删，会剩余一个<br>标签，故做处理
          el.innerHTML = '';
        }
        
        if (el.innerHTML === '\n') { // 第一个回车占2个字符，故做处理
          el.innerHTML = '';
        } 
      const len = this.getHtmlLen(el.innerText);
      if (len > this.maxlength) {
        const resultLength = el.innerHTML.length - len + this.maxlength;
        el.innerHTML = el.innerHTML.substr(0, resultLength);
        this.setFocus(el);
      }
      this.$emit('input', el.innerHTML)

      const range = getPrecedingRange()
      if (range) {
        const { atItems, avoidEmail, allowSpaces, showUnique } = this

        let show = true
        const text = range.toString()

        const { at, index } = getAtAndIndex(text, atItems)

        if (index < 0) show = false
        const prev = text[index - 1]

        const chunk = text.slice(index + at.length, text.length)

        if (avoidEmail) {
          // 上一个字符不能为字母数字 避免与邮箱冲突
          // 微信则是避免 所有字母数字及半角符号
          if (/^[a-z0-9]$/i.test(prev)) show = false
        }

        if (!allowSpaces && /\s/.test(chunk)) {
          show = false
        }

        // chunk以空白字符开头不匹配 避免`@ `也匹配
        if (/^\s/.test(chunk) || chunk !== '') show = false

        if (!show) {
          return
        } else {
          const { members, filterMatch, itemName } = this
          if (!keep && chunk) { // fixme: should be consistent with AtTextarea.vue
            this.$emit('at', chunk)
          }

          show = true
          // const matched = members.filter(v => {
          //   const name = itemName(v)
          //   return filterMatch(name, chunk, at)
          // })

          // show = false
          // if (matched.length) {
          //   show = true
          //   if (!showUnique) {
          //     let item = matched[0]
          //     if (chunk === itemName(item)) {
          //       show = false
          //     }
          //   }
          // }

          if (show) {
            this.atwho = {
              range
            }
            this.$emit('inputAt', true)
          } else {
            this.closePanel()
          }
        }
      }
      })
    },

    closePanel () {
      // if (this.atwho) {
      //   this.atwho = null
      // }
    },

    scrollToCur () {
      const curEl = this.$refs.cur[0]
      const scrollParent = curEl.parentElement.parentElement // .atwho-view
      scrollIntoView(curEl, scrollParent)
    },
    selectByMouse (e) {
      const el = closest(e.target, d => {
        return d.getAttribute('data-index')
      })
      const cur = +el.getAttribute('data-index')
      this.atwho = {
        ...this.atwho,
        cur
      }
    },
    selectByKeyboard (e) {
      const offset = e.keyCode === 38 ? -1 : 1
      const { cur, list } = this.atwho
      const nextCur = this.loop
        ? (cur + offset + list.length) % list.length
        : Math.max(0, Math.min(cur + offset, list.length - 1))
      this.atwho = {
        ...this.atwho,
        cur: nextCur
      }
    },

    // todo: 抽离成库并测试
    insertText (text, r) {
      r.deleteContents()
      const node = r.endContainer
      if (node.nodeType === Node.TEXT_NODE) {
        const cut = r.endOffset
        node.data = node.data.slice(0, cut) +
          text + node.data.slice(cut)
        r.setEnd(node, cut + text.length)
      } else {
        const t = document.createTextNode(text)
        r.insertNode(t)
        r.setEndAfter(t)
      }
      r.collapse(false) // 参数在IE下必传
      applyRange(r)
      this.dispatchInput()
    },

    insertHtml (html, r) {
      r.deleteContents()
      const node = r.endContainer
      var newElement = document.createElement('span')

      // Seems `contentediable=false` should includes spaces,
      // otherwise, caret can't be placed well across them
      newElement.appendChild(document.createTextNode(' '))
      newElement.appendChild(this.htmlToElement(html))
      newElement.appendChild(document.createTextNode(' '))
      newElement.setAttribute('data-at-embedded', '')
      newElement.setAttribute("contenteditable", false)

      if (node.nodeType === Node.TEXT_NODE) {
        const cut = r.endOffset
        var secondPart = node.splitText(cut);
        node.parentNode.insertBefore(newElement, secondPart);
        r.setEndBefore(secondPart)
      } else {
        const t = document.createTextNode(suffix)
        r.insertNode(newElement)
        r.setEndAfter(newElement)
        r.insertNode(t)
        r.setEndAfter(t)
      }
      r.collapse(false) // 参数在IE下必传
      applyRange(r)
    },

    insertItem (curItem) {
      const { range } = this.atwho
      const { suffix, atItems, itemName, customsEmbedded } = this
      const r = range.cloneRange()
      const text = range.toString()
      const { at, index } = getAtAndIndex(text, atItems)

      // Leading `@` is automatically dropped as `customsEmbedded=true`
      // You can fully custom the output inside the embedded slot
      const start = customsEmbedded ? index : index + at.length
      r.setStart(r.endContainer, start)

      // hack: 连续两次 可以确保click后 focus回来 range真正生效
      applyRange(r)
      applyRange(r)

      if (customsEmbedded) {
        // `suffix` is ignored as `customsEmbedded=true` has to be
        // wrapped around by spaces
        const el = this.$el.querySelector('[contenteditable]');
        const len = this.getHtmlLen(el.innerText) + curItem.name.length + 1;
        if (len <= this.maxlength) {
          const html = this.embeddedItemTemplate(curItem);
          this.insertHtml(html, r);
        } else if (el.innerText.substr(-1) === '@') {
          el.innerText = el.innerText.substr(0, el.innerText.length - 1);
        }
      } else {
        const t = itemName(curItem) + suffix
        this.insertText(t, r);
      }

      this.$emit('insert', curItem)
      this.handleInput()
    },
    htmlToElement (html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    },

    setFocus(){
       const el = this.$el.querySelector('[contenteditable]')
        el.focus();
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        //判断光标位置，如不需要可删除
        // if(sel.anchorOffset!=0){
        //     return;
        // };
        sel.removeAllRanges();
        sel.addRange(range);

    }
  }
}
</script>
