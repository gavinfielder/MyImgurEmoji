console.log("gavin's content script is running now");

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse)
	{
		if (request.message === "clicked_browser_action")
		{
			var elements = document.querySelectorAll('textarea');
			for (var i = 0; i < elements.length; i++)
			{
				var element = elements[i];
				console.log("Got element:" + element + " with classname: \"" + element.className + "\"");
				element.addEventListener("input", 
					function(eventObject)
					{
						console.log("text area changed!");
						var elem = eventObject.target;
						var text = elem.value;
						console.log("original: " + text);
						var replaced = text.replace(/millenial/gi, 'snake people');
						console.log("changed to: " + replaced);
						if (replaced !== text)
						{
							console.log("replaced!");
							elem.value = replaced;
						}
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
		}
	}
);

console.log("gavin's content script is done now.");
