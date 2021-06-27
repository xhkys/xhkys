/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2018-08-29 16:11:33
 * @version $Id$
 */
 //璁剧疆DIV鐨勯珮搴?
$(document).ready(function(){
  var imgBoxWidth=$(".homeNewUL .itemImg").width();
  $(".homeNewUL .itemImg").css("height",1.5*imgBoxWidth+"px");
  $(".homeNewUL .itemImg img").css("height",1.5*imgBoxWidth+"px");
});
$(window).resize(function(){
  var imgBoxWidth=$(".homeNewUL .itemImg").width();
  $(".homeNewUL .itemImg").css("height",1.5*imgBoxWidth+"px");
  $(".homeNewUL .itemImg img").css("height",1.5*imgBoxWidth+"px");
});


