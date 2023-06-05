const request = require('request-promise');


 function RequestGetShopify(accessToken,shop,apiUrl){
    const requestUrl = 'https://' + shop + apiUrl;
    const shopRequestHeaders = {
        'X-Shopify-Access-Token': accessToken,
    };
    return request.get(requestUrl, { headers: shopRequestHeaders })
}


 function RequestPutShopify(accessToken,shop,apiUrl,jsonParm){
    const requestUrl = 'https://' + shop + apiUrl;
    return  request({
        url: requestUrl,
        method: "PUT",
        json: jsonParm
        ,
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    })

}


 function RequestPostShopify(accessToken,shop,apiUrl,jsonParm){
    const requestUrl = 'https://' + shop + apiUrl;
    return  request({
        url: requestUrl,
        method: "POST",
        json: jsonParm
        ,
        headers: {
            'X-Shopify-Access-Token': accessToken
        }
    })

}



module.exports = {
    RequestGetShopify,
    RequestPutShopify,
    RequestPostShopify
};