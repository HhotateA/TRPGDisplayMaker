const scriptPaths = ["perseCommands.js","imageDownloader.js","rect.js","drawCanvas.js","main.js"];
scriptPaths.forEach(function(val,index,ar){
    var script = document.createElement('script');
    script.src = "scripts/" + val;
    document.head.appendChild(script);
});