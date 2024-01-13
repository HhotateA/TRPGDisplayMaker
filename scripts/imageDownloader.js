// キャラクター立ち絵の描写
export async function getIconPicture(url){
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