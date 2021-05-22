jQuery(function(){
	if(jQuery(".copy-pw").length>0){
		var clipboard = new ClipboardJS(".copy-pw");
		
		clipboard.on('success', function(e) {
			console.log(e);
			alert("\u590D\u5236\u6210\u529F\uFF01");
		});
		
		clipboard.on('error', function(e) {
			console.log(e);
			alert("\u590D\u5236\u9519\u8BEF\uFF01\u539F\u56E0\u4E3A\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u590D\u5236\u529F\u80FD\uFF0C\u5EFA\u8BAE\u66F4\u6362\u522B\u7684\u6D4F\u89C8\u5668\u518D\u8BD5\uFF01");
		});
	}
})

 