# select-plugin
自用-弹窗选择插件

## 插件描述
该插件主要实现的功能是将选择某数据之后返回。

## 插件要实现的功能：（options默认情况下是商品选择）
1. 支持单选、多选、SKU单选、SKU多选。
2. 传入选择框展示的内容type（默认是0商品）
3. 支持标题自定义
4. 支持全选、单选的判断（单选情况下是否直接关闭弹窗）
5. 支持刷新按钮的判断（暂未涉及）
6. 返回一个callback：successSelect

## 引用：
js:
```
<script type="text/javascript" src="../src/plugin/select-plugin/select-plugin.js"></script>
```
css:
```
<link rel="stylesheet" href="../style/css/selectplugin.css">
```

## 调用：
```
('#plugin').selectPlugin({})
```
## 传参
```
/**
 * 插件的默认配置项
 * single: false,               // 判断 selectPlugin 是单选还是多选 默认是多选
 * isSku: false,                // 判断 selectPlugin 是否支持到sku级别 (主要用于商品)
 * type: 0                      // 判断 selectPlugin 需要渲染的是什么 (0:商品)
 * title                        // 商品选择弹窗的title
 * isSelectAll                  // 判断是否显示全选按钮
 * isRefresh                    // 判断是否显示刷新按钮（暂未涉及）
 * function selectSuccess       // 成功选择之后的回调
 * function selectError         // 失败选择之后的回调（暂未涉及）
 */
 ```
 
 ### 需要修改
 1. 支持出商品外的其他数据的选择
 
