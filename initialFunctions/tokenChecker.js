let cookie = require('cookie');
let crypto = require('crypto');
let querystring = require('querystring');
let request = require('request-promise');
let db = require('../config/dbConnect');
let shopifyQuery = require('../ApiQueries/shopifyQueries');
let md5 = require('md5');

function CheckCustomer(shop,res,apiKey,apiSecret,req) {
    let sql = 'SELECT token_encrypted,accesstoken FROM customers WHERE store = ?';
    let params = shop;
    db.con.query(sql,params,function (err, row) {
        if (row && JSON.stringify(row) !== '[]') {
            let accesstknmd5 = row[0].token_encrypted;
            let accessToken  = row[0].accesstoken;
console.log("checkcustomers");
console.log(accessToken);
            let api = "/admin/api/2022-10/shop.json";
            shopifyQuery.RequestGetShopify(accessToken, shop, api)
                .then((data) => {
                    res.cookie('tknid',accesstknmd5).redirect("/")
                })
                .catch(error => {
                    callbackShopify(apiKey, apiSecret, res, req).then((accessTokenResponse) => {
console.log(accessTokenResponse.access_token);
                      let accessToken = accessTokenResponse.access_token;
                      let confing= [{ accesstoken: accessToken }, shop]
                      let sql = 'UPDATE customers set ? WHERE store = ?';
                      db.con.query(sql,confing,function (err, row) {
                          if (row)
                              res.cookie('tknid',accesstknmd5).redirect("/")
                      })

                  }).catch((error) => {
                      res.status(error.statusCode).send(error);
                  });

                })
        }
            else {
                callbackShopify(apiKey,apiSecret,res,req).then((accessTokenResponse) => {
                let accessToken = accessTokenResponse.access_token;
                const data = shopifyQuery.RequestGetShopify(accessToken,shop,'/admin/api/2022-10/shop.json')
                    .then((result) =>{
                        if(!shop.includes('boat') && !shop.includes('bags') && !shop.includes('soundsort'))
                        {
                        let dtshop= JSON.parse(result)
                     let accesstknmd5 = md5(accessToken)
                        // console.log(accessToken)
                        let customer  = {
                            name:  dtshop.shop.shop_owner,
                            email:  dtshop.shop.customer_email,
                            store:  shop,
                            country: dtshop.shop.country_name,
                            accesstoken: accessToken,
                            token_encrypted : accesstknmd5
                        };
                        let sql = 'INSERT INTO customers SET ?';
                        db.con.query(sql,customer,function (err, row) {
                            if (row)
                                res.cookie('tknid',accesstknmd5).redirect("/")
                        })
                        }
                        else
                        {
                        res.redirect("https://apps.shopify.com")
                        }
                    }).catch(error=>{
                        console.log(error);
                    })

   })
       .catch((error) => {
           res.status(error.statusCode).send(error);
       });
            }
        })
}
function callbackShopify(apiKey,apiSecret,res,req){
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;

    if (state !== stateCookie) {
        return res.status(403).send('Request origin cannot be verified');
    }

    if (shop && hmac && code) {
        // DONE: Validate request is from Shopify
        const map = Object.assign({}, req.query);
        delete map['signature'];
        delete map['hmac'];
        const message = querystring.stringify(map);
        const providedHmac = Buffer.from(hmac, 'utf-8');
        const generatedHash = Buffer.from(
            crypto
                .createHmac('sha256', apiSecret)
                .update(message)
                .digest('hex'),
            'utf-8'
        );
        let hashEquals = false;

        try {
            hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
        } catch (e) {
            hashEquals = false;
        };

        if (!hashEquals) {
            return res.status(400).send('HMAC validation failed');
        }

        // DONE: Exchange temporary code for a permanent access token
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        };

        return request.post(accessTokenRequestUrl, { json: accessTokenPayload })


    } else {
        res.status(400).send('Required parameters missing');
    }

}



module.exports = {
    CheckCustomer
};
