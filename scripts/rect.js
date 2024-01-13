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