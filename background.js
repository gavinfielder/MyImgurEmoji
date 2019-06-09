chrome.browserAction.onClicked.addListener(function(tab)
	{
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
			{
				var activeTab = tabs[0];
				console.log(activeTab.url);
				chrome.tabs.sendMessage(activeTab.id, {
					"message": "clicked_browser_action",
					"url": activeTab.url
				});
			}
		);
	});
