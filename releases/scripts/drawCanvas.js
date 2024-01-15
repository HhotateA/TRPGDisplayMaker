class DrawCanvas {
    constructor(canvas,ctx){
        this.canvas = canvas;
        this.ctx = ctx;
        this.font = "arial";
    }

    setFont(font){
        this.font = font;
    }

    drawChara(text,posx,posy,distance,width){
        this.ctx.shadowBlur = 0;
        for (let i = -distance; i <= distance; i+=1){
            for (let j = -distance; j <= distance; j+=1){
                this.ctx.shadowOffsetX = i;
                this.ctx.shadowOffsetY = j;
                this.ctx.fillText(text, posx , posy, width);
            }
        }
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        return this.ctx.measureText(text).width;
    }
    
    getRect(length,posx,posy,size,labelWidth,valueWidth,margin) {
        return new Rect(posx, posy, 
            size*margin*2 + size*labelWidth + size*0.5 + size*valueWidth, 
            size*margin*3 + size*(1+margin)*(length) - size*0.5);
    }

    // ステータス系の描写
    drawStatus(status,posx,posy,size,color,shadow,labelWidth = 2,valueWidth = 1,margin = 0.25,distance = 0) {
        status.forEach(function(val,index,ar){
            this.ctx.font = size + 'px ' + this.font;
            this.ctx.fillStyle = color;
            this.ctx.shadowColor = shadow;
            this.ctx.textBaseline = 'hanging';
            this.ctx.textAlign = 'center';
            this.drawChara(val["label"], 
                posx + size*margin + size*labelWidth/2, 
                posy + size*margin*1.5 + size*(1+margin)*index, 
                distance,size * labelWidth);
            this.ctx.font = size + 'px ' + this.font;
            this.drawChara(val["value"], 
                posx + size*margin + size*labelWidth + size*0.5 + size*valueWidth/2, 
                posy + size*margin*1.5 + size*(1+margin)*index, 
                distance,size*valueWidth);
        },this);
        return this.getRect(status.length,posx,posy,size,labelWidth,valueWidth,margin);
    }
    
    resetCanvas(width,height,scale,color = "#ccc"){
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width/scale+`px`;
        this.canvas.style.height = height/scale+`px`;
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, 1200, 900);
    }
    
    // 背景画像の描写
    drawBackGround(image,posx,posy,size){
        if(!image) return;
        var cnvsH = 900;
        var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
        if(cnvsW < this.canvas.width)
        {
            cnvsW = 1200;
            cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
        }
        this.ctx.drawImage(image, (1200-cnvsW)/2+posx, (900-cnvsH)/2+posy, cnvsW*size/100, cnvsH*size/100);
    }
    
    // キャラクター立ち絵の描写
    drawIconPicture(image,posx,posy,size,shadow,distance){
        if(!image) return new Rect(posx, posy, 0, 0);
        var cnvsH = 900;
        var cnvsW = cnvsH * image.naturalWidth / image.naturalHeight;
        if(cnvsW > this.canvas.width)
        {
            cnvsW = 1200;
            cnvsH = cnvsW * image.naturalHeight / image.naturalWidth;
        }
        this.ctx.shadowColor = shadow;
        this.ctx.shadowOffsetX = distance;
        this.ctx.shadowOffsetY = distance;
        this.ctx.drawImage(image, posx, posy, cnvsW*(size/100), cnvsH*(size/100));
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        return new Rect(posx, posy, cnvsW*(size/100), cnvsH*(size/100));
    }
    
    // ふり仮名と名前の描写
    drawNameFurigana(name,furigana,posx,posy,size,color,shadow,distance = 3)
    {
        return this.drawNameFuriganaHorizon(name,furigana,posx,posy,size,color,shadow,distance);
    }
    drawNameFuriganaHorizon(name,furigana,posx,posy,size,color,shadow,distance)
    {
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = shadow;
        // 名前の描写
        this.ctx.font = size + 'px ' + this.font ;
        this.ctx.textBaseline = 'hanging';
        this.ctx.textAlign = 'left';
        var width = this.drawChara(name,posx, posy, distance);
    
        var fsize = size/3;
        this.ctx.font = fsize + 'px ' + this.font ;
        this.ctx.textBaseline = 'ideographic';
        this.ctx.textAlign = 'center';
        var furiganaY = posy - size/10;
        // 表示位置ずれるフォント用の調節
        if(this.font == "misaki8bit"){
            furiganaY -= size * 0.1;
        }
        if(this.font == "LanobePOP"){
            furiganaY += size * 0.1;
        }
    
        // ふり仮名の描写
        if(this.ctx.measureText(furigana).width > width){
            // 幅が狭い場合は処理を分ける
            this.drawChara(furigana,posx + width/2, furiganaY,distance/3,width);
        }
        else{
            furigana.split('').forEach(function(val,index,ar){
                this.drawChara(val,posx + size/4 + (width-size/2) * index/(ar.length-1), furiganaY,distance/3);
            },this);
        }
        return new Rect(posx,posy,width,size*1.5);
    }
    drawNameFuriganaVertical(name,furigana,posx,posy,size,color,shadow,distance)
    {
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = shadow;
        // 名前の描写
        this.ctx.font = size + 'px ' + this.font ;
        this.ctx.textBaseline = 'hanging';
        this.ctx.textAlign = 'left';
        name.split('').forEach(function(val,index,ar){
            this.drawChara(val,posx, posy+size*index,distance);
        },this);
    
        this.ctx.font = size/3 + 'px ' + this.font ;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        furigana.split('').forEach(function(val,index,ar){
            this.drawChara(val,posx+size*1.25, posy + (size*name.length-size*0.5) * index/(ar.length-1),distance/3);
        },this);
        return new Rect(posx,posy,size,size*name.length);
    }
    
    // 技能の描写
    drawParams(cs,posx,posy,size,color,shadow,window,labelWidth = 2,valueWidth = 1,margin = 0.25,space = 0.25,distance = 0) {
        return this.drawParamsHorizon(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space,distance);
    }
    drawParamsVertical(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space,distance) {
        var r = new Rect(posx,posy,0,0);
        cs.forEach(function(val,index,ar){
            var a = this.getRect( val.length, r.x+r.w+size*space, r.y, size, labelWidth, valueWidth, margin);
            r = r.extend(a);
            this.ctx.beginPath();
            this.ctx.fillStyle = window;
            this.ctx.fillRect(a.x,a.y,a.w,a.h);
        },this);
        var r = new Rect(posx,posy,0,0);
        cs.forEach(function(val,index,ar){
            var a = this.drawStatus( val, r.x+r.w+size*space, r.y, size, color, shadow, labelWidth, valueWidth, margin, distance);
            r = r.extend(a);
        },this);
        return r;
    }
    drawParamsHorizon(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space,distance) {
        var r = new Rect(posx,posy,0,0);
        cs.forEach(function(val,index,ar){
            var a = this.getRect( val.length, r.x, r.y+r.h+size*space, size, labelWidth, valueWidth, margin);
            r = r.extend(a);
            this.ctx.beginPath();
            this.ctx.fillStyle = window;
            this.ctx.fillRect(a.x,a.y,a.w,a.h);
        },this);
        var r = new Rect(posx,posy,0,0);
        cs.forEach(function(val,index,ar){
            var a = this.drawStatus( val, r.x, r.y+r.h+size*space, size, color, shadow, labelWidth, valueWidth, margin, distance);
            r = r.extend(a);
        },this);
        return r;
    }
    
    // 技能の描写
    drawSkills(cs,posx,posy,size,color,shadow,window,labelWidth,valueWidth,margin,space,distance,columns = 7,rows = 2) {
        if(cs.length < columns){
            var r = this.getRect(cs.length,posx,posy,size,window,labelWidth,valueWidth,margin);
            this.ctx.beginPath();
            this.ctx.fillStyle = window;
            this.ctx.fillRect(r.x,r.y,r.w,r.h);
            this.drawStatus(cs,posx,posy,size,color,shadow,labelWidth,valueWidth,margin,distance);
            return r;
        }
        if(cs.length < rows){
            rows = cs.length;
        }
        cs.length -= cs.length%rows;
        columns = Math.min(cs.length/rows,columns);
        var r = new Rect(posx,posy,0,0);
        for(var i = 0; i < rows; i++) {
            var a = this.getRect(
                    columns,
                    posx + r.w,
                    posy,
                    size,labelWidth,valueWidth,margin);
            r = r.extend(a);
        }
        this.ctx.beginPath();
        this.ctx.fillStyle = window;
        this.ctx.fillRect(r.x,r.y,r.w,r.h);
        var r = new Rect(posx,posy,0,0);
        for(var i = 0; i < rows; i++) {
            var a = this.drawStatus(
                    cs.slice(0,columns),
                    posx + r.w,
                    posy,
                    size,color,shadow,labelWidth,valueWidth,margin,distance);
            cs = cs.slice(columns);
            r = r.extend(a);
        }
        return r;
    }
    
    // HP/MPの描写
    drawHub(cs,posx,posy,size,color,shadow,window,margin,distance = 2) {
        var width = size * 1.75;
        var r = new Rect(posx,posy,0,width);
        cs.forEach(function(val,index,ar){
            // 円の描写
            this.ctx.fillStyle = window;
            this.ctx.beginPath();
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'center';
            this.ctx.arc(r.x + r.w + width/2, r.y + r.h/2, width/2, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.fill();
    
            this.ctx.fillStyle = color;
            this.ctx.shadowColor = shadow;
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'center';
            this.ctx.font = size + 'px ' + this.font ;
            this.drawChara(val["value"],r.x + r.w + width/2, r.y + r.h/2 + size*0.2, distance, width);
            this.ctx.font = size/3 + 'px ' + this.font ;
            this.drawChara(val["label"],r.x + r.w + width/2, r.y + r.h/2 - size*0.5, distance/3, width);
    
            r.w += width + size*margin;
        },this);
        return r;
    }
}