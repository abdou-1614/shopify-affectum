let themeFunction = require('./themeFunctions');
let db = require('../config/dbConnect');
const shopifyQuery = require("../ApiQueries/shopifyQueries");


function renderApp(res,shop,accessTkn,package)
{
    let sql ="select * from facebookpixels where store_id =?;select * from otherpixels where store_id = ?;select statu_app from customers where store = ?"
    db.con.query(sql,[shop,shop,shop], function(err,row) {
            let outherpixels= row[1][0] || {};
            let fbpixels =row[0];
            console.log(fbpixels);
            console.log(outherpixels);
            let pixels = [];
            let app_statu = row[2][0].statu_app;
            for (let i = 0; i<fbpixels.length;i++)
            {
                pixels.push({
                    type :fbpixels[i].type,
                    code : fbpixels[i].pixel,
                    collections :  JSON.parse(fbpixels[i].collections),
                    id : fbpixels[i].idpixel,
                    namecol:JSON.parse(fbpixels[i].collectionsname),
                    accss_token : fbpixels[i].accss_token,
                    test_code : fbpixels[i].test_code
                })
            }
            console.log(outherpixels);
            let  data  =JSON.stringify( {outherpixels :outherpixels, fbpixels:pixels});
            if(!app_statu)
                app_statu = false;
            if(data) {
                themeFunction.getThemeActiveId(shop, accessTkn)
                    .then((themeId) => {
                        themeId = JSON.parse(themeId);
                        themeId = themeId.themes.filter(({role}) => role === "main")[0].id;
                        themeFunction.AddScriptTheme(accessTkn, shop, themeId);
                        //    injectScriptTag(res,shop,accessTkn, data)
                        //  res.status(200)
                        // .render('index',{data:data,app_statu: app_statu})
                        renderPackages(res, package, {data: data, app_statu: app_statu})
                    });
            }else{
                 data = '';
                themeFunction.getThemeActiveId(shop, accessTkn)
                    .then((themeId) => {
                        themeId = JSON.parse(themeId);
                        themeId = themeId.themes.filter(({role}) => role === "main")[0].id;
                        renderPackages(res,package,{data:data,app_statu: false})

                        //     injectScriptTag(res,shop,accessTkn,data,package);
                    }).catch((err) => {
                    throw err;
                })
            }

    });

}

function updateData(res,shop,accessTkn,responData)
{

    let sql ="select * from otherpixels where store_id = ?;select statu_app from customers where store = ?"
    db.con.query(sql,[shop,shop,shop], function (err, row) {
        if (err)
            throw err;
        let otherpixels =row[0][0] || {pinterest: '',snapchat:'',tiktok:'', taboola:'', twitter:''  };




        let datainject = `
<script>
var page = ""
//var addtocart = false;
//var initiateCheckoutFlag = false;
var pData = false;
var pTags = [];
var pCollection = [];
var shopCurrency = Shopify.currency.active
{% if template == 'index' %}
    var page = "index"
    
var htmlData = document.querySelectorAll('[type="application/json"]')
var homeProducts = []
var pTags = []
for(let html of htmlData)
{
    let data = JSON.parse(html.innerHTML)
    if(data.hasOwnProperty('id'))
    {
        homeProducts.push(data)
        for(let tag of data.tags)
        {
            pTags.push(tag)    
        }
    }    
}
{% endif %}
</script>

{% if template == 'product' %}
<script>
var productId = {{ product.id }};
var productTitle = \`{{ product.title }}\`;
var value = "{{ product.price | money_without_currency }}";
var niche = [{"id":"{{ product.id }}","quantity":"1"}];
var productType = "{{ product.type }}";
var name = \`{{ product.title }}\`;
  var pData = {
    content_type:"product_group",
    content_ids:[{{ product.id }}],
    value: "{{ product.price | money_without_currency }}",
    content_name: \`{{ product.title }}\`,
    currency:shopCurrency,
    content_category: "{{ product.type }}"
  }
  var lineitem = []
  {% for item in cart.items %}
  lineitem.push({{ item.product.id }})
  {% endfor %}  

  var cData = {
    content_type:"product_group",
    num_items:"{{ cart.item_count }}",
    value:"{{ cart.original_total_price | money_without_currency }}",
    currency:shopCurrency,
    content_ids:lineitem
  }
  var page = "product"
  
  var pTags = []
  {% for tag in product.tags %}
  pTags.push("{{ tag }}")
  {% endfor %}
  
  var pCollection = []
  {% for collection in product.collections %}
    pCollection.push("{{ collection.title }}")
  {% endfor %}  
             
  console.log(pData)
</script>
{% endif %}

{% if template == 'cart' %}
<script>
    var page = "cart"
    var pTags = []
    var pCollection = []
    {% for item in cart.items %}
        {% for tag in item.product.tags %}
            pTags.push("{{ tag }}")
        {% endfor %}
    {% endfor %}
                       
    {% for item in cart.items %}
        {% for collection in item.product.collections %}
            pCollection.push("{{ collection.title }}")
        {% endfor %}
    {% endfor %}

 pTags = pTags.filter(onlyUnique);
  pCollection = pCollection.filter(onlyUnique);
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
</script>
{% endif %}

<script>
  var lineitem = []
  {% for item in cart.items %}
    lineitem.push({{ item.product.id }})
  {% endfor %}  
  
  var cData = {
    content_type:"product_group",
    num_items:"{{ cart.item_count }}",
    value:"{{ cart.original_total_price | money_without_currency }}",
    currency:shopCurrency,
    content_ids:lineitem
  }


</script>

<script>
let appStatu = ${row[1][0].statu_app};
let  pinterestid = '${otherpixels.pinterest}';
let snapchatid =  '${otherpixels.snapchat}';
let tktid = '${otherpixels.tiktok}';
let tblid ='${otherpixels.taboola}';
let twid='${otherpixels.twitter}';
</script>
<script  src="https://multi-pixels.com/js/script3.js"></script>`

        themeFunction.getThemeActiveId(shop, accessTkn)
            .then((themeId) => {
                themeId = JSON.parse(themeId);
                themeId = themeId.themes.filter(({role}) => role === "main")[0].id;
                themeFunction.AddScriptTheme(accessTkn, shop, themeId)
                themeFunction.addLiquidToTheme(accessTkn,shop,themeId,datainject,"king-pixels.liquid")
                res.status(200).send(responData);
            }).catch((err) => {
            throw err;
        })
    })
}

