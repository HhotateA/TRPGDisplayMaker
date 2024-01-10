// #region class
// 描画オブジェクトの当たり判定用クラス
class Rect {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contain(offsetX,offsetY){
        if(this.x>offsetX) return false;
        if(this.x+this.w<offsetX) return false;
        if(this.y>offsetY) return false;
        if(this.y+this.h<offsetY) return false;
        return true;
    }
    pos(offsetX,offsetY){
        return [offsetX-this.x, offsetY-this.y];
    }
    extend(rect){
        var xmin = Math.min(this.x,this.x+this.w,rect.x,rect.x+rect.w);
        var ymin = Math.min(this.y,this.y+this.h,rect.y,rect.y+rect.h);
        var xmax = Math.max(this.x,this.x+this.w,rect.x,rect.x+rect.w);
        var ymax = Math.max(this.y,this.y+this.h,rect.y,rect.y+rect.h);
        return new Rect(xmin,ymin,xmax-xmin,ymax-ymin);
    }
    copyTo(xInput,yInput){
        xInput.val(this.x);
        yInput.val(this.y);
    }
    copyFrom(xInput,yInput){
        this.x = xInput.val();
        this.y = yInput.val();
    }
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
// #endregion

// #region initialize
const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');

// 技能から除外するコマンド
const commandFilter = ["正気度ロール","アイデア","幸運","知識","STR × 5","CON × 5","POW × 5","DEX × 5","APP × 5","SIZ × 5","INT × 5","EDU × 5", "クトゥルフ神話",
    "∞共鳴","＊調査","＊知覚","＊交渉","＊知識","＊ニュース","＊運動","＊格闘","＊投擲","＊生存","＊自我","＊手当て","＊細工","＊幸運"];

// グローバル変数群
font = "arial"
backGround = new Image();
iconImage = new Image();
statusRect = new Rect(50,450,1,1)
hudRect = new Rect(50,450,1,1)
skillsRect = new Rect(700,100,1,1)
nameRect = new Rect(500,700,1,1)
iconRect = new Rect(0,0,1,1)
canvasScale = 3;

$(function() {
    // フォントの読み込み。
    loadFont("soukou","装甲明朝","url(fonts/SoukouMincho-Font/SoukouMincho.ttf)");
    loadFont("LanobePOP","ラノベPOP","url(fonts/LanobePOPv2/LightNovelPOPv2.otf)");
    loadFont("ToronoGlitchSans","瀞ノグリッチ黒体","url(fonts/ToronoGlitchSans/ToronoGlitchSansH2.otf)");
    loadFont("KouzanMouhitu","衡山毛筆フォント","url(fonts/KouzanMouhituFontOTF/KouzanMouhituFontOTF.otf)");
    // ↑ 新たなフォントはここに追加する。

    loadBackground("https://hhotatea.github.io/TRPGDisplayMaker/sample/1499176.jpg");
    resetCanvas();
});

async function loadBackground(url)
{
    // 初期背景画像の読み込み
    backGround = await getIconPicture(url);
}

async function loadFont(id,name,url){
    let font = new FontFace(id,url);
    font.load().then(function (fs) {
        document.fonts.add(fs);
        $("#fontSelect").append('<option value="'+id+'"> <font face="'+id+'">'+name+'</font> </option>');
    });
}
// #endregion

// #region input
$('#fontSelect').change(function() {
    font = $('option:selected').val();
    drawCanvas();
})

$('#loadButton').click(function(){
    reloadCanvas();
});

$('#drawButton').click(function(){
    drawCanvas();
});

$('#download').click(function(){
    var base64 = canvas.toDataURL();
    document.getElementById("download").href = base64;
});

$('#bgInput').change(function(){
    if (!this.files.length) {
        alert('File Not Selected');
        return;
    }
    var file = this.files[0];
    backGround = new Image();
    var fr = new FileReader();
    fr.onload = function(evt) {
        backGround.src = evt.target.result;
        backGround.onload = function() {
            drawBackGroundIO();
            drawCanvas();
        }
    }
    fr.readAsDataURL(file);
});
// #endregion

// #region load
// 入力された文字列をJsonに分解
async function getData(){
    const text = $("#jsonInput").val();
    const parsed = JSON.parse(text);
    var data = parsed["data"]
    try{
        $("#nameInput").val("");
        $("#furiganaInput").val("");
        if("name" in data){
            var [name,furigana] = perseNameFurigana(data["name"]);
            $("#nameInput").val(name);
            $("#furiganaInput").val(furigana);
        }
    }catch(e){
        console.log(e);
    }
    try{
        $("#skillsInput").val("[]");
        if("commands" in data){
            var skills = perseSkills(data["commands"]);
            $("#skillsInput").val(JSON.stringify(skills));
        }
    }catch(e){
        console.log(e);
    }
    try{
        $("#statusInput").val("[]");
        if("params" in data){
            var params = [data["params"]];
            $("#statusInput").val(JSON.stringify(params));
        }
    }catch(e){
        console.log(e);
    }
    try{
        $("#hudInput").val("[]");
        if("status" in data){
            var params = data["status"];
            $("#hudInput").val(JSON.stringify(params));
        }
    }catch(e){
        console.log(e);
    }
    try{
        iconImage = new Image();
        if("iconUrl" in data){
            iconImage = await getIconPicture(data["iconUrl"]);
        }
    }catch(e){
        console.log(e);
    }
    try{
        //$("#iconShadowColor").val("#cccccc");
        if("color" in data){
            $("#iconShadowColor").val(data["color"]);
        }
    }catch(e){
        console.log(e);
    }
}

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

// キャラクター立ち絵の描写
async function getIconPicture(url){
    var image = new Image();
    if(url == "") return image;
    return new Promise(resolve =>{
        image.onload = function() {
            resolve(image);
        }
        image.crossOrigin = "anonymous";
        image.src = url;
    })
}
// #endregion

// #region touch
// これもグローバル変数だけど、このブロックでしか使わないのでここに配置。
grabFlg = 0;
grabRelativeX = 0
grabRelativeY = 0

// マウスでドラッグした時に、オブジェクトを移動させる。
$("#preview").mousedown(function(e){
    if(grabFlg != 0) return;
    var pos = [e.offsetX*canvasScale,e.offsetY*canvasScale];
    if(nameRect.contain(pos[0],pos[1]) && $("#namesToggle").prop('checked')){
        grabFlg = 1;
        [grabRelativeX,grabRelativeY] = nameRect.pos(pos[0],pos[1]);
    }else if(hudRect.contain(pos[0],pos[1]) && $("#hudToggle").prop('checked')){
        grabFlg = 2;
        [grabRelativeX,grabRelativeY] = hudRect.pos(pos[0],pos[1]);
    }else if(statusRect.contain(pos[0],pos[1]) && $("#statusToggle").prop('checked')){
        grabFlg = 3;
        [grabRelativeX,grabRelativeY] = statusRect.pos(pos[0],pos[1]);
    }else if(skillsRect.contain(pos[0],pos[1]) && $("#skillsToggle").prop('checked')){
        grabFlg = 4;
        [grabRelativeX,grabRelativeY] = skillsRect.pos(pos[0],pos[1]);
    }else if(iconRect.contain(pos[0],pos[1]) && $("#iconToggle").prop('checked')){
        grabFlg = 5;
        [grabRelativeX,grabRelativeY] = iconRect.pos(pos[0],pos[1]);
    }
}).mouseup(function(e){
    grabFlg = 0;
    drawCanvas();
}).mousemove(function(e){
    var pos = [e.offsetX*canvasScale,e.offsetY*canvasScale];
    switch(grabFlg){
        case 0:
            break;
        case 1:
            $("#namesXInput").val(pos[0]-grabRelativeX);
            $("#namesYInput").val(pos[1]-grabRelativeY);
            nameRect = drawNameIO();
            break;
        case 2:
            $("#hudXInput").val(pos[0]-grabRelativeX);
            $("#hudYInput").val(pos[1]-grabRelativeY);
            hudRect = drawHudIO();
            break;
        case 3:
            $("#statusXInput").val(pos[0]-grabRelativeX);
            $("#statusYInput").val(pos[1]-grabRelativeY);
            statusRect = drawStatusIO();
            break;
        case 4:
            $("#skillsXInput").val(pos[0]-grabRelativeX);
            $("#skillsYInput").val(pos[1]-grabRelativeY);
            skillsRect = drawSkillsIO();
            break;
        case 5:
            $("#iconXInput").val(pos[0]-grabRelativeX);
            $("#iconYInput").val(pos[1]-grabRelativeY);
            iconRect = drawIconIO();
            break;
    }
});
// canvas.addEventListener('touchstart',function(e){
//     if(grabFlg != 0) return;
//     var pos = [e.changedTouches[0].clientX*canvasScale,e.changedTouches[0].clientY*canvasScale];
//     if(statusRect.contain(pos[0],pos[1])){
//         e.preventDefault();
//         grabFlg = 1;
//         [grabRelativeX,grabRelativeY] = statusRect.pos(pos[0],pos[1]);
//     }else if(skillsRect.contain(pos[0],pos[1])){
//         e.preventDefault();
//         grabFlg = 2;
//         [grabRelativeX,grabRelativeY] = skillsRect.pos(pos[0],pos[1]);
//     }
// });
// canvas.addEventListener('touchend',function(e){
//     if(e.changedTouches.length != 0) return;
//     grabFlg = 0; // マウス押下終了
//     drawCanvas();
// });
// canvas.addEventListener('touchmove',function(e){
//     var pos = [e.changedTouches[0].clientX*canvasScale,e.changedTouches[0].clientY*canvasScale];
//     switch(grabFlg){
//         case 0:
//             break;
//         case 1:
//             e.preventDefault();
//             statusRect.x = pos[0]-grabRelativeX;
//             statusRect.y = pos[1]-grabRelativeY;
//             statusRect = drawStatus(getData()["params"],statusRect.x,statusRect.y,40);
//             break;
//         case 2:
//             e.preventDefault();
//             skillsRect.x = pos[0]-grabRelativeX;
//             skillsRect.y = pos[1]-grabRelativeY;
//             skillsRect = drawSkills(getData()["commands"],skillsRect.x,skillsRect.y,40);
//             break;
//     }
// });
// #endregion

// #region drawIO
async function drawCanvas(){
    drawCharadatas();
}
async function reloadCanvas(){
    resetCanvas();
    await getData();
    drawCharadatas();
}
function drawCharadatas(){
    // ここらへんは、ユーザーの入力値で任意にバグるので
    // エラーを握りつぶす。
    try {
        drawBackGroundIO();
    } catch (e) {
        console.log(e);
    }
    try {
        iconRect = drawIconIO();
    } catch (e) {
        console.log(e);
    }
    try {
        skillsRect = drawSkillsIO();
    } catch (e) {
        console.log(e);
    }
    try {
        statusRect = drawStatusIO();
    } catch (e) {
        console.log(e);
    }
    try {
        hudRect = drawHudIO();
    } catch (e) {
        console.log(e);
    }
    try {
        nameRect = drawNameIO();
    } catch (e) {
        console.log(e);
    }
}
function drawBackGroundIO(){
    resetCanvas($("#bgColor").val());
    if($("#bgToggle").prop('checked')){
        drawBackGround(backGround,
            Number($("#bgXInput").val()),
            Number($("#bgYInput").val()),
            Number($("#bgSizeInput").val()));
    }
}
function drawNameIO(){
    if($("#namesToggle").prop('checked')){
        return drawNameFurigana($("#nameInput").val(),$("#furiganaInput").val(),
            Number($("#namesXInput").val()),
            Number($("#namesYInput").val()),
            Number($("#namesSizeInput").val()),
            $("#nameTextColor").val(),
            $("#nameShadowColor").val());
    }
    return new Rect(0,0,1,1);
}
function drawStatusIO(){
    if($("#statusToggle").prop('checked')){
        return drawParams(JSON.parse($("#statusInput").val()),
            Number($("#statusXInput").val()),
            Number($("#statusYInput").val()),
            Number($("#statusSizeInput").val()),
            $("#statusTextColor").val(),
            $("#statusShadowColor").val(),
            colorcode2rgb($("#statusWindowColor").val(),$("#statusWindowAlpha").val()),
            Number($("#statusLabelWidth").val()),
            Number($("#statusValuelWidth").val()),
            Number($("#statusMargin").val()));
    }
    return new Rect(0,0,1,1);
}
function drawHudIO(){
    if($("#hudToggle").prop('checked')){
        return drawHub(JSON.parse($("#hudInput").val()),
            Number($("#hudXInput").val()),
            Number($("#hudYInput").val()),
            Number($("#hudSizeInput").val()),
            $("#hudTextColor").val(),
            $("#hudShadowColor").val(),
            colorcode2rgb($("#hudWindowColor").val(),$("#hudWindowAlpha").val()));
    }
    return new Rect(0,0,1,1);
}
function drawSkillsIO(){
    if($("#skillsToggle").prop('checked')){
        return drawSkills(JSON.parse($("#skillsInput").val()),
            Number($("#skillsXInput").val()),
            Number($("#skillsYInput").val()),
            Number($("#skillsSizeInput").val()),
            $("#skillsTextColor").val(),
            $("#skillsShadowColor").val(),
            colorcode2rgb($("#skillsWindowColor").val(),$("#skillsWindowAlpha").val()),
            Number($("#skillsLabelWidth").val()),
            Number($("#skillsValuelWidth").val()),
            Number($("#skillsMargin").val()),
            Number($("#skillsSpace").val()));
    }
    return new Rect(0,0,1,1);
}
function drawIconIO(){
    if($("#iconToggle").prop('checked')){
        return drawIconPicture(iconImage,
            Number($("#iconXInput").val()),
            Number($("#iconYInput").val()),
            Number($("#iconSizeInput").val()),
            $("#iconShadowColor").val());
    }
    return new Rect(0,0,1,1);
}
// #endregion

// #region drawFunc
function resetCanvas(color = "#ccc"){
    canvas.width = 1200;
    canvas.height = 900;
    canvas.style.width = canvas.width/canvasScale+`px`;
    canvas.style.height = canvas.height/canvasScale+`px`;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1200, 900);
}
// 背景画像の描写
function drawBackGround(image,posx,posy,size){
    if(!image) return;
    var cnvsH = 900;
    var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
    if(cnvsW < canvas.width)
    {
        cnvsW = 1200;
        cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
    }
    ctx.drawImage(image, (1200-cnvsW)/2+posx, (900-cnvsH)/2+posy, cnvsW*size/100, cnvsH*size/100);
}

