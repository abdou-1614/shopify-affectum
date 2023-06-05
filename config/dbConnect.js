
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Rca-real2015",
    port: 3306,
    multipleStatements: true,
    database : 'multipxl',
    charset : 'utf8mb4'
});

con.connect();

module.exports = {
    con,
};
