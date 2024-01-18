// #region initialize
const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');
var draw = new DrawCanvas(canvas,ctx);

// グローバル変数群
var backGround = new Image();
var iconImage = new Image();
var statusRect = new Rect(50,450,1,1);
var hudRect = new Rect(50,450,1,1);
var skillsRect = new Rect(700,100,1,1);
var nameRect = new Rect(800,725,1,1);
var iconRect = new Rect(0,0,1,1);
var canvasWidth = 1200;
var canvasHeight = 900;
var canvasScale = 1;

$(function() {
    // フォントの読み込み。
    loadFont("soukou","装甲明朝","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/SoukouMincho-Font/SoukouMincho.ttf)");
    loadFont("LanobePOP","ラノベPOP","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/LanobePOPv2/LightNovelPOPv2.otf)");
    loadFont("ToronoGlitchSans","瀞ノグリッチ黒体","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/ToronoGlitchSans/ToronoGlitchSansH2.otf)");
    loadFont("KouzanMouhitu","青柳隷書しも","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/aoyagireisyosimo/aoyagireisyosimo_otf_2_01.otf)");
    loadFont("misaki8bit","美咲ゴシック(8bit)","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/misaki8bit/misaki_gothic_2nd.ttf)");
    loadFont("CHIKARA","851チカラヅヨク","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/851CHIKARA-DZUYOKU/851CHIKARA-DZUYOKU_kanaA_004.ttf)");
    loadFont("akabara-cinderella","赤薔薇シンデレラ","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/MODI_akabara-cinderella/akabara-cinderella.ttf)");
    loadFont("TachibanaFont","たちばなフォント","url(https://hhotatea.github.io/TRPGDisplayMaker/releases/fonts/TachibanaFont/TachibanaFont2024.ttf)");
    // ↑ 新たなフォントはここに追加する。

    loadBackground("https://hhotatea.github.io/TRPGDisplayMaker/imgs/BGSample.jpg");
    resizeCanvas();
    draw.resetCanvas(canvasWidth,canvasHeight);
});

async function loadBackground(url) {
    // 初期背景画像の読み込み
    backGround = await getIconPicture(url);
}

async function loadFont(id,name,url){
    var font = new FontFace(id,url);
    font.load().then(function (fs) {
        document.fonts.add(fs);
        $("#fontSelect").append('<option value="'+id+'"> <font face="'+id+'">'+name+'</font> </option>');
    });
}
// #endregion

