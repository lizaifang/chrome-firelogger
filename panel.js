chrome.extension.onRequest.addListener(function(request) {
	document.write('ads');
});
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    document.write('ads');
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });
//setInterval(document.write((new Date).getTime()), 3000);
