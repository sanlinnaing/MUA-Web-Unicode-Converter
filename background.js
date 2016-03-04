chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      //console.log(items);
      var enableMUA = items.data;
      if(enableMUA == "disable") {
        chrome.browserAction.setIcon({path:"icon_disabled.png"});
      } else {
        chrome.browserAction.setIcon({path:"icon.png"});
      }
    } 
});