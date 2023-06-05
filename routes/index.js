let express = require('express');
let router = express.Router();
const app = express();
let iso3311a2 = require('iso-3166-1-alpha-2')
const dotenv = require('dotenv').config();
const crypto = require('crypto');
const cookie = require('cookie');
let path = require('path');
let appFunctions = require('../initialFunctions/appFunctions');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
let callbackShopify = require('../initialFunctions/tokenChecker');
let charge = require('../initialFunctions/makeCharge');
let themeFunction = require('../initialFunctions/themeFunctions');
let db = require('../config/dbConnect');
const scopes = ['read_script_tags','write_script_tags ','read_themes','read_products','write_themes'];
const forwardingAddress = "https://cfd5-196-74-195-247.ngrok-free.app";
const fs = require('fs');
let bodyParser = require('body-parser');
let cors = require('cors');
let shopifyQuery = require('../ApiQueries/shopifyQueries');
const bizSdk = require("facebook-nodejs-business-sdk");
let url = require("url")
let http = require("http")
const cron = require('cron');
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page. */
router.get('/', function(req, res, next) {
    let sql = 'SELECT chargeId FROM customers WHERE store = ?';
    let shop = req.cookies.shop;
    db.con.query(sql,shop, function (err, row) {
        if (row && JSON.stringify(row) !== '[]' && row[0].chargeId !== null){
            charge.CheckChargestatu(shop,row[0].chargeId,req,res)

        }else{
            res.render('makecharge_two')
        }
    })
});




router.get('/updateplanning', function(req, res, next) {
    res.render("makecharge_two")
});
router.get('/shopify', function(req, res, next) {
    const shop = req.query.shop;
    console.log(shop);
    if (shop) {
        const state = nonce();
        const redirectUri = forwardingAddress + '/shopify/callback';
        const installUrl = 'https://' + shop +
            '/admin/oauth/authorize?client_id=' + apiKey +
            '&scope=' + scopes +
            '&state=' + state +
            '&redirect_uri=' + redirectUri;
        res.cookie('state', state);
        res.cookie('shop', shop);
        res.redirect(installUrl);
    } else {
        return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }

});
router.get('/shopify/callback',   (req, res) => {
    let shop = req.cookies.shop;
    console.log(shop);
    callbackShopify.CheckCustomer(shop,res,apiKey,apiSecret,req)
});
router.get('/collection',(req,res)=>{
    let shop = req.query.store
    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    db.con.query(sql,shop,function (err, row) {
        if(err)
            throw err;
        let accessToken  = row[0].accesstoken;
        let api = "/admin/api/2022-10/custom_collections.json?limit=250";
        shopifyQuery.RequestGetShopify(accessToken, shop, api)
            .then((data) => {
                let collectinosId = JSON.parse(data)
                api = "/admin/api/2022-10/smart_collections.json?limit=250"
                shopifyQuery.RequestGetShopify(accessToken, shop, api).then((dataS)=>{
                    let collectinosIdS = JSON.parse(dataS)
                    console.log(collectinosIdS)
                    res.status(200)
                        .send({collectinosIdS
                            ,collectinosId});
                    //   res.status(200)
                    //  .send(collectinosIdS);
                }).catch(err=>{
                    throw err ;
                })
            })
            .catch(error => {
            })
    })

})

