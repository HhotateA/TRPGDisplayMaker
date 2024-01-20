var div = document.createElement('div');
$.ajax({
    url: 'https://hhotatea.github.io/TRPGDisplayMaker/releases/main.html',
    success: function(data) {
        $("#MainApp").append(data)
    }
  });