/**
 * Created with JetBrains WebStorm.
 * User: macisi528@gmail.com
 * Date: 12-11-25
 */
var QP = QP || {};
QP = (function(w){
    var global = w,
        doc = document;

    var doms = {
        requestList: [],
        /**
         * get single element
         * @param selector
         * @param obj (optional)
         * @return {Node}
         */
        getEl: function(selector, obj) {
            obj = typeof obj === "object" ? obj : doc; 
            return obj.querySelector(selector);
        },
        /**
         * get elements array
         * @param selector
         * @param obj (optional)
         * @return {NodeList}
         */
        getEls: function(selector, obj) {
            obj = typeof obj === "object" ? obj : doc; 
            return obj.querySelectorAll(selector);
        },
        /**
         * 绑定事件
         * @param el
         * @param evt
         * @param callback
         */
        addEvent: function(el, evt, callback) {
            el.addEventListener(evt, callback, false);
        },
        /**
         * 解除绑定
         * @param el
         * @param evt
         * @param callback
         */
        removeEvent: function(el, evt, callback) {
            el.removeEventListener(evt, callback, false);
        },
        requestJsonp: function(src) {
            var script = doc.createElement("script");
            script.src = src;
            script.charset = "GB2312";//防止乱码
            this.requestList.push(script);
            if (this.requestList.length >= 3) {
                doc.head.removeChild(this.requestList.shift());
            }
            document.head.appendChild(script);
            console.log(this.requestList);
        }
    };

    var util = {
        /**
         * 修改图片地址尺寸参数
         * @param  str  [地址]
         * @param  size [尺寸参数]
         * @return {[type]}  [修正后地址]
         */
        resizeUrl: function(str, size){
            var rs = str,
                _defSize = ['c', 'b', 'm', 's'],
                _cusSplit = 'x';
            size = size.toLowerCase();
            var rgxSubDomain = /^(https?\:\/\/)([ab])([0-9]+)/,
                isDefaultSize = this.eqString(size, _defSize) === -1 ? false : true,
                domainSizefix, subDomain, rgxSubDomainFix, cusSize;
            domainSizefix = {
                "opacity": 'b',
                'b': 'b',
                'c': 'b',
                'm': 'b',
                's': 'a'
            };
            if(!isDefaultSize) {
                cusSize = size.split(_cusSplit);
                size = 'b';
            }
            rs = rs.replace(/\/rurl4_[bms]=/, '/rurl4_' + ((size === 'm' || size === 'c') ? 'b' : size) + '=');
            if(size === 'm') {
                rs = rs.replace('/http_imgload.cgi?', '/http_img208.cgi?');
            } else {
                rs = rs.replace(/\/http_img[a-z0-9]+\.cgi\?/, '/http_imgload.cgi?');
            }
            switch(size) {
            case 'o':
            case 'b':
            case 'm':
                rgxSubDomainFix = /\&b=([0-9]+)/;
                break;
            case 's':
                rgxSubDomainFix = /\&a=([0-9]+)/;
                break;
            }
            subDomain = rs.match(rgxSubDomainFix);
            subDomain = (subDomain && subDomain[1]) || '';
            rs = rs.replace(rgxSubDomain, '$1' + domainSizefix[size] + (subDomain || '$3'));
            rs = rs.replace(/\/[abmco]\//, '/' + (size === 's' ? 'a' : size) + '/');
            if(size === 'o') {
                rs = rs.replace(/(https?\:\/\/)([^\/]*)\//, '$1r.photo.store.qq.com/');
            }
            if(cusSize) {
                rs = rs + (cusSize[0] ? '&w=' + $.trim(cusSize[0]) : '') + (cusSize[1] ? '&h=' + $.trim(cusSize[1]) : '') + (crop ? '&cf=2' : '');
            }
            return rs || 'about:blank';
        },
        /**
         * 返回是否包含字符串
         * @param  str [字符串]
         * @param  arr [数组]
         * @return     [description]
         */
        eqString: function(str, arr) {
            var plus = '|~~~|' + (+new Date()) + '|~~~|',
                arrPlus = plus + arr.join(plus) + plus,
                strPlus = plus + str + plus,
                has, rs = -1,
                idx = arrPlus.indexOf(strPlus);
            has = idx === -1 ? false : true;
            if(has) {
                rs = arrPlus.substr(0, idx).split(plus).length - 1;
            }
            return rs;
        }
    };

    var request = {
        route: ["http://app.photo.qq.com/cgi-bin/app/cgi_get_route?cb=_Callback&uin=", "&output_type=json"],
        album: ["http://", "/fcgi-bin/fcg_list_album?cb=_Callback&uin=", "&outstyle=2&format=jsonp"],
        list: ["http://", "/fcgi-bin/fcg_list_photo_v2?inCharset=gbk&outCharset=gbk&hostUin=", "&notice=0&callbackFun=", "&format=jsonp&plat=qzone&source=qzone&appid=4&uin=", "&albumid="]
    },
    photo = {
        album_domain: false,
        list_domain: false,
        uin: false
    };

    var _callback = function(obj){
        var map = {
            1: "nu",
            2: "p",
            3: "r",
            4: "s",
            5: "u"
        };
        if (obj.domain) {
            photo.uin = obj.uin;
            photo.album_domain = obj[obj.domain.default].p;
            photo.list_domain = obj[obj.domain.default][map[obj.idcno]];
            console.log(photo);
            doms.requestJsonp(request.album[0] + photo.album_domain + request.album[1] + photo.uin + request.album[2]);
        } else {
            var album_list = doms.getEl("#album_list");
            Handlebars.registerHelper('cover_url', function() {
                return util.resizeUrl(this.pre, "m");
            });
            var album_template = Handlebars.compile(doms.getEl("#tpl_album").innerHTML);
            album_list.innerHTML = album_template(obj);
        }
    };

    var list_Callback = function(obj) {
        if (obj.data === null) {
            alert("请先登录");
            return;
        }
        var photo_list = doms.getEl("#photo_list");
        var photo_template = Handlebars.compile(doms.getEl("#tpl_photo").innerHTML);
        photo_list.innerHTML = photo_template(obj.data);
    };

    global._Callback = _callback;
    global.list_Callback = list_Callback;

    (function(){
        var qNumber = doms.getEl("#Js_qNumber"),
            qButton = doms.getEl("#Js_button"),
            album_list = doms.getEl("#album_list"),
            qid;
        doms.addEvent(qButton, "click", function(){
            qid = (/^\d+$/).test(qNumber.value) ? qNumber.value : qid;
            doms.requestJsonp(request.route[0] + qid + request.route[1]);
        });
        doms.addEvent(album_list, "click", function(e){
            doms.requestJsonp(request.list[0] + photo.list_domain + request.list[1] + photo.uin + request.list[2] + "list" + request.list[3] + "418195138" + request.list[4] + e.target.dataset.albumId);
        });
    })()

    return {
        DOM: doms,
        UTIL: util
    }

})(window);

