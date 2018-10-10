var t_point_interval;
$(function(){

    initializeTable();

    $("form#geojsonForm").submit(uploadGeojsonFile);


    $("form#geotiffForm").submit(function (e) {
        e.preventDefault();
        var file = $("input[type='file']")[0].files[0];
        if(!file) {
            $("input").css("borderColor", "red");
            return;
        }
        uploading_file(file);
    });

    
    $("input[type='file']").change(function () {
        $("input").css("borderColor", "");
    });

    $("#minZoom button[data-type='plus']").click(function () {
        var newNum = parseInt($("#minZoom input").val()) + 1;
        var max = parseInt($("#minZoom input").attr("max"));
        if(newNum <= max) {
            $("#minZoom input").val(newNum);
        }
    });

    $("#minZoom button[data-type='minus']").click(function () {
        var newNum = parseInt($("#minZoom input").val()) - 1;
        var min = parseInt($("#minZoom input").attr("min"));
        if(newNum >= min) {
            $("#minZoom input").val(newNum);
        }
    });

    $("#maxZoom button[data-type='plus']").click(function () {
        var newNum = parseInt($("#maxZoom input").val()) + 1;
        var max = parseInt($("#maxZoom input").attr("max"));
        if(newNum <= max) {
            $("#maxZoom input").val(newNum);
        }
    });

    $("#maxZoom button[data-type='minus']").click(function () {
        var newNum = parseInt($("#maxZoom input").val()) - 1;
        var min = parseInt($("#maxZoom input").attr("min"));
        if(newNum >= min) {
            $("#maxZoom input").val(newNum);
        }
    });

    $("#defaultZoom").change(function () {
        var checked = $(this).prop("checked")
        if(checked) {
            $("button[data-type='minus'], button[data-type='plus']").attr("disabled", "disabled");
        } else {
            $("button[data-type='minus'], button[data-type='plus']").removeAttr("disabled");
        }
    });


});
function uploadGeojsonFile(event) {
    event.preventDefault();
    let file = $("#geojsonForm input[type='file']")[0].files[0];
    let formData = new FormData();
    formData.append("file", file);

    $.ajax({
        url: "/api/add_vector_from_geojson_file",
        method: "POST",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        xhr: () => {
            let xhr = $.ajaxSettings.xhr();
            $(".progress").fadeIn(100);
            let progress_bar = $(".progress-bar");

            xhr.upload.onprogress = evt => {
                var percentComplete = `${Math.floor(evt.loaded / evt.total *100)}%`;
                console.log(percentComplete);
                progress_bar.text(`${percentComplete} Complete`);
                progress_bar.css({width: percentComplete})
                if(percentComplete == '100%') {
                    $(".progress").fadeOut(600);
                }
            };

            return xhr;
        },
        success: res => {
            console.log("res= ",res);
        },
    });
}


function uploading_file(file) {
    showLoaders("Uploading the file.");

    var fromData = new FormData();
    fromData.append("file", file);
    $.ajax({
        url: "uploading_file",
        method: "POST",
        data: fromData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(res){
            console.log("res = ", res);
            split_to_tiles(res.filename);
        }
        });
}

function split_to_tiles(filename) {
    var zoom = null;
    showLoaders("Split to tiles.");
    var checked = $("#defaultZoom").prop("checked");
    if(!checked) {
        zoom = $("#minZoom input").val() + "-" + $("#maxZoom input").val();
    }
    $.ajax({
        url: "/api/split_to_tiles",
        method: "POST",
        data: {filename: filename, zoom: zoom},
        timeout: 0,
        success: function(res){
            console.log("res split_to_tiles = ", res);
            hideLoaders();
            // download_zip(res.filename);
        }
    });
}
function download_zip(filename) {
    showLoaders("Download zip.");
    $.fileDownload("download_zip?which=" + filename + ".zip", {
        successCallback: function () {
            hideLoaders();
        }
    });
}
function showLoaders(resultText) {
    $("button[type='submit']").attr('disabled', 'disabled');
    $("input").attr('disabled', 'disabled');
    $(".loader, #result").fadeIn(1000);
    $("#result").text(resultText);
    var i = 0;
    clearInterval(t_point_interval);
    t_point_interval = setInterval(function () {
        i = i + 1;
        if(i < 3) {
            $("#result").append(".");
        } else {
            i = 0 ;
            $("#result").text(resultText);
        }
    }, 500);
}

function hideLoaders() {
    $("button[type='submit']").removeAttr('disabled');
    $("input").removeAttr('disabled');
    $(".loader, #result").fadeOut(1000);
    clearInterval(t_point_interval);
    $("#result").text("");
}

function initializeTable() {
    var tbody = $("tbody");
    $.ajax({
        method: "GET",
        url: "api/list_of_rasters.json",
        success: function (res) {
            _.forEach(res, function (one) {
                tbody.append(`<tr><td>${one.name}</td><td>${one.url}</td></tr>`)
            });
        }
    });
}