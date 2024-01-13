// 技能から除外するコマンド
const commandFilter = ["正気度ロール","アイデア","幸運","知識","STR × 5","CON × 5","POW × 5","DEX × 5","APP × 5","SIZ × 5","INT × 5","EDU × 5", "クトゥルフ神話",
    "∞共鳴","＊調査","＊知覚","＊交渉","＊知識","＊ニュース","＊運動","＊格闘","＊投擲","＊生存","＊自我","＊手当て","＊細工","＊幸運"];
function perseSkills(command) {
    if(command.includes("CC"))
    {
        return command.match(/^CCB?<=(\d+) 【(.*?)】$/gm)?.map(item =>{
            // 正規表現で、ラベルと技能値を分解
            var r = /^CCB?<=(\d+) 【(.*?)】$/.exec(item);
            return {"label":r[2],"value":Number(r[1])};
        }).filter(item=>{
            // フィルターに一致する項目は排除
            return commandFilter.every(f => f != item["label"]);
        }).sort(function(a,b){
            // 技能値の高い順に並べ替え
            if(a["value"] < b["value"]) return 1;
            if(a["value"] > b["value"]) return -1;
            return 0;
        });
    }
    if(command.includes("DM"))
    {
        return command.match(/^(\d)DM<=(\d) 〈(.*)〉$/gm)?.map(item =>{
            // 正規表現で、ラベルと技能値を分解
            var r = /^(\d)DM<=(\d) 〈(.*)〉$/.exec(item);
            return {"label":r[3],"value":Number(r[2])};
        }).filter(item=>{
            // フィルターに一致する項目は排除
            return commandFilter.every(f => f != item["label"]);
        }).sort(function(a,b){
            // 技能値の高い順に並べ替え
            if(a["value"] < b["value"]) return 1;
            if(a["value"] > b["value"]) return -1;
            return 0;
        });
    }
    return [];
}

function perseNameFurigana(name){
    var r = /(.*?)\s?[(（](.*?)[)）]/.exec(name);
    if(r != null) {
        // ふり仮名があった場合
        return [r[1],r[2]]
    }
    return [name,""]
}

// カラーコードの文字列を変換する。
// https://cly7796.net/blog/javascript/changing-the-color-format-with-javascript
// を参考に作成。
function colorcode2rgb(colorcode,alpha) {
    if(colorcode.split('')[0] === '#') {
        colorcode = colorcode.substring(1);
    }
    if(colorcode.length === 3) {
        var codeArr = colorcode.split('');
        colorcode = codeArr[0] + codeArr[0] + codeArr[1] + codeArr[1] + codeArr[2] + codeArr[2];
    }
    if(colorcode.length !== 6) {
        return false;
    }
    var r = parseInt(colorcode.substring(0, 2), 16);
    var g = parseInt(colorcode.substring(2, 4), 16);
    var b = parseInt(colorcode.substring(4, 6), 16);
    return "rgba(" + [r, g, b, alpha] + ")"
}

if (typeof module !== "undefined") 
    module.exports = perseSkills;