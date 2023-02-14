'use strict';
$(function () {

    $(".close-btn").on("click", function () {
        $("#dialog-input").hide();
        $("#dialog-upload").hide();
        $("#dialog-help").hide();
        return false;
    });

    $(".cancel").on("click", function () {
        $("#dialog-input").hide();
        $("#dialog-upload").hide();
         $("#dialog-help").hide();
        return false;
    });

        $("#dialog-help").on("click",function(){
         $("#dialog-help").hide();
        return false;
    });


    $(".box").on("click",function(){
        //return false;
    });


    $("#file_select_btn").on("click", function () {

        $("#send_data").click();

        return false;

    });

    $("#send_data").on("change", function () {

        let a = $(this).val();

        $("#file_name").text(a);
        $('#upload-button').click();
        $(this).val('');

    });

    $('#upload-button').click(function () {


        let form_data = new FormData();
        form_data.append('send_data', $('#send_data').prop('files')[0]);
        inputFileName=$('#send_data').prop('files')[0].name;

        $.ajax({
            type: 'POST',
            url: '/prism-heart/upload',
            data: form_data,
            contentType: false,
            cache: false,
            dataType: 'json',
            processData: false,
            success: function (data) {

                $("#dialog-upload").hide();

                console.log(data);

                hertAjaxData=data;
                heartData = new HeartData(data);
                drawData();
                if (heartData.htmlData){
                    drawHtml();
                }

            },
        });
    });

    $('input[type="range"]').on("input", function () {
        if(hertAjaxData==null){
            return;
        }
        rangeValue = $(this).val();

        let newValue =  $(this).val();
        $("#scale_value").text(newValue);
        if(newValue==2){
            HeartConfig = JSON.parse(JSON.stringify(HeartConfig0));
        }else if(newValue==1){
            HeartConfig = JSON.parse(JSON.stringify(HeartConfig1));
        }
        else if(newValue==0){
            HeartConfig = JSON.parse(JSON.stringify(HeartConfig2));
        }
        heartData = new HeartData(hertAjaxData);

        drawData();

    });

    $("#in_text").on("change keyup",function(){
       let text=$("#in_text").val();
       $("#dlg-error-box").text("");
       if(text.length==0){
           $("#btn_text_upload").addClass("disabled");
       }
       else{
           $("#btn_text_upload").removeClass("disabled");

       }
    });

    $("#btn_open_input").on("click",function(){
        $("#in_text").val("");
        $("#in_dct").val("");
        $("#dlg-error-box").text("");
       openDialog('input');
       return false;
    });

    $("#btn_text_upload").on("click", function () {

        let text=$("#in_text").val();
        let dct=$("#in_dct").val();

        text=text.replace(/\r?\n/g, '');

        let data={
            text:text,
            dct:dct
        };

        $(".loading").show();
        $("#dialog-input").hide();
        let json = JSON.stringify(data);
        $.ajax({
            url: "/heart-api",
            type: 'POST',
            dataType: 'json',
            data: json,
             contentType:'application/json',
        }).done(function (data) {
            console.log(data);

            if(data.status=="Failure"){
                $("#dialog-input").show();
                $("#dlg-error-box").text(data.message);
            }else{
                hertAjaxData=data.response;
                heartData = new HeartData(data.response);
                drawData();
                if (heartData.htmlData){
                    drawHtml();
                }
                $(".loading").hide();

            }

        }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
            alert("error");
        }).always(function(){
            $(".loading").hide();
        });

    });
});

function getFile() {


    if (typeof InitalFileJson === 'undefined') {
        return;
    }
    if(InitalFileJson==null || InitalFileJson.length==0){
        return;
    }

    $.ajax({
        url: '/prism-heart/upload',
        type: 'GET',
        dataType: 'json',
        // フォーム要素の内容をハッシュ形式に変換
        data: {file: InitalFileJson},
        timeout: 5000,
    })
        .done(function (data) {
            // 通信成功時の処理を記述
            hertAjaxData=data;

            heartData = new HeartData(data);
            drawData();
            if (heartData.htmlData){
                drawHtml();
            }
            

        })
        .fail(function () {
            // 通信失敗時の処理を記述
        });

    
}


function openDialog(type) {
    //jquery の on click イベントだと URLに# がつく
    // return false すると、イベントが伝搬しない


    if (type === "input") {
        $("#dialog-input").show();
    } else if (type === "upload") {
        $("#dialog-upload").show();
    }else if (type === "help") {
        $("#dialog-help").show();
    }
}




var hertAjaxData=null;

var HeartConfig = JSON.parse(JSON.stringify(HeartConfig0));

var heartData;

var LabelWidth=100;
var TempWidth=0;
var TempHeight=0;
var focus=d3.select("aaaaa"),textColor,textBackColor;

var Width=0;
var Height=0;



