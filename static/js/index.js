'use strict';
console.log = function(){};


var SVGFileTexts = {};
var rangeValue = $('input[type="range"]').val();

$(function () {

    for (let i = 0; i < SVGIconList.length; i++) {
        let url = SVGIconList[i].path;
        $.get(url, function (data) {
            data = data.replace("<svg", "<g");
            data = data.replace("</svg>", "</g>");
            SVGFileTexts[SVGIconList[i].name] = data;
        }, "text");
    }
    $(function () {
        setTimeout(function () {

            setSize();
            getFile();
        }, 1000);
    });

});

var temp_pos = 0;


var content_width = $("main .content-col").width(),
    content_height = $("main .content-col").height(),
    canvas_width = $("main").width(),
    canvas_height = $("main").height();

var inputFileName;

$(function () {


    $(".close-btn").on("click", function () {
        $("#dialog-input").hide();
        $("#dialog-upload").hide();
        return false;
    });

    $(".cancel").on("click", function () {
        $("#dialog-input").hide();
        $("#dialog-upload").hide();
        return false;
    });

    $(".temp").on("click", function () {
        if (timer > 0) {
            //clearTimeout(timer);
        }

        let temp_width, temp_height, temp_left, temp_top;
        if (temp_pos == 0) {
            //right
            temp_width = content_width * divisionRadio;
            temp_height = canvas_height;
            temp_left = LabelWidth + content_width * (1 - divisionRadio);
            temp_top = 50;
            TempWidth = temp_width;
            TempHeight = 0;
            temp_pos = temp_pos + 1;
        } else if (temp_pos == 1) {
            //bottom
            temp_width = canvas_width;
            temp_height = content_height * divisionRadio;
            temp_left = 0;
            temp_top = 50 + content_height * (1 - divisionRadio);
            TempWidth = 0;
            TempHeight = temp_height;
            temp_pos = temp_pos + 1;
        } else {
            //hidden
            temp_width = 0;
            temp_height = canvas_height;
            temp_left = "100vw";
            temp_top = 0;
            TempHeight = 0;
            temp_pos = temp_pos - 2;
        }
        tempSizeSet(temp_width, temp_height, temp_left, temp_top);


        if (hertAjaxData) {
            console.log(hertAjaxData);
        }

        timer = setTimeout(function () {
            setSize();

        }, 50);
    });


    for (let i = 0; i < TimeTickRectColor.length; i++) {
        $("#timebar").append("<div class=\"timebar-box\"><div class=\"timebar\" style=\"background-color:" + TimeTickRectColor[i].color + ";\"></div><span class=\"timebar-text\">" + TimeTickRectColor[i].text + "</span></div><br style=\"clear:both\">")
    }

});


var timer = 0;

window.onresize = function () {

    content_width = $("main .content-col").width();
    content_height = $("main .content-col").height();
    canvas_width = $("main").width();
    canvas_height = $("main").width();

    let temp_width, temp_height;
    if (temp_pos == 1) {
        //right
        temp_width = $("main .content-col").width() * divisionRadio;
        temp_height = $("main").height();
        TempWidth = temp_width;
        tempSizeSet(temp_width, temp_height, $("main .content-col").width() * (1 - divisionRadio) + LabelWidth, 50);
    } else if (temp_pos == 2) {
        //bottom
        temp_width = $("main").width();
        temp_height = $("main .content-col").height() * divisionRadio;
        TempHeight = temp_height;
        tempSizeSet(temp_width, temp_height, 0, $("main .content-col").height() * (1 - divisionRadio) + 50);
    }


    timer = setTimeout(function () {
        setSize();

    }, 50);
};

function tempSizeSet(width, height, left, top) {
    $("main .temporary-col").css("width", width);
    $("main .temporary-col").css("height", height);
    $("main .temporary-col").css("left", left);
    $("main .temporary-col").css("top", top);
};

function setSize() {
    let scrollbarWidth = 16;
    let windowWidth = $(window).width();
    let titleWidth = $('.title-col').outerWidth(true);
    $('.scroll-bar-horizontal').outerWidth(windowWidth - LabelWidth - scrollbarWidth);
    let setLeft = windowWidth - scrollbarWidth;

    $('.scroll-bar-vertical').offset({left: setLeft});

    drawData()
}

