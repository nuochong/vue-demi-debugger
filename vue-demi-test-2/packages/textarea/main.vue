
<script>
import { ref, reactive, onMounted, toRefs, onUnmounted, computed, watch, watchEffect, onBeforeUnmount, h } from 'vue-demi';

export default {
  name: 'wTextarea',
  render() {
    let temp = '';
    if (this.tools.length > 0 || this.maxlength) {
      temp = (
        <div class="w-textarea_tools">
          {this.tools.map((item) => {
            return (
              <button
                class="w-textarea_tools__item"
                key={item.type}
                onClick={(e) => {
                  this.openTagDialog(item.type);
                }}
              >
                {item.text}
                {item.type}
              </button>
            );
          })}

          {this.maxlength ? <span class={['w-textarea_tools__text', this.count.num < 0 ? '__danger' : '']}>{this.count.text}</span> : ''}
        </div>
      );
    }

    return (
      <div class="w-textarea" ref="wTextarea">
        {console.log('xxxxxkkkk', this)}
        <div
          class="w-textarea_input"
          ref="wTextareaContent"
          id={this.contentId}
          onClick={(e) => this.inputClick(e)}
          onFocus={(this.isLocked = true)}
          onBlur={(this.isLocked = false)}
          deleteOnKeydown={(e) => this.handleDelete(e)}
          onInput={(e) => this.handleInput(e.target)}
        ></div>
        {temp}

        <div class="w-textarea_dialog">{this.$slots.default()}</div>
        {this.state}
      </div>
    );
  },
  setup(props, ctx) {
    // Refs
    const wTextareaContent = ref(null);
    const wTextarea = ref(null);
    const data = reactive({
      // count: 0,
      bbb: { a: 'a', b: 'b', c: { aa: 'aa' } },
      savedRange: {},
      isLocked: false,
      currentTagId: null,
    });

    // 记录currentText以计算长度
    let currentText = ref(props.modelValue);

    let getGuid = () => {
      // 生成随机ID
      return `r${new Date().getTime()}d${Math.ceil(Math.random() * 1000)}`;
    };

    // 为input区域生成随机id，当在页面上有多个组件时，用于监听光标的变化
    let contentId = ref(`content${getGuid()}`);
    console.log('xxxx', data.bbb.a);
    let selectHandler = () => {
      // 监听选定文本的变动
      let sel = window.getSelection();
      let range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      console.log('tttt', range, contentId);
      if (range && range.commonAncestorContainer.ownerDocument.activeElement.id === contentId.value) {
        data.savedRange = range;
      }
    };
    let createStyle = () => {
      // 为自定义的模版标签添加样式，使之不可编辑
      let style = document.createElement('style');
      style.innerHTML = `.w-textarea ${props.tag} {
        cursor: default;
        -webkit-user-modify: read-only !important;
      }`;
      console.log('bbbbbb', wTextarea.value);
      wTextarea.value.appendChild(style);
    };

    onMounted(() => {
      console.log('初始化数据');
      // 初始化数据
      currentText && (wTextareaContent.value.innerHTML = currentText.value);
      // 创建模版标签的style
      createStyle();
      // 每次光标变化的时候，保存 range
      document.addEventListener('selectionchange', selectHandler);
    });
    onBeforeUnmount(() => {
      console.log('卸载事件');
      // 卸载事件
      document.removeEventListener('selectionchange', selectHandler);
    });

    const modelValue = props.modelValue;

    watch(
      () => props.modelValue,
      (val) => {
        console.log('变化了');
        if (!data.isLocked) {
          wTextareaContent.value.innerHTML = val;
        }
      }
    );
    // watchEffect(() => {
    //   // console.log(`name is: ` + props.name)
    //   if (!data.isLocked) {
    //     console.log('gggg',wTextareaContent)
    //     wTextareaContent.value.innerHTML = props.name;
    //   }
    // });

    let updateData = (text) => {
      console.log('更新数据', ctx, text);

      // this.$emit('input', text);
      ctx.emit('update:modelValue', text);
    };

    const count = computed(() => {
      let maxlength = parseInt(props.maxlength);
      // 字符长度记数
      console.log('长度', maxlength, props.modelValue.length);
      let num = maxlength - currentText.value.length;
      let text = num < 0 ? `已超出${Math.abs(num)}个字符` : `还可以输入${num}个字符`;
      console.log('jjjj', num, text);
      return { num, text };
    });

    const closeModal = () => {
      this.form.text = '';
      this.showModal = false;
    };

    const openTagDialog = (type) => {
      console.log('打开输入框');
      // 将事件抛给父组件处理
      // 处理后需要调用 addTag() 或者 addLink() 将内容传回来
      ctx.emit('add', type);
    };

    const addTag = (text) => {
      // 创建模版标签
      let node = document.createElement(props.tag);
      node.innerText = text;
      // 添加id便于删除
      node.id = getGuid();
      insertNode(node);
    };

    const addLink = (text, url) => {
      // 创建a标签
      let node = document.createElement('a');
      node.innerText = text;
      node.href = url;
      node.target = 'blank';
      insertNode(node);
    };

    const insertNode = (node) => {
      // 在内容中插入标签
      // 删掉选中的内容（如有）
      // console.log('vvvv', this.data);
      data.savedRange.deleteContents();
      // 插入链接
      data.savedRange.insertNode(node);

      // 更新双向绑定数据
      let target = wTextareaContent.value;
      updateData(target.innerHTML);
      currentText.value = target.innerText;
    };

    const handleInput = (target) => {
      // 即时更新数据
      console.log('即时更新数据', target);
      updateData(target.innerHTML);
      currentText.value = target.innerText;
    };

    const handleDelete = (e) => {
      // 监听“删除”事件
      if (data.currentTagId) {
        // 若已选中模版标签，直接删除dom节点
        let t = document.getElementById(data.currentTagId);
        wTextareaContent.value.removeChild(t);
        data.currentTagId = null;
        // 阻止浏览器默认的删除事件，并手动更新数据
        e.preventDefault();
        handleInput(e.target);
      }
    };

    const inputClick = (e) => {
      console.log('bbbbb', '监听点击事件', e);
      // 监听点击事件
      data.isLocked = true;
      const TAG_NAME = e.target.nodeName;
      if (TAG_NAME === props.tag.toUpperCase()) {
        // 点击模版标签时，记录id
        data.currentTagId = e.target.id;
        e.target.className = 'active';
      } else if (data.currentTagId) {
        // 清空active样式
        let target = document.getElementById(data.currentTagId);
        target.className = '';
        data.currentTagId = null;
      } else {
        data.currentTagId = null;
      }
    };

    return {
      currentText,
      wTextareaContent,
      wTextarea,
      createStyle,
      contentId,
      getGuid,
      selectHandler,
      // data,
      ...toRefs(data),
      updateData,
      count,
      closeModal,
      openTagDialog,
      addTag,
      addLink,
      insertNode,
      handleInput,
      handleDelete,
      inputClick,
    };
    // return toRefs(state)
  },
  data() {
    return {
      // // 记录currentText以计算长度
      // currentText: this.value,
      // // 为input区域生成随机id，当在页面上有多个组件时，用于监听光标的变化
      // contentId: `content${this.getGuid()}`,
      // // 输入的时候锁定，禁止更新innerHTML
      // isLocked: false,
      // // 记录当前选中tag的ID
      // currentTagId: null,
      // // 当前光标位置
      // savedRange: {},
    };
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    tag: {
      // 自定义模版标签的标签名
      type: String,
      // 默认使用wise作为标签名，并添加了默认样式
      // 当使用其他标签名的时候，需要另写标签样式
      default: 'wise',
    },
    tools: {
      // 自定义扩展功能：超链接'link'，模版标签'tag'
      type: Array,
      default() {
        return [
          { type: 'link', text: '添加超链接' },
          { type: 'tag', text: '添加模版标签' },
        ];
      },
    },
    maxlength: {
      // 最大输入长度
      type: [String, Number],
      default: '',
    },
  },
};
</script>

