/**
 * Created by lijiahao on 16/8/16.
 * 选择插件 selectPlugin
 * 当前使用到的地方:
 *      渠道后台: 拼团(商品).幸运大抽奖(商品sku).直播(商品,用户).分享合伙人(用户)
 *      管控后台: 商品添加(仓库),渠道关联商品(商品,品牌,类目)
 */

;(function ($, window, document) {

    // 定义构造函数
    /**
     * 插件的默认配置项
     * @type {boolean} single: false,               // 判断 selectPlugin 是单选还是多选 默认是多选
     * @type {boolean} isSku: false,                // 判断 selectPlugin 是否支持到sku级别 (主要用于商品)
     * @type {boolean} needSkuGoodsInfo: false      // 判断 selectPlugin 是否在选择sku的时候默认返回商品的名字 默认不返回
     * @type {number}  type: 0                      // 判断 selectPlugin 需要渲染的是什么 (0:商品,1:用户,2:优惠券,3:仓库,4:品牌,5:类目,10:合约)
     * @type {number}  selectLength: 0              // 判断 selectPlugin 多选情况下选择的个数限制 (0 为无限)
     * @type {string}  title                        // 商品选择弹窗的title
     * @type {boolean} isSelectAll                  // 判断是否显示全选按钮
     * @type {boolean} isRefresh                    // 判断是否显示刷新按钮
     * @type {Array}   selectedList                 // 选择的列表
     * @type {string}  ajaxUrl                      // 请求的接口
     * @type {string}  ajaxSkuUrl                   // 请求的SKU接口
     * @type {string}  ajaxType                     // ajax的请求类型默认 post
     * @type {string}  ajaxDataType                 // ajax的请求数据类型默认 json
     * @type {boolean} needFailureInfo              // 是否展示已经失效的东西-垃圾数据 ( 默认情况下是展示 )
     * @type {Array}   categoryList                 // 需要展示的类目列表
     * @type {Array}   brandList                    // 需要展示的品牌列表
     * @type {boolean} showCateAndBrand             // 是否展示类目列表和品牌列表的搜索 ( 默认false )
     * function selectSuccess                       // 成功选择之后的回调 返回选择的数据data,和当前选择弹框的指针
     * function selectError                         // 失败选择之后的回调 返回一条错误信息info
     * function ajaxError                           // 接口请求报错后的回调
     */
    var selectPluginFunc = function (ele, opt) {

        var title = '全部商品&nbsp;|&nbsp;<a href="goods.html">新建商品</a><label>&nbsp;&nbsp;&nbsp;' +
            '<input data-type="4" type="checkbox" class="j-select-plugin-checkbox"/>&nbsp;只要上架商品</label>';

        this.$element = ele.selector;                   // 点击弹窗的element

        this.defaults = {
            needSkuGoodsInfo: false,                    // 判断 selectPlugin 是否在选择sku的时候默认返回商品的名字 默认不返回
            single: false,                              // 判断 selectPlugin 是单选还是多选 默认是多选
            isSku: false,                               // 判断 selectPlugin 是否支持到sku级别 (主要用于商品)
            type: 0,                                    // 判断 selectPlugin 需要渲染的是什么 (0:商品,1:用户,2:优惠券,3:仓库,10:合约)
            selectLength: 0,                            // 判断 selectPlugin 多选情况下选择的个数限制 (0 为无限)
            title: title,                               // 商品选择弹窗的title
            isSelectAll: true,                          // 判断是否显示全选按钮
            isRefresh: true,                            // 判断是否显示刷新按钮
            selectedList: [],                           // 选择的列表
            ajaxUrl: '',                                // 请求的接口
            ajaxSkuUrl: '',                             // 请求的SKU接口
            ajaxType: 'post',                           // ajax的请求类型默认 post
            ajaxDataType: 'json',                       // ajax的请求数据类型默认 json
            needFailureInfo: true,                      // 是否展示已经失效的东西-垃圾数据 ( 默认情况下是展示 )
            categoryList: [],                           // 需要展示的二级类目列表
            brandList: [],                              // 需要展示的品牌列表
            showCateAndBrand: false,                    // 是否展示类目列表和品牌列表的搜索 ( 默认false )
            selectSuccess: function (data, target) {    // 成功选择之后的回调 返回选择的数据data,和当前选择弹框的指针
            },
            selectError: function (info) {              // 失败选择之后的回调 返回一条错误信息info
            },
            ajaxError: function (data) {                // 接口请求报错后的回调

            }
        };
        this.options = $.extend({}, this.defaults, opt);
    };

    // 定义方法
    selectPluginFunc.prototype = {

        /**
         * init: 初始化
         */
        init: function () {
            this.typeArr = [0, 1, 2, 3, 4, 5, 10];                                  // 类型数据
            this.search_key = {};                                                   // 搜索配置
            this.pageConfig = {                                                     // 翻页配置
                pageSize: 20,
                visiblePages: 6,
                pageId: 1
            };

            if (this.options.ajaxUrl == '') {
                console.error('error: the ajaxUrl is null please check it again !');
                return;
            }

            if (this.options.isSku === true && this.options.ajaxUrl == '') {
                console.error('error: the ajaxSkuUrl is null please check it again !');
                return;
            }

            // 在单选的情况下 不能全选本页
            if (this.options.single === true && this.options.isSelectAll === true) {
                console.error('error: single and isSelectAll is conflict !');
                this.options.isSelectAll = false;

            } else {
                // 在sku多选的情况下,不能全选本页
                if (this.options.isSku === true && this.options.isSelectAll === true) {
                    console.error('error: isSku and isSelectAll is conflict !');
                    this.options.isSelectAll = false;
                }
            }

            // 如果选择的类型不存在则默认为第一个
            if ($.inArray(this.options.type, this.typeArr) == -1) {
                console.error('type is no found!');
                this.options.type = 0;
            }
            if (this.options.single === true) {
                this.options.selectLength = 1;
            }
            /**
             * 通用配置
             * @type {{}}
             */
            this.renderOption = {};                                                         // 渲染的option条件 example: item:data.data
            this.body = 'body';
            this.selectPluginBox = 'j-select-plugin-box';                                   // 一条商品
            this.templatePopupDialog = 'j-select-plugin-popup-dialog';                      // 弹窗模板
            this.selectPluginSaveBtn = 'j-select-plugin-save';                              // 确定使用按钮
            this.selectPluginSelectAllBtn = 'j-select-plugin-gsa';                          // 全选本页按钮
            this.selectPluginCancelAllBtn = 'j-select-plugin-gca';                          // 取消本页全选按钮
            this.selectPluginSearchBtn = 'j-select-plugin-search';                          // 搜索按钮
            this.selectPluginSelectBtn = 'j-select-plugin-g';                               // 选择按钮
            this.refreshBtn = 'j-select-plugin-refresh';                                    // 刷新

            if (this.options.type !== 5) {
                this.templateRenderArea = 'j-select-plugin-render';                         // 模板渲染的地方
            } else {
                this.templateRenderArea = 'j-select-plugin-cate-level-1';                   // 模板渲染的地方
            }
            this.inputKeyword = 'select-plugin-keyword';                                    // 关键字
            this.template = 'j-select-plugin-table-template';                               // 商品模板

            /**
             * 商品部分 type——0
             * 特殊功能: 确定只要上架/展开sku/一条sku
             */
            this.templateGoodsSku = 'j-select-plugin-sku';                                  // sku模板
            this.goodsCheckboxType4 = 'j-select-plugin-checkbox';                           // 确定只要上架
            this.goodsOpenSku = 'j-open-sku';                                               // 展开sku
            this.selectPluginSkuBox = 'j-select-plugin-sku-box';                            // 一条sku

            /**
             * coupon
             */
            this.coupon_lifecycle = 'j-select-plugin-coupon_lifecycle';
            this.selected_list = [];
            // 请求的api
            this.ajaxApi = this.options.ajaxUrl;
            // 请求的skuApi
            this.ajaxSkuApi = this.options.ajaxSkuUrl;
            this.initDialog();
        },
        /**
         * 初始化弹框按钮点击事件 弹出弹框
         */
        initDialog: function () {
            var that = this;
            // 显示弹窗
            $(that.body).on('click', that.$element, function () {
                if (that.options.selectedList.length > 0) {
                    that.selected_list = that.options.selectedList
                }
                that.target = $(this);

                // 清空上次的查询条件
                for(var key in that.search_key){
                    delete that.search_key[key];
                }
                that.pageConfig.pageId = 1;
                that.addEventOff();
                that.addEvent();

                // 根据type 进行初始化设置
                switch (that.options.type) {
                    case 0:
                        that.brand_key = '';
                        that.cate_key = '';
                        that.goodsAddEvent();
                        break;
                }
                that.popupDialog();
            });
        },
        /**
         * 每次点击事件绑定前off一下
         */
        addEventOff: function () {
            var that = this;
            // 刷新
            $(that.body).off('click', ('.' + that.refreshBtn));
            // 搜索
            $(document).off('click', ('#' + that.selectPluginSearchBtn));
            // 确定使用
            $(document).off('click', ('.' + that.selectPluginSaveBtn));
            // 弹窗 全选本页
            $(document).off('click', ('.' + that.selectPluginSelectAllBtn));
            // 弹窗选择&取消选择
            $(document).off('click', ('.' + that.selectPluginSelectBtn));

            // 点击一级类目出来二级类目
            $(document).off('click', '.select-plugin-category-list');

            // 只要上架
            $(document).off('click', ('.' + that.goodsCheckboxType4));

            $(document).off('click', ('.' + that.goodsOpenSku));
        },
        /**
         * 公共的默认事件监听
         */
        addEvent: function () {
            var that = this;
            var selectedInfo;

            // 刷新
            $(that.body).on('click', '.' + that.refreshBtn, function () {
                that.pageConfig.pageId = 1;
                var dialogHtml = that.theDialogRenderHtml();
                that.prepareHttpRequest(dialogHtml.template);
            });

            // 搜索
            $(document).on('click', '#' + that.selectPluginSearchBtn, function () {
                that.pageConfig.pageId = 1;
                var value = $.trim($('#' + that.inputKeyword).val());
                switch (that.options.type) {
                    case 0:
                        // 商品可查询关键字,品牌,类目
                        that.search_key.key = value;
                        that.search_key.brand_key = that.brand_key || '';
                        that.search_key.cate_key = that.cate_key || '';
                        break;
                    case 1:
                        // 用户可查询用户关键字
                        that.search_key.user_key = value;
                        break;
                    case 2:
                        // 优惠券可查询优惠券的关键字,优惠券的生命周期
                        that.search_key.coupon_key = value;
                        that.search_key.coupon_lifecycle = $('#' + that.coupon_lifecycle).find('option:selected').attr('data-value');
                        break;
                    case 3:
                        // 仓库可查询仓库的关键字
                        that.search_key.warehouse_key = value;
                        break;
                    case 4:
                        that.search_key.brand_name = value;
                        break;
                    case 5:
                        console.log('category');
                        break;
                    case 10:
                        // ...
                        that.search_key.contract_key = value;
                        break;
                }
                that.selected_list = [];
                that.successAjax();
            });

            // 确定使用
            $(that.body).on('click', '.' + that.selectPluginSaveBtn, function () {
                if (that.dialog) {
                    that.dialog.close();
                }
                selectedInfo = that.selected_list;
                that.options.selectSuccess(selectedInfo, that.target)
            });

            // 弹窗 全选本页
            $(document).on('click', '.' + that.selectPluginSelectAllBtn, function () {
                var selectBtn, selectBtn1, selectBtn0;
                selectBtn = $('.' + that.selectPluginSelectBtn);
                selectBtn1 = $('.' + that.selectPluginSelectBtn + '[data-status=1]');
                selectBtn0 = $('.' + that.selectPluginSelectBtn + '[data-status=0]');

                if (that.options.type == 5) {
                    /**
                     * 如果是全点,就点一级啦
                     * @type {*|HTMLElement}
                     */
                    selectBtn1 = $('.' + that.selectPluginSelectBtn + '[data-status=1][data-parent_id=0]');
                    selectBtn0 = $('.' + that.selectPluginSelectBtn + '[data-status=0][data-parent_id=0]');
                }

                if (selectBtn.length == 0) {
                    return false;
                }
                if ($(this).hasClass(that.selectPluginCancelAllBtn)) {
                    for (var i = 0; i < selectBtn1.length; i++) {
                        selectBtn1.eq(i).click();
                    }
                } else {
                    for (var m = 0; m < selectBtn0.length; m++) {
                        if (that.options.selectLength != 0 && (that.options.selectLength <= that.selected_list.length)) {
                            var info = '选择的数据超出上限了!';
                            that.options.selectError(info);
                            return false;
                        } else {
                            selectBtn0.eq(m).click();
                        }
                    }
                }
                that.checkGsa()
            });

            // 弹窗选择&取消选择
            $(document).on('click', '.' + that.selectPluginSelectBtn, function (e) {
                e.stopPropagation();
                var data = JSON.parse(decodeURIComponent($(this).attr('data-info')));
                var status = $(this).attr('data-status');
                var id = data.id;
                var parent = data.parent_id || null;
                var selectedList = that.selected_list;
                var level = $(this).attr('data-cate_level');
                var length = $(this).attr('data-length');

                if (that.options.type != 5) {
                    if (status == '0') {
                        // 选择
                        // 选择的时候判断选择的个数
                        if (that.options.selectLength != 0 && (that.options.selectLength <= selectedList.length)) {
                            var info = '选择的数据超出上限了!';
                            that.options.selectError(info);
                            return false;
                        }
                        selectedList.push(data);
                        $(this).attr('data-status', '1');
                        $(this).text('取消');
                        $(this).css({'background': '#26B99A', 'border-color': '#169F85', 'color': '#fff'});
                        // 判断是单选还是多选
                        if (that.options.single === true) {
                            that.options.selectSuccess(selectedList, that.target);
                            if( that.dialog ){
                                that.dialog.close();
                            }

                        }
                    } else {
                        // 取消

                        // item_id  兼容部分商品的id可能是只有item_id的问题
                        for (var i = 0; i < selectedList.length; i++) {
                            if (id == selectedList[i].id || id == selectedList[i].item_id) {
                                selectedList.splice(i, 1);
                                i--
                            }
                        }
                        $(this).attr('data-status', '0');
                        $(this).text('选择');
                        $(this).css({'background': '#fff', 'border-color': '#eee', 'color': '#333'})
                    }
                } else {
                    var selectBtn0, selectBtn1;
                    if (status == '0') {
                        // 选择
                        selectedList.push(data);
                        $(this).attr('data-status', '1');
                        $(this).text('取消');
                        $(this).css({'background': '#26B99A', 'border-color': '#169F85', 'color': '#fff'});
                        // 判断是单选还是多选
                        if (that.options.single === true) {
                            that.options.selectSuccess(selectedList, that.target);
                            if( that.dialog ){
                                that.dialog.close();
                            }

                        }
                        if (level) {
                            if (level == 1) {
                                // 如果是一级类目,二级类目全部选中
                                selectBtn0 = $('.' + that.selectPluginSelectBtn + '[data-status=0][data-parent_id=' + id + ']');
                                if (selectBtn0.length > 0) {
                                    for (var n = 0; n < selectBtn0.length; n++) {
                                        selectBtn0.eq(n).click();
                                    }
                                } else {
                                    // 如果是没有展开的情况
                                    for (var n = 0; n < data.sub_categorys.length; n++) {
                                        selectedList.push(data.sub_categorys[n]);
                                    }
                                }
                            } else if (level == 2) {
                                // 如果是二级类目
                                selectBtn1 = $('.' + that.selectPluginSelectBtn + '[data-status=1][data-parent_id=' + parent + ']');
                                if (selectBtn1.length == length) {
                                    $('.' + that.selectPluginSelectBtn + '[data-status=0][data-id=' + parent + ']').click();
                                }
                            }
                        }
                    } else {
                        // 取消
                        // item_id  兼容部分商品的id可能是只有item_id的问题
                        for (var j = 0; j < selectedList.length; j++) {
                            if (id == selectedList[j].id || id == selectedList[j].item_id) {
                                selectedList.splice(j, 1);
                                j--
                            }
                        }
                        $(this).attr('data-status', '0');
                        $(this).text('选择');
                        $(this).css({'background': '#fff', 'border-color': '#eee', 'color': '#333'})
                        if (level) {
                            if (level == 1) {
                                // 如果是一级类目,二级类目全部取消
                                selectBtn0 = $('.' + that.selectPluginSelectBtn + '[data-status=1][data-parent_id=' + id + ']');
                                if (selectBtn0.length > 0) {
                                    for (var n = 0; n < selectBtn0.length; n++) {
                                        selectBtn0.eq(n).click();
                                    }
                                } else {
                                    // 如果是没有展开的情况
                                    for (var n = 0; n < data.sub_categorys.length; n++) {
                                        for (var j = 0; j < selectedList.length; j++) {
                                            if (data.sub_categorys[n].id == selectedList[j].id || id == selectedList[j].item_id) {
                                                selectedList.splice(j, 1);
                                                j--
                                            }
                                        }
                                    }
                                }
                            } else if (level == 2) {
                                // 如果是二级类目
                                selectBtn1 = $('.' + that.selectPluginSelectBtn + '[data-status=0][data-parent_id=' + parent + ']');
                                if (selectBtn1.length < length) {
                                    var parentDom = $('.' + that.selectPluginSelectBtn + '[data-status=1][data-id=' + parent + ']');
                                    parentDom.attr('data-status', '0');
                                    parentDom.text('选择');
                                    parentDom.css({'background': '#fff', 'border-color': '#eee', 'color': '#333'});
                                    for (var j = 0; j < selectedList.length; j++) {
                                        if (parent == selectedList[j].id || id == selectedList[j].item_id) {
                                            selectedList.splice(j, 1);
                                            j--
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                that.checkGsa();
            });

            // 点击一级类目出来二级类目
            $(document).on('click', '.select-plugin-category-list', function () {
                var level = $(this).attr('data-cate_level');
                $('.select-plugin-category-list[data-cate_level=' + level + ']').removeClass('active');
                $(this).addClass('active');
                if (level == 1) {
                    var cateLevel2 = JSON.parse(decodeURIComponent($(this).attr('data-level2')));
                    that.renderCategoryLevel2(cateLevel2);
                    that.checkSelected(that.selected_list);
                } else if (level == 2) {

                }
            })
        },

        /**
         * 商品部分type: 0
         * goodsAddEvent: 商品的默认事件监听
         */
        goodsAddEvent: function () {
            var that = this;

            // 弹窗只要上架
            $(document).on('click', '.' + that.goodsCheckboxType4, function () {
                var status = $(this).attr('data-type');
                if (this.checked) {
                    that.statusKey = status;
                } else {
                    that.statusKey = '';
                }
                that.pageConfig.pageId = 1;
                that.selected_list = [];              // 确定上架的重置选择的数据
                that.successAjax();
            });

            // open sku
            $(document).on('click', '.' + that.goodsOpenSku, function () {
                var item_id = $(this).attr('data-id');
                var item_image_url = $(this).attr('data-item_image_url');
                // 如果配置为true, 在返回的每个sku里面塞入商品的名称
                // 因为接口问题,没有返回该项字段
                if (that.options.needSkuGoodsInfo === true) {
                    var item_name = $(this).attr('data-name');
                }
                if (!$(this).attr('data-open_type')) {
                    that.ajaxGoodsSku(item_id, item_name, item_image_url);
                    $(this).text('合拢');
                    $(this).attr('data-open_type', 1)
                } else {
                    $('.sku-box-' + item_id).hide();
                    $(this).text('展开并添加');
                    $(this).removeAttr('data-open_type', 1)
                }
            });

        },

        /**
         * 点击弹窗后重新赋值 搜索数据search_key 和 翻页数据pageId
         * 即:在页面不刷新的情况下重置搜索条件和翻页数据.
         * checkSingle():                   判断是否单选
         * checkSelectAllButton():          判断是否需要有全选按钮
         * prepareHttpRequest():            准备请求数据
         */
        popupDialog: function () {
            var that = this;
            var dialogHtml = that.theDialogRenderHtml();
            var blankContent = '<div id="select-plugin-dialog-content"></div>';
            that.search_key = {};               // 在页面不刷新的情况下重置搜索条件.
            that.pageConfig.pageId = 1;         // 在页面不刷新的情况下重置翻页数据.
            that.dialog = jDialog.dialog({
                title: that.options.title,
                content: blankContent,
                width: 850,
                height: 500,
                draggable: false
            });
            $('#select-plugin-dialog-content').html(dialogHtml.content({
                type: that.options.type,
                needFailureInfo: that.options.needFailureInfo,
                showCateAndBrand: that.options.showCateAndBrand
            }));
            that.checkSingle();
            that.checkSelectAllButton();
            that.prepareHttpRequest(dialogHtml.template);

            // 如果是商品
            if (that.options.type == 0) {
                that.renderBrand();
                that.renderCategory();
            }
        },

        /**
         * 弹窗出来前 判断渲染的模板和content
         * @returns {object} object - 返回一个对象
         * @returns {object} object.content - 渲染弹窗的内容html
         * @returns {object} object.template - 渲染数据列表的html
         */
        theDialogRenderHtml: function () {
            var that = this;
            var content = _.template($('#' + that.templatePopupDialog).html());
            var template = _.template($('#' + that.template).html());
            if (that.options.single === true) {
                that.selected_list = [];
            }
            return {
                content: content,
                template: template
            }
        },

        /**
         * 弹窗出来后 判断类型请求数据
         * @param {string} template - 传入要渲染的模板内容.
         */
        prepareHttpRequest: function (template) {
            var that = this;
            var obj, api;
            switch (that.options.type) {
                // 商品
                case 0:
                    var itemStatus;
                    if (that.options.needFailureInfo == true) {
                        // 需要下架商品
                        itemStatus = that.statusKey || ''
                    } else {
                        // 不需要下架商品
                        itemStatus = that.statusKey || 4
                    }
                    obj = {
                        current_page: that.pageConfig.pageId || 1,
                        page_size: that.pageConfig.pageSize,
                        item_status: itemStatus,
                        key: that.search_key.key,
                        brand_key: that.search_key.brand_key || '',
                        category_id: that.search_key.cate_key || ''
                    };

                    that.ajax(that.ajaxApi, obj, function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            isSku: that.options.isSku,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 用户
                case 1:
                    obj = {
                        offset: that.pageConfig.pageId <= 1 ? '0' : (that.pageConfig.pageId - 1) * 20,
                        page_size: that.pageConfig.pageSize,
                        key: that.search_key.user_key
                    };
                    that.ajax(that.ajaxApi, obj, function (data) {
                        that.renderOption = {
                            items: data.data.module,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 优惠券
                case 2:
                    var coupon_lifecycle;
                    if (that.options.needFailureInfo === true) {
                        // 需要展示过期信息
                        coupon_lifecycle = that.search_key.coupon_lifecycle || 0
                    } else {
                        // 不展示过期信息
                        coupon_lifecycle = that.search_key.coupon_lifecycle || 2
                    }
                    obj = {
                        current_page: that.pageConfig.pageId || 1,
                        page_size: that.pageConfig.pageSize,
                        has_code: 0,
                        name: that.search_key.coupon_key,
                        lifecycle: coupon_lifecycle
                    };
                    that.ajax(that.ajaxApi, obj, function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            type: that.options.type,
                            needFailureInfo: that.options.needFailureInfo
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 仓库
                case 3:
                    obj = {
                        current_page: that.pageConfig.pageId || 1,
                        page_size: that.pageConfig.pageSize,
                        has_code: 0,
                        name: that.search_key.warehouse_key
                    };
                    that.ajax(that.ajaxApi, obj, function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 品牌
                case 4:
                    obj = {
                        current_page: that.pageConfig.pageId || 1,
                        page_size: that.pageConfig.pageSize,
                        keywords: that.search_key.brand_name
                    };
                    that.ajax(that.ajaxApi, obj, function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 类目
                case 5:
                    console.log(template);
                    obj = {};
                    that.ajax(that.ajaxApi, obj, function (data) {
                        that.renderOption = {
                            items: data.data,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                // 合约
                //case 10:
                //    that.theAjaxContracts(function (data) {
                //        that.renderOption = {
                //            items: data.data.data,
                //            isSku: that.options.isSku,
                //            type: that.options.type
                //        };
                //        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                //    });
                //    break;
            }
        },

        /**
         * 进行模板渲染的方法
         * @param total_count:      翻页数据要用到的总页数
         * @param template:         数据渲染用到的模板
         * @param option:           数据渲染的参数如:items:data.data
         * @param list:             渲染结束后判断是否进行了选择,如果选择改变样式
         * @func  noData:           没有数据的展示
         * @func  pagination:       翻页方法
         * @func  checkSelected:    判断之前是否进行过选择
         * @func  checkGsa:         验证是否全选了本页
         *
         */
        renderTemplateFunc: function (total_count, template, option, list) {
            var that = this;
            var $render = $('#' + that.templateRenderArea);
            if (option.type !== 5) {
                if (total_count && total_count != 0) {
                    $render.html(template(option));
                } else {
                    that.noData(total_count, option);
                }
                that.pagination(total_count);
            } else if (option.type == 5) {
                // 如果是类目
                if (option.items && option.items.length > 0) {
                    $render.html(template(option));
                } else {
                    that.noData(total_count, option);
                }
            }
            that.checkSelected(list);
            that.checkGsa();
        },

        /**
         * ajax开始请求ajax
         */
        successAjax: function () {
            var renderHtml = this.theDialogRenderHtml();
            var template = renderHtml.template;
            this.prepareHttpRequest(template)
        },

        /**
         * 接口请求
         * @param {string} api - 接口请求的api地址
         * @param {object} obj - 请求接口提交给服务端的数据
         * @param {function} callback - 接口请求成功后的回调
         */
        ajax: function (api, obj, callback) {
            var that = this;
            $.ajax({
                url: api,
                type: that.options.ajaxType,
                dataType: that.options.ajaxDataType,
                data: obj,
                success: function (data) {
                    if (data.code == 10000) {
                        callback && callback(data)
                    } else if (data.code == 40000) {
                        location.href = '../seller_info/seller_login.html'
                    } else {
                        console.log(data.msg);
                        that.options.ajaxError(data);
                    }
                },
                error: function (data) {
                    console.log(data.msg);
                    that.options.ajaxError(data);
                }
            })
        },
        /**
         * type:0
         * 商品部分根据item_id请求sku信息
         * @param item_id
         * @param item_name
         * @param item_image_url
         */
        ajaxGoodsSku: function (item_id, item_name, item_image_url) {
            var that = this;
            //$('.j-sku-box').hide();

            var $skuTable = $('.sku-box-' + item_id);
            var $skuItem = $('.sku-item-' + item_id);

            that.ajax(that.ajaxSkuApi, {
                item_id: item_id
            }, function (data) {
                if (data.code == 10000) {

                    // todo 将商品名称.商品id.商品主图塞入sku里面
                    if (item_name) {
                        for (var i = 0; i < data.data.skus.length; i++) {
                            data.data.skus[i].item_name = item_name;
                            data.data.skus[i].item_id = item_id;
                            data.data.skus[i].item_image_url = item_image_url;
                        }
                    }

                    $skuTable.show();
                    if ($skuItem.find('tr').length < 1) {
                        var template = _.template($('#' + that.templateGoodsSku).html());
                        $skuItem.html(template({
                            items: data.data.skus,
                            type: that.options.type
                        }))
                    } else {
                        // 已经请求过的 不再请求接口
                        $skuItem.show();
                    }
                    that.checkSelected(that.selected_list);
                } else {
                    console.log(data.msg)
                }
            });
        },
        /**
         * 如果是商品 可以根据品牌进行搜索
         */
        renderBrand: function () {

            var that = this;

            if (this.options.brandList.length > 0) {
                // 拿到数据了
                //var template = _.template($('#j-select-plugin-brand'));
                //$('#select-plugin-brand').html(template({
                //    item: this.options.brandList
                //}))
                $('#select-plugin-brand-selectize').selectize({
                    options: this.options.brandList,
                    placeholder: '请选择品牌',
                    create: false,
                    onItemAdd: function (value, $item) {
                        // 选择品牌
                        console.log(value);
                        that.brand_key = value;
                    },
                    onItemRemove: function (value) {
                        that.brand_key = '';
                        console.log(that.brand_key, value)
                    }
                });
            } else {
                // 没有拿到数据 可能对方的接口还没有返回
                var timer = setInterval(function () {
                    if (!that.timer) {
                        that.timer = 0
                    } else {
                        if (that.timer > 5) {
                            clearInterval(timer)
                        } else {
                            that.timer += 1;
                            that.renderBrand();
                        }
                    }
                }, 1000)
            }
        },
        /**
         * 如果是商品 可以根据类目进行搜索
         */
        renderCategory: function () {

            var that = this;

            if (this.options.categoryList.length > 0) {
                // 拿到数据了
                $('#select-plugin-category-selectize').selectize({
                    options: this.options.categoryList,
                    placeholder: '请选择二级类目',
                    create: false,
                    onItemAdd: function (value, $item) {
                        // 选择品牌
                        console.log(value);
                        that.cate_key = value;
                    },
                    onItemRemove: function (value) {
                        that.cate_key = '';
                        console.log(that.cate_key, value)
                    }
                });
            } else {
                // 没有拿到数据 可能对方的接口还没有返回
                var timer = setInterval(function () {
                    if (!that.timerCate) {
                        that.timerCate = 0
                    } else {
                        if (that.timerCate > 5) {
                            clearInterval(timer)
                        } else {
                            that.timerCate += 1;
                            that.renderCategory();
                        }
                    }
                }, 1000)
            }
        },
        /**
         * 点击一级类目的时候 去渲染二级类目
         * @param data - 二级类目的data
         */
        renderCategoryLevel2: function (data) {
            var that = this;
            if (data && data.length > 0) {
                var template = _.template($('#j-select-plugin-category2').html());
                $('#j-select-plugin-cate-level-2').html(template({
                    items: data,
                    type: that.options.type
                }))
            }
        },
        /**
         * 验证是否全选了本页
         */
        checkGsa: function () {
            var selectBtn = $('.' + this.selectPluginSelectBtn);
            var selectBtn1 = $('.' + this.selectPluginSelectBtn + '[data-status=1]');
            if ((selectBtn1.length == selectBtn.length) && selectBtn.length != 0) {
                $('.' + this.selectPluginSelectAllBtn).text('取消本页全选').addClass(this.selectPluginCancelAllBtn)
            } else {
                $('.' + this.selectPluginSelectAllBtn).text('全选本页').removeClass(this.selectPluginCancelAllBtn)
            }
        },

        /**
         * 验证是否是单选
         */
        checkSingle: function () {
            var save = $('.' + this.selectPluginSaveBtn);
            if (this.options.single === true) {
                save.remove();
            } else {
                save.show();
            }
        },

        /**
         * 验证是否进行全选按钮的展示
         */
        checkSelectAllButton: function () {
            var gsa = $('.' + this.selectPluginSelectAllBtn);
            if (this.options.isSelectAll === true) {
                gsa.show();
            } else {
                gsa.remove();
            }
        },
        /**
         * 验证是否进行了选择(多选)
         * @param selectedList
         */
        checkSelected: function (selectedList) {
            var that = this;
            var list = $('#' + that.templateRenderArea).find('.' + that.selectPluginBox);
            try {
                if (selectedList.length > 0) {
                    if (selectedList[0].sku_id) {
                        // 如果是sku的时候
                        // 将list重新定义到sku的tab上去
                        list = $('#' + that.templateRenderArea).find('.' + that.selectPluginSkuBox);
                    }
                    if (that.options.type == 5) {
                        // 如果是类目
                        // 将list重新定义
                        list = $('.' + that.selectPluginBox)
                    }
                    for (var i = 0; i < selectedList.length; i++) {
                        for (var n = 0; n < list.length; n++) {
                            var selectedDom = list.eq(n).find('.' + that.selectPluginSelectBtn);
                            // item_id  兼容部分商品的id可能是只有item_id的问题
                            if ((selectedList[i].id || selectedList[i].sku_id || selectedList[i].item_id ) == selectedDom.attr('data-id')) {
                                selectedDom.attr('data-status', '1');
                                selectedDom.text('取消');
                                selectedDom.css({'background': '#26B99A', 'border-color': '#169F85', 'color': '#fff'})
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        },

        /**
         * 翻页
         * @param total
         */
        pagination: function (total) {
            var that = this;
            var pagination = $('.selectPluginPagination');
            pagination.jqPaginator({
                totalCounts: total == 0 ? 1 : total,                            // 设置分页的总条目数
                pageSize: that.pageConfig.pageSize,                             // 设置每一页的条目数
                visiblePages: that.pageConfig.visiblePages,                     // 设置最多显示的页码数
                currentPage: that.pageConfig.pageId,                            // 设置当前的页码
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    if (type == 'change') {
                        that.pageConfig.pageId = num;
                        var renderHtml = that.theDialogRenderHtml();
                        // 渲染
                        that.prepareHttpRequest(renderHtml.template)
                    }
                }
            });
            var n = $('#' + that.templateRenderArea).find('.' + that.selectPluginBox).length;
            if (total && total != 0) {
                pagination.prepend('<span>当前' + n + '条</span>/<span>共' + total + '条</span>')
            } else {
                pagination.prepend('<span>当前0条</span>/<span>共' + total + '条</span>')
            }
        },
        /**
         * 没有数据的显示情况
         */
        noData: function (total, option) {
            var content = '<tr style="text-align: center"><td colspan="18">没有任何记录!</td></tr>';
            if (option && option.type !== 5) {
                if (!total || total == 0) {
                    $('#' + this.templateRenderArea).html(content)
                }
            } else if (option && option.type == 5) {
                if (!option.items || option.items.length <= 5) {
                    $('#' + this.templateRenderArea).html(content)
                }
            }
        }
    };

    // 在插件中使用对象
    $.fn.selectPlugin = function (options) {

        var thePlugin = new selectPluginFunc(this, options);

        // 调用
        thePlugin.init();
    }

})(jQuery, window, document);
