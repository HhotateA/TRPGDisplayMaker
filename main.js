const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');
const commandFilter = ["正気度ロール","アイデア","幸運","知識","STR × 5","CON × 5","POW × 5","DEX × 5","APP × 5","SIZ × 5","INT × 5","EDU × 5", "クトゥルフ神話"]
font = "arial"
backGround = new Image();

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

$('#fontSelect').change(function() {
    font = $('option:selected').val();
    drawCanvas();
})

$('#loadButton').click(function(){
    drawCanvas();
});

$('#download').click(function(){
    var base64 = canvas.toDataURL();
    document.getElementById("download").href = base64;
});

$('#imageInput').change(function(){
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
        }
    }
    fr.readAsDataURL(file);
});

statusRect = new Rect(50,450,1,1)
skillsRect = new Rect(700,100,1,1)
nameRect = new Rect(500,700,1,1)
grabFlg = 0;
grabRelativeX = 0
grabRelativeY = 0
canvasScale = 3;

$("#preview").mousedown(function(e){
    if(grabFlg != 0) return;
    var pos = [e.offsetX*canvasScale,e.offsetY*canvasScale];
    if(statusRect.contain(pos[0],pos[1]) && $("#statusToggle").prop('checked')){
        grabFlg = 1;
        [grabRelativeX,grabRelativeY] = statusRect.pos(pos[0],pos[1]);
    }else if(skillsRect.contain(pos[0],pos[1])){
        grabFlg = 2;
        [grabRelativeX,grabRelativeY] = skillsRect.pos(pos[0],pos[1]);
    }else if(nameRect.contain(pos[0],pos[1])){
        grabFlg = 3;
        [grabRelativeX,grabRelativeY] = nameRect.pos(pos[0],pos[1]);
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
            statusRect.x = pos[0]-grabRelativeX;
            statusRect.y = pos[1]-grabRelativeY;
            statusRect = drawStatus(getData()["params"],statusRect.x,statusRect.y,40);
            statusRect.copyTo($("#statusXInput"),$("#statusYInput"));
            break;
        case 2:
            skillsRect.x = pos[0]-grabRelativeX;
            skillsRect.y = pos[1]-grabRelativeY;
            skillsRect = drawSkills(getData()["commands"],skillsRect.x,skillsRect.y,40);
            break;
        case 3:
            nameRect.x = pos[0]-grabRelativeX;
            nameRect.y = pos[1]-grabRelativeY;
            nameRect = drawName(getData()["name"],"white",nameRect.x,nameRect.y,120);
            break;
    }
});
canvas.addEventListener('touchstart',function(e){
    if(grabFlg != 0) return;
    var pos = [e.changedTouches[0].clientX*canvasScale,e.changedTouches[0].clientY*canvasScale];
    if(statusRect.contain(pos[0],pos[1])){
        e.preventDefault();
        grabFlg = 1;
        [grabRelativeX,grabRelativeY] = statusRect.pos(pos[0],pos[1]);
    }else if(skillsRect.contain(pos[0],pos[1])){
        e.preventDefault();
        grabFlg = 2;
        [grabRelativeX,grabRelativeY] = skillsRect.pos(pos[0],pos[1]);
    }
});
canvas.addEventListener('touchend',function(e){
    if(e.changedTouches.length != 0) return;
    grabFlg = 0; // マウス押下終了
    drawCanvas();
});
canvas.addEventListener('touchmove',function(e){
    var pos = [e.changedTouches[0].clientX*canvasScale,e.changedTouches[0].clientY*canvasScale];
    switch(grabFlg){
        case 0:
            break;
        case 1:
            e.preventDefault();
            statusRect.x = pos[0]-grabRelativeX;
            statusRect.y = pos[1]-grabRelativeY;
            statusRect = drawStatus(getData()["params"],statusRect.x,statusRect.y,40);
            break;
        case 2:
            e.preventDefault();
            skillsRect.x = pos[0]-grabRelativeX;
            skillsRect.y = pos[1]-grabRelativeY;
            skillsRect = drawSkills(getData()["commands"],skillsRect.x,skillsRect.y,40);
            break;
    }
});

