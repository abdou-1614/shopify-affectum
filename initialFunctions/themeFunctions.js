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

async function createTheme() {
    try {
      const themeResponse = await getThemeActiveId(shop, accessTkn);
      const themes = JSON.parse(themeResponse);
      const activeThemeId = themes[0].id

      await AddScriptTheme(accessTkn, shop, activeThemeId);
  
      const liquidName = 'layout.liquid';
      const liquidContent = `
        <div>
          <h1>Welcome to My Pixel!</h1>
          <p>Thank you for visiting our website.</p>
        </div>
      `;
      await addLiquidToTheme(accessTkn, shop, activeThemeId, liquidContent, liquidName);
  
      console.log('Theme created successfully!');
    } catch (error) {
      console.error('Failed to create theme:', error);
    }
  }
  
  createTheme();


module.exports = {
    getThemeActiveId,
    AddScriptTheme,
    addLiquidToTheme,
}
