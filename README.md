## 选择插件 ljh-select-box

### 插件简介
- 插件介绍
    * 该插件主要实现的功能是根据选择的内容返回选择的数组对象，有单选，多选等相应的功能。查看[demo](https://lijiahao8898.github.io/ljh-select-box/dist/view/)。
- 插件功能
    * 支持 单选、多选、sku单选、sku多选、商品选择、用户选择、类目选择、品牌选择、仓库选择、优惠券选择。
    * 支持 类型选择（默认是0,其他【0：商品，1：用户，2：优惠券，3：仓库，4：品牌，5：类目】）。
    * 支持 标题自定义。
    * 支持 全选、单选的判断（单选情况下是否直接关闭弹窗）。
    * 支持 刷新按钮的判断（暂未涉及）。
    * 支持 多个调用并且返回当前点击的指针位置。
    * 支持 多选情况下选择的个数限制 (0 为无限)。
    * 支持 将请求的借口作为参数传入。
    * 支持 品牌、类目的搜索（需要自己传入品牌、类目的list。并且根据showCateAndBrand判断是否展示）。
    * 支持 下架商品、过期优惠券的隐藏不展示功能。排除无用数据。
    * 支持 请求接口的参数自定义 `postData`。
    * 返回一个cb：selectSuccess ( 单选 和 多选 )。
    * 返回一个cb：selectError ( 数据超出上限会报这个错误 )。
    * 返回一个cb：ajaxError （ ajax请求报错回调 ）。
- 插件依赖
    * `jquery.dialog`
    * `jquery.paginator`
    * `selectize`
    * `underscore`
    * `jquery`

### Getting started
```
git clone https://github.com/lijiahao8898/ljh-select-box.git

cd ljh-select-box

npm install

gulp dist

// and then open the dist/view/index.html to look the demo
```

#### 引用：
只需要引用对应的 `js` ， `css`， `html模板`即可。
其中 `html模板` 使用的是 `underscore`。

js:
```
<script type="text/javascript" src="../src/plugin/select-plugin/ljh-select-box.js"></script>
```
css:
```
<link rel="stylesheet" href="../style/css/ljh-select-box.css">
```

#### 调用：
```
('#plugin').selectPlugin({
    // options
})
```

#### options：
| 参数              | 类型             | 作用                                                     |
|:---------------- |:-----------------|:---------------------------------------------------------|
| single           | `boolean`        | 默认：`false`多选。 是单选还是多选。|
| isSku            | `boolean`        | 默认：`false`。 是否支持到sku级别 (主要用于商品 type：0)。 |
| needSkuGoodsInfo | `boolean`        | 默认：`false`不返回。 是否在选择sku的时候默认返回商品的名字。 |
| type             | `number`         | 默认：`0`。 需要渲染的是内容类型 (0：商品,1：用户,2：优惠券,3：仓库,4：品牌,5：类目)。 |
| selectLength     | `number`         | 默认：`0`无限。 多选情况下选择的个数限制。 |
| title            | `string`         | 默认：`商品的信息`。商品选择弹窗的title。 |
| isSelectAll      | `boolean`        | 默认：`true`展示。判断是否显示全选按钮。 |
| isRefresh        | `boolean`        | 默认：`true`展示。判断是否显示刷新按钮。 |
| selectedList     | `Array`          | 默认：`[]`。选择的列表。例如：[ { id:1 },{ id:2 } ];  |
| ajaxUrl          | `string`         | 默认：`''`。请求的接口。 |
| ajaxSkuUrl       | `string`         | 默认：`''`。请求的SKU接口。 |
| ajaxType         | `string`         | 默认：`post`。 ajax的请求类型。 |
| needFailureInfo  | `boolean`        | 默认：`true`。 是否展示已经失效的东西-垃圾数据。 |
| ArrayArray       | `Array`          | 默认：`[]`。需要展示的类目列表。 |
| brandList        | `Array`          | 默认：`[]`。需要展示的品牌列表。 |
| showCateAndBrand | `boolean`        | 默认：`false`。是否展示类目列表和品牌列表的搜索。 |
| postData         | `object`         | 默认：`{}`。 需要提交的额外的参数。 |
| selectSuccess    | `function`       | 成功选择之后的回调。 返回选择的数据 `data` ,和当前选择弹框的指针 `target` 。 |
| selectError      | `function`       | 失败选择之后的回调。 返回一条错误信息 `info` 。 |
| ajaxError        | `function`       | 接口请求报错后的回调。 返回除10000以外的报错 `error`。 |

### what to do next ?
1. 支持出商品外的其他数据的选择。
2. 增加loadding。

### update & bugFix
- 2017.10.18 &nbsp; v2.0.0
    * 删除 合约类型
    * 删除 老版本
    * 修改 样式名称

- 2017.10.17 &nbsp; v2.0.0
    * 新增 `postData` 携带额外的参数

- 2017.07.07 &nbsp; v2.0.0
    * 修复 在没有展开二级类目的情况下,二级类目不选中的问题
    * 修复 在二级类目没有数据的情况下,二级类目数据不变的问题(应该展示无当前数据)

- 2017.06.29 &nbsp; v2.0.0
    * 修复 再二级类目请求的时候.在 `selectList` 重复添加数据的问题

- 2017.06.15 &nbsp; v2.0.0
    * 新增 品牌和类目的 `type` 类型
    * 修改 将接口更改为参数
    - 修复 同一个 `type` 类型不能同时出现2个或者以上的bug 导致选择的时候多次点击
        * ps: 选择类目后一二级类目都会返回.请自行处理

- 2017.06.12 &nbsp; v1.0.0
    * 新增 `categoryList` 的配置项
    * 新增 `categoryList` 的配置项
    * 新增 `showCateAndBrand` 的配置项用于控制 `categoryList` 和 `brandList` 的展示

- 2017.05.26 &nbsp; v1.0.0
    * 新增 `needFailureInfo` 的配置项

- 2017.05.18 &nbsp; v1.0.0
    * 新增 `ajaxType` 的类型
    * 新增 `ajaxDataType` 的类型
    * 新增 接口请求错误后的回调 `ajaxError`
    * 相关优化

### version
当前只有 `master` 版本


 
