/*
 *   These scripts are part of MUA Web Unicode Converter chrome extension
 *   It use Parabaik Converter developed by Ko Nwge Htun
 *   and Myanmar Font Tagger script developed by Ko Thant Thet Khin Zaw
 *   
 *
 *   
 */

'use strict';
var font_verification_enable = false;
var zawgyiRegex = "\u1031\u103b" // e+medial ra
    // beginning e or medial ra
    + "|^\u1031|^\u103b"
    // independent vowel, dependent vowel, tone , medial ra wa ha (no ya
    // because of 103a+103b is valid in unicode) , digit ,
    // symbol + medial ra
    + "|[\u1022-\u1030\u1032-\u1039\u103b-\u103d\u1040-\u104f]\u103b"
    // end with asat
    + "|\u1039$"
    // medial ha + medial wa
    + "|\u103d\u103c"
    // medial ra + medial wa
    + "|\u103b\u103c"
    // consonant + asat + ya ra wa ha independent vowel e dot below
    // visarga asat medial ra digit symbol
    + "|[\u1000-\u1021]\u1039[\u101a\u101b\u101d\u101f\u1022-\u102a\u1031\u1037-\u1039\u103b\u1040-\u104f]"
    // II+I II ae
    + "|\u102e[\u102d\u103e\u1032]"
    // ae + I II
    + "|\u1032[\u102d\u102e]"
    // I II , II I, I I, II II
    //+ "|[\u102d\u102e][\u102d\u102e]"
    // U UU + U UU
    //+ "|[\u102f\u1030][\u102f\u1030]" [ FIXED!! It is not so valuable zawgyi pattern ]
    // tall aa short aa
    //+ "|[\u102b\u102c][\u102b\u102c]" [ FIXED!! It is not so valuable zawgyi pattern ]
    // shan digit + vowel
    + "|[\u1090-\u1099][\u102b-\u1030\u1032\u1037\u103c-\u103e]"
    // consonant + medial ya + dependent vowel tone asat
    + "|[\u1000-\u102a]\u103a[\u102c-\u102e\u1032-\u1036]"
    // independent vowel dependent vowel tone digit + e [ FIXED !!! - not include medial ]
    + "|[\u1023-\u1030\u1032-\u1039\u1040-\u104f]\u1031"
    // other shapes of medial ra + consonant not in Shan consonant
    + "|[\u107e-\u1084][\u1001\u1003\u1005-\u100f\u1012-\u1014\u1016-\u1018\u101f]"
    // u + asat
    + "|\u1025\u1039"
    // eain-dray
    + "|[\u1081\u1083]\u108f"
    // short na + stack characters
    + "|\u108f[\u1060-\u108d]"
    // I II ae dow bolow above + asat typing error
    + "|[\u102d-\u1030\u1032\u1036\u1037]\u1039"
    // aa + asat awww
    + "|\u102c\u1039"
    // ya + medial wa
    + "|\u101b\u103c"
    // non digit + zero + \u102d (i vowel) [FIXED!!! rules tested zero + i vowel in numeric usage]
    + "|[^\u1040-\u1049]\u1040\u102d"
    // e + zero + vowel
    + "|\u1031?\u1040[\u102b\u105a\u102e-\u1030\u1032\u1036-\u1038]"
    // e + seven + vowel
    + "|\u1031?\u1047[\u102c-\u1030\u1032\u1036-\u1038]"
    // cons + asat + cons + virama
    //+ "|[\u1000-\u1021]\u103A[\u1000-\u1021]\u1039" [ FIXED!!! REMOVED!!! conflict with Mon's Medial ]
    // U | UU | AI + (zawgyi) dot below
    + "|[\u102f\u1030\u1032]\u1094"
    // virama + (zawgyi) medial ra
    + "|\u1039[\u107E-\u1084]";

var Zawgyi = new RegExp(zawgyiRegex);
/* Myanmar text checking regular expression 
 *  is the part of Myanmar Font Tagger
 * http://userscripts-mirror.org/scripts/review/103745 
 */
var Myanmar = new RegExp("[\u1000-\u1021]");

function isMyanmar(input) {
    if (Myanmar.test(input)) {
        return true;
    }
    return false;
}

/*
 * This method will check and search Zawgyi Pattern with input text and 
 * return true, if the text is Zawgyi encoding.
 * Parm = input text
 * return = boolean 
 *
 */

