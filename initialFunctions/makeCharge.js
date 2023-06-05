const request = require('request-promise');
const db = require('../config/dbConnect');
let shopifyQuery = require('../ApiQueries/shopifyQueries');
let appFunctions = require('./appFunctions')

function createCharge(shop,req,res){
    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    let params = shop;
    db.con.query(sql,params,function (err, row) {
        let accessToken  = row[0].accesstoken;
        let jsonParm = {
            "recurring_application_charge": {
                "name": "facebook  Pixel Plan",
                "price": 7.95,
                "return_url": "",
                "trial_days": 7,
            "test" :true
            }};
        let api ="/admin/api/2022-10/recurring_application_charges.json";
        shopifyQuery.RequestPostShopify(accessToken,shop,api,jsonParm)
            .then((data) => {
                let chargeid = data.recurring_application_charge.id;
                let sql ='UPDATE customers set ? WHERE store = ?';
                let params = [{ chargeId: chargeid }, shop];
                db.con.query(sql,params,function (err, row) {
                    res.redirect(data.recurring_application_charge.confirmation_url)
                    if(err)
                        return 0;
                })
            })
            .catch(error =>{
                console.log(error);
            })
    })
}
function CheckChargestatu(shop,chargeId,req,res) {
    let sql = 'SELECT accesstoken FROM customers WHERE store = ?';
    let params = shop;

    db.con.query(sql,params,function (err, row) {

        let accessToken  = row[0].accesstoken;
        let url= "/admin/api/2022-10/recurring_application_charges/"+chargeId+".json";
        shopifyQuery.RequestGetShopify(accessToken,shop,url)
            .then((data) => {
                checkcharge = JSON.parse(data);
                //console.log(JSON.parse(data))
                let chargeStatu =  checkcharge.recurring_application_charge.status;
                let plan = checkcharge.recurring_application_charge.name;
                switch(chargeStatu) {
                    case "accepted":
                        url = "/admin/api/2022-10/recurring_application_charges/"+chargeId+"/activate.json"
                        shopifyQuery.RequestPostShopify(accessToken,shop,url,checkcharge).then((response)=>{
                            if (response.recurring_application_charge.status=="active")
                            {

                              //  appFunctions.renderPackages(res,shop, response.recurring_application_charge.name,accessToken)
                          appFunctions.renderApp(res,shop,accessToken,response.recurring_application_charge.name)

                            }

                            else
                                res.redirect('/')
                        }).catch(error=>{
                            console.log(error)
                            throw error;
                        })
                        break;
                    case "pending":
                        res.render('makecharge_two');
                        break;
                    case "frozen":case "active":
                      //  appFunctions.renderPackages(res,shop,plan,accessToken)
                        appFunctions.renderApp(res,shop,accessToken,plan)

                        break;
                    default:
                        res.render('makecharge_two')
                        break
                }
            })
            .catch(error=>{
                console.log(error)
                throw error;
            })
    })

}
function make_charge_packages(accessToken,shop,packageData,res)
{
    let api ="/admin/api/2022-10/recurring_application_charges.json";
    shopifyQuery.RequestPostShopify(accessToken,shop,api,packageData)
        .then((data) => {
            console.log(data);
            let chargeid = data.recurring_application_charge.id;
            let sql ='UPDATE customers set ? WHERE store = ?';
            let params = [{ chargeId: chargeid }, shop];
            db.con.query(sql,params,function (err, row) {
                let params = {
                    "script_tag": {
                        "event": "onload",
                        "src": "https://cfd5-196-74-195-247.ngrok-free.app/script.js",
                        "display_scope": "order_status",
                    }
                };
                api = "/admin/api/2022-10/script_tags.json";
                shopifyQuery.RequestPostShopify(accessToken, shop,api,params)
                    .then((data2) => {
                    params = {
                           "script_tag": {
                          "event": "onload",
                           "src": "https://cfd5-196-74-195-247.ngrok-free.app/js/script_ty.js",
                          "display_scope": "order_status",
                     }
                      };
                   api = "/admin/api/2022-10/script_tags.json";
                     shopifyQuery.RequestPostShopify(accessToken, shop,api,params)
                       .then((data2) => {
                                res.status(200).send(data.recurring_application_charge.confirmation_url)


                          })
                    });

                if(err)
                    return 0;
            })
        })
        .catch(error =>{
            console.log(error);
        })
}





module.exports = {
    createCharge,
    CheckChargestatu,
    make_charge_packages
};
