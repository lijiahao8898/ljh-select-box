## 选择插件 ljh-select-box

### 插件简介
- 插件介绍
    * 该插件主要实现的功能是根据选择的内容返回选择的数组对象，有单选，多选等相应的功能。查看[demo](https://lijiahao8898.github.io/ljh-select-box/dist/view/)。
- 插件功能
    * 支持 单选、多选、sku单选、sku多选、商品选择、用户选择、类目选择、品牌选择、仓库选择、优惠券选择。
    * 支持 类型选择（默认是0,其他【0：商品，1：用户，2：优惠券，3：仓库，4：品牌，5：类目】）。
    * 支持 标题自定义。
    * 支持 全选、单选的判断。
    * 支持 多个调用并且返回当前点击的指针位置。
    * 支持 多选情况下选择的个数限制 (0 为无限)。
    * 支持 接口 `URL` 自定义。
    * 支持 品牌、类目的搜索（需要自己传入品牌、类目的list。并且根据 `showCateAndBrand` 判断是否展示）。
    * 支持 下架商品、过期优惠券的隐藏不展示功能（排除无用数据）。
    * 支持 请求接口的参数自定义 `postData`。
    * 支持 刷新按钮刷新页面。
    * 返回一个cb：selectSuccess ( 单选 和 多选 )。
    * 返回一个cb：selectError ( 数据超出上限会报这个错误 )。
    * 返回一个cb：ajaxError （ ajax请求报错回调 ）。
    * 支持 主题色的更换。（暂未涉及）
    * 支持 `Loading` icon 的自定义。（暂未涉及）
- 插件依赖
    * `jquery.dialog` - 弹框插件
    * `jquery.paginator` - 翻页插件
    * `selectize` - 选择框插件
    * `underscore` - 模板渲染
    * `jquery` - 库

### Getting started
```
git clone https://github.com/lijiahao8898/ljh-select-box.git

cd ljh-select-box

npm install

gulp dist/npm run dist

// and then open the dist/view/index.html to look the demo
```

#### 引用：
需要引用对应的 `js` ， `css`， `html模板`并且引用使用到的对应的插件。
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
  // options 其中ajaxUrl必填
  ajaxUrl: '../../..'
})
```

#### options：
| 参数              | 类型        | 默认                 | 作用                                                     |
|:---------------- |:------------|:---------------------|:---------------------------------------------------------|
| single           | `boolean`   | `false` - 多选        | 是单选还是多选。|
| isSku            | `boolean`   | `false` - 不支持sku    | 是否支持到sku级别 (主要用于商品 type：0)。 |
| needSkuGoodsInfo | `boolean`   | `false` - 不返回只返回sku信息   | 是否在选择sku的时候默认返回商品的名字。 |
| type             | `number`    | `0`                  | 需要渲染的是内容类型 (0：商品,1：用户,2：优惠券,3：仓库,4：品牌,5：类目)。 |
| selectLength     | `number`    | `0` - 无限            | 多选情况下选择的个数限制。 |
| title            | `string`    | `商品的信息`          | 商品选择弹窗的title。 |
| isSelectAll      | `boolean`   | `true` - 多选         |  判断是否显示全选按钮。 |
| isRefresh        | `boolean`   | `true` - 显示         | 判断是否显示刷新按钮。 |
| selectedList     | `Array`     | `[]`                 | 选择的列表。例如：[ { id:1 },{ id:2 } ];  |
| ajaxUrl          | `string`    | `''`                 | 请求的接口。 |
| ajaxSkuUrl       | `string`    | `''`                 | 请求的SKU接口。 |
| ajaxType         | `string`    | `post`               | ajax的请求类型。 |
| needFailureInfo  | `boolean`   | `true` - 不进行数据过滤  | 是否展示已经失效的东西-垃圾数据。 |
| ArrayArray       | `Array`     | `[]`                 | 需要展示的类目列表。 |
| brandList        | `Array`     | `[]`                 | 需要展示的品牌列表。 |
| showCateAndBrand | `boolean`   | `false` - 不展示      | 是否展示类目列表和品牌列表的搜索。 |
| postData         | `object`    | `{}`                 | 需要提交的额外的参数。 |
| selectSuccess    | `function`  | `function(data,target){}` | 成功选择之后的回调。 返回选择的数据 `data` ,和当前选择弹框的指针 `target` 。 |
| selectError      | `function`  | `function(info){}`    | 失败选择之后的回调。 返回一条错误信息 `info` 。 |
| ajaxError        | `function`  | `function(error){}`   | 接口请求报错后的回调。 返回除10000以外的报错 `error`。 |

### what to do next ?
1. 支持出商品外的其他数据的选择。
2. 增加loadding。
3. 支持主题色的替换

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


 