// キャラクター立ち絵の描写
function drawIconPicture(image,posx,posy,size,shadow){
    if(!image) return new Rect(posx, posy, 0, 0);
    var cnvsH = 900;
    var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
    if(cnvsW > canvas.width)
    {
        cnvsW = 1200;
        cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
    }
    ctx.shadowColor = shadow;
    ctx.shadowOffsetX = 15;
    ctx.shadowOffsetY = 15;
    ctx.drawImage(image, posx, posy, cnvsW*(size/100), cnvsH*(size/100));
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return new Rect(posx, posy, cnvsW*(size/100), cnvsH*(size/100));
}

// ふり仮名と名前の描写
function drawNameFurigana(name,furigana,posx,posy,size,color,shadow)
{
    return drawNameFuriganaHorizon(name,furigana,posx,posy,size,color,shadow);
}
function drawNameFuriganaHorizon(name,furigana,posx,posy,size,color,shadow)
{
    ctx.fillStyle = color;
    ctx.shadowColor = shadow;
    // 名前の描写
    ctx.font = size + 'px ' + font ;
    ctx.textBaseline = 'hanging';
    ctx.textAlign = 'left';
    var width = drawChara(name,posx, posy,3);

    var fsize = size/3;
    ctx.font = fsize + 'px ' + font ;
    ctx.textBaseline = 'ideographic';
    ctx.textAlign = 'center';
    if(ctx.measureText(furigana).width > width){
        // ふり仮名の描写
        drawChara(furigana,posx + width/2, posy-size/10,1,width);
    }
    else{
        // ふり仮名の描写
        furigana.split('').forEach(function(val,index,ar){
            drawChara(val,posx + size/4 + (width-size/2) * index/(ar.length-1), posy-size/10,1);
        });
    }
    return new Rect(posx,posy,width,size*1.5);
}
function drawNameFuriganaVertical(name,furigana,posx,posy,size,color,shadow)
{
    ctx.fillStyle = color;
    ctx.shadowColor = shadow;
    // 名前の描写
    ctx.font = size + 'px ' + font ;
    ctx.textBaseline = 'hanging';
    ctx.textAlign = 'left';
    name.split('').forEach(function(val,index,ar){
        drawChara(val,posx, posy+size*index,1);
    });

    ctx.font = size/3 + 'px ' + font ;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    furigana.split('').forEach(function(val,index,ar){
        drawChara(val,posx+size*1.25, posy + (size*name.length-size*0.5) * index/(ar.length-1),1);
    });
    return new Rect(posx,posy,size,size*name.length);
}

