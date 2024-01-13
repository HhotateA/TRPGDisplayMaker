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
var canvasScale = 3;

$(function() {
    // フォントの読み込み。
    loadFont("soukou","装甲明朝","url(fonts/SoukouMincho-Font/SoukouMincho.ttf)");
    loadFont("LanobePOP","ラノベPOP","url(fonts/LanobePOPv2/LightNovelPOPv2.otf)");
    loadFont("ToronoGlitchSans","瀞ノグリッチ黒体","url(fonts/ToronoGlitchSans/ToronoGlitchSansH2.otf)");
    loadFont("KouzanMouhitu","青柳隷書しも","url(fonts/aoyagireisyosimo/aoyagireisyosimo_otf_2_01.otf)");
    loadFont("misaki8bit","美咲ゴシック(8bit)","url(fonts/misaki8bit/misaki_gothic_2nd.ttf)");
    loadFont("CHIKARA","851チカラヅヨク","url(fonts/851CHIKARA-DZUYOKU/851CHIKARA-DZUYOKU_kanaA_004.ttf)");
    loadFont("akabara-cinderella","赤薔薇シンデレラ","url(fonts/MODI_akabara-cinderella/akabara-cinderella.ttf)");
    // ↑ 新たなフォントはここに追加する。

    loadBackground("https://hhotatea.github.io/TRPGDisplayMaker/imgs/BGSample.jpg");
    draw.resetCanvas(canvasWidth,canvasHeight,canvasScale);
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
            draw.drawBackGroundIO();
            draw.drawCanvas();
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
        // 読み込み内容に合わせての調整。
        var r = drawNameIO();
        nameRect.x += (nameRect.w-r.w)/2;
        $("#namesXInput").val(nameRect.x)
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
// #endregion

// #region drawIO
async function drawCanvas(){
    drawCharadatas();
}
async function reloadCanvas(){
    draw.resetCanvas(canvasWidth,canvasHeight,canvasScale);
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
    draw.resetCanvas(canvasWidth,canvasHeight,canvasScale,$("#bgColor").val());
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
            Number($("#skillsOutline").val()));
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