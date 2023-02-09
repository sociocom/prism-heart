'use strict';

var scrollable_width = 0,
scrollbar_area_width = 0,
adjustment_width = 0,
scrollbar_width = 0,
scrollable_height = 0,
scrollbar_area_height = 0,
adjustment_height = 0,
scrollbar_height = 0;


//スクロール
$(function () {
    eventOff() ;
    initScroll();
    initScrollX();
});

function setScrollEvent(){
    eventOff() ;
    initScroll();
    initScrollX();
}


function eventOff() {
    $('.content-wrap').off('scroll');
    $('.scroll-bar-h').off('mousedown');
    $('.scroll-bar-v').off('mousedown');
    $('.start').off('mousedown');
    $('.end').off('mousedown');
    $(document).off('mouseup');
    $(document).off('mousemove');
    $(document).off('selectstart');
    $('.content-wrap').off('scroll');
    $('.scroll-bar-h').off('mousedown');
    $('.start').off('mousedown');
    $('.end').off('mousedown');
    $(document).off('mouseup');
    $(document).off('mousemove');
    $(document).off('selectstart');

}

function initScroll() {

    scrollable_width = $('.content-wrap').width();
    scrollbar_area_width = $('.content-wrap').width() - $('.scroll-bar-v').width();
    adjustment_width = $('.img_main').outerWidth() - $('.title-scroll-wrap').width() + $('.scroll-bar-v').width();
    scrollbar_width = parseInt(scrollbar_area_width * scrollable_width / adjustment_width);
    scrollable_height = $('.content-wrap').height();
    scrollbar_area_height = $('.content-wrap').height() - $('.scroll-bar-h').height();
    adjustment_height = $('.img_main').outerHeight() - $('.timescale-wrap').height() + $('.scroll-bar-h').height();
    scrollbar_height = parseInt(scrollbar_area_height * scrollable_height / adjustment_height);

    if(scrollable_width > adjustment_width){
        $('.scroll-bar-h').hide()
    }else{$('.scroll-bar-h').show()}
    if(scrollable_height > adjustment_height){
        $('.scroll-bar-v').hide()
    }else{$('.scroll-bar-v').show()}

    $('.scroll-bar-h').css('width', scrollbar_width);
    $('.scroll-bar-v').css('height', scrollbar_height);

    var scrollbar_track_x = scrollbar_area_width - scrollbar_width,
        scrollbar_track_y = scrollbar_area_height - scrollbar_height;

        
    //スクロールと連動してつまみが移動
    $('.content-wrap').on('scroll', function () {
        var offset_x = $(this).scrollLeft() * scrollbar_track_x / (adjustment_width - scrollable_width);
        var offset_y = $(this).scrollTop() * scrollbar_track_y / (adjustment_height - scrollable_height);


        $('.scroll-bar-h').css('transform', 'translateX(' + offset_x + 'px)');
        $('.scroll-bar-v').css('transform', 'translateY(' + offset_y + 'px)');
        //連動して移動したつまみに、さらに連動してサイドも移動
        $('.timescale-wrap').scrollLeft(($('.scroll-bar-h').offset().left - $('.scroll-bar-horizontal').offset().left) / scrollbar_track_x * (adjustment_width - scrollable_width));
        $('.title-scroll-wrap').scrollTop(($('.scroll-bar-v').offset().top - $('.scroll-bar-vertical').offset().top) / scrollbar_track_y * (adjustment_height - scrollable_height));
    });


    var v_active = false, // つまみを操作しているかどうか
        h_active = false,
        active_s = false, // つまみの先端を操作しているかどうか
        active_e = false, // つまみの終端を操作しているかどうか
        scrollbar_thumb_cursor_x,
        scrollbar_thumb_cursor_y, // つまみ内のクリック位置
        scrollbar_start_cursor_y,
        scrollbar_end_cursor_y;

    //つまみを動かしてスクロール（端を押しているときは動かせない）

    $('.scroll-bar-h').on('mousedown', function (event) {
        h_active = true;
        scrollbar_thumb_cursor_x = event.pageX - $(this).offset().top;
    });

    $('.scroll-bar-v').on('mousedown', function (event) {
        v_active = true;
        scrollbar_thumb_cursor_y = event.pageY - $(this).offset().top;
    });

    $('.start').on('mousedown', function (event) {
        active_s = true;
        scrollbar_start_cursor_y = event.pageY - $(this).offset().top;
    });

    $('.end').on('mousedown', function (event) {
        active_e = true;
        scrollbar_end_cursor_y = event.pageY - $(this).offset().top;
    });


    $(document).on('mouseup', function () {
        h_active = false;
        v_active = false;
        active_s = false;
        active_e = false;
    });


    $(document).on('mousemove', function (event) {
        if (!h_active && !v_active) return;


        if (v_active) {
            if (active_s) {//上に伸ばす

            } else if (active_e) {//下に伸ばす
                return;
                var scrollbar_end_y = (event.pageY / scrollbar_track_y * scrollbar_track_y) - scrollbar_thumb_cursor_y;

                if (scrollbar_thumb_y < 0) {
                    scrollbar_thumb_y = 0;
                } else if (scrollbar_thumb_y > scrollbar_track_y) {
                    scrollbar_thumb_y = scrollbar_track_y;
                }

                $('.scroll-bar-v').css('height', scrollbar_height + scrollbar_end_y - $('.timescale-wrap').height() - $('header').height());


            } else {//縦のスクロール
                var scrollbar_thumb_y = ((event.pageY - $('.scroll-bar-vertical').offset().top) / scrollbar_track_y * scrollbar_track_y) - scrollbar_thumb_cursor_y;
                // つまみが上下の領域外を超えないようにする

                if (scrollbar_thumb_y < 0) {
                    scrollbar_thumb_y = 0;
                } else if (scrollbar_thumb_y > scrollbar_track_y) {
                    scrollbar_thumb_y = scrollbar_track_y;
                }

                // つまみの位置設定
                $('.scroll-bar-v').css('transform', 'translateY(' + scrollbar_thumb_y + 'px)');

                // つまみの位置に応じてスクロールさせる
                $('.content-wrap').scrollTop(($('.scroll-bar-v').offset().top - $('.scroll-bar-vertical').offset().top) / scrollbar_track_y * (adjustment_height - scrollable_height));
                $('.title-scroll-wrap').scrollTop(($('.scroll-bar-v').offset().top - $('.scroll-bar-vertical').offset().top) / scrollbar_track_y * (adjustment_height - scrollable_height));
            }
        }
    });

    // つまみを操作中はテキスト選択できないようにする

    $(document).on('selectstart', function () {
        if (h_active || v_active || active_e || active_s) return false;
    });
    }


    //横方向のスクロール
    function initScrollX() {
    var scrollable_width = $('.content-wrap').width(),
        scrollbar_area_width = $('.content-wrap').width() - $('.scroll-bar-v').width(),
        adjustment_width = $('.img_main').outerWidth() - $('.title-scroll-wrap').width() + $('.scroll-bar-v').width(),
        scrollbar_width = parseInt(scrollbar_area_width * scrollable_width / adjustment_width),

        scrollbar_track = scrollbar_area_width - scrollbar_width;

    //スクロールと連動してつまみが移動

    $('.content-wrap').on('scroll', function () {
        var offset_x = $(this).scrollLeft() * scrollbar_track / (adjustment_width - scrollable_width);

        $('.scroll-bar-h').css('transform', 'translateX(' + offset_x + 'px)');
        //連動して移動したつまみに、さらに連動してサイドも移動
        $('.timescale-wrap').scrollLeft(($('.scroll-bar-h').offset().left - $('.scroll-bar-horizontal').offset().left) / scrollbar_track * (adjustment_width - scrollable_width));


    });


    var active = false, // つまみを操作しているかどうか
        active_s = false, // つまみの先端を操作しているかどうか
        active_e = false, // つまみの終端を操作しているかどうか
        scrollbar_thumb_cursor_x, // つまみ内のクリック位置
        scrollbar_start_cursor_x,
        scrollbar_end_cursor_x;


    $('.scroll-bar-h').on('mousedown', function (event) {
        active = true;
        scrollbar_thumb_cursor_x = event.pageX - $(this).offset().left;
    });

    $('.start').on('mousedown', function (event) {
        active_s = true;
        scrollbar_start_cursor_x = event.pageX - $(this).offset().left + LabelWidth;
    });

    $('.end').on('mousedown', function (event) {
        active_e = true;
        scrollbar_end_cursor_x = event.pageX - $(this).offset().left + LabelWidth;
    });

    $(document).on('mouseup', function () {
        active = false;
        active_s = false;
        active_e = false;
    });


    $(document).on('mousemove', function (event) {
        if (!active) return;
        if (active_s) {///////左の端点を動かしたとき
            return;
            var scrollbar_thumb_x = ((event.pageX - scrollbar_start_cursor_x) / scrollbar_track * scrollbar_track) - scrollbar_thumb_cursor_x;

            if (scrollbar_thumb_x < 0) {
                scrollbar_thumb_x = 0;
            } else if (scrollbar_thumb_x > scrollbar_track) {
                scrollbar_thumb_x = scrollbar_track;
            }
            $('.scroll-bar-h > .start').css('transform', 'translateX(' + scrollbar_thumb_x + 'px)');
            //console.log(scrollbar_width-scrollbar_thumb_x)
            $('.scroll-bar-h').css('width', scrollbar_width - scrollbar_thumb_x);
            //console.log($('.scroll-bar-h').width());

        } else if (active_e) {////////右の端点を動かしたとき
            return;
            var scrollbar_end_x = (event.pageX / scrollbar_track * scrollbar_track) - scrollbar_thumb_cursor_x;
            //var scrollbar_end_x = ((event.pageX  - scrollbar_end_cursor_x) / scrollbar_track * scrollbar_track) - scrollbar_thumb_cursor_x;
            console.log($('.scroll-bar-h > .end').offset().left);

            if (scrollbar_thumb_x < 0) {
                scrollbar_thumb_x = 0;
            } else if (scrollbar_thumb_x > scrollbar_track) {
                scrollbar_thumb_x = scrollbar_track;
            }

            $('.scroll-bar-h').css('width', scrollbar_width + scrollbar_end_x - LabelWidth);


        } else {
            var scrollbar_thumb_x = ((event.pageX - $('.scroll-bar-horizontal').offset().left) / scrollbar_track * scrollbar_track) - scrollbar_thumb_cursor_x;

            // つまみが上下の領域外を超えないようにする
            if (scrollbar_thumb_x < 0) {
                scrollbar_thumb_x = 0;
            } else if (scrollbar_thumb_x > scrollbar_track) {
                scrollbar_thumb_x = scrollbar_track;
            }
            // つまみの位置設定
            $('.scroll-bar-h').css('transform', 'translateX(' + scrollbar_thumb_x + 'px)');

            // つまみの位置に応じてスクロールさせる
            $('.content-wrap').scrollLeft(($('.scroll-bar-h').offset().left - $('.scroll-bar-horizontal').offset().left) / scrollbar_track * (adjustment_width - scrollable_width));
            $('.timescale-wrap').scrollLeft(($('.scroll-bar-h').offset().left - $('.scroll-bar-horizontal').offset().left) / scrollbar_track * (adjustment_width - scrollable_width));
        }
    });

    // つまみを操作中はテキスト選択できないようにする

    $(document).on('selectstart', function () {
        if (active) return false;
    });
}