function getXbyD(d, includeLabelWidth) {
    if (includeLabelWidth) {
        return LabelWidth + d * heartData.TimeWidth;
    } else {
        return d * heartData.TimeWidth;
    }

}

function drawData() {

    if (heartData == null) {
        return;
    }

    console.log(heartData);


    LabelWidth = HeartConfig.LabelLeftM * 1.5 + heartData.anatomyMaxTextLength * HeartConfig.FontPixLabel + 2 * HeartConfig.FontPixLabel;

    console.log("LabelWidth",LabelWidth);



    HeartConfig.TimeWidth = heartData.TimeWidth;


    Width = LabelWidth + heartData.maxTickDay * heartData.TimeWidth + 400;
    Height = heartData.getHight() + HeartConfig.TimeHeight+30;


    $("main .title-col").css("padding-top", HeartConfig.TimeHeight + "px");
    $("main .title-col").css("height", "calc(100vh - " + (HeartConfig.TimeHeight + TempHeight) + "px)");

    $("main .content-col").css("width", "calc(100vw - " + (LabelWidth + TempWidth) + "px)");
    $(".timescale-wrap").css("width", "calc(100vw - " + (LabelWidth + TempWidth) + "px)");


    let left = -1 * LabelWidth;
    $("main .content-col .content-wrap .main_img_wrapper").css("left", left);
    $("main .content-col .content-wrap").css("width", "calc(100vw - " + (LabelWidth + TempWidth) + "px)");

    let top = -1 * HeartConfig.TimeHeight;
    $("main .content-col .content-wrap .main_img_wrapper").css("top", top);
    $("main .content-col .content-wrap").css("height", "calc(100vh - " + (50 + HeartConfig.TimeHeight + TempHeight) + "px)");


    $(".scroll-bar-horizontal").css("left", LabelWidth);
    $(".scroll-bar-horizontal").css("top", "calc(100vh - " + ( 16 + TempHeight) + "px)");
    $(".scroll-bar-horizontal").css("width", "calc(100vw - " + (LabelWidth + TempWidth) + "px)");


    $(".scroll-bar-vertical").css("left", "calc(100vw - " + (TempWidth+16) + "px)");
    $(".scroll-bar-vertical").css("top", 50 + HeartConfig.TimeHeight);
    $(".scroll-bar-vertical").css("height", "calc(100vh - " + ( 16 + 50 + HeartConfig.TimeHeight + TempHeight) + "px)");


    drawTop(Width);
    drawLeft(Width, Height);
    drawMain(Width, Height);

    setScrollEvent();
    
    content_width=$("main .content-col").width();

}