function drawChara(text,posx,posy,distance,width){
    for (let i = -distance; i <= distance; i+=1){
        for (let j = -distance; j <= distance; j+=1){
            ctx.shadowOffsetX = i;
            ctx.shadowOffsetY = j;
            ctx.fillText(text, posx , posy, width);
        }
    }
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return ctx.measureText(text).width;
}

function getRect(status,posx,posy,size,labelWidth,valueWidth,margin) {
    return new Rect(posx, posy, 
        size*margin*2 + size*labelWidth + size*0.5 + size*valueWidth, 
        size*margin*3 + size*(1+margin)*(status.length) - size*0.5);
}

// ステータス系の描写
function drawStatus(status,posx,posy,size,color,shadow,labelWidth = 2,valueWidth = 1,margin = 0.25,distance = 0) {
    status.forEach(function(val,index,ar){
        ctx.font = size + 'px ' + font ;
        ctx.fillStyle = color;
        ctx.shadowColor = shadow;
        ctx.textBaseline = 'hanging';
        ctx.textAlign = 'center';
        drawChara(val["label"], 
            posx + size*margin + size*labelWidth/2, 
            posy + size*margin*1.5 + size*(1+margin)*index, 
            distance,size * labelWidth);
        ctx.font = size + 'px ' + font ;
        drawChara(val["value"], 
            posx + size*margin + size*labelWidth + size*0.5 + size*valueWidth/2, 
            posy + size*margin*1.5 + size*(1+margin)*index, 
            distance,size*valueWidth);
    });
    return getRect(status,posx,posy,size,labelWidth,valueWidth,margin);
}


