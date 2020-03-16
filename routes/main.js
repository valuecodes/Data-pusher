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
    let yearData=req.body.combined;

    tickerInfo=[
        info.name,
        info.id,
        info.country,
        info.countryName,
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

        async function createTicker(tickerInfo){
        
            return new Promise(resolve =>{
                var sql = "INSERT INTO tickers (name,ticker, country,countryName, dividendType, sector, isin,industry ,subindustry,founded, address, website, employees,description,insiderStake) VALUES ?";
                con.query(sql,[[tickerInfo]], function (err, result, fields) {
                    if (err) throw error;
                    resolve('Ticker created');
                });
            })
        }

        async function saveYearData(yearData,ids){
            // yearData=yearData.shift();
            yearData.shift();
            for(var i=0;i<yearData.length;i++){
                yearData[i].push(ids);
            }
            return new Promise(resolve =>{
                var sql = "INSERT INTO yeardata (EPSEarningsPerShare,BasicEPS,SharesOutstanding,BasicSharesOutstanding,EBIT,EBITDA,NetIncome,IncomeFromDiscontinuedOperations,IncomeFromContinuousOperations,OtherIncome,IncomeAfterTaxes,IncomeTaxes,PreTaxIncome,TotalNonOperatingIncomeExpense,OperatingIncome,OperatingExpenses,OtherOperatingIncomeOrExpenses,SGAExpenses,ResearchAndDevelopmentExpenses,GrossProfit,CostOfGoodsSold,Revenue,year,month,day,quarter,TotalLiabilitiesAndShareHoldersEquity,ShareHolderEquity,OtherShareHoldersEquity,ComprehensiveIncome,RetainedEarnings,CommonStockNet,TotalLiabilities,TotalLongTermLiabilities,OtherNonCurrentLiabilities,LongTermDebt,TotalCurrentLiabilities,TotalAssets,TotalLongTermAssets,OtherLongTermAssets,GoodwillAndIntangibleAssets,LongTermInvestments,PropertyPlantAndEquipment,TotalCurrentAssets,OtherCurrentAssets,Inventory,NotesAndLoansReceivable,CashOnHand,CommonStockDividendsPaid,StockBasedCompensation,NetCashFlow,CashFlowFromFinancialActivities,FinancialActivitiesOther,TotalCommonAndPreferredStockDividendsPaid,NetTotalEquityIssuedRepurchased,NetCommonEquityIssuedRepurchased,DebtIssuanceRetirementNetTotal,NetCurrentDebt,NetLongTermDebt,CashFlowFromInvestingActivities,InvestingActivitiesOther,NetChangeInInvestmentsTotal,NetChangeInLongTermInvestments,NetChangeInShorttermInvestments,NetAcquisitionsDivestitures,NetChangeInIntangibleAssets,NetChangeInPropertyPlantAndEquiment,CashFlowFromOperatingActivities,TotalChangeInAssetsLiabilities,ChangeInAssetsLiabilities,ChangeInAccountsPayable,ChangeInInventories,ChangeInAccountsReceivable,TotalNonCashItems,OtherNonCashItems,TotalDepreciationAndAmortizationCashFlow,NetIncomeLoss,FreeCashFlowPerShare,OperatingCashFlowPerShare,BookValuePerShare,ROIReturnOnInvestment,ROAReturnOnAssets,ReturnOnTangibleEquity,ROEReturnOnEquity,DaysSalesInReceivables,ReceiveableTurnover,InventoryTurnoverRatio,AssetTurnover,NetProfitMargin,PreTaxProfitMargin,EBITDAMargin,EBITMargin,OperatingMargin,GrossMargin,DebtEquityRatio,LongtermDebtCapital,CurrentRatio,ticker_id) VALUES ?";
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

        async function saveDataToDB(tickerInfo,insider,weekData,divData,yearData){
            let ids = await getID();
            if(ids[tickerInfo[1]]===undefined){
                console.log(await createTicker(tickerInfo));
                ids = await getID();
            }
            console.log(ids[tickerInfo[1]])
            console.log(await deleteYearData(ids[tickerInfo[1]]));
            console.log(await deleteInsiderData(ids[tickerInfo[1]]));
            console.log(await deleteWeekData(ids[tickerInfo[1]]));
            console.log(await deleteDivData(ids[tickerInfo[1]]));
            console.log(await saveYearData(yearData,ids[tickerInfo[1]]));
            console.log(await saveInsiderData(insider,ids[tickerInfo[1]]));
            console.log(await saveWeekData(weekData,ids[tickerInfo[1]]));
            console.log(await saveDivData(divData,ids[tickerInfo[1]]));
        }
        saveDataToDB(tickerInfo,insider,weekData,divData,yearData);
    });
})


module.exports = app;