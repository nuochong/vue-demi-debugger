<template>
  <div class="home">
    <div>
      <h1>测试文本域</h1>
      <div class="container" ref="wise">
        <button @click="add">add</button>
        <div v-for="(item, index) in listData" :key="index">
          <button @click="handleDelete(index)">delete</button>
          <w-textarea v-model="item.text" :tools="[]"></w-textarea>
        </div>
        <w-textarea v-model="testData" tag="wise" ref="testText" maxlength="100" @add="handleAdd">
          <div v-if="show">
            <div>
              <label>模版内容</label>
              <input type="text" v-model="form.text">
            </div>
            <div>
              <button @click="addTag(form.text)">save</button>
            </div>
          </div>
          <div v-if="showLink">
            <div>
              <label>url</label>
              <input type="text" v-model="form.url">
              <label>textLink</label>
              <input type="text" v-model="form.textLink">
            </div>
            <div>
              <button @click="addLink(form.textLink,form.url)">save</button>
            </div>
          </div>
        </w-textarea>
        <div v-html="testData"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  components: {},
  data() {
    return {
      testData: '',
      listData: [],
      show: false,
      showLink: false,
      form: {
        text: '',
        link:'',
        url:''
      },
    };
  },
  methods: {
    add() {
      this.listData.push({ text: '' });
    },
    handleDelete(index) {
      this.listData.splice(index, 1);
      console.log('list', this.listData);
    },
    handleAdd(type) {
      console.log('添加函数',type)
      if (type === 'tag') {
        this.show = true;
        this.showLink = false;
      } else {
        this.showLink = true
        this.show = false
        console.log(type);
      }
    },
    addTag(text) {
      this.$refs.testText.addTag(text);
      console.log('testdata', this.testData);
      this.show = false;
    },
    addLink(url,text){
      this.$refs.testText.addLink(url,text);
      this.showLink = false;
    }
  },
};
</script>

<style lang="scss"></style>

projectA:{
  node_modules:{
    b:{
      node_modules:{
        d:{
          //处理是否安装c依赖的逻辑
        }
      },
      packagejson:{
        dependencies:{
          d
        }
      }
    }
  },
  packagejson:{
    dependencies:{
      a,
      b,//用户在安装b依赖时b依赖中的d依赖根据默认的a依赖版本决定是否向projectA项目中动态添加c依赖，并安装
      C
    }
  }   
} 