function drawHtml(){
    $("#temporary-col").html("<nobr>" + heartData.htmlData + "</nobr>");
    

    let focus1,focus1_after,focus2,stroke;
    // mouseoverすると対応する部分を取得
    $('.ner-doc span').mouseover(function(e) {
        let cursor_id=this.id.match(/[0-9]+/)[0];
        let entity = $.grep(heartData.data.entities,
                function(elem, index) {
                    return (elem.id == cursor_id);
                }
            ),
            time = $.grep(heartData.data.times,
                function(elem, index) {
                    return (elem.id == cursor_id);
                }
            ),
            anatomy = $.grep(heartData.data.anatomy,
                function(elem, index) {
                    return (elem.id == cursor_id);
                }
            );
        
        if(!entity[0]&&!time[0]&&!anatomy[0]){
            if($(this).attr("class")=="testval"||$(this).attr("class")=="medval"){
                for(let i = 0; i < heartData.data.entities.length; i++){
                    let entity_0 = $.grep(heartData.data.entities[i].value,
                        function(elem, index) {
                            return (elem.id == cursor_id);
                        }
                    );
                    if(entity_0[0]){
                        entity[0]=heartData.data.entities[i];
                        break;
                    }
                }
            }
        }
        


        let focus_sub;
        focus1 = d3.select("#canvasMain").select("#gradRect_"+cursor_id);
        focus2 = d3.select("#canvasLeft").selectAll("#text_"+cursor_id);

        if(focus1.empty()){
            focus1 = d3.select("#tableRect_"+cursor_id);
            focus_sub = d3.select("#nullll");
            if(focus1.empty()){
                focus1 = d3.select("#rect_"+cursor_id);
                if(focus1.empty()){
                    for (let i = 0; i < heartData.drawDataList.length; i++) {
                        let data = heartData.drawDataList[i];
                        if(data.textId==cursor_id){
                            focus1 = d3.select("#tableRect_"+data.entityItemId);
                        }
                    }
                }
            }
        }else{
            focus_sub=d3.select("#rect_"+cursor_id);
        }
        if (focus2.empty()){
            focus2 = d3.select("#canvasMain").selectAll("#text_"+cursor_id);
            if (focus2.empty()){
                focus2 = d3.select("#canvasTop").selectAll("#textorg_"+cursor_id);
                if (focus2.empty()){
                    focus2 = d3.selectAll("#tableText_"+cursor_id);
                }
            }
        }

        //クリックで左がスクロール
        let itemX,itemY;
        $(this).on("click",function(){
            if(time[0]){
                //times
                let item=time[0],
                    itemTime = getTickItem(item.id, false);
                itemX = getXbyD(itemTime.d);
                $('.content-wrap').scrollLeft(itemX);
                $('.content-wrap').scrollTop(0);
            }else if(!focus1.empty()){
                itemX=focus1.attr("x");
                itemY=focus1.attr("y");
                $('.content-wrap').scrollLeft(itemX-LabelWidth);
                if(itemX==0){
                    $('.content-wrap').scrollTop(itemY);
                }else{
                    $('.content-wrap').scrollTop(itemY-HeartConfig.TimeHeight);
                }
            }
        });  
        

        //マウスオーバーで左の対応する部分が赤く点滅
        if (timer > 0) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            stroke=null;
            let rectWidth=0,rectHeight=0,rectX,rectY;
            
            if(!focus_sub.empty()){
                if(Number(focus_sub.attr("width"))>0){
                    rectWidth=Number(focus_sub.attr("width"));
                }
            }
            if(!focus1.empty()){
                if(Number(focus1.attr("width"))>0){
                    rectWidth=rectWidth+Number(focus1.attr("width"));
                }
                rectHeight=rectHeight+Number(focus1.attr("height"));
                rectX=focus1.attr("x");
                rectY=focus1.attr("y");
                if(!focus_sub.empty()&&focus_sub.attr("x")<rectX){
                    rectX=focus_sub.attr("x");
                }
            }


            focus1_after=focus1;
            let stroke_color;
            if (!focus1.empty()){
                stroke=focus1.attr("stroke");
                if(stroke.slice(0,3)=="url"){
                    stroke_color="#F9D1B9";
                }else{
                    stroke_color=stroke;
                }
            }
            focus2.attr("font-weight","bolder");

            let appendRect;
            if(rectX==0){
                appendRect=d3.select('#canvasLeft').select("svg")
            }else{
                appendRect=d3.select('#canvasMain').select("svg")
            }
            appendRect.append("rect")
            .attr("class","tmpRect_"+cursor_id)
            .attr("fill","none")
            .attr("x",rectX)
            .attr("y",rectY)
            .attr("width",rectWidth)
            .attr("height",rectHeight)
            .attr("stroke",stroke_color)
            .attr("stroke-width",2)
            .attr("stroke-opacity",0);

            let tmpRect=d3.selectAll(".tmpRect_"+cursor_id);

            tmpRect.transition().duration(250).attr("stroke","red").attr("stroke-opacity",1).transition().duration(250).attr("stroke", stroke_color).attr("stroke-opacity",0)
            .transition().duration(250).attr("stroke","red").attr("stroke-opacity",1).transition().duration(250).attr("stroke", stroke_color).attr("stroke-opacity",0)
            .transition().duration(250).attr("stroke","red").attr("stroke-opacity",1).transition().duration(250).attr("stroke", stroke_color).attr("stroke-opacity",0)
            .transition().duration(250).attr("stroke","red").attr("stroke-opacity",1).transition().duration(250).attr("stroke", stroke_color).attr("stroke-opacity",0)
            .transition().duration(250).attr("stroke","red").attr("stroke-opacity",1).transition().duration(250).attr("stroke", stroke_color).attr("stroke-opacity",0);

            // focus2.transition().duration(250).attr("fill","red").transition().duration(250).attr("fill", "black")
            // .transition().duration(250).attr("fill","red").transition().duration(250).attr("fill", "black")
            // .transition().duration(250).attr("fill","red").transition().duration(250).attr("fill", "black")
            // .transition().duration(250).attr("fill","red").transition().duration(250).attr("fill", "black")
            // .transition().duration(250).attr("fill","red").transition().duration(250).attr("fill", "black");

            let count=0
            function blink(){
                if(count<5){
                    focus2.transition()
                    .duration(250)
                    .attr("fill","red")
                    .transition()
                    .duration(250)
                    .attr("fill", "black")
                    .each("end", blink);
                }
                count=count+1;
            }

            blink();

        }, 500);

    });

    $('.ner-doc span').mouseout(function(e) {
        let cursor_id=this.id.match(/[0-9]+/)[0];
        d3.selectAll(".tmpRect_"+cursor_id).remove();

        focus2.attr("fill", "black").attr("font-weight", "normal");
        focus1=d3.select("#null");
        focus2=d3.select("#null");
        if (timer > 0) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            focus1=d3.select("#null");
            focus2=d3.select("#null");
        }, 500);
    });


    function getTickItem(timeId, boreFlag) {
        for (let i = 0; i < heartData.timeLine.length; i++) {
            if (heartData.timeLine[i].id === timeId) {
                if (boreFlag === false && heartData.timeLine[i].category === "org") {
                    return heartData.timeLine[i];
                } else if (boreFlag === true && heartData.timeLine[i].category === "before") {
                    return heartData.timeLine[i];
                }
            }
        }
        return heartData.timeLine[0];
    }


}