// #region input
$('#fontSelect').change(function() {
    var font = $('option:selected').val();
    draw.setFont(font);
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

$(window).resize(function(){
    resizeCanvas();
});
function resizeCanvas(){
    if(document.documentElement.clientWidth > 925){
        var a = canvasWidth/(document.documentElement.clientWidth-525);
        var b = canvasHeight/(document.documentElement.clientHeight*0.75);
        canvasScale = Math.max(a,b);
    }else{
        canvasScale = canvasWidth/(document.documentElement.clientWidth-50);
    }
    canvas.style.width = canvasWidth/canvasScale+`px`;
    canvas.style.height = canvasHeight/canvasScale+`px`;
}
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
// #endregion

// #region touch
// これもグローバル変数だけど、このブロックでしか使わないのでここに配置。
var grabFlg = 0;
var grabRelativeX = 0
var grabRelativeY = 0
canvas.addEventListener("mousedown",e => {
    if(grabFlg != 0) return;
    canvasDown(e.offsetX*canvasScale,e.offsetY*canvasScale);
});
canvas.addEventListener("mouseup",e => {
    if(grabFlg == 0) return;
    canvasUp();
});
canvas.addEventListener("mousemove",e => {
    if(grabFlg == 0) return;
    canvasMove(e.offsetX*canvasScale,e.offsetY*canvasScale);
});
canvas.addEventListener("touchstart",e => {
    if(grabFlg != 0) return;
    e.preventDefault();
    var touches = e.changedTouches;
    var r = e.target.getBoundingClientRect();
    var offsetX = (touches[0].pageX - r.left); 
    var offsetY = (touches[0].pageY - r.top);
    canvasDown(offsetX*canvasScale,offsetY*canvasScale);
});
canvas.addEventListener("touchend",e => {
    if(grabFlg == 0) return;
    canvasUp();
});
canvas.addEventListener("touchcancel",e => {
    if(grabFlg == 0) return;
    canvasUp();
});
canvas.addEventListener("touchmove",e => {
    if(grabFlg == 0) return;
    e.preventDefault();
    var touches = e.changedTouches;
    var r = e.target.getBoundingClientRect();
    var offsetX = (touches[0].pageX - r.left); 
    var offsetY = (touches[0].pageY - r.top);
    canvasMove(offsetX*canvasScale,offsetY*canvasScale);
});

function canvasDown(posx,posy) {
    if(nameRect.contain(posx,posy) && $("#namesToggle").prop('checked')){
        grabFlg = 1;
        [grabRelativeX,grabRelativeY] = nameRect.pos(posx,posy);
    }else if(hudRect.contain(posx,posy) && $("#hudToggle").prop('checked')){
        grabFlg = 2;
        [grabRelativeX,grabRelativeY] = hudRect.pos(posx,posy);
    }else if(statusRect.contain(posx,posy) && $("#statusToggle").prop('checked')){
        grabFlg = 3;
        [grabRelativeX,grabRelativeY] = statusRect.pos(posx,posy);
    }else if(skillsRect.contain(posx,posy) && $("#skillsToggle").prop('checked')){
        grabFlg = 4;
        [grabRelativeX,grabRelativeY] = skillsRect.pos(posx,posy);
    }else if(iconRect.contain(posx,posy) && $("#iconToggle").prop('checked')){
        grabFlg = 5;
        [grabRelativeX,grabRelativeY] = iconRect.pos(posx,posy);
    }
}
function canvasUp() {
    grabFlg = 0;
    drawCanvas();
}
function canvasMove(posx,posy) {
    switch(grabFlg){
        case 0:
            break;
        case 1:
            $("#namesXInput").val(posx-grabRelativeX);
            $("#namesYInput").val(posy-grabRelativeY);
            nameRect = drawNameIO();
            break;
        case 2:
            $("#hudXInput").val(posx-grabRelativeX);
            $("#hudYInput").val(posy-grabRelativeY);
            hudRect = drawHudIO();
            break;
        case 3:
            $("#statusXInput").val(posx-grabRelativeX);
            $("#statusYInput").val(posy-grabRelativeY);
            statusRect = drawStatusIO();
            break;
        case 4:
            $("#skillsXInput").val(posx-grabRelativeX);
            $("#skillsYInput").val(posy-grabRelativeY);
            skillsRect = drawSkillsIO();
            break;
        case 5:
            $("#iconXInput").val(posx-grabRelativeX);
            $("#iconYInput").val(posy-grabRelativeY);
            iconRect = drawIconIO();
            break;
    }
}
// #endregion

// #region randomSet
function randomLayout(){
    var op = $('#fontSelect').children();
    var opv = op.eq(Math.ceil( Math.random() * (op.length-1) )).val();
    switch(Math.floor(Math.random()*5)){
        case 0:
            $('#fontSelect').val(opv).change();
            $("#iconXInput").val(0);
            $("#iconYInput").val(0);
            $("#iconSizeInput").val(100);
            $("#statusXInput").val(25);
            $("#statusYInput").val(300);
            $("#statusSizeInput").val(40);
            $("#skillsXInput").val(725);
            $("#skillsYInput").val(50);
            $("#skillsSizeInput").val(40);
            $("#hudXInput").val(70);
            $("#hudYInput").val(775);
            $("#hudSizeInput").val(60);
            $("#namesXInput").val(800-drawNameIO().w/2);
            $("#namesYInput").val(725);
            $("#namesSizeInput").val(150);
            break;
        case 1:
            $('#fontSelect').val(opv).change();
            $("#iconXInput").val(canvas.width-drawIconIO().w);
            $("#iconYInput").val(0);
            $("#iconSizeInput").val(100);
            $("#statusXInput").val(1025);
            $("#statusYInput").val(325);
            $("#statusSizeInput").val(40);
            $("#skillsXInput").val(70);
            $("#skillsYInput").val(70);
            $("#skillsSizeInput").val(40);
            $("#hudXInput").val(775);
            $("#hudYInput").val(775);
            $("#hudSizeInput").val(60);
            $("#namesXInput").val(25);
            $("#namesYInput").val(725);
            $("#namesSizeInput").val(150);
            break;
        case 2:
            $('#fontSelect').val(opv).change();
            $("#iconXInput").val(canvas.width/2-drawIconIO().w/2);
            $("#iconYInput").val(0);
            $("#iconSizeInput").val(100);
            $("#statusXInput").val(850);
            $("#statusYInput").val(75);
            $("#statusSizeInput").val(40);
            $("#skillsXInput").val(35);
            $("#skillsYInput").val(450);
            $("#skillsSizeInput").val(40);
            $("#hudXInput").val(825);
            $("#hudYInput").val(775);
            $("#hudSizeInput").val(60);
            $("#namesXInput").val(500);
            $("#namesYInput").val(600);
            $("#namesSizeInput").val(150);
            break;
        case 3:
            $('#fontSelect').val(opv).change();
            $("#iconXInput").val(canvas.width-drawIconIO().w);
            $("#iconYInput").val(0);
            $("#iconSizeInput").val(100);
            $("#statusXInput").val(75);
            $("#statusYInput").val(400);
            $("#statusSizeInput").val(40);
            $("#skillsXInput").val(300);
            $("#skillsYInput").val(450);
            $("#skillsSizeInput").val(40);
            $("#hudXInput").val(800);
            $("#hudYInput").val(775);
            $("#hudSizeInput").val(60);
            $("#namesXInput").val(375-drawNameIO().w/2);
            $("#namesYInput").val(175);
            $("#namesSizeInput").val(150);
            break;
        case 3:
            $('#fontSelect').val(opv).change();
            $("#iconXInput").val(0);
            $("#iconYInput").val(0);
            $("#iconSizeInput").val(100);
            $("#statusXInput").val(50);
            $("#statusYInput").val(450);
            $("#statusSizeInput").val(40);
            $("#skillsXInput").val(775);
            $("#skillsYInput").val(450);
            $("#skillsSizeInput").val(40);
            $("#hudXInput").val(350);
            $("#hudYInput").val(750);
            $("#hudSizeInput").val(60);
            $("#namesXInput").val(850-drawNameIO().w/2);
            $("#namesYInput").val(200);
            $("#namesSizeInput").val(150);
            break;
    }
}
// #endregion

// #region drawIO
async function drawCanvas(){
    drawCharadatas();
}
async function reloadCanvas(){
    draw.resetCanvas(canvasWidth,canvasHeight);
    await getData();
    randomLayout();
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
    draw.resetCanvas(canvasWidth,canvasHeight,$("#bgColor").val());
    if($("#bgToggle").prop('checked')){
        draw.drawBackGround(backGround,
            Number($("#bgXInput").val()),
            Number($("#bgYInput").val()),
            Number($("#bgSizeInput").val()));
    }
}
function drawNameIO(){
    if($("#namesToggle").prop('checked')){
        return draw.drawNameFurigana($("#nameInput").val(),$("#furiganaInput").val(),
            Number($("#namesXInput").val()),
            Number($("#namesYInput").val()),
            Number($("#namesSizeInput").val()),
            $("#nameTextColor").val(),
            $("#nameShadowColor").val(),
            Number($("#nameOutline").val()));
    }
    return new Rect(0,0,1,1);
}
function drawStatusIO(){
    if($("#statusToggle").prop('checked')){
        return draw.drawParams(JSON.parse($("#statusInput").val()),
            Number($("#statusXInput").val()),
            Number($("#statusYInput").val()),
            Number($("#statusSizeInput").val()),
            $("#statusTextColor").val(),
            $("#statusShadowColor").val(),
            colorcode2rgb($("#statusWindowColor").val(),$("#statusWindowAlpha").val()),
            Number($("#statusLabelWidth").val()),
            Number($("#statusValuelWidth").val()),
            Number($("#statusMargin").val()),
            Number($("#statusOutline").val()));
    }
    return new Rect(0,0,1,1);
}
function drawHudIO(){
    if($("#hudToggle").prop('checked')){
        return draw.drawHub(JSON.parse($("#hudInput").val()),
            Number($("#hudXInput").val()),
            Number($("#hudYInput").val()),
            Number($("#hudSizeInput").val()),
            $("#hudTextColor").val(),
            $("#hudShadowColor").val(),
            colorcode2rgb($("#hudWindowColor").val(),$("#hudWindowAlpha").val()),
            0.25,Number($("#hudOutline").val()));
    }
    return new Rect(0,0,1,1);
}
function drawSkillsIO(){
    if($("#skillsToggle").prop('checked')){
        return draw.drawSkills(JSON.parse($("#skillsInput").val()),
            Number($("#skillsXInput").val()),
            Number($("#skillsYInput").val()),
            Number($("#skillsSizeInput").val()),
            $("#skillsTextColor").val(),
            $("#skillsShadowColor").val(),
            colorcode2rgb($("#skillsWindowColor").val(),$("#skillsWindowAlpha").val()),
            Number($("#skillsLabelWidth").val()),
            Number($("#skillsValuelWidth").val()),
            Number($("#skillsMargin").val()),
            Number($("#skillsSpace").val()),
            Number($("#skillsOutline").val()),
            Number($("#skillsColumnsInput").val()),
            Number($("#skillsRowsInput").val()));
    }
    return new Rect(0,0,1,1);
}
function drawIconIO(){
    if($("#iconToggle").prop('checked')){
        return draw.drawIconPicture(iconImage,
            Number($("#iconXInput").val()),
            Number($("#iconYInput").val()),
            Number($("#iconSizeInput").val()),
            $("#iconShadowColor").val(),
            Number($("#iconOutline").val()));
    }
    return new Rect(0,0,1,1);
}
// #endregion