function resetCanvas(){
    canvas.width = 1200;
    canvas.height = 900;
    canvas.style.width = canvas.width/canvasScale+`px`;
    canvas.style.height = canvas.height/canvasScale+`px`;
    ctx.beginPath();
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, 1200, 900);
}

function drawCanvas(){
    resetCanvas();
    data = getData();
    drawCharadatas(data);
}

// 入力された文字列をJsonに分解
function getData(){
    const text = $("#jsonInput").val();
    const parsed = JSON.parse(text);
    return parsed["data"];
}

// キャラクターデータを一括で描写する
async function drawCharadatas(data){
    drawBackGround(backGround);
    await drawIconPicture(data["iconUrl"],data["color"]);
    nameRect = drawName(data["name"],"white",nameRect.x,nameRect.y,120);
    statusRect = drawStatus(data["params"],statusRect.x,statusRect.y,40);
    skillsRect = drawSkills(data["commands"],skillsRect.x,skillsRect.y,40);
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
async function drawIconPicture(url,shadow){
    var image = new Image();
    return new Promise(resolve =>{
        image.onload = function() {
            var cnvsH = 900;
            var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
            if(cnvsW > canvas.width)
            {
                cnvsW = 1200;
                cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
            }
            ctx.shadowColor = shadow;
            var max = 20
            ctx.shadowOffsetX = 15;
            ctx.shadowOffsetY = 15;
            ctx.drawImage(image, 0, 0, cnvsW, cnvsH);
            // 影を一様に入れる処理（重いので一時無効）
            /*for (let i = -max; i <= max; i+=2){
                for (let j = -max; j <= max; j+=2){
                    ctx.shadowOffsetX = i;
                    ctx.shadowOffsetY = j;
                    ctx.drawImage(image, 0, 0, cnvsW, cnvsH);
                }
            }*/
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            resolve();
        }
        image.crossOrigin = "anonymous";
        image.src = url;
    })
}

// 名前の描写
function drawName(name,shadow,posx,posy,size) {
    ctx.shadowColor = shadow;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    var r = /(.*?)\s?[(（](.*?)[)）]/.exec(name);
    if(r != null) {
        // ふり仮名があった場合
        return drawNameFurigana(r[1],r[2],posx,posy,size)
    }
    // ふり仮名がなかった場合、このまま描写
    ctx.font = size + 'px ' + font ;
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    ctx.fillText(name, posx, posy);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return new Rect(posx,posy,size*name.length,size);
}

// ふり仮名と名前の描写
function drawNameFurigana(name,furigana,posx,posy,size)
{
    // 名前の描写
    name.split('').forEach(function(val,index,ar){
        ctx.font = size + 'px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val, posx + name.length*size * index/(ar.length-1), posy+size);
    });

    // ふり仮名の描写
    furigana.split('').forEach(function(val,index,ar){
        ctx.font = size/3 + 'px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val, posx + name.length*size * index/(ar.length-1), posy);
    });
    return new Rect(posx,posy,size*name.length,size);
}

// ステータス系の描写
function drawStatus(status,posx,posy,size) {
    ctx.beginPath();
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    ctx.fillStyle = "rgba(" + [255, 255, 255, 0.3] + ")";
    ctx.fillRect(posx, posy, size*1.25*2+size*3, size*1.25*(status.length-1)+size*1.5);

    status.forEach(function(val,index,ar){
        ctx.font = size + 'px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val["label"], posx+size*1.5, posy+size*1.25+size*1.25*index, size*2.5);
        ctx.font = size + 'px ' + font ;
        ctx.fillText(val["value"], posx+size*1.5+size*1.25*2, posy+size*1.25+size*1.25*index);
    });
    return new Rect(posx, posy, size*1.25*2+size*3, size*1.25*(status.length-1)+size*1.5);
}

// 技能コマンドの分解
function drawSkills(command,posx,posy,size) {
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

    if(cs.length<7){
        return drawStatus(cs,posx,posy,size)
    }else{
        cs.length = Math.min(cs.length,20);
        if(cs.length%2==0) cs.length = cs.length-1;
        var a = drawStatus(cs.slice(0,cs.length/2),posx,posy,size);
        var b = drawStatus(cs.slice(cs.length/2+1,cs.length),posx+size*5.5,posy,size);
        return a.extend(b);
    }

}