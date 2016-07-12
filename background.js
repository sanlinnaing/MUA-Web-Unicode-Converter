chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      //console.log(items);
      var enableMUA = items.data;
      if(enableMUA == "disable") {
        chrome.browserAction.setIcon({path:"icon_disabled.png"});
        chrome.browserAction.setBadgeText({text: "Off"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#ea2839"});
      } else {
        chrome.browserAction.setIcon({path:"icon19.png"});
        chrome.browserAction.setBadgeText({text: "On"});
        chrome.browserAction.setBadgeBackgroundColor({color: "#34A7C1"});
      }
    } 
});
