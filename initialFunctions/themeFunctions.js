const request = require('request-promise');
const db = require('../config/dbConnect');
let shopifyQuery = require('../ApiQueries/shopifyQueries');


function  getThemeActiveId(shop,accessTkn) {
    let api = '/admin/api/2022-10/themes.json'
    return shopifyQuery.RequestGetShopify(accessTkn,shop,api)
}
function AddScriptTheme(accessTkn,shop,themeId){
    shopifyQuery.RequestGetShopify(accessTkn,shop, '/admin/api/2022-10/themes/'+themeId+'/assets.json?asset[key]=layout/theme.liquid')
        .then((themedata)=>{
            themedata = JSON.parse(themedata);
            let content = themedata.asset.value;
            let check = /\{% include \'king\-pixels\' %\}/g.test(content)
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


}
function addLiquidToTheme(accessTkn,shop,themeId,data,liquidName){
    const jsonParm={  "asset": {
            "key": "snippets/"+liquidName,
            "value":data
        }};
    return  shopifyQuery.RequestPutShopify(accessTkn,shop, '/admin/api/2022-10/themes/'+themeId+'/assets.json',
        jsonParm );
}


module.exports = {
    getThemeActiveId,
    AddScriptTheme,
    addLiquidToTheme,
}
