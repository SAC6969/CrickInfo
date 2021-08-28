let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");
let path = require("path");

let currDir = process.cwd();
let currentP = path.join(currDir, "IPL");
if(fs.existsSync(currentP) == false){
    fs.mkdirSync(currentP);
}
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url, cb);

function cb(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("page not found");
    } else {
        // console.log(html)
        getLink(html);
    }
}

function getLink(html) {
    let searchTool = cheerio.load(html);
    let element = searchTool(".label.blue-text.blue-on-hover");
    let ele = searchTool(element[0]).attr("href");
    let link = `https://www.espncricinfo.com/${ele}`;
    request(link, scorecb);
}

function scorecb(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("page not found");
    } else {
        // console.log(html)
        getScore(html);
    }
}

function getScore(html) {
    let searchData = cheerio.load(html);
    let element = searchData("a[data-hover='Scorecard']");
    for(let i=0; i<element.length; i++){
    let getlink = searchData(element[i]).attr("href");
    let scoreBoard = `https://www.espncricinfo.com/${getlink}`;
    request(scoreBoard, scoreBoardcb);
    }
}

function scoreBoardcb(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("page not found");
    } else {
        getScoreBoard(html);
    }
}

function getScoreBoard(html) {
    let searchData = cheerio.load(html);
    let element = searchData(".name-link>.name");
    let team1Name = searchData(element[0]).text();
    let team2Name = searchData(element[1]).text();
    let teamtable = searchData(".table.batsman tbody");
    let team1tbale = searchData(teamtable[0]);
    let team1tr = searchData(team1tbale).find("tr");
    let team2table = searchData(teamtable[1]);
    let team2tr = searchData(team2table).find("tr");
    

    let team1path = path.join(currentP,team1Name);
        function team1(team1tr){
            for (let i = 0; i < team1tr.length-1; i += 2) {
                let d = searchData(".w-100.table.match-details-table tbody tr") 
                let da = searchData(d[6]).find("td");
                let date = searchData(da[1]).text();
                let col = searchData(team1tr[i]).find("td");
                let name = searchData(col[0]).text();
                let run = searchData(col[2]).text();
                let ball = searchData(col[3]).text();
                let fours = searchData(col[5]).text();
                let six = searchData(col[6]).text();
                let sr = searchData(col[7]).text();
                let v = searchData(".font-weight-bold.match-venue");
                let venue = searchData(v).text();
                let stringName = `${name}.json`
                let playerpath1 = path.join(team1path, stringName);
                let content = [];
                let obj = {
                    team1Name,
                    name,
                    venue,
                    date,
                    team2Name,
                    run,
                    ball,
                    fours,
                    six,
                    sr
                }
                console.log(name + "-->" + team1Name)
                if(fs.existsSync(playerpath1)){
                    let jsonData = fs.readFileSync(playerpath1)
                    let jsonreadable = JSON.parse(jsonData);
                    jsonreadable.push(obj);
                    let jsoncontent = JSON.stringify(jsonreadable);
                    fs.writeFileSync(playerpath1, jsoncontent);
                }else{
                    content.push(obj);
                    let jsconcontent1 = JSON.stringify(content);
                    fs.writeFileSync(playerpath1, jsconcontent1);
                }
            }
        }
        if(!fs.existsSync(team1path)){
            fs.mkdirSync(team1path);
        }
        team1(team1tr);
    
    let team2path = path.join(currentP,team2Name);
        function team2(team2tr){
            for (let i = 0; i < team2tr.length-1; i += 2) {
                let col = searchData(team2tr[i]).find("td");
                let d = searchData(".w-100.table.match-details-table tbody tr") 
                let da = searchData(d[6]).find("td");
                let date = searchData(da[1]).text();
                let name = searchData(col[0]).text();
                let run = searchData(col[2]).text();
                let ball = searchData(col[3]).text();
                let fours = searchData(col[5]).text();
                let six = searchData(col[6]).text();
                let sr = searchData(col[7]).text();
                let v = searchData(".font-weight-bold.match-venue");
                let venue = searchData(v).text();
                let playerpath2 = path.join(team2path, `${name}.json`);
                let content = [];
                let obj = {
                    team2Name,
                    name,
                    venue,
                    date,
                    team1Name,
                    run,
                    ball,
                    fours,
                    six,
                    sr
                }
                console.log(name + "-->" + team2Name)
                if(fs.existsSync(playerpath2)){
                    let jsonData = fs.readFileSync(playerpath2)
                    let jsonreadable = JSON.parse(jsonData);
                    jsonreadable.push(obj);
                    let jsoncontent = JSON.stringify(jsonreadable);
                    fs.writeFileSync(playerpath2, jsoncontent);
                }else{
                    content.push(obj);
                    let jsconcontent1 = JSON.stringify(content);
                    fs.writeFileSync(playerpath2, jsconcontent1);
                }
            }
        }
        if(!fs.existsSync(team2path)){
            fs.mkdirSync(team2path);
        }   
        team2(team2tr);
}
