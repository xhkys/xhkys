
 //图片放大效果

 $(document).ready(function(){
	var imgObj=$(".itemImg");
	var imgWidth = imgObj.find("img").width(); //图片的默认宽度，主意不要带单位 
	var imgHeight = imgObj.find("img").height(); //图片的默认高度，主意不要带单位
	imgObj.hover(function(){
	  $(this).find('img').stop().animate({
	  left:'-5',
	  top:'-5',
	  width:imgWidth+10+'px',
	  height:imgHeight+10+'px'
	  },400);
	  },function(){
	  $(this).find('img').stop().animate({
	  left:'0',
	  top:'0',
	  //right:'0',
	  //bottom:'0',
	  width:imgWidth+'px',
	  height:imgHeight+'px'
	  },400);
  
	  });
  });

  $(document).ready(function(){
	  var toggle=true;
	$(".paixu,.downgz_paixu").click(function(){
		if(toggle)
		{
			$(this).find("img").attr("src","https://cdn.jsdelivr.net/gh/xhkys/xhkys@main/kkysw/template/kkys_pc/image/paixun_sheng.png");
			toggle=false;
		}
		else{
			$(this).find("img").attr("src","https://cdn.jsdelivr.net/gh/xhkys/xhkys@main/kkysw/template/kkys_pc/image/paixun_jiangdi.png");
			toggle=true;
		}
		
	})
  });
  $(document).ready(function(){ 
	layui.use('element', function(){
		element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
	  });
  });
	//滚动条梅花 
	     //收藏本页
	function AddFavorite(sURL, sTitle){
		try{
			window.external.addFavorite(sURL, sTitle);
		}
		catch(e){
			try{
				window.sidebar.addPanel(sTitle, sURL, "");
			}
			catch(e){
				alert("加入收藏失败，请使用Ctrl+D进行添加");
			};
		};
	};
	
	//收藏设置页面（首页）
	function addToFavorite(){
		if(document.all){
			window.external.AddFavorite(d,c);
		}else{
			if(window.sidebar){
				window.sidebar.addPanel(c,d,"");
			}else{
				alert("对不起，您的浏览器不支持此操作!\n请您使用菜单栏或Ctrl+D收藏本站。");
			}
		}
	}
