// #region class
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
// #endregion

// #region initialize
const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');
const commandFilter = ["正気度ロール","アイデア","幸運","知識","STR × 5","CON × 5","POW × 5","DEX × 5","APP × 5","SIZ × 5","INT × 5","EDU × 5", "クトゥルフ神話"]
font = "arial"
backGround = new Image();
iconImage = new Image();

statusRect = new Rect(50,450,1,1)
skillsRect = new Rect(700,100,1,1)
nameRect = new Rect(500,700,1,1)
iconRect = new Rect(0,0,1,1)
canvasScale = 3;

$(function() {
    loadFont("soukou","装甲明朝","url(fonts/SoukouMincho-Font/SoukouMincho.ttf)");
    loadFont("LanobePOP","ラノベPOP","url(fonts/LanobePOPv2/LightNovelPOPv2.otf)");
    loadFont("ToronoGlitchSans","瀞ノグリッチ黒体","url(fonts/ToronoGlitchSans/ToronoGlitchSansH2.otf)");
    loadFont("akabara","赤薔薇シンデレラ","url(fonts/MODI_akabara-cinderella/akabara-cinderella.ttf)");
    resetCanvas();
});

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
            drawBackGround(backGround);
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
    var [name,furigana] = perseNameFurigana(data["name"]);
    var skills = perseSkills(data["commands"]);
    var params = data["params"];
    $("#nameInput").val(name);
    $("#furiganaInput").val(furigana);
    $("#skillsInput").val(JSON.stringify(skills));
    $("#statusInput").val(JSON.stringify(params));
    await getIconPicture(data["iconUrl"])
}

