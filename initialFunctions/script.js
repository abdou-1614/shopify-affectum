"use strict";
var pixels =["273944367460006"];
var pxlscol = ["609943173266497"];
var collectionspixels = {"609943173266497":["241596432581","241218158789"]}
var  pinterestid = '';
var snapchatid =  '';
var tktid = '';
var tblid ='';
var  twid='';
var ids = [],   content = [];
var i = 0,
    j = 0,
    k = 0;
var value  = Shopify.checkout.total_price;
var item_count = Shopify.checkout.line_items.length;
var currency = Shopify.checkout.presentment_currency;
var order_id = Shopify.checkout.order_id;
var fn = Shopify.checkout.shipping_address.first_name;
var ln = Shopify.checkout.shipping_address.last_name;
var ph = Shopify.checkout.shipping_address.phone;
var em = Shopify.checkout.email;
var ct = Shopify.checkout.shipping_address.city;
var zp = Shopify.checkout.shipping_address.zip;


document.addEventListener("DOMContentLoaded", function() {

    for (i = 0; i < Shopify.checkout.line_items.length; i++) {
        ids.push(Shopify.checkout.line_items[i].product_id);
        content.push({
            "id": Shopify.checkout.line_items[i].product_id,
            "quantity": Shopify.checkout.line_items[i].quantity,
            "item_price": Shopify.checkout.line_items[i].price
        });
    }

    if (localStorage.getItem('calltwo') != null) {
        var prodcollections = JSON.parse(localStorage.getItem('calltwo'));
        console.log(prodcollections)
        prodcollections= prodcollections[0].collections
        for (var i = 0; i < pxlscol.length; i++) {
            let col =  collectionspixels[pxlscol[i]]
            console.log(col)
            console.log(pxlscol[i])
            SetPixels(col,prodcollections,pxlscol[i])

        }

        localStorage.removeItem('calltwo');
        getCurrentPixels();
    }
});



function getCurrentPixels() {
    if (getCookie('orderId') != order_id) {
        runPixels();
    }

}



function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }

    return "";
}

function runPixels() {

    if (pixels.length>0) {

        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;

            n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };

            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        for (var _i = 0; _i < pixels.length; _i++) {
            fbq('init', pixels[_i], {
                ln: ln,
                ph: ph,
                em: em,
                ct: ct,
                zp: zp
            });
        }
        fbq('track', 'Purchase', {
            content_type: "product_group",
            content_ids: ids,
            order_id: order_id,
            contents: content,
            value: value,
            num_items: item_count,
            currency: currency
        });
    }

    loadotherpixels(pinterestid, {
        content_type: "product_group",
        content_ids: ids,
        order_id: order_id,
        contents: content,
        value: value,
        num_items: item_count,
        currency: currency
    },snapchatid,twitterid,tblid);

    document.cookie = 'orderId=' + order_id;
}

function loadotherpixels(pinterestid,purchaseData,snapchatid,twitterd,tblid){
    if (pinterestid ) {
        loadpint( pinterestid,purchaseData)
    }
    if (snapchatid) {
        loadsnap(snapchatid,purchaseData)
    }

    if (twitterid) {
        loadtw(twitterid,purchaseData)

    }
    if (tblid) {
        loadtbl(tblid,purchaseData)
    }
    if (tktid) {
        loadtkt(tktid,purchaseData)
    }
}

function loadpint(pinid,purchaseData){
    if (pinid) {
        !function (e) {
            if (!window.pintrk) {
                window.pintrk = function () {
                    window.pintrk.queue.push(Array.prototype.slice.call(arguments));
                };
                var n = window.pintrk;
                n.queue = [], n.version = "3.0";
                var t = document.createElement("script");
                t.async = !0, t.src = e;
                var r = document.getElementsByTagName("script")[0];
                r.parentNode.insertBefore(t, r);
            }
        }("https://s.pinimg.com/ct/core.js");
        pintrk('load', pinterestid, {
            em: 'futureCobra12@gmail.com'
        });
        pintrk('page');
        pintrk('track', 'lead',purchaseData);
    }
}


function loadsnap(snapid,purchaseData)
{
    if (snapid) {
        (function(e,t,n){if(e.snaptr)return;
            var a=e.snaptr=function()
            {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];
            var s='script';
            var r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');

        snaptr('init', snapid, {
            'user_email': 'futureCobra12@gmail.com'
        });
        snaptr('track', 'PURCHASE', {
            price: purchaseData.value,
            currency: purchaseData.currency,
            content_type: "product_group",
            content_ids: purchaseData.ids,
            order_id: purchaseData.order_id,
            contents: purchaseData.content,
            num_items: purchaseData.item_count,
        });



    }
}

function loadtw(twid,purchaseData)
{

    if (twid){
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');

        twq('init',twid);
        twq('track','Purchase', purchaseData);

    }

}

function loadtbl(tblid,purchaseData)
{

    window._tfa = window._tfa || [];_tfa.push({notify: 'event', name: 'make_purchase', id: tblid,
    currency:""+purchaseData.currency,
    orderid :purchaseData.order_id,
    revenue:purchaseData.value
});!function (t, f, a, x) { if (!document.getElementById(x)) { t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f); }}(document.createElement('script'),document.getElementsByTagName('script')[0], '//cdn.taboola.com/libtrc/unip/'+tblid+'/tfa.js','tb_tfa_script');
    var ns = document.createElement('noscript')
    ns.innerHTML="<img src='https://trc.taboola.com/"+tblid+"/log/3/unip?en=make_purchase' width='0' height='0' style='display:none' />"
    document.head.appendChild(ns)
}



function loadtkt(tktid,purchaseData)
{

    !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load(tktid);
        ttq.page();
    }(window, document, 'ttq');

    ttq.track('Purchase',purchaseData)

}

function SetPixels(collectinosData,productsCollections,pxlscol) {
    if (productsCollections.length>0) {
        for (var i = 0;i<collectinosData.length;i++){
            if (productsCollections.includes(collectinosData[i]))
            {   if(!pixels.includes(pxlscol))
                pixels.push(pxlscol);
            }
        }
        console.log(pixels)

    }
}

