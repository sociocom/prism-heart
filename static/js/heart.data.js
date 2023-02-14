'use strict';


function isEmpty(obj) {
    return !Object.keys(obj).length;
}

var MARK = "*";

class HeartData {


    constructor(jsontext) {
        this.data = JSON.parse(JSON.stringify(jsontext));
        this.htmlData = this.data.html

        this.TagNameList = JSON.parse(JSON.stringify(TagNameList));



        this.markIndex = 0;

        this.drawDataList = [];

        //目盛の間に塗るデータ
        this.drawTickRectList = [];


        this.columns = [];

        this.anatomyMaxTextLength = 0;

        this.anatomyList = this.data.anatomy;
        this.anatomyHash = {};
        for (let i = 0; i < this.anatomyList.length; i++) {
            this.anatomyHash[this.anatomyList[i].id] = this.anatomyList[i];
            this.anatomyList[i].treeIndex = 0;
            if (this.anatomyList[i].text.length > this.anatomyMaxTextLength) this.anatomyMaxTextLength = this.anatomyList[i].text.length;

            //heightwiseBlock 高さ方向ブロック
            this.columns.push({
                type: "anatomy",
                id: this.anatomyList[i].id,
                heightwiseBlock: [],
                fillColor:"url(#DiseaseFill)",
                overflowColor:"url(#DiseaseFill)",
                name:this.anatomyList[i].text,
                drawDataPosList:[],//key timeLineIndex
            });
        }

        //検査等
        for (let i = 0; i < this.TagNameList.length; i++) {
            this.columns.push({
                type: "tag",
                id: this.TagNameList[i].name,
                heightwiseBlock: [],
                fillColor: this.TagNameList[i].fillColor,
                overflowColor: this.TagNameList[i].overflowColor,
                name: this.TagNameList[i].name,
                keyList: this.TagNameList[i].keyList,
                drawDataPosList: [],
            });
        }


        //子供ツリーの階層を計算する
        for (let i = 0; i < this.anatomyList.length; i++) {
            for (let j = 0; j < this.anatomyList[i].contain.length; j++) {
                this.anatomyHash[this.anatomyList[i].contain[j]].treeIndex++;
            }
        }

        this.timeList = this.data.times;
        this.timeHash = {};
        this.entitieList = this.data.entities;
        this.entitieHash = {};


        //子供ツリーの階層を計算する
        for (let i = 0; i < this.entitieList.length; i++) {
            this.entitieHash[this.entitieList[i].id] = this.entitieList[i];
            this.entitieList[i].regionTreeIndex = 0;

            if (this.getColumnIndexByEntity(this.entitieList[i]) === -1) {
                //登録がない
                this.columns.push({
                    type: "tag",
                    id: this.entitieList[i].tag,
                    heightwiseBlock: [],
                    fillColor: this.TagNameList[0].fillColor,
                    overflowColor: this.TagNameList[0].overflowColor,
                    name: this.entitieList[i].tag,
                    keyList: [this.entitieList[i].tag],
                    drawDataPosList:[],
                });
            }

            this.setEntitieListTree(this.entitieList[i], 0);

        }


        //以前より の表示に使用する
        this.beforeTimeSpanDay = 10;


        this.timeLine = [];

        let lastUnixtimestamp = 0;
        for (let i = 0; i < this.timeList.length; i++) {
            let item = this.timeList[i];
            this.timeHash[item.id] = item;
            let datestr = item.value;
            item.unixtimestamp = Date.parse(datestr);
            item.date = new Date(item.unixtimestamp);

            this.timeLine.push({id: item.id, unixtimestamp: item.unixtimestamp, category: "org", text: item.text});
            this.timeLine.push({id: item.id, unixtimestamp: item.unixtimestamp + 3600 * 24, category: "nextday", text: ""});

            //以前より を入れておく
            this.timeLine.push({id: item.id, unixtimestamp: item.unixtimestamp - 3600 * 24 * 10000 * this.beforeTimeSpanDay, category: "before", text: ""});

            if (lastUnixtimestamp < item.unixtimestamp) {
                lastUnixtimestamp = item.unixtimestamp;
            }
        }

        //ソート
        this.timeLine.sort(function (a, b) {
            if (a.unixtimestamp < b.unixtimestamp) return -1;
            if (a.unixtimestamp > b.unixtimestamp) return 1;
            return 0;
        });


        for(let i=0;i<this.columns.length;i++){
            for(let j=0;j<this.timeLine.length;j++){
                this.columns[i].drawDataPosList.push(0);
            }
        }


        //重複削除
        let boforeunixtimestamp = 0;

        while (true) {
            let removeFlag = false;
            for (let i = 0; i < this.timeList.length; i++) {
                if (boforeunixtimestamp === this.timeLine[i].unixtimestamp) {
                    //削除
                    //どちらを削除するか
                    if (this.timeList[i].category === "org" && this.timeList[i - 1].category !== "org") {
                        this.timeLine.splice(i + 1, 1);
                    } else if (this.timeList[i].category !== "org" && this.timeList[i - 1].category !== "org") {
                        this.timeLine.splice(i + 1, 1);
                    } else {
                        this.timeLine.splice(i, 1);
                    }
                    removeFlag = true;
                    break;
                }
            }
            if (removeFlag === false) {
                break;
            }
        }


        let minDTime = 100000000000;
        let maxDtime = 0;
        this.timeLine[0].spanDay = 0;
        for (let i = 1; i < this.timeLine.length; i++) {
            let d = this.timeLine[i].unixtimestamp - this.timeLine[i - 1].unixtimestamp;
            if (d > maxDtime) maxDtime = d;
            if (d < minDTime) minDTime = d;
            this.timeLine[i].spanDay = d / 3600 / 24 / 1000;

        }

        this.minSpanDay = minDTime / 3600 / 24 / 1000;
        this.maxSpanDay = maxDtime / 3600 / 24 / 1000;
        this.wholeSpanDay = (this.timeLine[this.timeLine.length - 1].unixtimestamp - this.timeLine[0].unixtimestamp) / 3600 / 24 / 1000;

        if(rangeValue==2){
            //spanの幅に従った目盛り
            let d = 0, dd = 3;
            this.timeLine[0].d = 0;
            //beforeがない場合に左に余白を作る
            if(this.timeLine[0].category!="before"){
                this.timeLine[0].d = 2;
            }

            for (let i = 1; i < this.timeLine.length; i++) {
                let spanDay = this.timeLine[i].spanDay/100;
                for (let j = 0; j < spanDay - 1; j++) {
                    d = d + dd;
                }
                d = d + dd;
                this.timeLine[i].d = d;
                
            }
            this.maxTickDay = d;
            
        }else if(rangeValue==1){
            //大まかなspanのスケールに応じた目盛り
            let d = 0;
            this.timeLine[0].d = 0;
            //beforeがない場合に左に余白を作る
            if(this.timeLine[0].category!="before"){
                this.timeLine[0].d = 2;
            }

            for (let i = 1; i < this.timeLine.length; i++) {
                let spanDay = this.timeLine[i].spanDay;
                if (spanDay < 3) {
                    for (let j = 0; j < spanDay - 1; j++) {
                        d = d + 1;
                    }
                    d = d + 1;
                    this.timeLine[i].d = d;
                } else if (spanDay < 30) {
                    d = d + 3;
                    this.timeLine[i].d = d;
                } else if (spanDay < 180) {
                    d = d + 6;
                    this.timeLine[i].d = d;
                } else {
                    d = d + 8;
                    this.timeLine[i].d = d;
                }
            }
            this.maxTickDay = d;
        }else if(rangeValue==0){
            //等間隔の目盛り
            let d = 0, dd = 2;
            this.timeLine[0].d = 0;
            //beforeがない場合に左に余白を作る
            if(this.timeLine[0].category!="before"){
                this.timeLine[0].d = 2;
            }

            for (let i = 1; i < this.timeLine.length; i++) {
                
                d = d + dd;
                this.timeLine[i].d = d;
            }
            this.maxTickDay = d;
        }

        //tickの目盛間隔に色を塗る
        let before = null;
        for (let i = 0; i < this.timeLine.length; i++) {
            let p = this.timeLine[i];
            if (p.category === "org") {
                if (before != null) {
                    console.log(p.unixtimestamp - before.unixtimestamp);

                    let diffmsec = p.unixtimestamp - before.unixtimestamp;
                    let color=null;
                    for (let j = 0; j < TimeTickRectColor.length; j++) {

                        if (diffmsec > TimeTickRectColor[j].minday * 86400 * 1000) {
                           color=TimeTickRectColor[j].color;
                           break;
                        }
                    }
                    if(color!=null){
                         this.drawTickRectList.push(
                                {
                                    type: "tickRect",
                                    t1: before.d,
                                    t2: p.d,
                                    color:color,
                                }
                            );
                    }

                }
                before=p;
            }

         }



        if (this.maxTickDay < 10) {
            this.TimeWidth = HeartConfig.TimeWidth3;
        } else if (this.maxTickDay < 30) {
            this.TimeWidth = HeartConfig.TimeWidth2;
        } else {
            this.TimeWidth = HeartConfig.TimeWidth1;
        }

        for (let i = 0; i < this.entitieList.length; i++) {


            let item = this.entitieList[i];
            if (item.anatomy != null) {

                this.setEntityViewData(item);
            }
        }

        let item=null;
        let testData = [];
        for (let i = 0; i < this.entitieList.length; i++) {
            item = this.entitieList[i];

            if (item.anatomy != null) {

                if (testData.length > 0) {
                    let tableData = this.getTableDataByEntityText(testData);
                    this.setViewDataByTableData(tableData, item);
                    testData = [];
                }
                 continue;
            }

            testData.push(item);
            for (let k = i + 1; k < this.entitieList.length; k++) {
                let itemK = this.entitieList[k];


                if (itemK.tag === item.tag && item.time[0] === itemK.time[0] && item.time[1] === itemK.time[1]) {
                    // 同じように処理する
                    if(itemK.anatomy==null) {
                        testData.push(itemK);
                    }
                    i=k;

                } else {
                    if (testData.length > 0) {
                        let tableData = this.getTableDataByEntityText(testData);
                        this.setViewDataByTableData(tableData, item);

                        testData = [];
                        i=k-1;
                        break;
                    }
                }
            }


        }
        if (testData.length > 0) {

            let tableData = this.getTableDataByEntityText(testData);
            this.setViewDataByTableData(tableData, item);

        }

    }