function perseSkills(command) {
    var cs = command.match(/^CCB?<=(\d+) 【(.*?)】$/gm).map(item =>{
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
    return cs;
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
    iconImage = new Image();
    return new Promise(resolve =>{
        iconImage.onload = function() {
            resolve();
        }
        iconImage.crossOrigin = "anonymous";
        iconImage.src = url;
    })
}
// #endregion

// #region touch
grabFlg = 0;
grabRelativeX = 0
grabRelativeY = 0

$("#preview").mousedown(function(e){
    if(grabFlg != 0) return;
    var pos = [e.offsetX*canvasScale,e.offsetY*canvasScale];
    if(statusRect.contain(pos[0],pos[1]) && $("#statusToggle").prop('checked')){
        grabFlg = 1;
        [grabRelativeX,grabRelativeY] = statusRect.pos(pos[0],pos[1]);
    }else if(skillsRect.contain(pos[0],pos[1]) && $("#skillsToggle").prop('checked')){
        grabFlg = 2;
        [grabRelativeX,grabRelativeY] = skillsRect.pos(pos[0],pos[1]);
    }else if(nameRect.contain(pos[0],pos[1]) && $("#namesToggle").prop('checked')){
        grabFlg = 3;
        [grabRelativeX,grabRelativeY] = nameRect.pos(pos[0],pos[1]);
    }else if(iconRect.contain(pos[0],pos[1]) && $("#iconToggle").prop('checked')){
        grabFlg = 4;
        [grabRelativeX,grabRelativeY] = iconRect.pos(pos[0],pos[1]);
    }
}).mouseup(function(e){
    grabFlg = 0; // マウス押下終了
    drawCanvas();
}).mousemove(function(e){
    var pos = [e.offsetX*canvasScale,e.offsetY*canvasScale];
    switch(grabFlg){
        case 0:
            break;
        case 1:
            $("#statusXInput").val(pos[0]-grabRelativeX);
            $("#statusYInput").val(pos[1]-grabRelativeY);
            statusRect = drawStatusIO();
            break;
        case 2:
            $("#skillsXInput").val(pos[0]-grabRelativeX);
            $("#skillsYInput").val(pos[1]-grabRelativeY);
            skillsRect = drawSkillsIO();
            break;
        case 3:
            $("#namesXInput").val(pos[0]-grabRelativeX);
            $("#namesYInput").val(pos[1]-grabRelativeY);
            nameRect = drawNameIO();
            break;
        case 4:
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
    resetCanvas();
    drawCharadatas();
}
async function reloadCanvas(){
    resetCanvas();
    await getData();
    drawCharadatas();
}
function drawCharadatas(){
    drawBackGroundIO();
    iconRect = drawIconIO();
    nameRect = drawNameIO();
    statusRect = drawStatusIO();
    skillsRect = drawSkillsIO();
}
function drawBackGroundIO(){
    drawBackGround(backGround);
}
function drawNameIO(){
    if($("#namesToggle").prop('checked'))
    {
        return drawNameFurigana($("#nameInput").val(),$("#furiganaInput").val(),
            Number($("#namesXInput").val()),
            Number($("#namesYInput").val()),
            Number($("#namesSizeInput").val()));
    }
    return new Rect(0,0,1,1);
}
function drawStatusIO(){
    if($("#statusToggle").prop('checked'))
    {
        return drawStatus(JSON.parse($("#statusInput").val()),
            Number($("#statusXInput").val()),
            Number($("#statusYInput").val()),
            Number($("#statusSizeInput").val()));
    }
    return new Rect(0,0,1,1);
}
function drawSkillsIO(){
    if($("#skillsToggle").prop('checked'))
    {
        return drawSkills(JSON.parse($("#skillsInput").val()),
            Number($("#skillsXInput").val()),
            Number($("#skillsYInput").val()),
            Number($("#skillsSizeInput").val()));
    }
    return new Rect(0,0,1,1);
}
function drawIconIO(){
    if($("#iconToggle").prop('checked'))
    {
        return drawIconPicture(iconImage,
            Number($("#iconXInput").val()),
            Number($("#iconYInput").val()),
            Number($("#iconSizeInput").val()),"white");
    }
    return new Rect(0,0,1,1);
}
// #endregion

// #region drawFunc
function resetCanvas(){
    canvas.width = 1200;
    canvas.height = 900;
    canvas.style.width = canvas.width/canvasScale+`px`;
    canvas.style.height = canvas.height/canvasScale+`px`;
    ctx.beginPath();
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, 1200, 900);
}
// 背景画像の描写
function drawBackGround(image){
    var cnvsH = 900;
    var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
    if(cnvsW < canvas.width)
    {
        cnvsW = 1200;
        cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
    }
    ctx.drawImage(image, (1200-cnvsW)/2, (900-cnvsH)/2, cnvsW, cnvsH);
}

// キャラクター立ち絵の描写
function drawIconPicture(image,posx,posy,size,shadow){
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
    // 影を一様に入れる処理（重いので一時無効）
    var max = 20
    /*for (let i = -max; i <= max; i+=2){
        for (let j = -max; j <= max; j+=2){
            ctx.shadowOffsetX = i;
            ctx.shadowOffsetY = j;
            ctx.drawImage(image, 0, 0, cnvsW, cnvsH);
        }
    }*/
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return new Rect(posx, posy, cnvsW*(size/100), cnvsH*(size/100));
}

// ふり仮名と名前の描写
function drawNameFurigana(name,furigana,posx,posy,size,shadow)
{
    if(name.length == 1)
    {
        drawText(name,font,size,posx + size/2, posy+size*1.5,'#000',shadow,3);
        // ふり仮名の描写
        furigana.split('').forEach(function(val,index,ar){
            drawText(val,font,size/3,posx + name.length*size * index/(ar.length-1), posy+size*0.5,'#000',shadow,1);
        });
        return new Rect(posx,posy,size,size*1.5);
    }
    // 名前の描写
    name.split('').forEach(function(val,index,ar){
        drawText(val,font,size,posx + size/2 + name.length*size * index/(ar.length-1), posy+size*1.5,'#000',shadow,3);
    });
    // ふり仮名の描写
    furigana.split('').forEach(function(val,index,ar){
        drawText(val,font,size/3,posx + size/2 + name.length*size * index/(ar.length-1), posy+size*0.5,'#000',shadow,1);
    });
    return new Rect(posx,posy,size*(name.length+1),size*1.5);
}

function drawText(text,font,size,posx,posy,color,shadow,distance){
    ctx.font = size + 'px ' + font ;
    ctx.fillStyle = color;
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    for (let i = -distance; i <= distance; i+=1){
        for (let j = -distance; j <= distance; j+=1){
            ctx.shadowColor = shadow;
            ctx.shadowOffsetX = i;
            ctx.shadowOffsetY = j;
            ctx.fillText(text, posx , posy);
        }
    }
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// ステータス系の描写
function drawStatus(status,posx,posy,size,window = "rgba(" + [255, 255, 255, 0.3] + ")",labelWidth = 2,valueWidth = 1,margin = 0.25) {
    ctx.beginPath();
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    ctx.fillStyle = window;
    var r = new Rect(posx, posy, 
        size*margin + size*labelWidth + size*0.5 + size*valueWidth + size*margin, 
        size*margin + size*0.25 + size*(1+margin)*status.length);
    ctx.fillRect(r.x,r.y,r.w,r.h);

    status.forEach(function(val,index,ar){
        ctx.font = size + 'px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val["label"], 
            posx + size*margin + size*labelWidth/2, 
            posy + size*margin + size*1 + size*(1+margin)*index, size*labelWidth);
        ctx.font = size + 'px ' + font ;
        ctx.fillText(val["value"], 
            posx + size*margin + size*labelWidth + size*0.5 + size*valueWidth/2, 
            posy + size*margin + size*1 + size*(1+margin)*index, size*valueWidth);
    });
    return r;
}

// 技能の描写
function drawSkills(cs,posx,posy,size,window = "rgba(" + [255, 255, 255, 0.3] + ")",labelWidth = 3,valueWidth = 1,margin = 0.25,space = 0.5) {
    if(cs.length<7){
        return drawStatus(cs,posx,posy,size,window,labelWidth,valueWidth,margin)
    }else{
        cs.length = Math.min(cs.length,20);
        if(cs.length%2==0) cs.length = cs.length-1;
        var a = drawStatus(cs.slice(0,cs.length/2),posx,posy,size,window,labelWidth,valueWidth,margin);
        ctx.beginPath();
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillStyle = window;
        ctx.fillRect(a.x+a.w,a.y,size*space,a.h);
        var b = drawStatus(cs.slice(cs.length/2+1,cs.length),posx+size*space+a.w,posy,size,window,labelWidth,valueWidth,margin);
        return a.extend(b);
    }
}
// #endregion