function drawTop(width) {

    $('#canvasTop').empty();


    let svg = d3.select('#canvasTop').append('svg')
        .attr('width', width)
        .attr('height',  HeartConfig.TimeHeight);

    $("#canvasTop").width(width);
    $("#canvasTop").height(HeartConfig.TimeHeight);

    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", HeartConfig.CanvasBackColor);


    //メモリの描画
    drawTick(svg, width, false);

}


function drawTick(svg, width, includeLabelWidth) {
    let x = 0;

    let timetickLength = 10;

    let labelW = 0;
    if (includeLabelWidth === true) {
        labelW = LabelWidth;
    }
    let w = width - LabelWidth;
    if (includeLabelWidth === true) {
        w = width;
    }

    for (let i = 0; i < heartData.drawTickRectList.length; i++) {
        let item = heartData.drawTickRectList[i];

        let x1 = getXbyD(item.t1, includeLabelWidth);
        let x2 = getXbyD(item.t2, includeLabelWidth);
        let y1 = HeartConfig.TimeHeight - 5;
        let y2 = HeartConfig.TimeHeight;

        svg.append("rect")
            .attr("x", x1) // 開始x座標
            .attr("y", y1) // 開始y座標
            .attr("width", x2 - x1) // 横幅
            .attr("height", y2 - y1) // 縦幅
            .attr("fill", item.color) // 長方形の中の色
            .attr("stroke", item.color)
            .attr("stroke-width", 1) // 線の太さ
        //.attr("stroke-dasharray", "5, 2")


    }



    //時間軸
    svg.append("line")
        .attr("x1", labelW)
        .attr("x2", w)
        .attr("y1", HeartConfig.TimeHeight)
        .attr("y2", HeartConfig.TimeHeight)
        .attr("stroke-width", 2)
        .attr("stroke", HeartConfig.TimeTickColor)
        .attr("fill", "none");


    //縦仕切り
    svg.append("line")
        .attr("x1", labelW)
        .attr("x2", labelW)
        .attr("y1", 0)
        .attr("y2", HeartConfig.TimeHeight)
        .attr("stroke-width", 1)
        .attr("stroke", HeartConfig.TimeTickColor)
        .attr("fill", "none");


    //時間刻み
    let h2=15;
    let drawCount=0;
    let x0 = labelW;
    for (let i = 0; i < heartData.timeLine.length; i++) {


        let timeItem = heartData.timeLine[i];

        x = getXbyD(timeItem.d, includeLabelWidth);

        let y1=HeartConfig.TimeHeight - timetickLength;
        let y2=HeartConfig.TimeHeight;
        let textColor,textBackColor;

        if(HeartConfig.IsTickMarkShift==true && drawCount%2==1){
            y1-=timetickLength;
        }


        if (timeItem.category === "org") {
            svg.append("line")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", y1)
                .attr("y2", y2)
                .attr("stroke-width", 1)
                .attr("stroke", HeartConfig.TimeTickColor)
                .attr("fill", "none");
            drawCount++;
        }
        svg.append('text')
            .attr('id','text'+timeItem.category+'_'+timeItem.id)
            .attr('class','item_'+timeItem.id)
            .attr('x', x)
            .attr('y', y1 - 10)
            .attr("font-family", HeartConfig.TextFontFamily)
            .attr("font-size", HeartConfig.TextFontSizeTick)
            .attr('fill', HeartConfig.TextColor)
            .text(timeItem.text)
            .on("mouseover", function(){
                if(timeItem.category=="org"){
                    let count=0;
                    if (timer > 0) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function () {
                        focus = d3.select("#T"+timeItem.id);
                        if(!focus.empty()){
                            textColor = focus.style("color");
                            textBackColor = focus.style("background");
                            if(textColor=="#fffff"){

                            }
                            function tmpBlink(){
                                if(count<5){
                                    focus.transition()
                                    .duration(300)
                                    .style("color","red")
                                    .style("border","thin solid")
                                    .style("border-color","red")
                                    .transition()
                                    .duration(300)
                                    .style("color","black")
                                    .style("border-color","#f7f7f7")
                                    .each("end", tmpBlink);
                                }
                                count=count+1;
                            };
                            tmpBlink();
                        }
                    }, 600);
                }
            })
            .on("mouseout", function(){ imgMouseOut(); })
            .on("click",function(){ imgClick(timeItem.id); });
    }



}

