# vue-demi-debugger

## 會發生錯誤的操作流程
```
cd vue-test-2
yarn
yarn serve
```

## 不會發生錯誤的操作流程

調整vue-demi-test插件中的vue-demi依賴

vue-demi-test -> package.json
```
- "vue-demi": "latest",
+ "vue-demi": "file:../vue-demi",
```
然後再次執行流程，觀察是否報錯。
```
cd vue-test-2
yarn
yarn serve
```