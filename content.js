console.log("gavin's content script is running now");

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse)
	{
		if (request.message === "clicked_browser_action")
		{
			var firstHref = $("a[href^='http']").eq(0).attr("href");
			console.log(firstHref);
			chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
		}
	}
);

var elements = document.querySelectorAll('textarea');
for (var i = 0; i < elements.length; i++)
{
	var element = elements[i];
	console.log("Got element:" + element + " with classname: \"" + element.className + "\"");
	element.addEventListener("click", 
		function(eventObject)
		{
			console.log("text area changed!");
		}
	);
}

var elements = document.querySelectorAll('input');
for (var i = 0; i < elements.length; i++)
{
	var element = elements[i];
	console.log("Got input element:" + element);
	element.addEventListener("click", 
		function(eventObject)
		{
			console.log("input clicked!");
		}
	);
}

console.log("gavin's content script is done now.");