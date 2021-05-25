<html>
<head>
    <!--<title>m3u8 mp4播放器</title>-->
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" id="viewport" name="viewport">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.css" />
    <style type="text/css">
        body,html{width:100%;height:100%;background:#000;padding:0;margin:0;overflow-x:hidden;overflow-y:hidden}
        *{margin:0;border:0;padding:0;text-decoration:none}
        #video{position:inherit}
    </style>
</head>
<body style="background:#000" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" oncontextmenu=window.event.returnValue=false>

<div id="video"></div>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.0.0/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dplayer@1.26.0/dist/DPlayer.min.js"></script>
<script>
    var url = '<?php echo($_REQUEST['url']);?>';
    var dp = new DPlayer({
        container: document.getElementById('video'),
        autoplay: true,
        hotkey: true,
        video: {
            url:url,
             pic: 'loading.gif',
        },
           pluginOptions: {
            hls: {
                p2pConfig: {
                    live: false,
                }
            }
        },
    });
    dp.on('fullscreen', function () {
        if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            screen.orientation.lock('landscape');
        }
    });
</script>
<!--<div style="display:none">
 <script type="text/javascript">var cnzz_protocol = (("https:" == document.location.protocol) ? "https://" : "http://");document.write(unescape("%3Cspan id='cnzz_stat_icon_1278196943'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s9.cnzz.com/z_stat.php%3Fid%3D1278196943' type='text/javascript'%3E%3C/script%3E"));</script>
  </div>-->
</body>
</html>