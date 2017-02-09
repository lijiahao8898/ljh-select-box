;(function(){
    var nav = {
        init: function(){
            if( localStorage.navInfo ){
                this.data = JSON.parse(localStorage.navInfo);
            }
            this.shop_type = '';
            var biz_code = cobra.cookie('biz_code');
            this.urlMap = [
                '../seller_info/seller_login.html',
                '../seller_info/seller_mallConfiguration.html',
                '../seller_info/seller_register.html',
                '../seller_info/register.html',
                '../seller_info/seller_forgot_pwd.html',
                '../seller_info/seller_register_free.html'
                //'../seller_info/seller_account_passwd.html'
            ];

            //如果是dev
            if (location.host.indexOf('dev') == 0) {
                this.url = '..' + location.href.split(location.host)[1].split('.html')[0] + '.html';
                window.menuDomain = 'http://115.29.191.163';
                this.apiBase = 'http://haodada.boss.mockuai.com:18181/multibossmanager/';
                window.ossDomain = 'http://media.mockuai.com/'
            } else {
                this.url = '..' + location.href.split(location.host + '/multibossmanager/html')[1].split('.html')[0] + '.html';
                window.menuDomain = 'http://115.29.191.163';
                this.apiBase = 'http://' + location.host + '/multibossmanager/';
                window.ossDomain = 'http://media.mockuai.com/'
            }

            if( localStorage.configInfoBoss && location.href.indexOf('seller_login') == -1 ){
                this.renderMallConfig(JSON.parse(localStorage.configInfoBoss));
            }else{
                this.getMallConfig();
            }

            /**
             * 根据map => urlMap 匹配
             * 如果是在urlMap里面的,则不去渲染导航等.
             * 因为这些页面没有导航
             */
            if( $.inArray(this.url,this.urlMap) != -1  ){
                return false;
            }

            var session_key = Common.getQuery('session_key');
            var biz_code = Common.getQuery('biz_code');
            var type = Common.getQuery('user_type');
            if( session_key && biz_code  ){
                var self = this;
                self.getNavInfo(biz_code,function(d){
                    cobra.cookie('is_multi_mall',0,{path:'/'})
                    self.data = JSON.parse(d);
                    self.addEvent();
                    self.render(biz_code,type);
                });
            }else{
                var biz_code = cobra.cookie('biz_code');
                this.addEvent();
                this.render(biz_code);
            }

            //判断用户是否有商城权限
            if( cobra.cookie('role_mark') == 3 && cobra.cookie('is_multi_mall') == 1 && cobra.cookie('is_super') == 1 ){
                $('.seller-nav-main').children('li:last').after('<li class="ui-nav-item j-goto-mall" style="display: list-item;"> <a href="javascript:;">去商城</a></li>')
            }
        },
        getNavInfo: function(biz_code,cb){
            var that = this;
            $.ajax({
                type:'get',
                url: window.menuDomain +'/auth/get_user_auth',
                data:{
                    biz_code:biz_code,
                    shop_type:1             // 版本切换固定是单店铺
                },
                success:function(d){
                    var data = JSON.parse(d);
                    if(data.code == 10000){
                        if( !data.data.menu_list ){
                            that._msgBox.error('暂未配置权限信息，请联系管理人员配置相关权限信息！')
                            return false;
                        }
                        localStorage.navInfo = d;
                        cb && cb(d);
                    }
                }
            })
        },
        render:function(biz_code,type){
            var that = this;
            if( that.data ){
                var data = that.data;
                var template = _.template($('#j-template-nav').html());
                $('.j-nav-render').html(template({
                    items:data.data.menu_list
                }));

                $("ul.seller-nav-main").on("mouseenter" , ">li.ui-nav-item" , function(){
                    if(!$(this).hasClass("ui-nav-item-current")){
                        $(this).find(">ul.ui-nav-submain").addClass("preview").css({left : 'auto'});
                        $(this).find(">a").addClass("preview");
                    }
                }).on("mouseleave", ">li.ui-nav-item", function(){
                    if(!$(this).hasClass("ui-nav-item-current")){
                        $(this).find(">ul.ui-nav-submain").removeClass("preview");
                        $(this).find(">a").removeClass("preview");
                    }
                });
                // 如果是门店
                var user_type = cobra.cookie("user_type");
                if (user_type == 1 || type == 1) {
                    $('.ui-nav-item').show();
                } else {
                    $(".ui-nav-item[data-id=237]").show();
                    $('.ui-nav-items').attr('href','#');
                    $('.button-export-order').remove();
                    that.hideSelectNav('.ui-nav-item', 237, [238, 242, 243]);
                }

            }
        },
        addEvent: function(){
            var that = this;
            var urlArr = [];
            //导航栏的匹配
            if( that.data ){
                var data  = that.data.data;
                for ( var i = 0;i < data.menu_list.length; i ++ ){
                    if( data.menu_list[i].children ){
                        for( var n = 0;n < data.menu_list[i].children.length; n ++ ){
                            //拿出所有url放入数组
                            urlArr.push(data.menu_list[i].children[n].menu_url);
                            if( data.menu_list[i].children[n].menu_url == that.url ){
                                data.menu_list[i].active = true;
                                data.menu_list[i].children[n].active = true;
                            }
                        }
                    }else{
                        urlArr.push(data.menu_list[i].menu_url);
                    }
                }
                var funList = data.fun_list;
                var toggleFunList = function () {
                    for ( var f = 0 ; f < funList.length ; f ++ ){
                        if( funList[f].menu_title == 'register' ){
                            $('.j-fun-block[data-fun-name='+funList[f].menu_title+']').css({'display':'inline-block'});
                        }else{
                            $('.j-fun-block[data-fun-name='+funList[f].menu_title+']').show();
                        }
                    }
                };
                if( funList ){
                    toggleFunList();

                    // 自定义事件: 更新功能模块控制展示
                    $('body').on('updateFunListToggle', toggleFunList);
                }
            }
            //不满足导航情况的菜单子页面
            if( urlArr.indexOf(that.url) == -1 ){
                that.getCurrentId()
            }

            //去商城
            $(document).on('click','.j-goto-mall',function(){
                that._availdMall(function(link){
                    that.gotoMall(link,true)
                })
            })

        },
        // 支持带有refer的跳转，兼容 ie
        gotoMall: function (url, blank) {
            var linka = document.createElement('a');
            linka.href=url;
            if (blank) {
                linka.target = '_blank';
            }
            document.body.appendChild(linka);
            linka.click();
        },
        _availdMall: function(cb){
            $.ajax({
                type:'get',
                dataType:'jsonp',
                data:{
                    //session_key:cobra.cookie('session_key'),
                    role_mark:cobra.cookie('role_mark')
                },
                url: this.apiBase + 'user/direct_to_login.do',
                success:function(d){
                    if ( d.code == 10000 ){
                        var biz_code = cobra.cookie('biz_code');
                        var link = d.data.direct_login_url;
                        cb(link)
                    }
                }
            })
        },
        getCurrentId: function(){
            var that = this;
            if( cobra.cookie('is_multi_mall') == 1  ){      //1是商城 0 是店铺
                that.shop_type = 3
            }else if( cobra.cookie('is_multi_mall') == 0 ){
                that.shop_type = 1
            }
            $.ajax({
                type:'post',
                data:{
                    menu_url:that.url,
                    shop_type:that.shop_type
                },
                url: window.menuDomain + '/auth/get_current_menu',
                success:function(d){
                    var data = JSON.parse(d);
                    if( data.code == 10000 ){
                        //todo 获取当前的二级导航成功
                        var current_id = data.data.current_menu_id;
                        if( current_id != 0 ){
                            $('.ui-nav-subitem[data-id='+current_id+']').addClass('ui-nav-subitem-current');
                            $('.ui-nav-subitem[data-id='+current_id+']').parents('.ui-nav-item').addClass('ui-nav-item-current')
                        }
                    }else{

                    }
                }
            })
        },
        //隐藏被选择的导航
        hideSelectNav: function(elem, p, cArr) {
            var $nav = $(elem + '[data-id=' + p + ']');
            if (cArr) {
                var j = cArr.length;
                for (var i = 0; i < j; i++) {
                    $nav.find('li[data-id=' + cArr[i]+ ']').hide();
                }
            } else {
                $nav.hide();
            }
        },
        // 获取商城信息的配置
        getMallConfig: function () {
            var that = this;

            $.ajax({
                type:'get',
                url: this.apiBase + '/boss_image/get.do',
                dataType:'jsonp',
                success:function(data){

                    if( data.code == 10000 ){

                        try {
                            localStorage.configInfoBoss = JSON.stringify(data);
                            that.renderMallConfig(data)

                        } catch (e){
                            console.log(e);
                        }

                    }else{
                        console.log(data.msg);
                    }
                }
            })
        },
        renderMallConfig: function (data) {
            try {
                if( !data.data.boss_image.index_head_img ){
                    $('.logo-bd,.copyright,.main-logo,.main-logo-join').css({
                        'display':'block'
                    });
                    $('.welcome-login-text').css({
                        'display':'inline-block'
                    });
                    document.title = '店铺管理后台-魔筷科技'
                }else{

                    var boss = data.data.boss_image;
                    if( boss.index_head_img ){
                        $('.main-logo').css({
                            'background':'url('+ boss.index_head_img +') no-repeat',
                            'display':'block'
                        });
                    }
                    if( boss.buttom_copyrights_text ){
                        $('.copyright').text(boss.buttom_copyrights_text).show();
                    }
                    if( boss.login_head_img ){
                        $('.logo-bd').css({
                            'background':'url('+ boss.login_head_img +') no-repeat 0 0',
                            'display':'block'
                        })
                    }
                    if( boss.welcome_login_text ){
                        $('.welcome-login-text').text(boss.welcome_login_text).show();
                    }
                    if( boss.seller_join_head_img ){
                        $('.main-logo-join').css({
                            'background':'url('+ boss.seller_join_head_img +') no-repeat 0 15px',
                            'display':'block'
                        })
                    }
                    if( boss.index_title ){
                        document.title = '店铺管理后台-' + boss.index_title
                    }else{
                        document.title = '店铺管理后台-魔筷科技'
                    }
                }
            } catch (e){
                console.log(e);
            }
        }
    };
    //run
    $(function(){
        nav.init();
    })
})();