    //テーブルの表示データの作成
    setViewDataByTableData(tableData,entityItem) {

        if (tableData == null) {
            return;
        }
        let maxCol = 0;
        let maxTextLengthList = [];

        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].length > maxCol) {
                maxCol = tableData[i].length;
            }
        }
        for (let i = 0; i < maxCol; i++) {
            maxTextLengthList.push(0);
        }
        for (let i = 0; i < tableData.length; i++) {
            for (let j = 0; j < tableData[i].length; j++) {
                let textLen = tableData[i][j].text.length
                if (j > 0) {
                    //マーク
                    textLen += 3;
                }
                //マーク
                textLen += 2;
                if (maxTextLengthList[j] < textLen) {
                    maxTextLengthList[j] = textLen;
                }
            }
        }

        let itmeItem1 = this.getTickItem(entityItem.time[0], false);
        let itmeItem2 = this.getTickItem(entityItem.time[1], false);


        let rectWidth=HeartConfig.TableMW;
        for(let i=0;i<maxTextLengthList.length;i++){
            rectWidth+= maxTextLengthList[i]*HeartConfig.FontPix;
            if(i>0){
                rectWidth+=HeartConfig.TableColM;
            }
        }

        let heightPixcel=HeartConfig.TableMH+tableData.length*(HeartConfig.FontPix+HeartConfig.FontPixM) -HeartConfig.FontPixM;


        // {colIndex: colIndex,startH: max};
        //どこに描画するかの計算


        let hInfo=this.calcColumnPos2(entityItem, false, heightPixcel,rectWidth);


        let width = itmeItem2.d+1 - itmeItem1.d;
        if (width === 0) {
            width = 1;
        }

        //if (maxTextLengthList.length > 1 && rectWidth > width * this.TimeWidth) {
            //外枠
            this.drawDataList.push(
                {
                    //id: "tableRect_"+entityItem.id,
                    type: "tableRect",
                    tag: entityItem.tag,
                    d: itmeItem1.d,
                    colIndex: hInfo.colIndex,
                    startH:hInfo.startH,
                    widthPixcel: rectWidth,
                    heightPixcel: heightPixcel,
                    fill: "#F7F7F7",
                    stroke: "#ccc",
                    entityItemId:entityItem.id

                }
            );
        //}


        this.drawDataList.push({
            type: "tableRect",
            tag: entityItem.tag,
            entityId:entityItem.id,
            d: itmeItem1.d,
            colIndex: hInfo.colIndex,
            startH:hInfo.startH,
            width: width,
            heightPixcel: heightPixcel,
            fill: this.columns[hInfo.colIndex].fillColor,
            stroke: this.columns[hInfo.colIndex].fillColor,
            entityItemId:entityItem.id

        });




        let topMargine = HeartConfig.TableMH;

        for (let i = 0; i < tableData.length; i++) {

            let leftMargine = HeartConfig.TableMW;

            for (let j = 0; j < tableData[i].length; j++) {
                let text = tableData[i][j].text;

                if(j>0){
                    leftMargine+=HeartConfig.MarkSize ;
                }



                this.drawDataList.push(
                    {
                        type: "tableText",
                        tag: entityItem.tag,
                        d: itmeItem1.d,
                        entityId:entityItem.id,
                        posLeft: "left",
                        posTop: "center",
                        colIndex: hInfo.colIndex,
                        startH:hInfo.startH,
                        size: 1,
                        leftMargine:leftMargine,
                        topMargine:topMargine,
                        text: text,
                        entityItemId:entityItem.id,
                        textId:tableData[i][j].dataId,
                        state:tableData[i][j].state,
                        certainty:tableData[i][j].certainty,
                    }
                );

                leftMargine += maxTextLengthList[j] * HeartConfig.FontPix + HeartConfig.TableColM;

                if (tableData[i][j].state != null) {
                    leftMargine += HeartConfig.MarkSize + HeartConfig.MarkRightMargne;
                }
                if (tableData[i][j].certainty != null) {
                    leftMargine += HeartConfig.MarkSize + HeartConfig.MarkRightMargne;
                }
            }
            topMargine += HeartConfig.FontPix+HeartConfig.FontPixM;
        }




    }

    getTableDataByEntityText(testData) {

        if (testData.length === 0) {
            return null;
        }


        let item = testData[0];
        let itmeItem1 = this.getTickItem(item.time[0], false);
        let itmeItem2 = this.getTickItem(item.time[1], false);

        //今は使用するのは、先頭の日付のみ
        let tableData = [];
        for (let i = 0; i < testData.length; i++) {
            let textList = [];
            textList.push({text:testData[i].text,state:testData[i].state,certainty:testData[i].certainty,dataId:testData[i].id})
            for (let j = 0; j < testData[i].value.length; j++) {
                textList.push({text:testData[i].value[j].text,state:testData[i].value[j].state,certainty:testData[i].value[j].certainty,dataId:testData[i].value[j].id})
            }

            tableData.push(textList);
        }

        return tableData;


    }


    setEntityViewData(item) {
        let anatomyId = item.anatomy;
        let anatomyItem = this.anatomyHash[anatomyId];

        if (item.time.length !== 2) {
            console.log("ERROR!!!!!!! item.time.length!=2 anatomyId=" + anatomyId);
            return;
        }
        let boreFlag = false;
        if (item.tag.toLowerCase() === "disease") {
            boreFlag = true
        }
        let itmeItem1 = this.getTickItem(item.time[0], false);
        let itmeItem2 = this.getTickItem(item.time[1], false);
        if (itmeItem1 == null || itmeItem2 == null) {
            console.log("ERROR!!!!!!! itmeItem1==null || itmeItem2==null anatomyId=" + anatomyId);
            return;
        }


          let heightPixcel = HeartConfig.BaseH

        let hInfo=this.calcColumnPos2(item, boreFlag, heightPixcel,null);




        //グラデーション
        //http://bl.ocks.org/pnavarrc/20950640812489f13246

        //領域内に入れる文字
        let featureText = this.getFeatureTextByEntity(item)
        let changeTextList = this.getChangeTextByEntity(item);



        if (item.tag.toLowerCase() === "disease") {
            let itmeItem0 = this.getTickItem(item.time[0], true);

            //前グラデーション
            this.drawDataList.push(
                {
                    id: "gradRect_"+item.id,
                    itemId: item.id,
                    type: "rect",
                    tag: item.tag,
                    d: itmeItem0.d,
                    colIndex: hInfo.colIndex,
                    startH: hInfo.startH,
                    heightPixcel: heightPixcel,

                    width: itmeItem1.d - itmeItem0.d,
                    fill: "url(#DiseaseGradient)",
                     stroke:"url(#DiseaseGradient)",
                }
            );
        }

        this.drawDataList.push(
            {
                id: "rect_"+item.id,
                itemId: item.id,
                type: "rect",
                tag: item.tag,
                d: itmeItem1.d,
                colIndex: hInfo.colIndex,
                width: itmeItem2.d - itmeItem1.d + 1,
                startH: hInfo.startH,
                heightPixcel: heightPixcel,
                fill: "url(#DiseaseFill)",
                stroke: "url(#DiseaseFill)",
            }
        );

        if (item.parentKey === "内部") {
            //内部にもう１つ四角

            let margine = "borth";
            if (item.tag.toLowerCase() === "disease") {
                let itmeItem0 = this.getTickItem(item.time[0], true);

                margine = "right";
                //前グラデーション
                this.drawDataList.push(
                    {
                        id: "gradRectInner_"+item.id,
                        itemId: item.id,
                        type: "rect",
                        tag: item.tag,
                        margine: "left",
                        d: itmeItem0.d,
                        colIndex: hInfo.colIndex,

                        width: itmeItem1.d - itmeItem0.d,
                        startH: hInfo.startH,
                        heightPixcel: heightPixcel,
                        fill: "url(#DiseaseInnerGradient)",
                        stroke: "url(#DiseaseInnerGradient)",
                        regionTreeIndex: item.regionTreeIndex,
                    }
                );
            }


            this.drawDataList.push(
                {
                    id: "rectInner_"+item.id,
                    itemId: item.id,
                    type: "rect",
                    tag: item.tag,
                    margine: margine,
                    d: itmeItem1.d,
                    colIndex: hInfo.colIndex,
                    width: itmeItem2.d - itmeItem1.d + 1,
                    startH: hInfo.startH,
                    heightPixcel: heightPixcel,
                    fill: "url(#DiseaseInnerFill)",
                    stroke: "url(#DiseaseInnerFill)",
                    regionTreeIndex: item.regionTreeIndex,
                }
            );


        }


        //図形が先
        for (let j = 0; j < changeTextList.length; j++) {
            //{markIndex:this.markIndex,text:entityItem.change[i].text,markd:d}

            if (changeTextList[j].text === "より増大") {
                //増大の三角
                this.drawDataList.push(
                    {
                        type: "path",
                        tag: item.tag,
                        lineData: [
                            {d: changeTextList[j].markd, h: 1},
                            {d: itmeItem2.d + 1, h: 1},
                            {d: itmeItem2.d + 1, h: 0},
                        ],
                        colIndex: hInfo.colIndex,
                       startH: hInfo.startH,
                        heightPixcel: heightPixcel,
                        fill:  HeartConfig.DiseaseTriangleColorRange[1],
                    stroke: HeartConfig.DiseaseTriangleColorRange[1],
                    }
                );
            }

        }

        let text1 = item.text;
        if (item.parentKey != null) {
            text1 = item.parentKey + " : " + text1;
        }


        this.drawDataList.push(
            {
                id: "text_"+item.id,
                itemId: item.id,
                type: "text",
                tag: item.tag,
                d: itmeItem1.d,
                posLeft: "left",
                posTop: "center",
                colIndex: hInfo.colIndex,
                 startH: hInfo.startH,
                    heightPixcel: heightPixcel,
                size: 1,
                margineText: 0,
                text: text1,
                certainty:item.certainty,
                state:item.state,
                anatomy:item.anatomy,
                leftMargine:0,
                topMargine:0,
            }
        );





        ///////////////////////////////////////
        ///////////////////////////////////////
        ///////////////////////////////////////
        ///////////////////////////////////////
        //TODO item.text.length

        if (featureText != null) {

            let textlen_text="";
            let textlen=item.text.length;
            textlen_text+=item.text;
            if(item.parentKey!=null){
                 textlen+=item.parentKey.length;
                 textlen_text+=item.parentKey;
            }

            textlen++;


            this.drawDataList.push(
                {
                    id: "featuretext_"+item.id,
                    itemId: item.id,
                    type: "text",
                    tag: item.tag,
                    d: itmeItem1.d,
                    posLeft: "left",
                    posTop: "center",
                    colIndex: hInfo.colIndex,
                     startH: hInfo.startH,
                    heightPixcel: heightPixcel,
                    size: 2,
                    margineText: textlen,
                    text: featureText,
                }
            );
        }


        for (let j = 0; j < changeTextList.length; j++) {
            //{markIndex:this.markIndex,text:entityItem.change[i].text,markd:d};

            let startd = changeTextList[j].markd;



            //マーク
            this.drawDataList.push(
                {
                    id: "mark_"+item.id,
                    itemId: item.id,
                    type: "text",
                    tag: item.tag,
                    pos: "right",
                    posTop: "bottom",
                    d: changeTextList[j].markd,
                    colIndex: hInfo.colIndex,
                     startH: hInfo.startH,
                    heightPixcel: heightPixcel,
                    size: 3,
                    margineText: 0,
                    text: MARK + changeTextList[j].markIndex
                }
            );



            //マークに対応するテキスト
            this.drawDataList.push(
                {
                    id: "markText_"+item.id,
                    itemId: item.id,
                    type: "text",
                    tag: item.tag,
                    pos: "right",
                    posTop: "bottom",
                    d: changeTextList[j].textd,
                    colIndex: hInfo.colIndex,
                     startH: hInfo.startH,
                    heightPixcel: heightPixcel,
                    size: 3,
                    margineText: 0,
                    text: MARK + changeTextList[j].markIndex + changeTextList[j].text
                }
            );


        }
        if (isEmpty(item.region) === false) {
            for (let key in item.region) {
                for (let j = 0; j < item.region[key].length; j++) {
                    let child = item.region[key][j];
                    this.setEntityViewData(child);
                }

            }
        }



    }



    getTickItem(timeId, boreFlag) {
        for (let i = 0; i < this.timeLine.length; i++) {
            if (this.timeLine[i].id === timeId) {
                if (boreFlag === false && this.timeLine[i].category === "org") {
                    return this.timeLine[i];
                } else if (boreFlag === true && this.timeLine[i].category === "before") {
                    return this.timeLine[i];
                }
            }
        }

        return this.timeLine[0];

    }


    getTickIndexByDay(d) {
        for (let i = 0; i < this.timeLine.length; i++) {
            if (this.timeLine[i].d === d) {
                return i;
            }
            if(this.timeLine[i].d > d){
                return i;
            }
        }

        return 0;

    }


    setEntitieListTree(item, treeIndex) {

        if (isEmpty(item.region) === false)
            for (let key in item.region) {
                for (let i = 0; i < item.region[key].length; i++) {
                    item.region[key][i].regionTreeIndex = treeIndex + 1;
                    item.region[key][i].parentKey = key;
                    this.setEntitieListTree(item.region[key][i], treeIndex + 1)
                    this.entitieHash[item.region[key][i].id] = item.region[key][i];
                }
            }
    }


    getColumnIndexByEntity(entityItem) {
        if (entityItem.anatomy != null) {
            for (let i = 0; i < this.columns.length; i++) {
                if (this.columns[i].id === entityItem.anatomy) {
                    return i;
                }
            }
        } else {
            for (let i = 0; i < this.columns.length; i++) {
                if(this.columns[i].keyList==null){
                    continue;
                }
                for(let j=0;j<this.columns[i].keyList.length;j++){
                    if(this.columns[i].keyList[j]===entityItem.tag){
                         return i;
                    }
                }
            }
        }
        return -1;
    }


    getHeight() {
        let totalH = 0;

        for (let i = 0; i < this.columns.length; i++) {
            for (let j = 0; j < this.columns[i].heightwiseBlock.length; j++) {
                totalH += this.columns[i].heightwiseBlock[j];
            }
        }

        return totalH;

    }

    getWidth(){

    }



    getHight(){

        let h=0;
        for(let i=0;i<this.columns.length;i++){
            h+=this.getColumnHeight(i);
        }

        return h;

    }

    getColounStartPosY(colIndex) {
        let h=0;
        for(let i=0;i<colIndex;i++){
            h+=this.getColumnHeight(i);
        }
        return h;

    }

    getColumnHeight(colIndex){


        let posList = this.columns[colIndex].drawDataPosList;
        let maxDay=this.timeLine[this.timeLine.length-1].d;

        let max=0;
        for(let i=0;i<=maxDay;i++){
            if(posList[i]>max){
                max=posList[i];
            }
        }

        return max;

    }


    //次に配置する位置を決める
    calcColumnPos2(entityItem, boreFlag, heightPx, widthPixcel) {


        let colIndex = this.getColumnIndexByEntity(entityItem);
        let itmeItem1 = this.getTickItem(entityItem.time[0], boreFlag);
        let itmeItem2 = this.getTickItem(entityItem.time[1], false);

        let mind=itmeItem1.d;
        let maxd=itmeItem2.d + 1


        //現在のDay刻み

        if (widthPixcel != null) {
            let maxd2 = mind + Math.ceil(widthPixcel / this.TimeWidth);

            if (maxd2 > maxd) {
                maxd = maxd2;
            }
        }


        let posList = this.columns[colIndex].drawDataPosList;



        let max = 0;
        for (let i = mind; i <= maxd; i++) {
            if (posList[i] > max) {
                max = posList[i];
            }
        }

        //登録
        for (let i = mind; i <= maxd; i++) {
            posList[i] = max + heightPx;
        }
        return  {colIndex: colIndex,startH: max};


    }



    getFeatureTextByEntity(entityItem) {
        if (entityItem.feature.length > 0) {
            let str = ""
            for (let i = 0; i < entityItem.feature.length; i++) {
                if (i > 0) {
                    str += "・";
                }
                str += entityItem.feature[i];
            }
            return "(" + str + ")";
        }
        return null;

    }

    getChangeTextByEntity(entityItem) {


        if (entityItem.change.length === 0) {
            return [];
        }
        let changeTextList = [];
        for (let i = 0; i < entityItem.change.length; i++) {
            this.markIndex++;
            let markd = this.getFirstOrgTimeIndex();
            let textd = 0;
            let compare = entityItem.change[i].compare;
            if (compare != null) {
                let compareItem = this.entitieHash[compare];
                if (compareItem != null) {
                    let tickItem0 = this.getTickItem(compareItem.time[0], false);
                    markd = tickItem0.d
                }

            }
            let tickItem2 = this.getTickItem(entityItem.time[1], false);
            if (tickItem2 != null) {
                textd = tickItem2.d;
            }



            changeTextList.push({markIndex: this.markIndex, text: entityItem.change[i].text, markd: markd, textd: textd, compare: entityItem.change[i].compare});
        }
        return changeTextList;
    }

    getFirstOrgTimeIndex(){
        for(let i=0;i<this.timeLine.length;i++){
            if(this.timeLine[i].category === "org" ){
                return this.timeLine[i].d;
            }
        }
         return 0;
    }


}