<style lang="scss">
// 给标签默认样式，不可scoped
.w-textarea {
  wise {
    color: #26a2ff;
    padding: 0 1px;
    white-space: nowrap;
    cursor: default;
    -webkit-user-modify: read-only !important;
  }

  .active {
    background: #dcdfe6;
  }
}
</style>

<style lang="scss">
$borderColor: #dcdfe6;
$bgColor: #f5f7fa;
$textColor: #666;

.w-textarea {
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid $borderColor;
  margin-bottom: 15px;
  overflow: hidden;
  position: relative;

  &_input {
    width: 100%;
    min-height: 100px;
    box-sizing: border-box;
    padding: 10px;
    line-height: 1.5;
    word-break: break-word;
    // 允许编辑，禁止富文本
    -webkit-user-modify: read-write-plaintext-only !important;

    &:focus {
      outline: none;
    }
  }

  &_tools {
    padding: 0 10px;
    height: 40px;
    line-height: 40px;
    border-top: 1px solid $borderColor;
    background-color: $bgColor;
    color: $textColor;
    font-size: 12px;

    &__item {
      display: inline-block;
      line-height: 1;
      padding: 5px 8px;
      margin-right: 8px;
      color: $textColor;
      cursor: pointer;
      border: 1px solid $borderColor;
      border-radius: 4px;
      background: #fff;
      transition: all 0.3s;

      &:hover {
        background: $bgColor;
        opacity: 0.7;
      }

      &:focus {
        outline: none;
      }
    }

    &__text {
      display: inline-block;
      line-height: 40px;
      padding: 0 8px;
      float: right;
      color: $textColor;
      cursor: default;
      transition: all 0.3s;

      &:hover {
        opacity: 1;
      }

      &.__danger {
        color: red;
      }
    }
  }
}
</style>
