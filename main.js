const canvas = document.getElementById("preview");
const ctx = canvas.getContext('2d');

$(function() {
    loadFont();
    canvas.width = 1200;
    canvas.height = 900;
    canvas.style.width = `400px`;
    canvas.style.height = `300px`;
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = 'red';
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
    drawName(parsed["data"]["name"]);
})

function drawName(name) {
    ctx.font = '100px soukou';
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'center';
    ctx.textAlign = 'center';
    ctx.fillText(name, 300, 300);
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
})