//左のラベル描画
function drawLabel(svg, width, includeTimeHeight) {



    let y0 = heartData.getColounStartPosY(0);


    if (includeTimeHeight === true) {
        y0 = y0 + HeartConfig.TimeHeight;
    }


    for (let i = 0; i < heartData.columns.length; i++) {

        let c = heartData.columns[i];
        let colH = heartData.getColumnHeight(i);
        if (colH === 0) {
            continue;
        }


        let y = heartData.getColounStartPosY(i);


        if (includeTimeHeight === true) {
            y = y + HeartConfig.TimeHeight;
        }

        svg.append("rect")
            .attr("id", "rect_"+c.id)
            .attr("class", "item_"+c.id)
            .attr("class", "rect_"+c.id)
            .attr("x", 0) // 開始x座標
            .attr("y", y) // 開始y座標
            .attr("width", LabelWidth) // 横幅
            .attr("height", colH) // 縦幅
            .attr("fill", c.fillColor) // 長方形の中の色
            .attr("stroke", c.fillColor)
            .attr("stroke-width", 1) // 線の太さ
        //.attr("stroke-dasharray", "5, 2")



        let lineWidth=1;
        if(includeTimeHeight){
            lineWidth=0.5
        }

        //下線
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y + colH)
            .attr("y2", y + colH)
            .attr("stroke-width", lineWidth )
            .attr("stroke", HeartConfig.LabelLineColor)
            .attr("stroke-dasharray", "5, 2")
            .attr("fill", "none");

        //縦線
        svg.append("line")
            .attr("x1", LabelWidth)
            .attr("x2", LabelWidth)
            .attr("y1", y )
            .attr("y2", y + colH)
            .attr("stroke-width", 1)
            .attr("stroke", HeartConfig.LabelLineColor)
            .attr("fill", "none");



        let text1 = c.name;
        let text="";
        let textColor,textBackColor;

        if (c.type === "anatomy") {
            let a = heartData.anatomyHash[c.id];


            if (a.treeIndex > 0) {
                for(let i=0;i<a.treeIndex;i++){
                    text+=" ";
                }
                text += "┗ " + text1;
            }
            else{
                text =text1;
            }
        }
        else{
            text =text1;
        }
        svg.append('text')
            .attr("id", "text_"+c.id)
            .attr("class", "item_"+c.id)
            .attr("x", HeartConfig.LabelLeftM) // 開始x座標
            .attr("y", y + colH / 2) // 開始y座標
            .attr("font-family", HeartConfig.TextFontFamily)
            .attr("font-size", HeartConfig.TextFontSizeLabel)
            .attr('fill', HeartConfig.TextColor)
            .text(text)
            .on("mouseover", function(){
                imgMouseOver(c.id);
            })
            .on("mouseout", function(){ imgMouseOut(); })
            .on("click",function(){ imgClick(c.id); });


    }



    //ラベルの一番上
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", LabelWidth)
        .attr("y1", y0)
        .attr("y2", y0)
        .attr("stroke-width", 1)
        .attr("stroke", HeartConfig.TimeTickColor);

}

function drawLeft(width, height) {


    $('#canvasLeft').empty();

    let svg = d3.select('#canvasLeft').append('svg')
        .attr('width', LabelWidth)
        .attr('height', height);


    $("#canvasLeft").width(LabelWidth);
    $("#canvasLeft").height(height);

    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", HeartConfig.CanvasBackColor);

    drawLabel(svg, width, false);
}


