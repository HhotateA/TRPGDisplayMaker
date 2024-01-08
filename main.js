const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');
const commandFilter = ["正気度ロール","アイデア","幸運","知識","STR × 5","CON × 5","POW × 5","DEX × 5","APP × 5","SIZ × 5","INT × 5","EDU × 5", "クトゥルフ神話"]
font = "arial"
backGround = new Image();

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
    var base64 = canvas.toDataURL("image/png");
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

function resetCanvas(){
    canvas.width = 1200;
    canvas.height = 900;
    canvas.style.width = `400px`;
    canvas.style.height = `300px`;
    ctx.beginPath();
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, 1200, 900);
}

function drawCanvas(){
    resetCanvas();
    const text = $("#jsonInput").val();
    const parsed = JSON.parse(text);
    drawCharadatas(parsed["data"]);
}

async function drawCharadatas(data)
{
    drawBackGround(backGround);
    await drawIconPicture(data["iconUrl"],data["color"]);
    drawName(data["name"],"white");
    drawStatus(data["params"],600,100,40);
    drawSkills(data["commands"],1000,100,40);
}

function drawBackGround(image){
    var cnvsH = 900;
    var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
    if(cnvsW < canvas.width)
    {
        cnvsW = 1200;
        cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
    }
    ctx.drawImage(image, 0, 0, cnvsW, cnvsH);
}

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
            for (let i = -max; i <= max; i+=2){
                for (let j = -max; j <= max; j+=2){
                    ctx.shadowOffsetX = i;
                    ctx.shadowOffsetY = j;
                    ctx.drawImage(image, 0, 0, cnvsW, cnvsH);
                }
            }
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            resolve();
        }
        image.src = url;
    })
}

function drawName(name,shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    var r = /(.*?)\s?[(（](.*?)[)）]/.exec(name);
    console.log(r+";"+name)
    if(r == null) {
        ctx.font = '120px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(name, 450, 800);
    }
    else {
        drawNameFurigana(r[1],r[2])
    }
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawNameFurigana(name,furigana)
{
    name.split('').forEach(function(val,index,ar){
        ctx.font = '120px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val, 100+600*index/(ar.length-1), 850);
    });
    furigana.split('').forEach(function(val,index,ar){
        ctx.font = '40px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val, 100+600*index/(ar.length-1), 700);
    });
}

function drawStatus(status,posx,posy,size) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(" + [255, 255, 255, 0.3] + ")";
    ctx.fillRect(posx-size*1.5, posy-size*1.25, size*1.25*2+size*3, size*1.25*(status.length-1)+size*1.5);

    status.forEach(function(val,index,ar){
        ctx.font = size + 'px ' + font ;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val["label"], posx, posy+size*1.25*index);
        ctx.fillText(val["value"], posx+size*1.25*2, posy+size*1.25*index);
    });
}

function drawSkills(command,posx,posy,size) {
    var cs = command.match(/\nCCB?<=(\d+) 【(.*?)】\n/g).map(item =>{
        var r = /\nCCB?<=(\d+) 【(.*?)】\n/g.exec(item);
        return {"label":r[2],"value":r[1]};
    }).filter(item=>{
        // フィルターに一致する項目は排除
        return commandFilter.every(f => f != item["label"]);
    }).sort(function(a,b){
        if(a["value"] < b["value"]) return 1;
        if(a["value"] > b["value"]) return -1;
        return 0;
    });
    cs.length = Math.min(cs.length,17);

    drawStatus(cs,posx,posy,size)
}