function drawParams(cs,posx,posy,size,color,shadow,window,labelWidth = 2,valueWidth = 1,margin = 0.25,space = 0.25) {
    return drawParamsHorizon(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space);
}
// 技能の描写
function drawParamsVertical(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space) {
    var r = new Rect(posx,posy,0,0);
    cs.forEach(function(val,index,ar){
        var a = getRect( val, r.x+r.w+size*space, r.y, size, labelWidth, valueWidth, margin);
        r = r.extend(a);
        ctx.beginPath();
        ctx.fillStyle = window;
        ctx.fillRect(a.x,a.y,a.w,a.h);
    });
    var r = new Rect(posx,posy,0,0);
    cs.forEach(function(val,index,ar){
        var a = drawStatus( val, r.x+r.w+size*space, r.y, size, color, shadow, labelWidth, valueWidth, margin);
        r = r.extend(a);
    });
    return r;
}
// 技能の描写
function drawParamsHorizon(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space) {
    var r = new Rect(posx,posy,0,0);
    cs.forEach(function(val,index,ar){
        var a = getRect( val, r.x, r.y+r.h+size*space, size, labelWidth, valueWidth, margin);
        r = r.extend(a);
        ctx.beginPath();
        ctx.fillStyle = window;
        ctx.fillRect(a.x,a.y,a.w,a.h);
    });
    var r = new Rect(posx,posy,0,0);
    cs.forEach(function(val,index,ar){
        var a = drawStatus( val, r.x, r.y+r.h+size*space, size, color, shadow, labelWidth, valueWidth, margin);
        r = r.extend(a);
    });
    return r;
}

