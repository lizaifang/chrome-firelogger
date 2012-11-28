function toConsole(msg) {
	chrome.extension.sendRequest({
		command: "toConsole",
		tabId: chrome.devtools.tabId,
		args: msg
		//args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
	});
}

ChromeLogger = {
};
ChromeLogger.handleFirePhpHeaders = function(har_entry) {
    var pattern = /x-wf/i;
};
ChromeLogger.handleFireLoggerHeaders = function(har_entry) {
    var response_headers = har_entry.response.headers;

    var buffers = {};
    var profiles = {};
    var pattern = /^firelogger-([0-9a-f]+)-(\d+)/i;
    var parseHeader = function(name, value) {
        var res = pattern.exec(name);
        if (!res) return;
        buffers[res[1]] = buffers[res[1]] || [];
        buffers[res[1]][res[2]] = value;
    }
    for (var key in response_headers) {
        parseHeader(response_headers[key].name, response_headers[key].value);
    }
    var packets = [];
    for (var bufferId in buffers) {
        if (!buffers.hasOwnProperty(bufferId)) continue;
        var buffer = buffers[bufferId].join('');
        buffer = Base64.decode(buffer);
        buffer = Utf8.decode(buffer);
        var packet = JSON.parse(buffer);
        packets.push(packet);
    }
    var logs = [];
    for (var packet in packets) {
        var packet = packets[packet];
        for (i=0; i < packet.logs.length; i++) {
            var log = packet.logs[i];
            logs.push(log);
        }
    }
    var final = [];
    for (var log in logs) {
        //final.push(JSON.stringify(logs[log].args));
        toConsole(JSON.stringify(logs[log].args));
    }
};

chrome.devtools.network.getHAR(function(result) {
	var entries = result.entries;
    chrome.extension.sendMessage({greeting: "hello"}, function(response) {
      console.log(response.farewell);
        document.write("asd");
    });
	chrome.extension.sendRequest({
		command: "toConsole",
		tabId: chrome.devtools.tabId,
		args: "asd"
	});
	chrome.devtools.network.onRequestFinished.addListener(
		ChromeLogger.handleFireLoggerHeaders.bind(ChromeLogger)
	);
});

//prepare requestHeaders
var requestHeaders = {"X-FireLogger": "1.1"};
if (localStorage['password']) {
	var password = localStorage.getItem('password');
	var auth = "#FireLoggerPassword#" + password + "#";
	requestHeaders["X-FireLoggerAuth"] = MD5(auth);
	//requestHeaders["X-FireLoggerProfiler"] = 1;
	//requestHeaders["X-FireLoggerAppstats"] = 1;
}
if (localStorage['remote']) {
	requestHeaders["X-FirePHP-Version"] = "0.0.6";
}
//add requestHeaders
chrome.devtools.network.addRequestHeaders(requestHeaders);

//add panel into devtools
chrome.devtools.panels.create("HeaderHelper", "icon32.png", "panel.html");