function injectScriptTag(res,shop,accessTkn,renderData,package){
    let api = "/admin/api/2022-10/script_tags.json";
    let params = {
        "script_tag": {
            "event": "onload",
            "display_scope" : "order_status",
            "src": "https://multi-pixels.com/script.js"
        }
    }
    shopifyQuery.RequestPostShopify(accessTkn, shop,api,params)
        .then((data) => {
            renderData = JSON.stringify(renderData);
            // res.status(200)
            // .render('index',{data:renderData,app_statu: "false"})
        })
        .catch(error => {
            console.log(error)
        })
}

function renderPackages(res,package,data)
{
    switch (package) {
        case "PLUS" :
            res.status(200).render("plus",data);
            break;
        case "PRO" :
            res.status(200).render("pro",data);
            break;
        case "BASIC" :
            res.status(200).render("basic",data);
            break;
    }
}


const checkRoute = (res) => {

    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    let shop = 'justspikestore.myshopify.com';
    db.con.query(sql,shop,function (err, row) {
        let accessTkn  = row[0].accesstoken;
    themeFunction.getThemeActiveId(shop, accessTkn)
        .then((themeId) => {
            themeId = JSON.parse(themeId);
            themeId = themeId.themes.filter(({role}) => role === "main")[0].id;
 shopifyQuery.RequestGetShopify(accessTkn,shop, '/admin/api/2022-10/themes/'+themeId+'/assets.json?asset[key]=layout/theme.pagefly.liquid')
                .then((themedata)=>{
                    themedata = JSON.parse(themedata);
                    let content = themedata.asset.value;
                    let check = /\{% include \'king\-pixels\' %\}/g.test(content)
                    console.log(check)
                    if(!check ||check===false){
                        let link="{% include 'king-pixels' %}"
                        content=content.replace(/<.body>/g, link+"</body>")
                        const jsonParm={  "asset": {
                                "key": "layout/theme.liquid",
                                "value":content
                            }};
                        shopifyQuery.RequestPutShopify(accessTkn,shop, '/admin/api/2022-10/themes/'+themeId+'/assets.json',
                            jsonParm );
                    }else {
                        return 0;
                    }
                }).catch((err)=>{
                throw err;
            })
            res.status(200).send('works');
        }).catch((err) => {
        throw err;
    })
    })


    console.log("Route checked at " + new Date());
};





module.exports = {
    checkRoute,
    renderApp,
    updateData,
    renderPackages,

}