// 技能の描写
function drawSkills(cs,posx,posy,size,color,shadow,window,labelWidth = 3,valueWidth = 1,margin = 0.25,space = 0.5) {
    if(cs.length<7){
        var r = getRect(cs,posx,posy,size,window,labelWidth,valueWidth,margin);
        ctx.beginPath();
        ctx.fillStyle = window;
        ctx.fillRect(r.x,r.y,r.w,r.h);
        drawStatus(cs,posx,posy,size,color,shadow,labelWidth,valueWidth,margin);
        return r;
    }else{
        cs.length = Math.min(cs.length,20);
        if(cs.length%2!=0) cs.length = cs.length-1;
        var a = getRect(cs.slice(0,cs.length/2),posx,posy,size,labelWidth,valueWidth,margin);
        var b = getRect(cs.slice(cs.length/2),posx+size*space+a.w,posy,size,labelWidth,valueWidth,margin);
        var r = a.extend(b);

        ctx.beginPath();
        ctx.fillStyle = window;
        ctx.fillRect(r.x,r.y,r.w,r.h);

        drawStatus(cs.slice(0,cs.length/2),posx,posy,size,color,shadow,labelWidth,valueWidth,margin);
        drawStatus(cs.slice(cs.length/2),posx+size*space+a.w,posy,size,color,shadow,labelWidth,valueWidth,margin);
        return r;
    }
}

// HP/MPの描写
function drawHub(cs,posx,posy,size,color,shadow,window,margin = 0.25) {
    var width = size * 1.75;
    var r = new Rect(posx,posy,0,width);
    cs.forEach(function(val,index,ar){
        // 円の描写
        ctx.fillStyle = window;
        ctx.beginPath();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.arc(r.x + r.w + width/2, r.y + r.h/2, width/2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = color;
        ctx.shadowColor = shadow;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = size + 'px ' + font ;
        drawChara(val["value"],r.x + r.w + width/2, r.y + r.h/2 + size*0.2, 2, width);
        ctx.font = size/3 + 'px ' + font ;
        drawChara(val["label"],r.x + r.w + width/2, r.y + r.h/2 - size*0.5, 1, width);

        r.w += width + size*margin;
    });
    return r;
}
// #endregion