router.post('/addpixel', (req, res) => {
    let data = req.body;
    var response;
    let shop = req.cookies.shop;
    let collections = req.body.collections;
    collections = JSON.parse(collections);
    if(req.body.code.length>0) {
        response = {
            status: 200,
            success: 'Updated Successfully',
            pixel: {
                type: req.body.type,
                code: req.body.code,
                shop: shop,
                collections: collections,
                id: req.body.id,
                namecol: JSON.parse(req.body.colname),
                accss_token : req.body.accss_token,
                test_code : req.body.test_code

            }
        };

        let params = {
            store_id: shop,
            collections: JSON.stringify(collections),
            pixel: req.body.code,
            type: req.body.type,
            idpixel: req.body.id,
            collectionsname: req.body.colname,
            accss_token : req.body.accss_token,
            test_code : req.body.test_code

        }
        let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
        try {
            db.con.query(sql, shop, function (err, row) {
                if (err)
                    throw err;
                let accessToken = row[0].accesstoken;
                sql = 'INSERT INTO facebookpixels SET ?';
                db.con.query(sql, params, (err, row) => {
                    if (err)
                        throw err;
                    appFunctions.updateData(res, shop, accessToken, JSON.stringify(response))
                })
            })
        }
        catch (e) {
            console.error(e)
            res.send(360)
        }

    }else{
        response = {
            status: false,
            error: 'Please add Valid Id'
        };
        res.send(JSON.stringify(response));
    }

});
router.post('/update_pixel', (req, res) => {
    let shop =req.cookies.shop
    let collections = req.body.collections;
    collections = JSON.parse(collections);
    var response = {
        status  : 200,
        success : 'Updated Successfully',
        pixel :{
            type: req.body.type,
            id: req.body.id,
            code: req.body.code,
            shop: shop,
            collections : collections,
            namecol : JSON.parse(req.body.colname),
            accss_token : req.body.accss_token,
            test_code : req.body.test_code

        }
    }

    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    try {
        db.con.query(sql,shop,function (err, row) {
            if (err)
                throw err;
            let accessToken  = row[0].accesstoken;
            sql = 'update facebookpixels SET ? WHERE store_id = ? AND idpixel = ?'
            let params =[{
                collections: JSON.stringify(collections),
                pixel      : req.body.code,
                type       : req.body.type,
                collectionsname : req.body.colname,
                accss_token : req.body.accss_token,
                test_code : req.body.test_code,

            },shop,req.body.id]
            db.con.query(sql,params,(err,row)=>{
                if(err)
                    throw err;
                appFunctions.updateData(res,shop,accessToken,JSON.stringify(response))


            });

        });
    } catch (e) {
        console.error(e)
        res.send(360)
    }

});
router.post('/otheradd', (req, res) => {
    let data = req.body
    let shop = req.cookies.shop;
    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    try
    {
        db.con.query(sql,shop,function (err, row) {
            if (err)
                throw err;
            let accessToken  = row[0].accesstoken;
            sql='SELECT * FROM otherpixels WHERE store_id = ?';
            db.con.query(sql,shop, (err, row) => {
                if(row.length===0)
                {
                    sql = 'INSERT INTO otherpixels SET ?';
                    let params ={
                        store_id : shop,
                        pinterest:data.pinterestid,
                        snapchat:data.snapchatid,
                        tiktok :data.tiktok,
                        taboola : data.taboola,
                        twitter :data.twitter
                    }
                    db.con.query(sql,params,(err,row)=>{
                        if(err)
                            throw err;
                        appFunctions.updateData(res,shop,accessToken,'ADD Successfully')
                    })
                } else {
                    sql = 'UPDATE otherpixels SET ? WHERE  store_id = ?';
                    let params =[ {
                        store_id : shop,
                        pinterest:data.pinterestid,
                        snapchat:data.snapchatid,
                        tiktok :data.tiktok,
                        taboola : data.taboola,
                        twitter :data.twitter
                    },shop]
                    db.con.query(sql,params,(err,row)=>{
                        if(err)
                            throw err;
                        appFunctions.updateData(res,shop,accessToken,'ADD Successfully')
                    })
                }
            })
        })
    }
    catch (e) {
        console.error(e)
        res.send(360)
    }
});
router.get('/script.js', (req, res) => {
    let shop = req.query.shop;
    if (shop) {
        let sql = "select * from facebookpixels where store_id =?;select * from otherpixels where store_id = ?;select statu_app from customers where store = ?"
        db.con.query(sql, [shop, shop, shop], function (err, row) {
            if (err)
                throw err;
            let fbpixels = row[0], otherpixels = row[1][0] || {};
            let masterpixels = [], collectionspixels = {};
            let pxlcol = [];
            for (let i = 0; i < fbpixels.length; i++) {
                if (fbpixels[i].type === 'master')
                    masterpixels.push(fbpixels[i].pixel);
                else {
                    collectionspixels[fbpixels[i].pixel] = JSON.parse(fbpixels[i].collections)
                    pxlcol[i] = fbpixels[i].pixel
                }
            }
            masterpixels = JSON.stringify(masterpixels);
            pxlcol = JSON.stringify(pxlcol);
            collectionspixels = JSON.stringify(collectionspixels);
            let pinterest = otherpixels.pinterest || '';
            let snapchat = otherpixels.snapchat  || '';
            let tiktok = otherpixels.tiktok || '';
            let taboola = otherpixels.taboola || '';
            let twitter = otherpixels.twitter || '';
//            let app_statu = row[2][0].statu_app || true;
            let app_statu = true;
            if(row[2][0] != null)
                app_statu = row[2][0].statu_app;

            let datainject = ` console.log('hereeeeee')
`;

            res.send(datainject)

        })
    }
    else if (shop === undefined)
        res.send('empty')
});
router.post('/change-Status', (req, res) => {
    let shop = req.cookies.shop
    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    try {
        db.con.query(sql,shop,function (err, row) {
            if (err)
                throw err;
            let accessToken  = row[0].accesstoken;
            sql = 'update customers SET ? WHERE store = ?'
            let params =[{
                statu_app: req.body.statu

            },shop]

            db.con.query(sql,params,(err,row)=>{
                if(err)
                    throw err;
                appFunctions.updateData(res,shop,accessToken,{status : true})
            })   })
    }
    catch (e) {
        console.error(e)
        res.send(360)
    }

});
router.post('/delete', (req, res) => {
    let shop = req.cookies.shop
    let pixelid = req.body.id
    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    try {
        db.con.query(sql, shop, function (err, row) {
            if (err)
                throw err;
            let accessToken = row[0].accesstoken;
            sql = 'DELETE FROM facebookpixels  WHERE store_id = ? AND idpixel = ?';
            db.con.query(sql, [shop, pixelid], (err, row) => {
                if (err)
                    throw err;
                appFunctions.updateData(res, shop, accessToken, 'ADD Successfully')
            })
        })
    }
    catch (e) {
        console.error(e)
        res.send(360)
    }
});
router.get('/updatepackage',(req,res)=> {
    let sql = 'SELECT chargeId,accesstoken FROM customers WHERE store = ?';
    let shop = req.cookies.shop;
    let plan = req.query.plan;
    try {
        const arrayOfStrings = ['prestigeofficial-com.myshopify.com', 'diamond-smile-fr.myshopify.com', 'diamond-smile-fr.myshopify.com',];
        const isStringInArray = arrayOfStrings.includes(shop);
        db.con.query(sql, shop, function (err, row) {
            let accessToken = row[0].accesstoken;
            let recurringCharge = {
                "recurring_application_charge": {
                    "return_url": "https://cfd5-196-74-195-247.ngrok-free.app",
                    "trial_days": 7,
                    "test" :true
                }
            };
            if (isStringInArray) {
                switch (plan) {
                    case "PRO":
                        recurringCharge.recurring_application_charge.name = "PRO";
                        recurringCharge.recurring_application_charge.price = 7.99;
                        //                  recurringCharge.recurring_application_charge.test = true;
                        recurringCharge.recurring_application_charge.trial_days = 7;
                        break;
                    case "PLUS":
                        recurringCharge.recurring_application_charge.name = "PLUS";
                        recurringCharge.recurring_application_charge.price = 3.6;
                        //                    recurringCharge.recurring_application_charge.test = true;
                        recurringCharge.recurring_application_charge.trial_days = 3;
                        break;
                    case "BASIC":
                        recurringCharge.recurring_application_charge.name = "BASIC";
                        recurringCharge.recurring_application_charge.price = 5.99;
                        break;
                }
            } else {
                switch (plan) {
                    case "PRO":
                        recurringCharge.recurring_application_charge.name = "PRO";
                        recurringCharge.recurring_application_charge.price = 7.99;
                        //                      recurringCharge.recurring_application_charge.test = true;
                        recurringCharge.recurring_application_charge.trial_days = 7;
                        break;
                    case "PLUS":
                        recurringCharge.recurring_application_charge.name = "PLUS";
                        recurringCharge.recurring_application_charge.price = 5.99;
//                        recurringCharge.recurring_application_charge.test = true;
                        recurringCharge.recurring_application_charge.trial_days = 7;
                        break;
                    case "BASIC":
                        recurringCharge.recurring_application_charge.name = "BASIC";
                        recurringCharge.recurring_application_charge.price = 5.99;
                        break;
                }
            }
            charge.make_charge_packages(accessToken, shop, recurringCharge, res);
        });
    } catch (e) {
        console.error(e);
        res.send(360);
    }

});
router.post('/customers/data_request', (req, res) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    // Use raw-body to get the body (buffer)
    // Create a hash using the body and our key
    const hash = crypto
        .createHmac('sha256', apiSecret)
        .update(JSON.stringify(req.body), 'utf8', 'hex')
        .digest('base64');
    // Compare our hash to Shopify's hash
    // It's a match! All good
    console.log('Phew, it came from Shopify!');
    res.sendStatus(200)

});
router.post('/customers/redact', (req, res) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256');

    // Use raw-body to get the body (buffer)
    // Create a hash using the body and our key
    const hash = crypto
        .createHmac('sha256', apiSecret)
        .update(JSON.stringify(req.body), 'utf8', 'hex')
        .digest('base64');
    // It's a match! All good
    console.log('Phew, it came from Shopify!');
    res.sendStatus(200)

});
router.post('/shop/redact', (req, res) => {
    // We'll compare the hmac to our own hash
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    // Use raw-body to get the body (buffer)
    // Create a hash using the body and our key
    const hash = crypto
        .createHmac('sha256', apiSecret)
        .update(JSON.stringify(req.body), 'utf8', 'hex')
        .digest('base64');
    // Compare our hash to Shopify's hash
    // It's a match! All good
    console.log('Phew, it came from Shopify!');
    res.sendStatus(200)


});


