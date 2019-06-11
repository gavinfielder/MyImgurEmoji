function	GetActiveTab(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		{
			var activeTab = tabs[0];
			callback(activeTab);
		}
	);
}

function	LogMessageToActiveTab(msg)
{
	GetActiveTab(function(activeTab) {
		chrome.tabs.sendMessage(activeTab.id, {
			"message": "propogate_to_log",
			"data": msg
		});
	});
}
