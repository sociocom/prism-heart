'use strict';


//初期json ファイル
// コメントアウトにすると正気状態では空でスタート
var InitalFileJson="JP0133-1.json";

var TagNameList= [
        {keyList: ["TestKey", "TestTest", "TestVal"], name: "検査", fillColor: "#dedaf0", overflowColor: "#ebe8f6"},
        {keyList: ["MedicineKey", "MedicineVal"], name: "投薬", fillColor: "#daf0e0", overflowColor: "#e8f6ec"},
        {keyList: ["Remedy"], name: "処置", fillColor: "#eaf0da", overflowColor: "#f2f6e8"},
        {keyList: ["Disease"], name: "病気", fillColor: "#f0daea", overflowColor: "#f6e8f2"},
        {keyList: ["ClinicalContext"], name: "臨床", fillColor: "#daeaf0", overflowColor: "#e8f2f6"},
    ];

    
//画面分割の比率
var divisionRadio=1/3;




var TimeTickRectColor = [
    {
        minday: 360,
        color: "#00cbfd",
        text:"１年以上",
    },
    {
        minday: 180,
        color: "#52d7ff",
        text:"３ヶ月～１年",
    },
    {
        minday: 30,
        color: "#93e6fc",
        text:"１ヶ月～３か月",
    },
    {
        minday: 0,
        color: "rgb(190,239,253)",
         text:"１ヶ月未満",
    },

];


var HeartConfig0 = {

    //縦高さの基本
    BaseH: 50,

    //左ラベルの幅 左余白
    LabelLeftM: 80,


    //変更不可（CSSと連動している）
    TimeHeight: 55,


    //横軸の刻み幅
    TimeWidth1: 20,
    TimeWidth2: 30,
    TimeWidth3: 50,

    //目盛を２段で表示するかどうか
    IsTickMarkShift:true,


    //テーブルデータ用計算用
    FontPix: 11,
    FontPixLabel:12,
    FontPixM: 7,

    InnerMW: 10,
    InnerMH: 10,


    TableMH: 20,
    TableMW: 8,
    TableColM: 10,



    DiseaseColorRange: ['#F7F7F7', '#F9D1B9'],
    DiseaseTriangleColorRange: ['#F7F7F7', '#E2B7B8'],
    DiseaseInnerColorRange: ['#F7F7F7', '#FEF1EB'],

    TimeTickColor:"#404444",
    LabelLineColor:"#404444",

    TextColor: "#222",
    TextFontSize:"11px",
    TextFontFamily:"Roboto",

    TextFontSizeTick: "11px",
    TextFontSizeLabel: "12px",

    //マークサイズ
    MarkSize:16,
    //画像のスケール
    MarkScale:0.5,
    //マークから文字までの間隔
    MarkRightMargne:2,

    CanvasBackColor: "#f7f7f7",



};





var HeartConfig1 = {
    BaseH: 50,

    //左ラベルの幅 左余白
    LabelLeftM: 20,


    TimeHeight: 55,
    TimeWidth1: 20,
    TimeWidth2: 30,
    TimeWidth3: 50,


    //目盛を２段で表示するかどうか
    IsTickMarkShift: true,


   //テーブルデータ用計算用
    FontPix: 11,// 10,
    FontPixLabel:12,
    FontPixM: 7,

    InnerMW: 10,
    InnerMH: 10,


    TableMH: 16,
    TableMW: 8,
    TableColM: 10,


    DiseaseColorRange: ['#F7F7F7', '#F9D1B9'],
    DiseaseTriangleColorRange: ['#F7F7F7', '#E2B7B8'],
    DiseaseInnerColorRange: ['#F7F7F7', '#FEF1EB'],

    TimeTickColor:"#404444",
    LabelLineColor:"#404444",

    TextColor: "#000",
    TextFontSize:"11px",//"10px",
    TextFontFamily:"Roboto",

    TextFontSizeTick:"10px",
    TextFontSizeLabel: "12px",

    //マークサイズ
    MarkSize:16,
    //画像のスケール
    MarkScale:0.45,
    //マークから文字までの間隔
    MarkRightMargne:2,

    CanvasBackColor: "#f7f7f7",


};



var HeartConfig2 = {
    BaseH: 50,

    //左ラベルの幅 左余白
    LabelLeftM: 20,


    TimeHeight: 55,
    TimeWidth1: 20,
    TimeWidth2: 30,
    TimeWidth3: 50,

    //目盛を２段で表示するかどうか
    IsTickMarkShift:true,


    //テーブルデータ用計算用
    FontPix: 10,
    FontPixLabel:12,
    FontPixM: 7,

    InnerMW: 10,
    InnerMH: 10,


    TableMH: 16,
    //テーブルの左マージン
    TableMW: 5,
    TableColM: 10,


    DiseaseColorRange: ['#F7F7F7', '#F9D1B9'],
    DiseaseTriangleColorRange: ['#F7F7F7', '#E2B7B8'],
    DiseaseInnerColorRange: ['#F7F7F7', '#FEF1EB'],

    TimeTickColor:"#404444",
    LabelLineColor:"#404444",


    TextColor: "#000",
    TextFontSize:"10px",
    TextFontFamily:"Roboto",

    TextFontSizeTick:"10px",
    TextFontSizeLabel: "12px",


    //マークサイズ
    MarkSize:14,
    //画像のスケール
    MarkScale:0.45,
    //マークから文字までの間隔
    MarkRightMargne:2,


    CanvasBackColor: "#f7f7f7",


};