router.get('/basic_12', (req, res) => {

    res.render('pro',{data: {},app_statu: false})
});




router.get('/scriptall', (req, res) => {
    let sql = "select * from facebookpixels where store_id =?"
    let queryObject = url.parse(req.url, true).query;
    let shop = queryObject['shop'];
    try{
        db.con.query(sql, [shop], function (err, row) {
            if (err) {
                res.sendStatus('404')
            }
            else if (row) {
                let pixels = queryObject['pixelIds'].split(',')
                if (pixels.length > 0 && queryObject['pixelIds'] !=='') {
                    for (let i = 0; i < pixels.length; i++) {
                        sql = "select * from facebookpixels where pixel =?"
                        db.con.query(sql, [pixels[i]], function (err, pixels_row) {
                            if(err)
                            {
                                console.error(err)
                            }else
                            if(pixels_row[0].accss_token !=null) {
                                try {
                                    let user_ip = queryObject['user_ip'];
                                    let user_agent = queryObject['user_agent'];
                                    let source_url = queryObject['source_url'];
                                    let currency = queryObject['currency'];
                                    let content_ids = queryObject['content_ids'] || '';
                                    let value = queryObject['value'] || '';
                                    let content_name = queryObject['content_name'] || '';
                                    let num_items = queryObject['num_items'] || '';
                                    let pixelIds = pixels[0];
                                    let addToCartEventId = queryObject['addToCartEventId'] || '';
                                    let InitiateCheckoutEventId = queryObject['InitiateCheckoutEventId'] || '';
                                    let route = queryObject['route'] || '';
                                    let requestType = queryObject['requestType'] || 'pixelfy_pageview';
                                    //let cartEventId =  queryObject['cartEventId']
                                    let productId = queryObject['productId'] || '';
                                    let fbp = queryObject['fbp']
                                    let current_timestamp = Math.floor(new Date() / 1000);
                                    // let accessToken ='EAAbpzfTXlvABAAVZAZACo6t5Y710A41zjBKZAdaaIoYMWkP2anpfUqIHBwDeErTPn6g7admZCZAu5ZC5jIOZB54g3ZB4MRfh3cZBYFBNdhhwPN5FalnNrowVBuQZARFU8JBRsJe8dgATTjIfdozcfRJUuKBERr2r4LLbnmpnj3ZBZBbEGw6suSZCbguQf'
                                    let bizSdk = require('facebook-nodejs-business-sdk');
                                    let Content = bizSdk.Content;
                                    let CustomData = bizSdk.CustomData;
                                    let DeliveryCategory = bizSdk.DeliveryCategory;
                                    let EventRequest = bizSdk.EventRequest;
                                    let UserData = bizSdk.UserData;
                                    let ServerEvent = bizSdk.ServerEvent;
                                    let accessToken = pixels_row[0].accss_token;
                                    let api = bizSdk.FacebookAdsApi.init(accessToken);
                                    let userData = (new UserData()).setClientIpAddress(user_ip)
                                        .setClientUserAgent(user_agent)
                                        .setFbp(fbp)
                                    let content = (new Content())
                                        .setId(productId)
                                        .setQuantity(num_items)
                                        .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);
                                    let customData = (new CustomData())
                                        .setContents(content)
                                        .setCurrency(currency)
                                        .setValue(parseInt(value));
                                    let serverEvent = (new ServerEvent())
                                        .setEventName(requestType)
                                        .setEventTime(current_timestamp)
                                        .setUserData(userData)
                                        .setCustomData(customData)
                                        .setEventSourceUrl(source_url)
                                        .setActionSource('website');
                                    let eventsData = [serverEvent];
                                    let eventRequest = (new EventRequest(accessToken, pixels_row[0].pixel))
                                        .setEvents(eventsData).setTestEventCode(pixels_row[0].test_code)
                                    eventRequest.execute().then(
                                        response => {
                                            console.log('Response: ', response);
                                        },
                                        err => {
                                            console.error('Error: ', err);
                                        }
                                    ).catch(err => {
                                        console.error('Error: ', err);
                                    })
                                }
                                catch (e) {
                                    console.error(e)
                                }
                            }
                            else {
                                console.log('no pixels')
                            }
                        });
                    }
                    // res.sendStatus(200)
                    res.status(200).json({});
                }
                else {
                    // res.sendStatus(200)
                    res.status(200).json({});
                }
            }
        });
    } catch (e) {
        console.error(e)
        // res.sendStatus(320);
        res.status(200).json({});
    }



});
router.get('/pixels', (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    let shop = queryObject.shop;
    let  sql = "select * from customers where store =?"

    try {
        db.con.query(sql, [shop], function (err, status_row) {
            if (status_row && JSON.stringify(status_row) !== '[]' && status_row[0].accesstoken !== null) {
                shopifyQuery.RequestGetShopify(status_row[0].accesstoken, shop, '/admin/api/2022-10/shop.json')
                    .then((result) => {

                        if (err)
                            res.send('the app is disable')
                        if (status_row[0].statu_app === 'true') {
                            sql = "select * from facebookpixels where store_id =?"
                            db.con.query(sql, [shop], function (err, row) {
                                if (err) {
                                    res.send('')
                                } else {
                                    let all_data = [];
                                    let json_data = {};
                                    let full_data = {};
                                    for (let i = 0; i < row.length; i++) {
                                        //console.log(row[1])
                                        all_data.push({
                                            'pixel_id': row[i].pixel,
                                            'type': row[i].type,
                                            'collection': row[i].collectionsname,
                                            'tag': row[i].tag,
                                            "status": 1
                                        });
                                    }
                                    full_data['dTags'] = all_data;
                                    let datainject = JSON.stringify(full_data) //'{ "dTags" : [{"id":2392,"shop_id":2859,"pixel_id":30087,"type":"master","collection":null,"tag":null,"access_token":"EAAbpzfTXlvABAAVZAZACo6t5Y710A41zjBKZAdaaIoYMWkP2anpfUqIHBwDeErTPn6g7admZCZAu5ZC5jIOZB54g3ZB4MRfh3cZBYFBNdhhwPN5FalnNrowVBuQZARFU8JBRsJe8dgATTjIfdozcfRJUuKBERr2r4LLbnmpnj3ZBZBbEGw6suSZCbguQf","test_token":"TEST91613","status":1,"created_at":"2022-09-22T16:37:59.000000Z","updated_at":"2022-09-22T16:37:59.000000Z"}]}'
                                    res.send(datainject)
                                }
                            });
                        } else {
                            res.send('the app is disable')
                        }

                    }).catch(error => {
                    res.send('{ "dTags" : []}')
                })
            }
        });
    }
    catch (e) {
        console.error(e)
        res.sendStatus(360);
    }


});
router.get('/chckito', (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    let shop = queryObject.shop;
    let  sql = "select * from customers where store =?"
    try {
        db.con.query(sql, [shop], function (err, status_row) {

            if (err)
                res.send('the app is disable')
            if (status_row && JSON.stringify(status_row) !== '[]') {
                shopifyQuery.RequestGetShopify(status_row[0].accesstoken, shop, '/admin/api/2022-10/shop.json')
                    .then((result) => {

                        res.send('true')
                    }).catch(error => {
                    res.send('false')
                })
            } else {
                res.send('the app is disable')

            }

        });
    }  catch (e) {
        console.error(e)
        res.sendStatus(304)
    }

});
router.get('/purchase', (req, res) => {
    let sql = "select * from facebookpixels where store_id =?"
    //  let shop = queryObject.shop;
    let queryObject = url.parse(req.url, true).query;
    let shop = queryObject['shop'];
    ///  console.log(shop)
    try {
        db.con.query(sql, [shop], function (err, row) {
            if (err) {
                res.sendStatus('404')
            } else if (row) {
                let pixels = queryObject['pixelIds'].split(',')
                if (pixels.length > 0 && queryObject['pixelIds'] !== '') {
                    for (let i = 0; i < pixels.length; i++) {
                        //console.log(pixels.length)
                        sql = "select * from facebookpixels where pixel =?"
                        db.con.query(sql, [pixels[i]], function (err, pixels_row) {
//console.log(pixels_row[0].accss_token)

                            if (err) {
                                console.log(err)
                            } else if
                            (pixels_row[0].accss_token != null) {
                                try {
                                    let user_ip = queryObject['user_ip'];
                                    let user_agent = queryObject['user_agent'];
                                    let source_url = queryObject['source_url'];
                                    let currency = queryObject['currency'];
                                    let content_ids = queryObject['content_ids'] || '';
                                    let value = queryObject['value'] || '';
                                    let content_name = queryObject['content_name'] || '';
                                    let num_items = queryObject['num_items'] || '';
                                    let pixelIds = pixels[0];
                                    let addToCartEventId = queryObject['addToCartEventId'] || '';
                                    let InitiateCheckoutEventId = queryObject['InitiateCheckoutEventId'] || '';
                                    let route = queryObject['route'] || '';
                                    let requestType = queryObject['requestType'] || '';
                                    let email = queryObject['em'] || '';
                                    let lastName = queryObject['ln'] || '';
                                    let city = queryObject['ct'] || '';
                                    let zip = queryObject['zp'] || '';
                                    let firstName = queryObject['fn'] || '';
                                    let state = queryObject['st'] || '';
                                    let country = queryObject['country'] || '';
                                    //let cartEventId =  queryObject['cartEventId']
                                    let productId = queryObject['productId'] || '';
                                    let fbp = queryObject['fbp']
                                    let current_timestamp = Math.floor(new Date() / 1000);
                                    // let accessToken ='EAAbpzfTXlvABAAVZAZACo6t5Y710A41zjBKZAdaaIoYMWkP2anpfUqIHBwDeErTPn6g7admZCZAu5ZC5jIOZB54g3ZB4MRfh3cZBYFBNdhhwPN5FalnNrowVBuQZARFU8JBRsJe8dgATTjIfdozcfRJUuKBERr2r4LLbnmpnj3ZBZBbEGw6suSZCbguQf'
                                    const bizSdk = require('facebook-nodejs-business-sdk');
                                    const Content = bizSdk.Content;
                                    const CustomData = bizSdk.CustomData;
                                    const DeliveryCategory = bizSdk.DeliveryCategory;
                                    const EventRequest = bizSdk.EventRequest;
                                    const UserData = bizSdk.UserData;
                                    const ServerEvent = bizSdk.ServerEvent;
                                    const accessToken = pixels_row[0].accss_token;
                                    const api = bizSdk.FacebookAdsApi.init(accessToken);
                                    const userData = (new UserData())
                                        .setEmails([email])
                                        .setLastName(lastName)
                                        .setFirstName(firstName)
                                        .setZip(zip)
                                        .setCity(city)
                                        .setCountry(iso3311a2.getCode(country))
                                        .setState(state)
                                        .setClientIpAddress(user_ip)
                                        .setClientUserAgent(user_agent)
                                        .setFbp(fbp)
                                    const content = (new Content())
                                        .setId(content_ids)
                                        .setQuantity(num_items)
                                        .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);
                                    const customData = (new CustomData())
                                        .setContents(content)
                                        .setCurrency(currency)
                                        .setValue(parseInt(value));
                                    const serverEvent = (new ServerEvent())
                                        .setEventName('Purchase')
                                        .setEventTime(current_timestamp)
                                        .setUserData(userData)
                                        .setCustomData(customData)
                                        .setEventSourceUrl(source_url)
                                        .setActionSource('website');
                                    const eventsData = [serverEvent];
                                    const eventRequest = (new EventRequest(accessToken, pixels_row[0].pixel))
                                        .setEvents(eventsData).setTestEventCode(pixels_row[0].test_code)
                                    eventRequest.execute().then(
                                        response => {
                                            console.log('purchase: ', response);
                                            res.status(200).json({});


                                        },
                                        err => {
                                            console.error('Error: ', err);
                                            //res.sendStatus(360);
//res.status(200).json({});
                                        }
                                    ).catch(err => {
                                        console.error('Error: ', err);
                                        //res.sendStatus(360);
//res.status(200).json({});

                                    })
                                }
                                catch (e) {
                                    console.error(err)
//res.status(200).json({});
                                }
                            } else {
                                console.log('no access')
                                // res.sendStatus(320)


                            }
                        });
                    }
                    res.sendStatus(200)
                } else {
                    res.sendStatus(200)

                }
            }
        });
    }
    catch (e) {
        console.error(e)
        res.sendStatus(360)
    }

});



module.exports = router;
