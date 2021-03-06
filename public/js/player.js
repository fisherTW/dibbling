// var ws = new WebSocket('ws://local.dibbling.tw:9502');
//
// //開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
// ws.onopen = () => {
//     console.log('WebSocket open connection');
//     ws.send("player");
// };
//
// //關閉後執行的動作，指定一個 function 會在連結中斷後執行
// ws.onclose = () => {
//     console.log('WebSocket close connection');
// };
//
// // onmessage  監聽
// ws.onmessage = (evt) => {
//     console.log(evt);
// };
// ws.onmessage = (evt) => {
//     console.log(evt);
//     var videoId = '';
//     var title = '';
//     JSON.parse(evt.data, function(k, v) {
//         if (typeof k === 'videoId') videoId = evt.data;
//         if (typeof k === 'title') title = evt.data;
//     });
//     $("#list").append("<li class='list-group-item' id='"+id+"'>"+title+"</li>");
// };
// init YT Player
function onYouTubeIframeAPIReady() {
    var player;
    player = new YT.Player('YouTubeVideoPlayer', {
        videoId: 'H4vrIS2gc4k',     // YouTube 影片ID
        // width: 560,                 // 播放器寬度 (px)
        // height: 316,                // 播放器高度 (px)
        playerVars: {
            autoplay: 1,            // 在讀取時自動播放影片
            controls: 1,            // 在播放器顯示暫停／播放按鈕
            showinfo: 0,            // 隱藏影片標題
            modestbranding: 1,      // 隱藏YouTube Logo
            loop: 0,                // 讓影片循環播放
            fs: 0,                  // 隱藏全螢幕按鈕
            cc_load_policty: 0,     // 隱藏字幕
            iv_load_policy: 3,      // 隱藏影片註解
            autohide: 0             // 當播放影片時隱藏影片控制列
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onError,
        }
    });
}

// YT Player on readey
function onPlayerReady(event) {
    player_ref = event.target;
    event.target.playVideo();
}

// YT Player change state
function onPlayerStateChange(event) {
    if (event.data == 0) {
        playNext(event);
    }
}

// YT Player error
function onError(event){
    playNext(event);
}

function playNext(event) {
    var list = $.ajax({
        url: '/v1/list',
        method: "GET"
    });

    list.done(function (dblist) {
        if (dblist.length > 0) {
            // append video list
            var onplay_id = dblist[0]['id'];
            $("#list").empty();
            for (const [key, row] of Object.entries(dblist)) {
                var id = row['id'];
                var video_id = row['video_id'];
                var title = row['title'];
                $("#list").append("<li class='list-group-item' id='" + id + "' video_id='" + video_id + "'>" + title + "</li>");
            }

            // get onplay video & tag onplay video
            var onplay_video = dblist[0];
            event.target.loadVideoById(onplay_video['video_id']);
            videoData = event.target.getVideoData();
            $('#' + onplay_id).addClass('active');

            // delete first video
            remove(onplay_video['id']);

            // ajax add playing
            playing(onplay_video['id'])
        } else {
            // no video list
            $("#list").empty();
            $("#list").append("<li class='list-group-item'>無點播清單</li>");
            playRandom(event);
        }
    });
}
function remove(id) {
    $.ajax({
        url: 'v1/list/' + id,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: "DELETE",
        dataType: "json",
    });
}

function playing(id) {
    $.ajax({
        url: 'v1/playing',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        method: "POST",
        dataType: "json",
        data: {
            'id': id,
        },
    });
}

function playRandom(event){
    var promise_get_random = $.ajax({
        url: '/v1/list/random',
        method: "GET"
    });
    promise_get_random.done(function (data) {
        console.log(data);
        if (data.id) {
            // play this video
            event.target.loadVideoById(data.video_id);
            // ajax add playing
            playing(data.id)
        } else {
            // todo
            event.target.loadVideoById('hKRUPYrAQoE');
        }
    });

    promise_get_random.fail(function (d) {
        // todo
        event.target.loadVideoById('hKRUPYrAQoE');
    });
}