function drawMain(width, height) {

    $('#canvasMain').empty();

    let svg = d3.select('#canvasMain').append('svg')
        .attr('width', width)
        .attr('height', height);

    $("#canvasMain").width(width);
    $("#canvasMain").height(height);


    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", HeartConfig.CanvasBackColor);


    let lineFunction = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate("linear");

    let svgDefs = svg.append('defs');


    let DiseaseGradient = svgDefs.append('linearGradient')
        .attr('id', 'DiseaseGradient');

    DiseaseGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", HeartConfig.DiseaseColorRange[0]);

    DiseaseGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", HeartConfig.DiseaseColorRange[1]);


    let DiseaseFill = svgDefs.append('linearGradient')
        .attr('id', 'DiseaseFill');

    DiseaseFill.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", HeartConfig.DiseaseColorRange[1]);

    DiseaseFill.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", HeartConfig.DiseaseColorRange[1]);


    let DiseaseInnerGradient = svgDefs.append('linearGradient')
        .attr('id', 'DiseaseInnerGradient');

    DiseaseInnerGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", HeartConfig.DiseaseInnerColorRange[0]);

    DiseaseInnerGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", HeartConfig.DiseaseInnerColorRange[1]);


    let DiseaseInnerFill = svgDefs.append('linearGradient')
        .attr('id', 'DiseaseInnerFill');

    DiseaseInnerFill.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", HeartConfig.DiseaseInnerColorRange[1]);

    DiseaseFill.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", HeartConfig.DiseaseInnerColorRange[1]);



    drawTick(svg, width, true);




    //ラベル毎に領域を塗りつぶす（線幅を一定にするため）
    let y0 = heartData.getColounStartPosY(0);
    y0 = y0 + HeartConfig.TimeHeight;
    for (let i = 0; i < heartData.columns.length; i++) {

        let c = heartData.columns[i];

        let colH = heartData.getColumnHeight(i);
        if (colH === 0) {
            continue;
        }


        let y = heartData.getColounStartPosY(i);
        y = y + HeartConfig.TimeHeight;

        //外領域
        svg.append("rect")
            .attr("x", 0) // 開始x座標
            .attr("y", y) // 開始y座標
            .attr("width", width) // 横幅
            .attr("height", colH) // 縦幅
            .attr("fill", HeartConfig.CanvasBackColor) // 長方形の中の色
            .attr("stroke", HeartConfig.CanvasBackColor)
            .attr("stroke-width", 1) // 線の太さ
        //.attr("stroke-dasharray", "5, 2")

    }


    //まずは塗りつぶし図形から
    for (let i = 0; i < heartData.drawDataList.length; i++) {
        let data = heartData.drawDataList[i];


        let y = heartData.getColounStartPosY(data.colIndex);
        y += data.startH;
        y = y + HeartConfig.TimeHeight;

        if (data.type === "rect") {

            let x = getXbyD(data.d, true);
            let width = data.width * heartData.TimeWidth;


            let height = data.heightPixcel;

            if (data.regionTreeIndex != null) {
                y = y + HeartConfig.InnerMH;
                height = height - HeartConfig.InnerMH * 2;

                if (data.margine === "left") {
                    x = x + HeartConfig.InnerMW;
                    width = width - HeartConfig.InnerMW ;
                } else if (data.margine === "right") {
                    width = width - HeartConfig.InnerMW ;
                } else if (data.margine === "both") {
                    x = x + HeartConfig.InnerMW;
                    width = width - HeartConfig.InnerMW * 2;
                }


            }


            svg.append("rect")
                .attr("id",data.id)
                .attr("class", "item_"+data.itemId)
                .attr("class", "rect_"+data.itemId)
                .attr("x", x) // 開始x座標
                .attr("y", y) // 開始y座標
                .attr("width", width) // 横幅
                .attr("height", height) // 縦幅
                .attr("fill", data.fill) // 長方形の中の色
                .attr("stroke",data.fill)
                .attr("stroke-width", 1) // 線の太さ
            //.attr("stroke-dasharray", "5, 2")

        } else if (data.type === "path") {

            let lineData = [];
            for (let j = 0; j < data.lineData.length; j++) {
                let x1 = getXbyD(data.lineData[j].d, false);
                let y1 = y + data.heightPixcel * data.lineData[j].h;
                lineData.push({
                    x: x1,
                    y: y1
                });
            }


            svg.append("path")
                .attr('d', lineFunction(lineData))
                .attr("stroke", data.stroke)
                .attr('fill', data.fill);
        } else if (data.type === "tableRect") {


            let x = getXbyD(data.d, true);
            let width = 0;
            if (data.width != null) {
                width = data.width * heartData.TimeWidth;
            } else if (data.widthPixcel != null) {
                width = data.widthPixcel;
            }


            let height = data.heightPixcel;

            svg.append("rect")
                .attr("id","tableRect_"+data.entityItemId)
                .attr("class", "item_"+data.entityItemId)
                .attr("class", "rect_"+data.entityItemId)
                .attr("x", x) // 開始x座標
                .attr("y", y) // 開始y座標
                .attr("width", width) // 横幅
                .attr("height", height) // 縦幅
                .attr("fill", data.fill) // 長方形の中の色
                .attr("stroke-width", 1)
                .attr("stroke", data.stroke)
            .on("mouseover", function(d) {
                let a=d3.select(this).attr("id");


            })
        .on("mouseout", function(d) {
        });


        }

    }


    for (let i = 0; i < heartData.drawDataList.length; i++) {


        let data = heartData.drawDataList[i];

        let y = heartData.getColounStartPosY(data.colIndex);
        y += data.startH;
        y = y + HeartConfig.TimeHeight;


        let colH = data.heightPixcel;
        let textColor,textBackColor;


        if (data.type === "text") {

            if (data.posTop === "center") {
                y += colH / 2;
            } else if (data.posTop === "bottom") {
                y += colH - 5;
            } else {
                y += colH / 2;
            }
            let x = getXbyD(data.d, true);


            if (data.margineText != null && data.margineText > 0) {
                x += data.margineText * 14;
            }




            let tx=x;
            let dt=0;
            if (data.state != null) {


                let sx=x + data.leftMargine;
                let sy=y + data.topMargine - HeartConfig.MarkSize * 0.8;


                let svghtml = SVGFileTexts[data.state];
                if (svghtml != null) {

                    svg.append('g').html(svghtml)
                        .attr("class", "item_"+data.itemId)
                        .attr("id","state_"+data.entityItemId)
                        .attr("width", HeartConfig.MarkSize)
                        .attr("height", HeartConfig.MarkSize)
                        .attr("transform", "translate("+sx+","+sy+") scale("+HeartConfig.MarkScale+")")
                        .attr("x", x + data.leftMargine) // 開始x座標
                        .attr("y", y + data.topMargine - HeartConfig.MarkSize * 0.8);// 開始y座標


                    tx+=HeartConfig.MarkSize+HeartConfig.MarkRightMargne+1;
                    dt+=HeartConfig.MarkSize+HeartConfig.MarkRightMargne+1;

                } else {
                    console.log("no image  " + data.state);
                }
            }

            if (data.certainty != null) {

                let sx = x+dt;
                let sy = y - HeartConfig.MarkSize * 0.8;

                let svghtml = SVGFileTexts[data.certainty];
                if (svghtml != null) {

                    svg.append('g').html(svghtml)
                        .attr("class", "item_" + data.itemId)
                        .attr("id", "certainty_" + data.entityItemId)
                        .attr("width", HeartConfig.MarkSize)
                        .attr("height", HeartConfig.MarkSize)
                        .attr("transform", "translate(" + sx + "," + sy + ") scale(" + HeartConfig.MarkScale + ")")
                        .attr("x", sx + data.leftMargine) // 開始x座標
                        .attr("y", sy + data.topMargine + HeartConfig.MarkSize * 0.8);// 開始y座標

                    tx += HeartConfig.MarkSize + HeartConfig.MarkRightMargne + 1;
                } else {
                    console.log("no image  " + data.certainty);
                }
            }

            svg.append('text')
                .attr("id", data.id)
                .attr("class", "item_" + data.itemId)
                .attr("x", tx) // 開始x座標
                .attr("y", y) // 開始y座標
                .attr("font-family", HeartConfig.TextFontFamily)
                .attr("font-size", HeartConfig.TextFontSize)
                .attr('fill', HeartConfig.TextColor)
                .text(data.text)
                .on("mouseover", function(){
                    imgMouseOver(data.itemId);
                })
                .on("mouseout", function(){ imgMouseOut(); })
                .on("click",function(){ imgClick(data.itemId); });




        } else if (data.type === "tableText") {

            let x = getXbyD(data.d, true);

            let x1=x + data.leftMargine;


            if (data.state != null) {

                let sx=x + data.leftMargine;
                let sy=y + data.topMargine - HeartConfig.MarkSize * 0.8;


                let svghtml = SVGFileTexts[data.state];
                if (svghtml != null) {
                    svg.append('g').html(svghtml)
                        .attr("class", "item_"+data.itemId)
                        .attr("id","state_"+data.entityItemId)
                        .attr("width", HeartConfig.MarkSize)
                        .attr("height", HeartConfig.MarkSize)
                        .attr("transform", "translate("+sx+","+sy+") scale("+HeartConfig.MarkScale+")")
                        .attr("x", x + data.leftMargine) // 開始x座標
                        .attr("y", y + data.topMargine - HeartConfig.MarkSize * 0.8);// 開始y座標


                    x1+=HeartConfig.MarkSize+HeartConfig.MarkRightMargne+1;

                } else {
                    console.log("no image  " + data.state);
                }
            }


            if (data.certainty != null) {

                let sx=x1;
                let sy=y + data.topMargine - HeartConfig.MarkSize * 0.8;

                let svghtml = SVGFileTexts[data.certainty];
                if (svghtml != null) {
                    svg.append('g').html(svghtml)
                        .attr("class", "item_"+data.itemId)
                        .attr("id","certainty_"+data.entityItemId)
                        .attr("width", HeartConfig.MarkSize)
                        .attr("height", HeartConfig.MarkSize)
                        .attr("transform", "translate("+sx+","+sy+") scale("+HeartConfig.MarkScale+")")
                        .attr("x", x1) // 開始x座標
                        .attr("y", y + data.topMargine - HeartConfig.MarkSize * 0.8);// 開始y座標

                    x1+=HeartConfig.MarkSize+HeartConfig.MarkRightMargne+1;

                }
                else{
                    console.log("no image  "+data.certainty);
                }
            }

            svg.append('text')
                .attr("id","tableText_"+data.textId)
                .attr("class", "item_"+data.textId)
                .attr("x", x1) // 開始x座標
                .attr("y", y + data.topMargine) // 開始y座標
                .attr("font-family", HeartConfig.TextFontFamily)
                .attr("font-size", HeartConfig.TextFontSize)
                .attr('fill', HeartConfig.TextColor)
                .text(data.text)
                .on("mouseover", function(){
                    imgMouseOver(data.textId);
                })
                .on("mouseout", function(){ imgMouseOut(); })
                .on("click",function(){ imgClick(data.textId); });

        }
    }


 drawLabel(svg, width, true);


     d3.select('body').append('a')
      .attr('href-lang', 'image/svg+xml')
      .attr('href', 'data:image/svg+xml; charset=utf8, ' + unescape(svg.node().parentNode.outerHTML))
      .text('Download')
    ;

}


