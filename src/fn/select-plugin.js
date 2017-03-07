/**
 * Created by lijiahao on 16/8/16.
 * 选择插件 selectPlugin
 * 默认情况下是商品的多选
 * todo 最近修改:
 * 1. id 判断选中 增加了item_id 服务端返回的只有item_id   验证拼团
 * 2. 有两个dialog同时出现的展示异常
 * 3. 增加优惠券的选择
 */

;(function ($, window, document) {

    // 定义构造函数
    /**
     * 插件的默认配置项
     * @type {{boolean}} single: false,               // 判断 selectPlugin 是单选还是多选 默认是多选
     * @type {{boolean}} isSku: false,                // 判断 selectPlugin 是否支持到sku级别 (主要用于商品)
     * @type {{boolean}} needSkuGoodsInfo: false      // 判断 selectPlugin 是否在选择sku的时候默认返回商品的名字 默认不返回
     * @type {{number}}  type: 0                      // 判断 selectPlugin 需要渲染的是什么 (0:商品,1:用户,2:优惠券,10:合约)
     * @type {{number}}  selectLength: 0              // 判断 selectPlugin 多选情况下选择的个数限制 (0 为无限)
     * @type {{string}}  title                        // 商品选择弹窗的title
     * @type {{boolean}} isSelectAll                  // 判断是否显示全选按钮
     * @type {{boolean}} isRefresh                    // 判断是否显示刷新按钮
     * @type {{arry}}    selectedList                 // 选择的list
     * function selectSuccess                         // 成功选择之后的回调
     * function selectError                           // 失败选择之后的回调
     */
    var selectPluginFunc = function (ele, opt) {

        var title = '全部商品&nbsp;|&nbsp;<a href="goods.html">新建商品</a><label>&nbsp;&nbsp;&nbsp;<input data-type="4" type="checkbox" class="j-select-plugin-checkbox"/>&nbsp;只要上架商品</label>';

        this.$element = ele.selector;        // 点击弹窗的element

        this.defaults = {
            selectPluginBtn: ele,
            needSkuGoodsInfo: false,
            single: false,
            isSku: false,
            type: 0,
            selectLength: 0,
            title: title,
            isSelectAll: true,
            isRefresh: true,
            selectedList: [],
            selectSuccess: function (data, info) {
            },
            selectError: function (info) {
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
            this.typeArr = [0, 1, 2, 3, 10];                                        // 类型数据
            this.search_key = {};                                                   // 搜索配置
            this.pageConfig = {                                                     // 翻页配置
                pageSize: 20,
                visiblePages: 6,
                pageId: 1
            };

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
            this.renderOption = {};                                                      // 渲染的option条件 example: item:data.data
            this.body = 'body';
            this.selectPluginBox = 'j-select-plugin-box';                                // 一条商品
            this.templatePopupDialog = 'j-select-plugin-popup-dialog';                   // 弹窗模板
            this.selectPluginSaveBtn = 'j-select-plugin-save-' + this.options.type;       // 确定使用按钮
            this.selectPluginSelectAllBtn = 'j-select-plugin-gsa-' + this.options.type;  // 全选本页按钮
            this.selectPluginCancelAllBtn = 'j-select-plugin-gca-' + this.options.type;  // 取消本页全选按钮
            this.selectPluginSearchBtn = 'j-select-plugin-search-' + this.options.type;  // 搜索按钮
            this.selectPluginSelectBtn = 'j-select-plugin-g-' + this.options.type;       // 选择按钮
            this.refreshBtn = 'j-select-plugin-refresh-' + this.options.type;            // 刷新

            this.templateRenderArea = 'j-select-plugin-render';                          // 模板渲染的地方
            this.inputKeyword = 'select-plugin-keyword';                                 // 关键字
            this.template = 'j-select-plugin-table-template';                           // 商品模板

            /**
             * 商品部分 type——0
             * 特殊功能: 确定只要上架/展开sku/一条sku
             */
            this.templateGoodsSku = 'j-select-plugin-sku';                          // sku模板
            this.goodsCheckboxType4 = 'j-select-plugin-checkbox';                   // 确定只要上架
            this.goodsOpenSku = 'j-open-sku';                                       // 展开sku
            this.selectPluginSkuBox = 'j-select-plugin-sku-box';                    // 一条sku

            /**
             * coupon
             */
            this.coupon_lifecycle = 'j-select-plugin-coupon_lifecycle';

            this.addEvent();

            // 根据type 进行初始化设置
            switch (this.options.type) {
                case 0:
                    this.goodsAddEvent();
                    break;
            }

            this.selected_list = [];

            // api
            // todo dome json数据
            this.ajaxApi = {
                item: '../stub/demo.json',
                item_sku: '../stub/demo_sku.json',
                item_users: '../stub/demo_users.json',
                item_coupon: '../stub/demo_coupon.json',
                item_warehouse: '../stub/demo_warehouse.json'
            };

            if (location.host.indexOf('dev') == 0) {
                //this.ajaxApi = {
                //    item: '../stub/demo.json',
                //    item_sku:'../stub/demo_sku.json'
                //}
            } else {
                //this.ajaxApi = {
                //    item: '../stub/demo.json',
                //    item_sku:'../stub/demo_sku.json'
                //}
            }

        },
        /**
         * 公共的默认事件监听
         */
        addEvent: function () {
            var that = this;
            var selectedInfo;

            // 显示弹窗
            $(that.body).on('click', that.$element, function () {

                if (that.options.selectedList.length > 0) {
                    that.selected_list = that.options.selectedList
                }

                that.popupDialog();
            });

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
                        that.search_key.key = value;
                        break;
                    case 1:
                        that.search_key.user_key = value;
                        break;
                    case 2:
                        that.search_key.coupon_key = value;
                        that.search_key.coupon_lifecycle = $('#' + that.coupon_lifecycle).find('option:selected').attr('data-value');
                        break;
                    case 3:
                        that.search_key.warehouse_key = value;
                        break;
                    case 10:
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
                that.options.selectSuccess(selectedInfo)
            });

            // 弹窗 全选本页
            $(document).on('click', '.' + that.selectPluginSelectAllBtn, function () {
                var selectBtn = $('.' + that.selectPluginSelectBtn);
                var selectBtn1 = $('.' + that.selectPluginSelectBtn + '[data-status=1]');
                var selectBtn0 = $('.' + that.selectPluginSelectBtn + '[data-status=0]');
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
            $(document).on('click', '.' + that.selectPluginSelectBtn, function () {
                var data = JSON.parse(decodeURIComponent($(this).attr('data-info')));
                var status = $(this).attr('data-status');
                var id = data.id;
                var selectedList = that.selected_list;

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
                    $(this).css({'background': '#5cb85c', 'border-color': '#5cb85c', 'color': '#fff'});
                    // 判断是单选还是多选
                    if (that.options.single === true) {
                        that.options.selectSuccess(selectedList);
                        that.dialog.close();

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
                that.checkGsa();
            });
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
         *
         * checkSingle():                   判断是否单选
         * checkSelectAllButton():          判断是否需要有全选按钮
         * prepareHttpRequest():            准备请求数据
         *
         */
        popupDialog: function () {
            var that = this;
            var dialogHtml = that.theDialogRenderHtml();
            var blankContent = '<div id="select-plugin-dialog-content"></div>';
            that.search_key = {};
            that.pageConfig.pageId = 1;
            that.dialog = jDialog.dialog({
                title: that.options.title,
                content: blankContent,
                width: 850,
                height: 450,
                draggable: false
            });
            $('#select-plugin-dialog-content').html(dialogHtml.content({
                type: that.options.type
            }));
            that.checkSingle();
            that.checkSelectAllButton();
            that.prepareHttpRequest(dialogHtml.template);
        },

        /**
         * 弹窗出来前 判断渲染的模板和content
         * @returns {{content: '渲染弹窗的内容html', template: '渲染数据列表的html'}}
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
         * @param template:传入要渲染的模板内容.
         */
        prepareHttpRequest: function (template) {
            var that = this;
            switch (that.options.type) {
                // 商品
                case 0:
                    that.theAjaxGoods(function (data) {
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
                    that.theAjaxUsers(function (data) {
                        that.renderOption = {
                            items: data.data.module,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 优惠券
                case 2:
                    that.theAjaxCoupon(function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                case 3:
                    that.theAjaxWarehouse(function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
                // 合约
                case 10:
                    that.theAjaxContracts(function (data) {
                        that.renderOption = {
                            items: data.data.data,
                            isSku: that.options.isSku,
                            type: that.options.type
                        };
                        that.renderTemplateFunc(data.data.total_count, template, that.renderOption, that.selected_list);
                    });
                    break;
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
            if (total_count && total_count != 0) {
                $render.html(template(option));
            } else {
                that.noData(total_count);
            }
            that.pagination(total_count);
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

        //商品 start-----------------------------------------------------------------------------
        /**
         * type:0
         * 商品部分请求的接口获取商品列表
         * @param callback
         */
        theAjaxGoods: function (callback) {
            var that = this;
            $.ajax({
                url: that.ajaxApi.item,
                type: 'post',
                dataType: 'json',
                data: {
                    current_page: that.pageConfig.pageId || 1,
                    page_size: that.pageConfig.pageSize,
                    item_status: that.statusKey || '',
                    key: that.search_key.key
                },
                success: function (data) {
                    if (data.code == 10000) {
                        callback && callback(data)
                    } else {
                        console.log(data.msg)
                    }
                },
                error: function (data) {
                    console.log(data.msg)
                }
            })
        },
        /**
         * type:0
         * 商品部分根据item_id请求sku信息
         * @param item_id
         */
        ajaxGoodsSku: function (item_id, item_name, item_image_url) {
            var that = this;
            //$('.j-sku-box').hide();

            var $skuTable = $('.sku-box-' + item_id);
            var $skuItem = $('.sku-item-' + item_id);

            $.ajax({
                url: that.ajaxApi.item_sku,
                type: 'post',
                dataType: 'json',
                data: {
                    item_id: item_id
                },
                success: function (data) {
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
                },
                error: function () {
                    console.log(data.msg)
                }
            });
        },

        //商品 end-----------------------------------------------------------------------------

        //用户 start-----------------------------------------------------------------------------

        /**
         * type:1
         * 用户部分请求的接口获取商品列表
         * @param callback
         */
        theAjaxUsers: function (callback) {
            var that = this;
            $.ajax({
                url: that.ajaxApi.item_users,
                type: 'post',
                dataType: 'json',
                data: {
                    offset: that.pageConfig.pageId <= 1 ? '0' : (that.pageConfig.pageId - 1) * 20,
                    page_size: that.pageConfig.pageSize,
                    key: that.search_key.user_key
                },
                success: function (data) {
                    if (data.code == 10000) {
                        callback && callback(data)
                    } else {
                        console.log(data.msg)
                    }
                },
                error: function (data) {
                    console.log(data.msg)
                }
            })
        },

        //用户 end-----------------------------------------------------------------------------

        //优惠券 start-----------------------------------------------------------------------------

        /**
         * type:2
         * 优惠券部分请求的接口获取商品列表
         * @param callback
         */
        theAjaxCoupon: function (callback) {
            var that = this;
            $.ajax({
                url: that.ajaxApi.item_coupon,
                type: 'post',
                dataType: 'json',
                data: {
                    current_page: that.pageConfig.pageId || 1,
                    page_size: that.pageConfig.pageSize,
                    has_code: 0,
                    name: that.search_key.coupon_key,
                    lifecycle: that.search_key.coupon_lifecycle || 0
                },
                success: function (data) {
                    if (data.code == 10000) {
                        callback && callback(data)
                    } else {
                        console.log(data.msg)
                    }
                },
                error: function (data) {
                    console.log(data.msg)
                }
            })
        },

        //优惠券 end-----------------------------------------------------------------------------

        //仓库 start-----------------------------------------------------------------------------

        /**
         * type:3
         * 仓库部分请求的接口获取商品列表
         * @param callback
         */
        theAjaxWarehouse: function (callback) {
            var that = this;
            $.ajax({
                url: that.ajaxApi.item_warehouse,
                type: 'post',
                dataType: 'json',
                data: {
                    current_page: that.pageConfig.pageId || 1,
                    page_size: that.pageConfig.pageSize,
                    has_code: 0,
                    name: that.search_key.warehouse_key
                },
                success: function (data) {
                    if (data.code == 10000) {
                        callback && callback(data)
                    } else {
                        console.log(data.msg)
                    }
                },
                error: function (data) {
                    console.log(data.msg)
                }
            })
        },

        //仓库 end-----------------------------------------------------------------------------

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
                    for (var i = 0; i < selectedList.length; i++) {
                        for (var n = 0; n < list.length; n++) {
                            var selectedDom = list.eq(n).find('.' + that.selectPluginSelectBtn);
                            // item_id  兼容部分商品的id可能是只有item_id的问题
                            if ((selectedList[i].id || selectedList[i].sku_id || selectedList[i].item_id ) == selectedDom.attr('data-id')) {
                                selectedDom.attr('data-status', '1');
                                selectedDom.text('取消');
                                selectedDom.css({'background': '#5cb85c', 'border-color': '#5cb85c', 'color': '#fff'})
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
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
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
        noData: function (total) {
            var content = '<tr style="text-align: center"><td colspan="18">没有任何记录!</td></tr>';
            if (!total || total == 0) {
                $('#' + this.templateRenderArea).html(content)
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
