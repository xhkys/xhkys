;(function($){$.fn.extend({autocomplete:function(urlOrData,options){var isUrl=typeof urlOrData=="string";options=$.extend({},$.Autocompleter.defaults,{url:isUrl?urlOrData:null,data:isUrl?null:urlOrData,delay:isUrl?$.Autocompleter.defaults.delay:10,max:options&&!options.scroll?10:150},options);options.highlight=options.highlight||function(value){return value;};options.formatMatch=options.formatMatch||options.formatItem;return this.each(function(){new $.Autocompleter(this,options);});},result:function(handler){return this.bind("result",handler);},search:function(handler){return this.trigger("search",[handler]);},flushCache:function(){return this.trigger("flushCache");},setOptions:function(options){return this.trigger("setOptions",[options]);},unautocomplete:function(){return this.trigger("unautocomplete");}});$.Autocompleter=function(input,options){var KEY={UP:38,DOWN:40,DEL:46,TAB:9,RETURN:13,ESC:27,COMMA:188,PAGEUP:33,PAGEDOWN:34,BACKSPACE:8};var $input=$(input).attr("autocomplete","off").addClass(options.inputClass);var timeout;var previousValue="";var cache=$.Autocompleter.Cache(options);var hasFocus=0;var lastKeyPressCode;var config={mouseDownOnSelect:false};var select=$.Autocompleter.Select(options,input,selectCurrent,config);var blockSubmit;$.browser.opera&&$(input.form).bind("submit.autocomplete",function(){if(blockSubmit){blockSubmit=false;return false;}});$input.bind(($.browser.opera?"keypress":"keydown")+".autocomplete",function(event){hasFocus=1;lastKeyPressCode=event.keyCode;switch(event.keyCode){case KEY.UP:event.preventDefault();if(select.visible()){select.prev();}else{onChange(0,true);}break;case KEY.DOWN:event.preventDefault();if(select.visible()){select.next();}else{onChange(0,true);}break;case KEY.PAGEUP:event.preventDefault();if(select.visible()){select.pageUp();}else{onChange(0,true);}break;case KEY.PAGEDOWN:event.preventDefault();if(select.visible()){select.pageDown();}else{onChange(0,true);}break;case options.multiple&&$.trim(options.multipleSeparator)==","&&KEY.COMMA:case KEY.TAB:case KEY.RETURN:if(selectCurrent()){event.preventDefault();blockSubmit=true;return false;}break;case KEY.ESC:select.hide();break;default:clearTimeout(timeout);timeout=setTimeout(onChange,options.delay);break;}}).focus(function(){hasFocus++;}).blur(function(){hasFocus=0;if(!config.mouseDownOnSelect){hideResults();}}).click(function(){if(hasFocus++>1&&!select.visible()){onChange(0,true);}}).bind("search",function(){var fn=(arguments.length>1)?arguments[1]:null;function findValueCallback(q,data){var result;if(data&&data.length){for(var i=0;i<data.length;i++){if(data[i].result.toLowerCase()==q.toLowerCase()){result=data[i];break;}}}if(typeof fn=="function")fn(result);else $input.trigger("result",result&&[result.data,result.value]);}$.each(trimWords($input.val()),function(i,value){request(value,findValueCallback,findValueCallback);});}).bind("flushCache",function(){cache.flush();}).bind("setOptions",function(){$.extend(options,arguments[1]);if("data"in arguments[1])cache.populate();}).bind("unautocomplete",function(){select.unbind();$input.unbind();$(input.form).unbind(".autocomplete");});function selectCurrent(){var selected=select.selected();if(!selected)return false;var v=selected.result;previousValue=v;if(options.multiple){var words=trimWords($input.val());if(words.length>1){var seperator=options.multipleSeparator.length;var cursorAt=$(input).selection().start;var wordAt,progress=0;$.each(words,function(i,word){progress+=word.length;if(cursorAt<=progress){wordAt=i;return false;}progress+=seperator;});words[wordAt]=v;v=words.join(options.multipleSeparator);}v+=options.multipleSeparator;}$input.val(v);hideResultsNow();$input.trigger("result",[selected.data,selected.value]);return true;}function onChange(crap,skipPrevCheck){if(lastKeyPressCode==KEY.DEL){select.hide();return;}var currentValue=$input.val();if(!skipPrevCheck&&currentValue==previousValue)return;previousValue=currentValue;currentValue=lastWord(currentValue);if(currentValue.length>=options.minChars){$input.addClass(options.loadingClass);if(!options.matchCase)currentValue=currentValue.toLowerCase();request(currentValue,receiveData,hideResultsNow);}else{stopLoading();select.hide();}};function trimWords(value){if(!value)return[""];if(!options.multiple)return[$.trim(value)];return $.map(value.split(options.multipleSeparator),function(word){return $.trim(value).length?$.trim(word):null;});}function lastWord(value){if(!options.multiple)return value;var words=trimWords(value);if(words.length==1)return words[0];var cursorAt=$(input).selection().start;if(cursorAt==value.length){words=trimWords(value)}else{words=trimWords(value.replace(value.substring(cursorAt),""));}return words[words.length-1];}function autoFill(q,sValue){if(options.autoFill&&(lastWord($input.val()).toLowerCase()==q.toLowerCase())&&lastKeyPressCode!=KEY.BACKSPACE){$input.val($input.val()+sValue.substring(lastWord(previousValue).length));$(input).selection(previousValue.length,previousValue.length+sValue.length);}};function hideResults(){clearTimeout(timeout);timeout=setTimeout(hideResultsNow,200);};function hideResultsNow(){var wasVisible=select.visible();select.hide();clearTimeout(timeout);stopLoading();if(options.mustMatch){$input.search(function(result){if(!result){if(options.multiple){var words=trimWords($input.val()).slice(0,-1);$input.val(words.join(options.multipleSeparator)+(words.length?options.multipleSeparator:""));}else{$input.val("");$input.trigger("result",null);}}});}};function receiveData(q,data){if(data&&data.length&&hasFocus){stopLoading();select.display(data,q);autoFill(q,data[0].value);select.show();}else{hideResultsNow();}};function request(term,success,failure){if(!options.matchCase)term=term.toLowerCase();var data=cache.load(term);if(data&&data.length){success(term,data);}else if((typeof options.url=="string")&&(options.url.length>0)){var extraParams={timestamp:+new Date()};$.each(options.extraParams,function(key,param){extraParams[key]=typeof param=="function"?param():param;});$.ajax({mode:"abort",port:"autocomplete"+input.name,dataType:options.dataType,url:options.url,data:$.extend({q:lastWord(term),limit:options.max},extraParams),success:function(data){var parsed=options.parse&&options.parse(data)||parse(data);cache.add(term,parsed);success(term,parsed);}});}else{select.emptyList();failure(term);}};function parse(data){var parsed=[];var rows=data.split("\n");for(var i=0;i<rows.length;i++){var row=$.trim(rows[i]);if(row){row=row.split("|");parsed[parsed.length]={data:row,value:row[0],result:options.formatResult&&options.formatResult(row,row[0])||row[0]};}}return parsed;};function stopLoading(){$input.removeClass(options.loadingClass);};};$.Autocompleter.defaults={inputClass:"ac_input",resultsClass:"ac_results",loadingClass:"ac_loading",minChars:1,delay:400,matchCase:false,matchSubset:true,matchContains:false,cacheLength:10,max:100,mustMatch:false,extraParams:{},selectFirst:true,formatItem:function(row){return row[0];},formatMatch:null,autoFill:false,width:0,multiple:false,multipleSeparator:", ",highlight:function(value,term){return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>");},scroll:true,scrollHeight:180};$.Autocompleter.Cache=function(options){var data={};var length=0;function matchSubset(s,sub){if(!options.matchCase)s=s.toLowerCase();var i=s.indexOf(sub);if(options.matchContains=="word"){i=s.toLowerCase().search("\\b"+sub.toLowerCase());}if(i==-1)return false;return i==0||options.matchContains;};function add(q,value){if(length>options.cacheLength){flush();}if(!data[q]){length++;}data[q]=value;}function populate(){if(!options.data)return false;var stMatchSets={},nullData=0;if(!options.url)options.cacheLength=1;stMatchSets[""]=[];for(var i=0,ol=options.data.length;i<ol;i++){var rawValue=options.data[i];rawValue=(typeof rawValue=="string")?[rawValue]:rawValue;var value=options.formatMatch(rawValue,i+1,options.data.length);if(value===false)continue;var firstChar=value.charAt(0).toLowerCase();if(!stMatchSets[firstChar])stMatchSets[firstChar]=[];var row={value:value,data:rawValue,result:options.formatResult&&options.formatResult(rawValue)||value};stMatchSets[firstChar].push(row);if(nullData++<options.max){stMatchSets[""].push(row);}};$.each(stMatchSets,function(i,value){options.cacheLength++;add(i,value);});}setTimeout(populate,25);function flush(){data={};length=0;}return{flush:flush,add:add,populate:populate,load:function(q){if(!options.cacheLength||!length)return null;if(!options.url&&options.matchContains){var csub=[];for(var k in data){if(k.length>0){var c=data[k];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub.push(x);}});}}return csub;}else
if(data[q]){return data[q];}else
if(options.matchSubset){for(var i=q.length-1;i>=options.minChars;i--){var c=data[q.substr(0,i)];if(c){var csub=[];$.each(c,function(i,x){if(matchSubset(x.value,q)){csub[csub.length]=x;}});return csub;}}}return null;}};};$.Autocompleter.Select=function(options,input,select,config){var CLASSES={ACTIVE:"ac_over"};var listItems,active=-1,data,term="",needsInit=true,element,list;function init(){if(!needsInit)return;element=$("<div/>").hide().addClass(options.resultsClass).css("position","absolute").appendTo(document.body);list=$("<ul/>").appendTo(element).mouseover(function(event){if(target(event).nodeName&&target(event).nodeName.toUpperCase()=='LI'){active=$("li",list).removeClass(CLASSES.ACTIVE).index(target(event));$(target(event)).addClass(CLASSES.ACTIVE);}}).click(function(event){$(target(event)).addClass(CLASSES.ACTIVE);select();input.focus();return false;}).mousedown(function(){config.mouseDownOnSelect=true;}).mouseup(function(){config.mouseDownOnSelect=false;});if(options.width>0)element.css("width",options.width);needsInit=false;}function target(event){var element=event.target;while(element&&element.tagName!="LI")element=element.parentNode;if(!element)return[];return element;}function moveSelect(step){listItems.slice(active,active+1).removeClass(CLASSES.ACTIVE);movePosition(step);var activeItem=listItems.slice(active,active+1).addClass(CLASSES.ACTIVE);if(options.scroll){var offset=0;listItems.slice(0,active).each(function(){offset+=this.offsetHeight;});if((offset+activeItem[0].offsetHeight-list.scrollTop())>list[0].clientHeight){list.scrollTop(offset+activeItem[0].offsetHeight-list.innerHeight());}else if(offset<list.scrollTop()){list.scrollTop(offset);}}};function movePosition(step){active+=step;if(active<0){active=listItems.size()-1;}else if(active>=listItems.size()){active=0;}}function limitNumberOfItems(available){return options.max&&options.max<available?options.max:available;}function fillList(){list.empty();var max=limitNumberOfItems(data.length);for(var i=0;i<max;i++){if(!data[i])continue;var formatted=options.formatItem(data[i].data,i+1,max,data[i].value,term);if(formatted===false)continue;var li=$("<li/>").html(options.highlight(formatted,term)).addClass(i%2==0?"ac_even":"ac_odd").appendTo(list)[0];$.data(li,"ac_data",data[i]);}listItems=list.find("li");if(options.selectFirst){listItems.slice(0,1).addClass(CLASSES.ACTIVE);active=0;}if($.fn.bgiframe)list.bgiframe();}return{display:function(d,q){init();data=d;term=q;fillList();},next:function(){moveSelect(1);},prev:function(){moveSelect(-1);},pageUp:function(){if(active!=0&&active-8<0){moveSelect(-active);}else{moveSelect(-8);}},pageDown:function(){if(active!=listItems.size()-1&&active+8>listItems.size()){moveSelect(listItems.size()-1-active);}else{moveSelect(8);}},hide:function(){element&&element.hide();listItems&&listItems.removeClass(CLASSES.ACTIVE);active=-1;},visible:function(){return element&&element.is(":visible");},current:function(){return this.visible()&&(listItems.filter("."+CLASSES.ACTIVE)[0]||options.selectFirst&&listItems[0]);},show:function(){var offset=$(input).offset();element.css({width:typeof options.width=="string"||options.width>0?options.width:$(input).width(),top:offset.top+input.offsetHeight,left:offset.left}).show();if(options.scroll){list.scrollTop(0);list.css({maxHeight:options.scrollHeight,overflow:'auto'});if($.browser.msie&&typeof document.body.style.maxHeight==="undefined"){var listHeight=0;listItems.each(function(){listHeight+=this.offsetHeight;});var scrollbarsVisible=listHeight>options.scrollHeight;list.css('height',scrollbarsVisible?options.scrollHeight:listHeight);if(!scrollbarsVisible){listItems.width(list.width()-parseInt(listItems.css("padding-left"))-parseInt(listItems.css("padding-right")));}}}},selected:function(){var selected=listItems&&listItems.filter("."+CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);return selected&&selected.length&&$.data(selected[0],"ac_data");},emptyList:function(){list&&list.empty();},unbind:function(){element&&element.remove();}};};$.fn.selection=function(start,end){if(start!==undefined){return this.each(function(){if(this.createTextRange){var selRange=this.createTextRange();if(end===undefined||start==end){selRange.move("character",start);selRange.select();}else{selRange.collapse(true);selRange.moveStart("character",start);selRange.moveEnd("character",end);selRange.select();}}else if(this.setSelectionRange){this.setSelectionRange(start,end);}else if(this.selectionStart){this.selectionStart=start;this.selectionEnd=end;}});}var field=this[0];if(field.createTextRange){var range=document.selection.createRange(),orig=field.value,teststring="<->",textLength=range.text.length;range.text=teststring;var caretAt=field.value.indexOf(teststring);field.value=orig;this.selection(caretAt,caretAt+textLength);return{start:caretAt,end:caretAt+textLength}}else if(field.selectionStart!==undefined){return{start:field.selectionStart,end:field.selectionEnd}}};})(jQuery);(function(a){a.fn.lazyload=function(b){var c={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:window,skip_invisible:!0};b&&(null!==b.failurelimit&&(b.failure_limit=b.failurelimit,delete b.failurelimit),a.extend(c,b));var d=this;return 0==c.event.indexOf("scroll")&&a(c.container).bind(c.event,function(b){var e=0;d.each(function(){if(c.skip_invisible&&!a(this).is(":visible"))return;if(!a.abovethetop(this,c)&&!a.leftofbegin(this,c))if(!a.belowthefold(this,c)&&!a.rightoffold(this,c))a(this).trigger("appear");else if(++e>c.failure_limit)return!1});var f=a.grep(d,function(a){return!a.loaded});d=a(f)}),this.each(function(){var b=this;b.loaded=!1,a(b).one("appear",function(){this.loaded||a("<img />").bind("load",function(){a(b).hide().attr("src",a(b).data("original"))[c.effect](c.effectspeed),b.loaded=!0}).attr("src",a(b).data("original"))}),0!=c.event.indexOf("scroll")&&a(b).bind(c.event,function(c){b.loaded||a(b).trigger("appear")})}),a(c.container).trigger(c.event),this},a.belowthefold=function(b,c){if(c.container===undefined||c.container===window)var d=a(window).height()+a(window).scrollTop();else var d=a(c.container).offset().top+a(c.container).height();return d<=a(b).offset().top-c.threshold},a.rightoffold=function(b,c){if(c.container===undefined||c.container===window)var d=a(window).width()+a(window).scrollLeft();else var d=a(c.container).offset().left+a(c.container).width();return d<=a(b).offset().left-c.threshold},a.abovethetop=function(b,c){if(c.container===undefined||c.container===window)var d=a(window).scrollTop();else var d=a(c.container).offset().top;return d>=a(b).offset().top+c.threshold+a(b).height()},a.leftofbegin=function(b,c){if(c.container===undefined||c.container===window)var d=a(window).scrollLeft();else var d=a(c.container).offset().left;return d>=a(b).offset().left+c.threshold+a(b).width()},a.extend(a.expr[":"],{"below-the-fold":function(b){return a.belowthefold(b,{threshold:0,container:window})},"above-the-fold":function(b){return!a.belowthefold(b,{threshold:0,container:window})},"right-of-fold":function(b){return a.rightoffold(b,{threshold:0,container:window})},"left-of-fold":function(b){return!a.rightoffold(b,{threshold:0,container:window})}})})(jQuery)
function nofind(img,src){img.src=src;img.onerror=null;}
var FF={'Home':{'Url':document.URL,'Tpl':'defalut','Channel':'','GetChannel':function($sid){if($sid=='1')return'vod';if($sid=='2')return'news';if($sid=='3')return'special';},'Js':function(){this.Channel=this.GetChannel(Sid);if($("#wd").length>0){if(Sid=='2'){$key='输入关键字';$('#ffsearch').attr('action',Root+'index.php?s=news-search');}else{$key='输入影片名称或主演名称';}
if($('#wd').val()==''){$('#wd').val($key);}
$('#wd').focus(function(){if($('#wd').val()==$key){$('#wd').val('');}});$('#wd').blur(function(){if($('#wd').val()==''){$('#wd').val($key);}});}
$("#fav").click(function(){var url=window.location.href;try{window.external.addFavorite(url,document.title);}catch(err){try{window.sidebar.addPanel(document.title,url,"");}catch(err){alert("请使用Ctrl+D为您的浏览器添加书签！");}}});$("#fav2").click(function(){var url=window.location.href;try{window.external.addFavorite(url,document.title);}catch(err){try{window.sidebar.addPanel(document.title,url,"");}catch(err){alert("请使用Ctrl+D为您的浏览器添加书签！");}}});}},'UpDown':{'Vod':function($ajaxurl){if($("#Up").length||$("#Down").length){this.Ajax($ajaxurl,'vod','');}
$('.Up').click(function(){FF.UpDown.Ajax($ajaxurl,'vod','up');})
$('.Down').click(function(){FF.UpDown.Ajax($ajaxurl,'vod','down');})},'News':function($ajaxurl){if($("#Digup").length||$("#Digdown").length){this.Ajax($ajaxurl,'news','');}else{FF.UpDown.Show($("#Digup_val").html()+':'+$("#Digdown_val").html(),'news');}
$('.Digup').click(function(){FF.UpDown.Ajax($ajaxurl,'news','up');})
$('.Digdown').click(function(){FF.UpDown.Ajax($ajaxurl,'news','down');})},'Ajax':function($ajaxurl,$model,$ajaxtype){$.ajax({type:'get',url:$ajaxurl+'-type-'+$ajaxtype,timeout:5000,dataType:'json',success:function($html){if(!$html.status){alert($html.info);}else{FF.UpDown.Show($html.data,$model);}}});},'Show':function($html,$model){if($model=='vod'){$(".Up>span").html($html.split(':')[0]);$(".Down>span").html($html.split(':')[1]);}else if($model='news'){var Digs=$html.split(':');var sUp=parseInt(Digs[0]);var sDown=parseInt(Digs[1]);var sTotal=sUp+sDown;var spUp=(sUp/sTotal)*100;spUp=Math.round(spUp*10)/10;var spDown=100-spUp;spDown=Math.round(spDown*10)/10;if(sTotal!=0){$('#Digup_val').html(sUp);$('#Digdown_val').html(sDown);$('#Digup_sp').html(spUp+'%');$('#Digdown_sp').html(spDown+'%');$('#Digup_img').width(parseInt((sUp/sTotal)*55));$('#Digdown_img').width(parseInt((sDown/sTotal)*55));}}}},'Comment':{'Default':function($ajaxurl){if($("#Comment").length>0){FF.Comment.Show($ajaxurl);}},'Show':function($ajaxurl){$.ajax({type:'get',url:$ajaxurl,timeout:5000,error:function(){$("#Comment").html('评论加载失败...');},success:function($html){$("#Comment").html($html);}});},'Post':function(){if($("#comment_content").val()=='请在这里发表您的个人看法，最多200个字。'){$('#comment_tips').html('请发表您的评论观点！');return false;}
var $data="cm_sid="+Sid+"&cm_cid="+Id+"&cm_content="+$("#comment_content").val()+"&cm_user="+$("#cm_user").val();$.ajax({type:'post',url:Root+'index.php?s=Cm-insert',data:$data,dataType:'json',success:function($string){if($string.status==1){FF.Comment.Show(Root+"index.php?s=Cm-Show-sid-"+Sid+"-id-"+Id+"-p-1");}
$('#comment_tips').html($string.info);}});}},'Gold':{'Default':function($ajaxurl){if($("#Gold").length>0||$("#Goldnum").length>0){$.ajax({type:'get',url:$ajaxurl,timeout:5000,dataType:'json',error:function(){$(".Gold").html('评分加载失败');},success:function($html){FF.Gold.Show($ajaxurl,$html.data,'');}});}else{if($(".Gold").length>0||$(".Goldnum").length>0){FF.Gold.Show($ajaxurl,$(".Goldnum").html()+':'+$(".Golder").html(),'');}}},'Show':function($ajaxurl,$html,$status){$(".Goldtitle").remove();$(".Gold").after('<span class="Goldtitle" style="width:'+$(".Gold").width()+'px"></span>');$(".Goldtitle").css({margin:'20px 0 0 -95px'});if($status=='onclick'){$(".Goldtitle").html('评分成功！');$(".Goldtitle").show();$status='';}
$(".Gold").html(FF.Gold.List($html.split(':')[0]));$(".Goldnum").html($html.split(':')[0]);$(".Golder").html($html.split(':')[1]);$(".Gold>span").mouseover(function(){$id=$(this).attr('id')*1;$(".Goldtitle").html(FF.Gold.Title($id*2));$(".Goldtitle").show();$bgurl=$(this).css('background-image');for(i=0;i<5;i++){if(i>$id){$(".Gold>#"+i+"").css({background:$bgurl+" 48px 0 repeat"});}else{$(".Gold>#"+i+"").css({background:$bgurl});}}});$(".Gold>span").mouseout(function(){$(".Goldtitle").hide();$score=$html.split(':')[0]*1/2;$id=$(this).attr('id')*1;$bgurl=$(this).css('background-image');for(i=0;i<5;i++){if(i<Math.round($score)){if(i==parseInt($score)){$(".Gold>#"+i+"").css({background:$bgurl+" 25px 0 repeat"});}else{$(".Gold>#"+i+"").css({background:$bgurl});}}else{$(".Gold>#"+i+"").css({background:$bgurl+" 48px 0 repeat"});}}});$(".Gold>span").click(function(){$.ajax({type:'get',url:$ajaxurl+'-type-'+(($(this).attr('id')*1+1)*2),timeout:5000,dataType:'json',error:function(){$(".Goldtitle").html('评分失败!');},success:function($html){if(!$html.status){$(".Goldtitle").html($html.info);$(".Goldtitle").show();}else{FF.Gold.Show($ajaxurl,$html.data,'onclick');}}});});},'List':function($score){var $html='';$score=$score/2;for(var i=0;i<5;i++){var classname='all';if(i<$score&&i<Math.round($score)){if(i==parseInt($score)){classname='half';}}else{classname='none';}
$html+='<span id="'+i+'" class="'+classname+'"></span>';}
return $html;},'Title':function($score){var array_str=['很差！','一般！','不错！','很好！','力荐！'];var $score=parseFloat($score);if($score<2.0)return array_str[0];if($score>=2.0&&$score<4.0)return array_str[1];if($score>=4.0&&$score<6.0)return array_str[2];if($score>=6.0&&$score<8.0)return array_str[3];if($score>=8.0)return array_str[4];}},'Lazyload':{'Show':function(){$("img.lazy").lazyload();},'Box':function($id){$("img.lazy").lazyload({container:$("#"+$id)});}},'Suggest':{'Show':function($id,$limit,$ajaxurl,$jumpurl){$("#"+$id).autocomplete($ajaxurl,{width:467,scrollHeight:300,minChars:1,matchSubset:1,max:$limit,cacheLength:10,multiple:true,matchContains:true,autoFill:false,dataType:"json",parse:function(obj){if(obj.status){var parsed=[];for(var i=0;i<obj.data.length;i++){parsed[i]={data:obj.data[i],value:obj.data[i].vod_name,result:obj.data[i].vod_name};}
return parsed;}else{return{data:'',value:'',result:''};}},formatItem:function(row,i,max){return row.vod_name;},formatResult:function(row,i,max){return row.vod_name;}}).result(function(event,data,formatted){location.href=$jumpurl+encodeURIComponent(data.vod_name);});}},'Cookie':{'Set':function(name,value,days){var exp=new Date();exp.setTime(exp.getTime()+days*24*60*60*1000);var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));document.cookie=name+"="+escape(value)+";path=/;expires="+exp.toUTCString();},'Get':function(name){var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));if(arr!=null){return unescape(arr[2]);return null;}},'Del':function(name){var exp=new Date();exp.setTime(exp.getTime()-1);var cval=this.Get(name);if(cval!=null){document.cookie=name+"="+escape(cval)+";path=/;expires="+exp.toUTCString();}}},'History':{'Json':'','Display':true,'List':function($id){this.Create($id);$('#'+$id).hover(function(){FF.History.Show();},function(){FF.History.FlagHide();});},'Clear':function(){FF.Cookie.Del('FF_Cookie');$('#history_box').html('<li class="hx_clear">已清空观看记录。</li>');},'Show':function(){$('#history_box').show();},'Hide':function(){$('#history_box').hide();},'FlagHide':function(){$('#history_box').hover(function(){FF.History.Display=false;FF.History.Show();},function(){FF.History.Display=true;FF.History.Hide();});if(FF.History.Display){FF.History.Hide();}},'Create':function($id){var jsondata=[];if(this.Json){jsondata=this.Json;}else{var jsonstr=FF.Cookie.Get('FF_Cookie');if(jsonstr!=undefined){jsondata=eval(jsonstr);}}
html='<dl class="history_box" id="history_box" style="display:none;position:absolute;">';html+='<dt><span href="javascript:void(0)" onclick="FF.History.Clear();">清空</span> | <span href="javascript:void(0)" onclick="FF.History.Hide();">关闭</span></dt>';if(jsondata.length>0){for($i=0;$i<jsondata.length;$i++){if($i%2==1){html+='<dd class="odd">';}else{html+='<dd class="even">';}
html+='<a href="'+jsondata[$i].vodlink+'" class="hx_title">'+jsondata[$i].vodname+'</a></dd>';}}else{html+='<dd class="hide">暂无观看记录。</dd>';}
html+='</dl>';$('#'+$id).after(html);},'Insert':function(vodname,vodlink,limit,days,cidname,vodpic){var jsondata=FF.Cookie.Get('FF_Cookie');if(jsondata!=undefined){this.Json=eval(jsondata);for($i=0;$i<this.Json.length;$i++){if(this.Json[$i].vodlink==vodlink){return false;}}
if(!vodlink){vodlink=document.URL;}
jsonstr='{video:[{"vodname":"'+vodname+'","vodlink":"'+vodlink+'","cidname":"'+cidname+'","vodpic":"'+vodpic+'"},';for($i=0;$i<=limit;$i++){if(this.Json[$i]){jsonstr+='{"vodname":"'+this.Json[$i].vodname+'","vodlink":"'+this.Json[$i].vodlink+'","cidname":"'+this.Json[$i].cidname+$i+'","vodpic":"'+this.Json[$i].vodpic+'"},';}else{break;}}
jsonstr=jsonstr.substring(0,jsonstr.lastIndexOf(','));jsonstr+="]}";}else{jsonstr='{video:[{"vodname":"'+vodname+'","vodlink":"'+vodlink+'","cidname":"'+cidname+'","vodpic":"'+vodpic+'"}]}';}
this.Json=eval(jsonstr);FF.Cookie.Set('FF_Cookie',jsonstr,days);}}}
var pagego=function($url,$total){$page=document.getElementById('page').value;if($page>0&&($page<=$total)){$url=$url.replace('{!page!}',$page);if($url.split('index-1')){$url=$url.split('index-1')[0];}
top.location.href=$url;}
return false;}
$(document).ready(function(){FF.Home.Js();FF.Lazyload.Show();FF.Suggest.Show('wd',12,Root+'index.php?s=plus-search-vod',Root+'index.php?s=vod-search-wd-');FF.History.List('history');FF.UpDown.Vod(Root+'index.php?s=Updown-'+FF.Home.Channel+'-id-'+Id);FF.UpDown.News(Root+'index.php?s=Updown-'+FF.Home.Channel+'-id-'+Id);FF.Comment.Show(Root+"index.php?s=Cm-Show-sid-"+Sid+"-id-"+Id+"-p-1");FF.Gold.Default(Root+'index.php?s=Gold-'+FF.Home.Channel+'-id-'+Id);});