function isZawgyi(input) {
    input = input.trim();
    //console.log(input);
    var textSplittedByLine = input.split(/[\f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/);
    for (var i = 0; i < textSplittedByLine.length; i++) {
        var textSplitted = textSplittedByLine[i].split(" ");
        for (var j = 0; j < textSplitted.length; j++) {
            //  console.log(textSplitted[j]);
            if (j != 0)
                textSplitted[j] = " " + textSplitted[j];
            if (Zawgyi.test(textSplitted[j]))
                return true;
        }
    }
    return false;
}

/*
 */

function shouldIgnoreNode(node) {
    if (node.nodeName == "INPUT" || node.nodeName == "SCRIPT" || node.nodeName == "TEXTAREA") {
        return true;
    } else if (node.isContentEditable == true) {
        return true;
    }
    return false;
}

/*
 * This part are from Myanmar Font Tagger scripts developed by Ko Thant Thet Khin Zaw
 * http://userscripts-mirror.org/scripts/review/103745
 */
function convertTree(parent) {
    if (parent instanceof Node == false || parent instanceof SVGElement) {
        return;
    }
    if (parent.className != null && parent.className.indexOf('_c_o_nvert_') != -1) {
        //console.log("converted return");
        return;
    }
    for (var i = 0; i < parent.childNodes.length; i++) {
        var child = parent.childNodes[i];
        if (child.nodeType != Node.TEXT_NODE && child.hasChildNodes()) {
            convertTree(child);
        } else if (child.nodeType == Node.TEXT_NODE) {
            var text = child.textContent;
            if (text && isMyanmar(text)) {
                //console.log(text);
                if (shouldIgnoreNode(parent) == false && isZawgyi(text)) {
                    child.textContent = Z1_Uni(text);
                    if (parent.className == null || (parent.className.indexOf('_c_o_nvert_') == -1 && parent.className.indexOf('text_exposed_show') == -1)) {
                        parent.className += ' _c_o_nvert_';
                        parent.style.setProperty("font-family", "lucida grande,tahoma,verdana,arial,sans-serif", "important");
                        if (font_verification_enable) {
                            parent.className += " i_am_zawgyi";
                        } else {
                            addNoti();
                        }
                    }
                }


            }
        }
    }
}

var addObserver = function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var list = document.querySelector('body');

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == 'childList') {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.nodeType == Node.TEXT_NODE) {
                        convertTree(node.parentNode);
                    } else {
                        convertTree(node);
                    }
                }
            } else if (mutation.type == 'characterData') {
                convertTree(mutation.target);
            }
        });
    });

    if (list) {
        observer.observe(list, {
            childList: true,
            attributes: false,
            characterData: true,
            subtree: true
        });
    }
}

function addNoti() {
    if (!document.getElementById("zawgyi_noti")) {
        var notify_node = document.createElement("div");
        notify_node.setAttribute("id", "zawgyi_noti");
        var body = document.body;
        
        notify_node.innerHTML = '<image id= "mua_noti_off" onclick="clearNoti()" src="data:image/png;base64,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">';
        notify_node.innerHTML += '<img class="mua_image" src="data:image/png;base64,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">';
        var title = document.createAttribute("title");
        title.value = "ဤစာမျက်နှာတွင် ရှိသော ဇော်ဂျီဖြင့် ရေးထားသည့် စာများအား အလိုအလျောက် ပြောင်းလဲထားပါသည်။";
        notify_node.setAttributeNode(title);
        var script_node = document.createElement("script");
        script_node.innerHTML += "function clearNoti(){ var noti=document.getElementById('zawgyi_noti'); var bodyNode = document.body; bodyNode.removeChild(noti); clearInterval(timmer);} var timmer = setInterval(function(){ clearNoti(); }, 5000);";
        body.appendChild(script_node);
        body.appendChild(notify_node);

    }
}

var title = document.title;
if (isMyanmar(title) && isZawgyi(title)) {
    document.title = Z1_Uni(title);
}

if (document.location.hostname.indexOf("facebook") != -1) {
    font_verification_enable = true;
    //console.log("It is facebook");
}

var list = document.querySelector('body');
if (!list) {
    if (document.addEventListener) {
        // Use the handy event callback
        document.addEventListener("DOMContentLoaded",
            function() {
                chrome.storage.sync.get("data", function(items) {
                    if (!chrome.runtime.error) {
                      //console.log(items);
                      var enableMUA = items.data;
                      if(enableMUA != "disable") {
                        addObserver();
                      }
                    } 
                });
            }, false);
    }
} else {
    chrome.storage.sync.get("data", function(items) {
        if (!chrome.runtime.error) {
          //console.log(items);
          var enableMUA = items.data;
          if(enableMUA != "disable") {
            convertTree(document.body);
            addObserver();
          }
        } 
    });
    
}