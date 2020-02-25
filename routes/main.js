var express = require('express');
var app = express();
let path = require('path');
app.use(express.json());

app.post('/selectTicker', function (req, res) {
    // console.log(req.body);
    let data=[[
        req.body.id,
        req.body.name,
        req.body.country,
        req.body.dividendType,
        req.body.sector,
        req.body.isin
    ]];

    console.log(data);

    req.getConnection(function (error, con) {
        if (error) throw error;
        console.log("Connected!");
        var sql = "INSERT INTO tickers (ticker, name, country, dividendType, sector, isin) VALUES ? ON DUPLICATE KEY UPDATE ticker = '"+req.body.id+"';";
        con.query(sql,[data], function (err, result, fields) {
            if (err) throw error;
            console.log(result);
                res.json({
                    status: 'success',
                    data: result
                })
            });
    });
})


app.post('/saveTickerData', function (req, res) {

    let insider=req.body.insiderData;
    let info=req.body.active;
    let tickerInfo=[];
    let weekData=req.body.weekData;
    let divData=req.body.divData;
    console.log(info);
    let lDebt=req.body.lDebtData;
    let shares=req.body.sharesData;
    let margin=req.body.marginData;

    if(shares[0][2]>lDebt[0][2]){
        lDebt.unshift([undefined,undefined,undefined]);
    }
       
    for(var a=0;a<shares.length;a++){
        shares[a].push(lDebt[a][0]);
    }

    let yearData=shares;

    // for(key in info){
    //     tickerInfo.push(info[key]);
    // }

    tickerInfo=[
        info.name,
        info.id,
        info.country,
        info.dividendType,
        info.sector,
        info.isin,
        info.industry,
        info.subindustry,
        info.founded,
        info.address,
        info.website,
        info.employees,
        info.description,
        info.insiderStake,
    ]


    let ticker=req.body.active.id;
    let earnings=req.body.epsData;
    let fcf=req.body.fcfData;
    let debt=req.body.qDebtData;
    let ebitda=req.body.ebitData;
    
    if(earnings[0][3]>fcf[0][7]){
        fcf.unshift([undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,])
    }
    
    if(earnings[0][2]>debt[0][5]){
        debt.unshift([undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,])
    }
    
    if(earnings[0][2]>margin[0][5]){
        margin.unshift([undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,])
    }

    for(var q=0;q<20;q++){
        fcf.push([undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,]);
        debt.push([undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,]);
        margin.push([undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,]);
    }

    for(var i=0;i<earnings.length;i++){        
        earnings[i].push(
            fcf[i][1],
            fcf[i][2],
            debt[i][0],
            debt[i][1],
            debt[i][2],
            margin[i][0],
            margin[i][1],
            margin[i][2],
        )
    }
    
    req.getConnection(function (error, con) {   
        async function getID(){
            return new Promise(resolve =>{
            con.query("SELECT ticker,id FROM tickers", function (err, result, fields) {
                if (err) throw err;
                let res={};
                for(var i=0;i<result.length;i++){
                res[result[i].ticker]=result[i].id;
                }
                resolve(res);
            });
            })
        }

        async function saveEarnings(earnings,ids){
            
            for(var i=0;i<earnings.length;i++){
                earnings[i].push(ids);
            }
            return new Promise(resolve =>{
                let sql = "INSERT INTO qfinancials (eps,year,month,quarter,idnumber,fcf,pfcf,currentassets,currentliabilities,cratio,revenue,ttmnetincome,netmargin,ticker_id) VALUES ?";
                con.query(sql, [earnings], function (err, result) {
                    if (err) throw err;
                    resolve("Qfifanancials inserted: " + result.affectedRows);
                }); 
            })
        }

        async function createTicker(tickerInfo){
            return new Promise(resolve =>{
                var sql = "INSERT INTO tickers (name,ticker, country, dividendType, sector, isin,industry ,subindustry,founded, address, website, employees,description,insiderStake) VALUES ?";
                con.query(sql,[[tickerInfo]], function (err, result, fields) {
                    if (err) throw error;
                    resolve('Ticker created');
                });
            })
        }

        async function saveYearData(yearData,ids){
            for(var i=0;i<yearData.length;i++){
                yearData[i].push(ids);
            }
            return new Promise(resolve =>{
                var sql = "INSERT INTO yeardata (shares,idnumber, year, ldebt, ticker_id) VALUES ?";
                con.query(sql,[yearData], function (err, result, fields) {
                    if (err) throw error;
                    resolve("Yeardata inserted: " + result.affectedRows);
                });
            })
        }

        async function saveInsiderData(insiderData,ids){
            for(var i=0;i<insiderData.length;i++){
                insiderData[i].push(ids);
            }
            return new Promise(resolve =>{
                var sql = "INSERT INTO insider (name,title,type,count,shares,total,year,month,day,quarter,idnumber,ticker_id) VALUES ?";
                con.query(sql,[insiderData], function (err, result, fields) {
                    if (err) throw error;
                    resolve("Insider data inserted: " + result.affectedRows);
                });
            })
        }

        async function saveWeekData(weekData,ids){
            for(var i=0;i<weekData.length;i++){
                weekData[i].push(ids);
            }
            return new Promise(resolve =>{
                var sql = "INSERT INTO weeklydata (open,high,low,close,volume,dividend,year,month,day,quarter,ticker_id) VALUES ?";
                con.query(sql,[weekData], function (err, result, fields) {
                    // console.log(err);
                    if (err) throw error;
                    resolve("Weekdata data inserted: " + result.affectedRows);
                });
            })
        }

        async function saveDivData(divData,ids){
            for(var i=0;i<divData.length;i++){
                divData[i].push(ids);
            }
            return new Promise(resolve =>{
                var sql = "INSERT INTO dividends (dividend,exDiv,year,month,day,quarter,country,ticker_id) VALUES ?";
                con.query(sql,[divData], function (err, result, fields) {
                    if (err) throw error;
                    resolve("Dividend data inserted: " + result.affectedRows);
                });
            })
        }

        async function deleteEarnings(ids){
            return new Promise(resolve =>{
                var sql = "DELETE FROM qfinancials WHERE ticker_id = '"+ids+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records deleted: " + result.affectedRows);
                    resolve('Previous financials deleted');
                });
            })
        }

        async function deleteYearData(ids){
            return new Promise(resolve =>{
                var sql = "DELETE FROM yeardata WHERE ticker_id = '"+ids+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records deleted: " + result.affectedRows);
                    resolve('Previous yeardata deleted');
                });
            })
        }

        async function deleteInsiderData(ids){
            return new Promise(resolve =>{
                var sql = "DELETE FROM insider WHERE ticker_id = '"+ids+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records deleted: " + result.affectedRows);
                    resolve('Previous insider data deleted');
                });
            })
        }

        async function deleteWeekData(ids){
            return new Promise(resolve =>{
                var sql = "DELETE FROM weeklydata WHERE ticker_id = '"+ids+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records deleted: " + result.affectedRows);
                    resolve('Week data deleted');
                });
            })
        }
        
        async function deleteDivData(ids){
            return new Promise(resolve =>{
                var sql = "DELETE FROM dividends WHERE ticker_id = '"+ids+"'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("Number of records deleted: " + result.affectedRows);
                    resolve('Dividend data deleted');
                });
            })
        }  

        async function saveDataToDB(earnings,tickerInfo,yearData,insider,weekData,divData){
            let ids = await getID();
            if(ids[tickerInfo[1]]===undefined){
                console.log(await createTicker(tickerInfo));
                ids = await getID();
            }
            console.log(ids[tickerInfo[1]])
            console.log(await deleteEarnings(ids[tickerInfo[1]]));
            console.log(await deleteYearData(ids[tickerInfo[1]]));
            console.log(await deleteInsiderData(ids[tickerInfo[1]]));
            console.log(await deleteWeekData(ids[tickerInfo[1]]));
            console.log(await deleteDivData(ids[tickerInfo[1]]));
            console.log(await saveEarnings(earnings,ids[tickerInfo[1]]));
            console.log(await saveYearData(yearData,ids[tickerInfo[1]]));
            console.log(await saveInsiderData(insider,ids[tickerInfo[1]]));
            console.log(await saveWeekData(weekData,ids[tickerInfo[1]]));
            console.log(await saveDivData(divData,ids[tickerInfo[1]]));
        }
        saveDataToDB(earnings,tickerInfo,yearData,insider,weekData,divData);
    });
})


module.exports = app;