d3.select('#saveButton').on('click', function () {


    let svg = d3.select("#canvasMain").select("svg");

    let svgString = getSVGString(svg.node());




    svgString2Image(svgString, 2 * Width, 2 * Height, 'png', save); // passes Blob and filesize String to the callback

    function save(dataBlob, filesize) {
        let saveImageName;
        if(inputFileName){
            saveImageName =  inputFileName.replace(".json","");
            saveAs(dataBlob, saveImageName + '.png');
        }else{
            saveAs(dataBlob, 'HeaRT.png'); // FileSaver.js function
        }
    }



});

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString(svgNode) {
    //svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    svgNode.setAttribute('xlink', 'http://www.w3.org/2000/svg');
    let cssStyleText = getCSSStyles(svgNode);
    appendCSS(cssStyleText, svgNode);

    let serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

    return svgString;

    function getCSSStyles(parentElement) {
        let selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (let c = 0; c < parentElement.classList.length; c++)
            if (!contains('.' + parentElement.classList[c], selectorTextArr))
                selectorTextArr.push('.' + parentElement.classList[c]);

        // Add Children element Ids and Classes to the list
        let nodes = parentElement.getElementsByTagName("*");
        for (let i = 0; i < nodes.length; i++) {
            let id = nodes[i].id;
            if (!contains('#' + id, selectorTextArr))
                selectorTextArr.push('#' + id);

            let classes = nodes[i].classList;
            for (let c = 0; c < classes.length; c++)
                if (!contains('.' + classes[c], selectorTextArr))
                    selectorTextArr.push('.' + classes[c]);
        }

        // Extract CSS Rules
        let extractedCSSText = "";
        for (let i = 0; i < document.styleSheets.length; i++) {
            let s = document.styleSheets[i];

            try {
                if (!s.cssRules) continue;
            } catch (e) {
                if (e.name !== 'SecurityError') throw e; // for Firefox
                continue;
            }

            let cssRules = s.cssRules;
            for (let r = 0; r < cssRules.length; r++) {
                if (contains(cssRules[r].selectorText, selectorTextArr))
                    extractedCSSText += cssRules[r].cssText;
            }
        }


        return extractedCSSText;

        function contains(str, arr) {
            return arr.indexOf(str) === -1 ? false : true;
        }

    }

    function appendCSS(cssText, element) {
        let styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.innerHTML = cssText;
        let refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
    }
}


