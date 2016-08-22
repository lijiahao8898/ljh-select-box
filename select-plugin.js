/**
 * Created by lijiahao on 16/8/16.
 * 选择插件 selectPlugin
 * 默认情况下是商品的多选
 */

;(function ($, cobra, window, document) {

    // 定义构造函数
    /**
     * 插件的默认配置项
     * single: false,               // 判断 selectPlugin 是单选还是多选 默认是多选
     * isSku: false,                // 判断 selectPlugin 是否支持到sku级别 (主要用于商品)
     * type: 0                      // 判断 selectPlugin 需要渲染的是什么 (0:商品)
     * title                        // 商品选择弹窗的title
     * isSelectAll                  // 判断是否显示全选按钮
     * isRefresh                    // 判断是否显示刷新按钮
     * function selectSuccess       // 成功选择之后的回调
     * function selectError         // 失败选择之后的回调
     */
    var selectPluginFunc = function (ele, opt) {

        var title = '全部商品&nbsp;|&nbsp;<a href="goods.html">新建商品</a><label>&nbsp;&nbsp;&nbsp;<input data-type="4" type="checkbox" class="j-select-plugin-checkbox"/>&nbsp;只要上架商品</label>';

        this.$element = ele.selector;        // 点击弹窗的element

        this.defaults = {
            selectPluginBtn:ele,
            single:false,
            isSku:false,
            type:0,
            title:title,
            isSelectAll:true,
            isRefresh:true,
            selectSuccess: function (data, info) {},
            selectError: function (data, info) {}
        };

        this.options = $.extend({}, this.defaults, opt);
    };

    // 定义方法
    selectPluginFunc.prototype = {

        init: function () {
            this.typeArr = [0];                                                    // 类型数据
            this.search_key = {};                                                  // 搜索配置
            this.pageConfig = {                                                    // 翻页配置
                pageSize: 20,
                visiblePages: 6,
                pageId: 1
            };
            this.renderOption = {};                                                // 渲染的option条件 example: item:data.data
            this.body                     = 'body';
            this.selectPluginBox          = 'j-select-plugin-box';                 // 一条商品
            this.selectPluginSaveBtn      = 'j-select-plugin-save';                // 确定使用按钮
            this.selectPluginSelectAllBtn = 'j-select-plugin-gsa';                 // 全选本页按钮
            this.selectPluginCancelAllBtn = 'j-select-plugin-gca';                 // 取消全选按钮
            this.selectPluginSearchBtn    = 'j-select-plugin-search';              // 搜索按钮
            this.selectPluginSelectBtn    = 'j-select-plugin-g';                   // 选择按钮

            this.templateRenderArea       = 'j-select-plugin-render';              // 模板渲染的地方
            this.inputKeyword             = 'select-plugin-keyword';               // 关键字

            /**
             * 商品部分
             * @type {string}
             */
            this.templatePopupGoods       = 'j-select-plugin-popup-goods';         // 弹窗模板
            this.templateGoods            = 'j-select-plugin-goods';               // 商品模板
            this.templateGoodsSku         = 'j-select-plugin-sku';                 // sku模板
            this.goodsCheckboxType4       = 'j-select-plugin-checkbox';            // 确定只要上架
            this.goodsOpenSku             = 'j-open-sku';                          // 展开sku
            this.selectPluginSkuBox       = 'j-select-plugin-sku-box';             // 一条sku

            // 在单选的情况下 不能全选本页
            if( this.options.single === true && this.options.isSelectAll === true ){
                console.log('error: single and isSelectAll is conflict !');
                this.options.isSelectAll = false;
            }else{
                // 在sku多选的情况下,不能全选本页
                if( this.options.isSku === true && this.options.isSelectAll === true ){
                    console.log('error: isSku and isSelectAll is conflict !');
                    this.options.isSelectAll = false;
                }
            }

            // 如果选择的类型不存在则默认为第一个
            if( $.inArray(this.options.type, this.typeArr) == -1 ){
                console.log('type is no found!');
                this.options.type = 0
            }

            this.addEvent();

            // 根据type 进行初始化设置
            switch ( this.options.type ){
                case 0:
                    this.goodsAddEvent();
                    this.selected_list_goods = [];
                    break;
            }

        },
        addEvent: function () {
            var that = this;
            var selectedInfo;

            // 显示弹窗
            $(that.body).on('click', that.$element,function(){
                that.popupDialog();
            });

            // 确定使用
            $(that.body).on('click', '.' + that.selectPluginSaveBtn, function () {
                that.dialog.close();
                switch ( that.options.type ){
                    case 0:
                        selectedInfo = that.selected_list_goods;
                        break;
                }
                console.log(selectedInfo);
                that.options.selectSuccess(selectedInfo)
            });

            // 弹窗 全选本页
            $(document).on('click', '.' + that.selectPluginSelectAllBtn,function(){
                var selectBtn = $('.' + that.selectPluginSelectBtn);
                var selectBtn1 = $('.' + that.selectPluginSelectBtn + '[data-status=1]');
                var selectBtn0 = $('.'+ that.selectPluginSelectBtn +'[data-status=0]');
                if( selectBtn.length == 0 ){
                    return false;
                }
                if( $(this).hasClass(that.selectPluginCancelAllBtn) ){
                    for ( var i = 0 ; i < selectBtn1.length ; i ++){
                        selectBtn1.eq(i).click();
                    }
                }else{
                    for ( var m = 0 ; m < selectBtn0.length ; m ++){
                        selectBtn0.eq(m).click();
                    }
                }
                that.checkGsa()
            });
        },

        /**
         * 点击弹窗后重复值 搜搜数据search_key 和 翻页数据pageId
         */
        popupDialog: function () {
            var that = this;
            var renderHtml = that.theRenderBefore();
            that.search_key = {};
            that.pageConfig.pageId = 1;
            that.dialog = jDialog.dialog({
                title: that.options.title,
                content: renderHtml.content,
                width: 850,
                height: 450,
                draggable: false
            });
            that.checkSingle();
            that.checkSelectAllButton();
            that.searchResult();
            // 渲染
            that.theRender(renderHtml.template);
        },

        // 弹窗前 判断渲染的模板和content
        theRenderBefore: function () {
            var that = this;
            var content,template;
            switch ( that.options.type ){
                // 商品
                case 0:
                    content = $('#'+that.templatePopupGoods).html();
                    template = _.template($('#'+that.templateGoods).html());
                    if( that.options.single === true ){
                        that.selected_list_goods = []
                    }
                    break;
            }
            return {
                content:content,
                template:template
            }
        },

        // 弹窗出来后
        theRender: function (template) {
            var that = this;
            switch ( that.options.type ){
                case 0:
                    that.ajaxGoods(function (data) {
                        that.renderOption = {
                            items:data.data.data,
                            type:that.options.isSku
                        };
                        that.render(data.data.total_count, template, that.renderOption, that.selected_list_goods);
                    });
                    break;
            }
        },

        render: function (total_count, template, option, list) {
            var that = this;
            var $render = $('#'+that.templateRenderArea);
            if( total_count && total_count != 0 ){
                $render.html(template(option));
            }else{
                that.noData(total_count);
            }
            that.pagination(total_count);
            that.checkSelected(list);
            that.checkGsa();
        },

        successAjax: function () {
            var renderHtml = this.theRenderBefore();
            var template = renderHtml.template;
            this.theRender(template)
        },

        /**
         * 搜索
         * 搜索的时候重置了选择过的数据
         */
        searchResult: function(){
            var that = this;

            $(document).on('click', '#' + that.selectPluginSearchBtn, function () {
                that.pageConfig.pageId = 1;
                switch (that.options.type){
                    case 0:
                        that.search_key.key = $.trim($('#'+that.inputKeyword).val());
                        that.selected_list_goods = [];
                        that.successAjax();
                }
            })
        },

        /**
         * 公共部分事件
         */
        commonAddEvent: function () {

        },

        /**
         * 商品部分type: 0
         */
        goodsAddEvent: function () {
            var that = this;

            // 弹窗只要上架
            $(document).on('click', '.' + that.goodsCheckboxType4 , function () {
                var status = $(this).attr('data-type');
                if( this.checked ){
                    that.statusKey = status;
                }else{
                    that.statusKey = '';
                }
                that.pageConfig.pageId = 1;
                that.selected_list_goods = [];              // 确定上架的重置选择的数据
                that.successAjax();
            });

            // 弹窗选择&取消选择
            $(document).on('click', '.' + that.selectPluginSelectBtn, function () {
                var data = JSON.parse(decodeURIComponent($(this).attr('data-info')));
                var status = $(this).attr('data-status');
                var id = data.id;
                if( status == '0' ){
                    // 选择
                    that.selected_list_goods.push(data);
                    $(this).attr('data-status','1');
                    $(this).text('取消');
                    $(this).css({'background':'#5cb85c','border-color':'#5cb85c','color':'#fff'});
                    // 判断是单选还是多选
                    if( that.options.single === true ){
                        that.options.selectSuccess(that.selected_list_goods);
                        that.dialog.close();

                    }
                }else{
                    // 取消
                    for( var i = 0 ; i < that.selected_list_goods.length ; i ++ ){
                        if( id == that.selected_list_goods[i].id ){
                            that.selected_list_goods.splice(i,1);
                            i --
                        }
                    }
                    $(this).attr('data-status','0');
                    $(this).text('选择');
                    $(this).css({'background':'#fff','border-color':'#eee','color':'#333'})
                }
                that.checkGsa();
            });

            // open sku
            $(document).on('click', '.'+ that.goodsOpenSku , function(){
                var item_id = $(this).attr('data-id');
                if( !$(this).attr('data-open_type') ){
                    that.ajaxGoodsSku(item_id);
                    $(this).text('合拢');
                    $(this).attr('data-open_type', 1)
                }else{
                    $('.sku-box-' + item_id).hide();
                    $(this).text('展开并添加');
                    $(this).removeAttr('data-open_type', 1)
                }
            });

        },
        ajaxGoods: function (callback) {
            var that = this;
            $.ajax({
                url: 'http://boss.mockuai.net:8080/bossmanager/item/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    current_page: that.pageConfig.pageId || 1,
                    page_size: that.pageConfig.pageSize,
                    item_status:that.statusKey || '',
                    key:that.search_key.key
                },
                success: function (data) {
                    if( data.code == 10000 ){
                        callback && callback(data)
                    }else{
                        console.log(data.msg)
                    }
                },
                error: function (data) {
                    console.log(data.msg)
                }
            })
        },
        ajaxGoodsSku: function(item_id){
            var that = this;
            //$('.j-sku-box').hide();

            var $skuTable = $('.sku-box-' + item_id);
            var $skuItem = $('.sku-item-' + item_id);

            $.ajax({
                url: 'http://boss.mockuai.net:8080/bossmanager/item/sku/query.do',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    item_id:item_id
                },
                success: function (data) {
                    if( data.code == 10000 ){
                        $skuTable.show();
                        if( $skuItem.find('tr').length < 1 ){
                            var template = _.template($('#'+ that.templateGoodsSku).html());
                            $skuItem.html(template({
                                items:data.data.skus
                            }))
                        }else{
                            // 已经请求过的 不再请求接口
                            $skuItem.show();
                        }
                        that.checkSelected(that.selected_list_goods);
                    }else{
                        console.log(data.msg)
                    }
                },
                error: function () {
                    console.log(data.msg)
                }
            });
        },

        /**
         * 验证是否全选了本页
         */
        checkGsa: function(){
            var selectBtn = $('.' + this.selectPluginSelectBtn);
            var selectBtn1 = $('.'+ this.selectPluginSelectBtn +'[data-status=1]');
            if( (selectBtn1.length == selectBtn.length) &&  selectBtn.length != 0){
                $('.'+this.selectPluginSelectAllBtn).text('取消全选').addClass(this.selectPluginCancelAllBtn)
            }else{
                $('.'+this.selectPluginSelectAllBtn).text('全选本页').removeClass(this.selectPluginCancelAllBtn)
            }
        },

        /**
         * 验证是否是单选
         */
        checkSingle: function () {
            var save = $('.'+ this.selectPluginSaveBtn);
            if( this.options.single === true ){
                save.remove();
            }else{
                save.show();
            }
        },

        /**
         * 验证是否进行全选按钮的展示
         */
        checkSelectAllButton: function () {
            var gsa = $('.'+ this.selectPluginSelectAllBtn);
            if( this.options.isSelectAll === true ){
                gsa.show();
            }else{
                gsa.remove();
            }
        },
        /**
         * 验证是否进行了选择
         * @param selectedList
         */
        // 检查是否进行了选择(多选)
        checkSelected: function (selectedList) {
            var that = this;
            var list = $('#'+ that.templateRenderArea).find('.'+that.selectPluginBox);
            if( selectedList.length > 0 ){
                if( selectedList[0].sku_id ){
                    // 如果是sku的时候
                    list = $('#'+ that.templateRenderArea).find('.'+that.selectPluginSkuBox);
                }
            }
            for ( var i = 0 ; i < selectedList.length ; i ++ ){
                for ( var n = 0 ; n < list.length ; n ++ ){
                    var selectedDom = list.eq(n).find('.'+ that.selectPluginSelectBtn);
                    if( (selectedList[i].id || selectedList[i].sku_id) == selectedDom.attr('data-id') ){
                        selectedDom.attr('data-status','1');
                        selectedDom.text('取消');
                        selectedDom.css({'background':'#5cb85c','border-color':'#5cb85c','color':'#fff'})
                    }
                }
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
                        var renderHtml = that.theRenderBefore();
                        // 渲染
                        that.theRender(renderHtml.template)
                    }
                }
            });
            var n = $('#'+ that.templateRenderArea).find('.'+that.selectPluginBox).length;
            if( total && total != 0 ){
                pagination.prepend('<span>当前'+n+'条</span>/<span>共'+total+'条</span>')
            }else{
                pagination.prepend('<span>当前0条</span>/<span>共'+total+'条</span>')
            }
        },
        /**
         * 没有数据的显示情况
         */
        noData: function (total) {
            var content = '<tr style="text-align: center"><td colspan="18">没有任何记录!</td></tr>';
            if( !total || total == 0 ){
                $('#'+this.templateRenderArea).html(content)
            }
        }
    };

    // 在插件中使用对象
    $.fn.selectPlugin = function (options) {

        var thePlugin = new selectPluginFunc(this, options);

        // 调用
        thePlugin.init();
    }

})(jQuery, cobra, window, document);
