# vue-demi-debugger

## 会发生错误的操作流程
```
cd vue-test-2
yarn
yarn serve
```

## 不会发生错误的操作流程

调整vue-demi-test插件中的vue-demi依赖

vue-demi-test->package.json
```
- "vue-demi": "latest",
+ "vue-demi": "file:../vue-demi",
```
然后再次执行流程，观察是否报错。
```
cd vue-test-2
yarn
yarn serve
```