
if(appStatu){
    var productData={}
    var showPixel = showImgPixel = '';
    var pageURL = window.location.href;
    var cart_url = '//'+window.location.hostname+'/cart.json';
    var currency = Shopify.currency.active
    var newprodid = ""
    var fbTrackCode = ""

// cart page
    if(pageURL.indexOf(window.location.hostname+'/cart') > -1) {

        var prodcollections = document.querySelector('product-collection');
        if (prodcollections != null) {

            prodcollections = prodcollections.innerHTML.trim().slice(0, -1).split(',');
        }
        for (var i = 0; i < pxlscol.length; i++) {
            let col =  collectionspixels[pxlscol[i]]

            SetPixels(col,prodcollections,pxlscol[i])

        }

        loadotherpixels(pinterestid,snapchatid,twid,tblid,tktid)

        if(pixels.length) {
            $.each(pixels,function(i,val) {
                var fbPixel = val
                showPixel += "fbq('init', '"+fbPixel+"');";
                showImgPixel += "<img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id="+fbPixel+"&ev=PageView&noscript=1'/>";
            });
            if(showPixel != '') {
                fbTrackCode = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');";
                $('head').append("<script>"+fbTrackCode+""+showPixel+"fbq('track', 'PageView');</script><noscript>"+showImgPixel+"</noscript>");




                // Start On Checkout button click
                $('body').on('click', '[name="checkout"]', function(e) {
                    ajaxCheckout(cart_url,fbTrackCode,currency);
                });

                if($('[name="checkout"]').length == 0) {
                    $('body').on('click', 'form[action="/checkout"] [type="submit"], [href="/checkout"]', function() {
                        ajaxCheckout(cart_url,fbTrackCode,currency);
                    });
                }
                // End On Checkout button click
            }
        }
    }


// product pages
    else if(pageURL.indexOf('/products/') > -1) {
        var prodcollections = document.querySelector('product-collection');
        if (prodcollections != null) {
            prodcollections = prodcollections.innerHTML.trim().slice(0, -1).split(',');

        }
        newprodid = meta.product.id;
        setproductdetailsstorage();
        for (var i = 0; i < pxlscol.length; i++) {
            let col =  collectionspixels[pxlscol[i]]

            SetPixels(col,prodcollections,pxlscol[i])
        }
        loadotherpixels(pinterestid,snapchatid,twid,tblid,tktid)

        var showAddtoCartPixel = '';
        if (pageURL.indexOf('?') > -1) {
            var product_url = pageURL.split('?');
            product_url = product_url[0] + '.json';
        }
        else {
            var product_url = pageURL + '.json';
        }
        if(pixels.length) {
            $.each(pixels,function(i,val) {
                //var handle = $(this).text();
                var fbPixel = val;
                showPixel += "fbq('init', '"+fbPixel+"');";
                showImgPixel += "<img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id="+fbPixel+"&ev=PageView&noscript=1'/>";
            });
        }
        $.ajax({
            url: product_url,
            dataType: 'jsonp',
            header: {
                'Access-Control-Allow-Origin': '*'
            },
            success: function(responseData) {
                var product = responseData.product;
                if(product.title.indexOf("'") > -1) {
                    product.title = product.title.replace(/'/g, '');
                }
                if  (showPixel !=''){
                    showPixel += "fbq('track', 'ViewContent', {content_ids: ["+product.id+"],content_type:'product_group',value: "+product.variants[0].price+", content_name: '"+product.title+"', currency: '"+currency+"', content_category: ''});";
                    fbTrackCode = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');";

                }
                var qty = 1;
                if($('form[action="/cart/add"] [name="quantity"]').length) {
                    $('form[action="/cart/add"] [name="quantity"]').on('change', function(){
                        qty = $(this).val();
                    });
                }
                // On Add to cart click
                if($('form[action="/cart/add"] [type="submit"]').length !== 0 || $('form[action="/cart/add"] [type="button"]').length !== 0) {
                    $('form[action="/cart/add"] [type="submit"], form[action="/cart/add"] [type="button"]').click(function(e){
                        var _thisForm = $('form[action="/cart/add"]');

                        var variantid = $('[name="id"]', _thisForm).val();
                        $.each(product.variants, function(index) {
                            if(product.variants[index].id == variantid){
                                var price = product.variants[index].price;
                                price = price * qty;
                                //showAddtoCartPixel += "fbq('track', 'AddToCart', {value: "+price+",currency: '"+currency+"'});";
                                if(showPixel !='')
                                    showAddtoCartPixel += "fbq('track', 'AddToCart', {content_ids: ["+product.id+"],content_type:'product_group',value: "+price+", content_name: '"+product.title+"', currency: '"+currency+"', content_category: ''});";
                                productData = {content_ids: '['+product.id+']',content_type:'product_group',value: price, content_name: product.title, currency: currency, content_category: ''};
                            }
                        });


//otherPixels
                        AddTocart(pinterestid,productData,snapchatid,twid,tblid,tktid)
                        if(showAddtoCartPixel != '' ) {
                            $('head').append("<script>"+fbTrackCode+""+showAddtoCartPixel+"</script>");
                        }
                    });
                } else {
                    $('form[action="/cart/add"]').submit(function(e) {
                        var _thisForm = $(this);
                        var variantid = $('[name="id"]', _thisForm).val();
                        $.each(product.variants, function(index) {
                            if(product.variants[index].id == variantid){
                                var price = product.variants[index].price;
                                price = price * qty;
                                showAddtoCartPixel += "fbq('track', 'AddToCart', {content_ids: ["+product.id+"],content_type:'product_group',value: "+price+", content_name: '"+product.title+"', currency: '"+currency+"', content_category: ''});";
                                productData = {content_ids: '['+product.id+']',content_type:'product_group',value: price, content_name: product.title, currency: currency, content_category: ''};
                            }
                        });

//otherPixels

                        AddTocart(pinterestid,productData,snapchatid,twid,tblid,tktid)
                        if(showAddtoCartPixel != '' ) {
                            $('head').append("<script>"+fbTrackCode+""+showAddtoCartPixel+"</script>");
                        }

                    });
                }
                if(showPixel !='')
                    $('head').append("<script>"+fbTrackCode+""+showPixel+"fbq('track', 'PageView');</script><noscript>"+showImgPixel+"</noscript>");

                // Start On Checkout button click
                $('body').on('click', '[name="checkout"]', function() {
                    ajaxCheckout(cart_url,fbTrackCode,currency);
                });
                if($('[name="checkout"]').length == 0) {
                    $('body').on('click', 'form[action="/checkout"] [type="submit"], [href="/checkout"], .fastcheckout_buy_button', function(){
                        ajaxCheckout(cart_url,fbTrackCode,currency);
                    });
                }
                // End On Checkout button click

            }

        });
    }





// start collection page
    else if(pageURL.indexOf('/collections') > -1) {
        var fbTrackCode =""
        var prodcollections = document.querySelector('page-collection-id');
        if (prodcollections != null) {
            pixels =[]
            prodcollections = prodcollections.innerHTML.trim().slice(0, -1).split(',');
        }
        for (var i = 0; i < pxlscol.length; i++) {
            let col =  collectionspixels[pxlscol[i]]

            SetPixels(col,prodcollections,pxlscol[i])
        }
        loadotherpixels(pinterestid,snapchatid,twid,tblid,tktid)
        if(pixels.length) {
            fbTrackCode = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');";
            $.each(pixels,function(i,val) {
                var fbPixel = val;
                showPixel += "fbq('init', '"+fbPixel+"');";
                showImgPixel += "<img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id="+fbPixel+"&ev=PageView&noscript=1'/>";
            });
        }
        if(showPixel !== '') {
            // Pixel here
            $('head').append("<script>"+fbTrackCode+""+showPixel+"fbq('track', 'PageView');</script><noscript>"+showImgPixel+"</noscript>");

        }
        loadotherpixels(pinterestid,snapchatid,twid,tblid,tktid)

        // Start On Checkout button click
        $('body').on('click', '[name="checkout"]', function() {
            ajaxCheckout(cart_url,fbTrackCode,currency);
        });
        if($('[name="checkout"]').length == 0) {
            $('body').on('click', 'form[action="/checkout"] [type="submit"], [href="/checkout"], .fastcheckout_buy_button', function(){
                ajaxCheckout(cart_url,fbTrackCode,currency);
            });
        }

        // End On Checkout button click
    }
// start other pages
    else {

        //  SetPixels(collectinosData,prodcollections)
        loadotherpixels(pinterestid,snapchatid,twid,tblid,tktid)
        var fbTrackCode =""
        if(pixels.length) {
            $.each(pixels, function (i, val) {
                var fbPixel = val;
                showPixel += "fbq('init', '" + fbPixel + "');";
                showImgPixel += "<img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id=" + fbPixel + "&ev=PageView&noscript=1'/>";
            });
            if(showPixel != '') {
                fbTrackCode = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');";
                $('head').append("<script>"+fbTrackCode+""+showPixel+"fbq('track', 'PageView');</script><noscript>"+showImgPixel+"</noscript>")
            }
        }

        $('body').on('click', 'form[action="/cart/add"] [type="submit"], form[action="/cart/add"] [type="button"]', function(e){
            var _main = $(this).parents('form[action="/cart/add"]');
            var proID = _main.attr('id').replace(/[^0-9\.]/g,'');
            var priceArr = _main.find('[name="id"] option:selected').text().split('-');
            var price = priceArr[priceArr.length - 1].replace(/[^0-9\.]/g,'');
            var proName = _main.parents('.product-single__meta--wrapper').find('[itemprop="name"]').text();
            if(price == '') {
                var proID = _main.find('[name="id"]').attr('data-section');
                var price = $('div[data-section-id="'+proID+'"] #ProductPrice-'+proID).attr('content');
                var proName = $.trim($('div[data-section-id="'+proID+'"]').find('[itemprop="name"]').text());
            }

            var productData = {content_ids: "[" + proID + "]",content_type:'product_group',value: price , content_name: '' + proName , currency:currency , content_category: ''}
            AddTocart(pinterestid,productData,snapchatid,twid,tblid,tktid)

            if(pixels.length) {
                var showAddtoCartPixel = "fbq('track', 'AddToCart', {content_ids: [" + proID + "],content_type:'product_group',value: " + price + ", content_name: '" + proName + "', currency: '" + currency + "', content_category: ''});";

                if(showAddtoCartPixel != '' ) {
                    $('head').append("<script>"+fbTrackCode+""+showAddtoCartPixel+"</script>");
                }
            }
        });

        // Start On Checkout button click
        $('body').on('click', '[name="checkout"]', function() {
            ajaxCheckout(cart_url,fbTrackCode,currency);
        });
        if($('[name="checkout"]').length == 0) {
            $('body').on('click', 'form[action="/checkout"] [type="submit"], [href="/checkout"], .fastcheckout_buy_button', function(){
                ajaxCheckout(cart_url,fbTrackCode,currency);
            });
        }
        // End On Checkout button click


    }

    function ajaxCheckout(cart_url,fbTrackCode,currency) {
        $.ajax({
            url: cart_url,
            dataType: 'jsonp',
            header: {
                'Access-Control-Allow-Origin': '*'
            },
            success: function(response) {
                contentIDs = [];
                $.each(response.items, function(index,value){
                    contentIDs.push(value.product_id);
                });
                var total_price = response.total_price;
                total_price = Math.floor(total_price / 100);
                var prdata = { content_type: 'product_group', content_ids: "["+contentIDs+"]", num_items: response.item_count, currency: ""+currency,value: total_price}

                var checkoutPixel = "fbq('track', 'InitiateCheckout',{ content_type: 'product_group', content_ids: ["+contentIDs+"], num_items: "+response.item_count+", currency: '"+currency+"',value: "+total_price+"});";


                $('head').append("<script>"+fbTrackCode+""+checkoutPixel);
                InitiateCheckout(prdata,pinterestid,twid,tblid,tktid)
            }
        });
    }

    function setproductdetailsstorage() {
        var array = localStorage.getItem('calltwo');

        if (array != null) {
            array = JSON.parse(array);
            var length = array.length;

            for (var i = 0; i < length; i++) {
                if (array[i].newprodid == newprodid) {
                    return;
                }
            }

            array.push({
                newprodid: newprodid,
                collections: prodcollections
            });


            localStorage.setItem('calltwo', JSON.stringify(array));
        } else {
            var array2 = [{
                newprodid: newprodid,
                collections: prodcollections

            }];
            localStorage.setItem('calltwo', JSON.stringify(array2));
        }
    }


    function SetPixels(collectinosData,productsCollections,pxlscol) {
        if (productsCollections.length>0) {
            for (var i = 0;i<collectinosData.length;i++){
                if (productsCollections.includes(collectinosData[i]))
                {   if(!pixels.includes(pxlscol))
                    pixels.push(pxlscol);
                }
            }

        }
    }


    function loadotherpixels(pinid,snapid,twid,tblid,tktid)
    {

        if (pinid)
        {
            loadpint(pinid)
            pintrk('track', 'pagevisit');
        }
        if(snapid)
        {
            loadsnap(snapid)
            snaptr('track', 'PAGE_VIEW');
        }

        if (twid)
        {
            loadtw(twid)
            twq('track','PageView');
        }

        if (tblid){
            loadtb(tblid)
        }
        if (tktid) {
            loadtkt(tktid)
        }
    }


    function loadpint(pinid){
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
            em: 'redboub12@gmail.com'
        });
        pintrk('page');
    }

    function loadsnap(snapid)
    {
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');

        snaptr('init', snapid, {
            'user_email': 'redboub12@gmail.com'
        });

    }

    function loadtw(twid)
    {
        !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
        },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
        twq('init',twid);
    }

    function loadtb(tblid)
    {
        var tblscripi = "<script>window._tfa = window._tfa || [];window._tfa.push({notify: 'event', name: 'page_view', id: "+tblid+"});!function (t, f, a, x) { if (!document.getElementById(x)) { t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f); }}(document.createElement('script'),document.getElementsByTagName('script')[0], '//cdn.taboola.com/libtrc/unip/"+tblid+"/tfa.js','tb_tfa_script');</script>"
        $('head').append(tblscripi+"<noscript><img src='https://trc.taboola.com/"+tblid+"/log/3/unip?en=page_view'width='0' height='0' style='display:none' /></noscript>");

    }

    function loadtkt(tktid)
    {

        !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};


            ttq.load(tktid);
            ttq.page();
        }(window, document, 'ttq');


    }

    function AddTocart(pinterestid,productData,snapid,twid,tblid,tktid){
        if (pinterestid) {
            pintrk('track', 'addtocart',  productData);
        }
        if (snapid) {

            snaptr('track', 'ADD_CART',productData);

        }
        if (twid)
        {

            twq('track','AddToCart',productData)
        }
        if (tblid) {
            var tblscripi = "<script>  _tfa.push({notify: 'event', name: 'add_to_cart', id: "+tblid+"});</script>"
            $('head').append(tblscripi+"<noscript><img src='https://trc.taboola.com/"+tblid+"/log/3/unip?en=add_to_cart'width='0' height='0' style='display:none' /></noscript>");

        }

        if (tktid) {
            ttq.track('AddToCart',productData)
        }

    }

    function InitiateCheckout(productData,pinterestid,twid,tblid,tktid){
        if (pinterestid) {
            pintrk('track', 'checkout',  productData);

        }
        if (twid)
        {

            twq('track','InitiateCheckout',productData)
        }
        if (tblid) {
            var tblscripi = "<script>  _tfa.push({notify: 'event', name: 'start_checkout', id: "+tblid+"});</script>"
            $('head').append(tblscripi+"<noscript><img src='https://trc.taboola.com/"+tblid+"/log/3/unip?en=start_checkout'width='0' height='0' style='display:none' /></noscript>");

        }

        if (tktid) {
            ttq.track('StartCheckout',productData)
        }

    }
}else
    console.log('app Desactive')
