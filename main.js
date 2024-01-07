const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');
const commandFilter = ["正気度ロール","アイデア","幸運","知識","STR × 5","CON × 5","POW × 5","DEX × 5","APP × 5","SIZ × 5","INT × 5","EDU × 5", "クトゥルフ神話"]

$(function() {
    loadFont();
    canvas.width = 1200;
    canvas.height = 900;
    canvas.style.width = `400px`;
    canvas.style.height = `300px`;
    ctx.fillStyle = '#ccc';
    ctx.rect(0, 0, 1200, 900);
    ctx.fill();
    ctx.stroke();
});

async function loadFont(){
    let font = new FontFace("soukou", "url(fonts/SoukouMincho.ttf)");
    await font.load();
    document.fonts.add(font);
}

$('#loadButton').click(function(){
    const text = $("#jsonInput").val();
    const parsed = JSON.parse(text);
    $("#nameInput").val(parsed["data"]["name"]);
    drawCharadatas(parsed["data"]);
});

async function drawCharadatas(data)
{
    await drawIconPicture(data["iconUrl"],data["color"]);
    drawName(data["name"],"white");
    drawStatus(data["params"]);
    drawSkills(data["commands"]);
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

    var r = /^(.*) [(（](.*)[)）]$/.exec(name);
    console.log(r+";"+name)
    if(r == null) {
        ctx.font = '120px soukou';
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
    console.log(name+":"+furigana)
    name.split('').forEach(function(val,index,ar){
        ctx.font = '120px soukou';
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val, 100+600*index/(ar.length-1), 850);
    });
    furigana.split('').forEach(function(val,index,ar){
        ctx.font = '40px soukou';
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(val, 100+600*index/(ar.length-1), 700);
    });
}

function drawStatus(status) {
    ctx.font = '40px soukou';
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    status.forEach(function(val,index,ar){
        ctx.fillText(val["label"], 600, 100+50*index);
        ctx.fillText(val["value"], 700, 100+50*index);
    });
}

function drawSkills(command) {
    ctx.font = '40px soukou';
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
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
    cs.forEach(function(val,index,ar){
        ctx.fillText(val["label"], 1000, 100+50*index);
        ctx.fillText(val["value"], 1100, 100+50*index);
    });
}

$('#imageInput').change(function(){
    if (!this.files.length) {
        alert('File Not Selected');
        return;
    }
    var file = this.files[0];
    var image = new Image();
    var fr = new FileReader();
    fr.onload = function(evt) {
        image.src = evt.target.result;
        image.onload = function() {
            var cnvsH = 900;
            var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
            if(cnvsW < canvas.width)
            {
                cnvsW = 1200;
                cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
            }
            ctx.drawImage(image, 0, 0, cnvsW, cnvsH);
        }
    }
    fr.readAsDataURL(file);
});