function svgString2Image(svgString, width, height, format, callback) {
    format = format ? format : 'png';

    let imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    let image = new Image();
    image.onload = function () {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(function (blob) {
            let filesize = Math.round(blob.length / 1024) + ' KB';
            if (callback) callback(blob, filesize);
        });


    };

    image.src = imgsrc;
}

function imgMouseOver(id){
    if (timer > 0) {
        clearTimeout(timer);
    }
    timer = setTimeout(function () {
        focus = d3.select("#T"+id);
        if(!focus.empty()){
            textColor = focus.style("color");
            textBackColor = focus.style("background");
            let count=0;
            function tmpBlink(){
                if(count<5){
                    focus.transition()
                    .duration(250)
                    .style("color",textBackColor)
                    .style("background",textColor)
                    .style("border","thin solid")
                    .style("border-color",textBackColor)
                    .transition()
                    .duration(250)
                    .style("color",textColor)
                    .style("background",textBackColor)
                    .style("border-color","#f7f7f7")
                    .each("end", tmpBlink);
                }
                count=count+1;
            };
            tmpBlink();
        }
    }, 500);
}
function imgMouseOut(){
    focus=d3.select("aaaaa");
    if (timer > 0) {
        clearTimeout(timer);
    }
    timer = setTimeout(function () {
        focus=d3.select("aaaaa");
    }, 500);
}

function imgClick(id){
    let elementPos=$('#T'+id).offset(),
        scrollPos=$(".ner-doc").offset();
    $("#temporary-col").scrollTop(elementPos.top-scrollPos.top);
    $("#temporary-col").scrollLeft(elementPos.left-scrollPos.left);

}
