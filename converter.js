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
  +
  "|^\u1031|^\u103b"
  // independent vowel, dependent vowel, tone , medial ra wa ha (no ya
  // because of 103a+103b is valid in unicode) , digit ,
  // symbol + medial ra
  +
  "|[\u1022-\u1030\u1032-\u1039\u103b-\u103d\u1040-\u104f]\u103b"
  // end with asat
  +
  "|\u1039$"
  // medial ha + medial wa
  +
  "|\u103d\u103c"
  // medial ra + medial wa
  +
  "|\u103b\u103c"
  // consonant + asat + ya ra wa ha independent vowel e dot below
  // visarga asat medial ra digit symbol
  +
  "|[\u1000-\u1021]\u1039[\u101a\u101b\u101d\u101f\u1022-\u102a\u1031\u1037-\u1039\u103b\u1040-\u104f]"
  // II+I II ae
  +
  "|\u102e[\u102d\u103e\u1032]"
  // ae + I II
  +
  "|\u1032[\u102d\u102e]"
  // I II , II I, I I, II II
  //+ "|[\u102d\u102e][\u102d\u102e]"
  // U UU + U UU
  //+ "|[\u102f\u1030][\u102f\u1030]" [ FIXED!! It is not so valuable zawgyi pattern ]
  // tall aa short aa
  //+ "|[\u102b\u102c][\u102b\u102c]" [ FIXED!! It is not so valuable zawgyi pattern ]
  // shan digit + vowel
  +
  "|[\u1090-\u1099][\u102b-\u1030\u1032\u1037\u103c-\u103e]"
  // consonant + medial ya + dependent vowel tone asat
  +
  "|[\u1000-\u102a]\u103a[\u102c-\u102e\u1032-\u1036]"
  // independent vowel dependent vowel tone digit + e [ FIXED !!! - not include medial ]
  +
  "|[\u1023-\u1030\u1032-\u1039\u1040-\u104f]\u1031"
  // other shapes of medial ra + consonant not in Shan consonant
  +
  "|[\u107e-\u1084][\u1001\u1003\u1005-\u100f\u1012-\u1014\u1016-\u1018\u101f]"
  // u + asat
  +
  "|\u1025\u1039"
  // eain-dray
  +
  "|[\u1081\u1083]\u108f"
  // short na + stack characters
  +
  "|\u108f[\u1060-\u108d]"
  // I II ae dow bolow above + asat typing error
  +
  "|[\u102d-\u1030\u1032\u1036\u1037]\u1039"
  // aa + asat awww
  +
  "|\u102c\u1039"
  // ya + medial wa
  +
  "|\u101b\u103c"
  // non digit + zero + \u102d (i vowel) [FIXED!!! rules tested zero + i vowel in numeric usage]
  +
  "|[^\u1040-\u1049]\u1040\u102d"
  // e + zero + vowel
  +
  "|\u1031?\u1040[\u102b\u105a\u102e-\u1030\u1032\u1036-\u1038]"
  // e + seven + vowel
  +
  "|\u1031?\u1047[\u102c-\u1030\u1032\u1036-\u1038]"
  // cons + asat + cons + virama
  //+ "|[\u1000-\u1021]\u103A[\u1000-\u1021]\u1039" [ FIXED!!! REMOVED!!! conflict with Mon's Medial ]
  // U | UU | AI + (zawgyi) dot below
  +
  "|[\u102f\u1030\u1032]\u1094"
  // virama + (zawgyi) medial ra
  +
  "|\u1039[\u107E-\u1084]";

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
      var index = (textSplitted[j].match(/[\u1000-\u1021]/i)) ? textSplitted[j].match(/[\u1000-\u1021]/i).index : 0;
      if (Zawgyi.test(textSplitted[j].substring(index)))
        return true;
    }
  }
  return false;
}

var convToUni = true;
chrome.storage.sync.get('unicode', function(item) {
  // console.log('convToUni',item.unicode);
  if (item.unicode === false) {
    convToUni = false;
  } else {
    convToUni = true;
  }
});

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
  if (parent.className != null && parent.classList.contains('_c_o_nvert_') == true) {
    //console.log("converted return");
    return;
  }
  for (var i = 0; i < parent.childNodes.length; i++) {
    var child = parent.childNodes[i];
    if (child.nodeType != Node.TEXT_NODE && child.hasChildNodes()) {
      convertTree(child);
    } else if (child.nodeType == Node.TEXT_NODE) {
      var text = child.textContent.replace(/[\u200b\uFFFD]/g, "");
      text = text.replace(/&#8203;/g, "");
      if (text && isMyanmar(text)) {
        //console.log(text);
        if (shouldIgnoreNode(parent) == false && isZawgyi(text) && convToUni) {
          child.textContent = Z1_Uni(text);
          if (parent.className == null || (parent.classList.contains('_c_o_nvert_') == false && parent.classList.contains('text_exposed_show') == false)) {
            parent.classList.add('_c_o_nvert_');
            parent.style.setProperty("font-family", "lucida grande,tahoma,verdana,arial,sans-serif", "important");
            if (font_verification_enable) {
              var parentElement = findParent(parent);
              if (isDuplicated(parentElement) === false) {
                parentElement.classList.add("i_am_zawgyi");
              }
            } else {
              addNoti();
            }
          }
        }
        if (shouldIgnoreNode(parent) == false && isZawgyi(text) === false && convToUni === false) {
          // console.log(parent,child);
          if (parent.className == null || (parent.classList.contains('_c_o_nvert_') == false && parent.classList.contains('text_exposed_show') == false)) {
            if (font_verification_enable) {
              parent.classList.add('_c_o_nvert_', 'i_am_uni_verified');
            } else {
              parent.classList.add('_c_o_nvert_', 'i_am_uni');
              addNoti();
            }
          }
        }
      }
    }
  }
}

function findParent(element) {
  var parentElement = element.parentNode;
  var end = false;
  while (end === false) {
    if (parentElement.childNodes.length > 1) {
      if (parentElement.lastChild.nodeName == 'DIV') {
        end = true;
      } else {
        parentElement = parentElement.parentNode;
      }
    } else {
      end = true;
    }
  }
  if (parentElement.nodeName == 'SPAN') {
    parentElement.style.display = 'block';
  } else if (parentElement.nodeName == 'A') {
    parentElement.style.display = 'inline-block';
  }
  return parentElement;
}

function isDuplicated(element) {
  var parent = findParent(element);
  return parent.className.indexOf('i_am_zawgyi') !== -1 ? true : false;
}
var addObserver = function(iFdoc) {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  var list;
  if (iFdoc) {
    list = iFdoc.querySelector('body');
  } else {
    list = document.querySelector('body');
  }

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      var frames = document.getElementsByTagName('IFRAME');
      for (let frame of frames) {
        var iFLoad = function(e) {
          var doc = frame.contentDocument || frame.contentWindow.document;
          if (doc) {
            addObserver(doc);
          }
          frame.removeEventListener('load', iFLoad);
        }
        frame.addEventListener('load', iFLoad);
      }

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
  var id = 'mua-conversion-warning-container';

  if (!document.getElementById(id)) {
    var text = '';
    if (convToUni) {
      text = "ဤစာမျက်နှာတွင် ရှိသော ဇော်ဂျီဖြင့် ရေးထားသည့် စာများအား အလိုအလျောက် ပြောင်းလဲထားပါသည်။";
    } else {
      text = "ဤစာမ်က္ႏွာရွိ ယူနီကုဒ္ ျဖင့္ ေရးသားထားေသာစာမ်ားကို စံႏွင့္အညီ ေဖာ္ျပထားပါသည္။";
    }
    var html = '<div class="mua-toast mua-toast-warning" style="display: block;"><div class="mua-toast-message">' + text + '</div></div>'
    var div = document.createElement('div');
    div.id = id;
    div.className = "mua-toast-top-right";
    div.innerHTML = html;
    div.style.display = 'none';
    document.body.appendChild(div);

    var fadeInAndOut = function(element) {
      // http://stackoverflow.com/questions/6121203/how-to-do-fade-in-and-fade-out-with-javascript-and-css
      var setOpacity = function(el, value) {
        div.style.opacity = value;
        div.style.filter = 'alpha(opacity=' + value * 100 + ")";
      }

      var op = 0.01;

      setOpacity(element, op);
      element.style.display = 'block';
      var timer = setInterval(function() {
        if (op >= 1) {
          clearInterval(timer);
        }
        setOpacity(element, op);
        op += op * 0.1;
      }, 10);

      setTimeout(function() {
        var element = document.getElementById(id);
        var timer = setInterval(function() {
          if (op <= 0.01) {
            clearInterval(timer);
            element.style.display = 'none';
          }
          setOpacity(element, op);
          op -= op * 0.1;
        }, 50);
      }, 3000);
    }

    fadeInAndOut(div);
  }
}

var title = document.title;
if (isMyanmar(title) && isZawgyi(title)) {
  document.title = Z1_Uni(title);
}

if (document.location.hostname.indexOf("facebook") != -1 || document.location.hostname == 'plus.google.com') {
  font_verification_enable = true;
  //console.log("It is facebook");
}

//  checking this site is disabled me or not.
var isDisableMUA = document.getElementById("disableMUA") ? true : false;
console.log("MUA Conver is disabled by site was " + isDisableMUA);

var list = document.querySelector('body');

if (!isDisableMUA && !list) {
  if (document.addEventListener) {
    // Use the handy event callback
    document.addEventListener("DOMContentLoaded",
      function() {
        chrome.storage.sync.get("data", function(items) {
          if (!chrome.runtime.error) {
            //console.log(items);
            var enableMUA = items.data;
            if (enableMUA != "disable") {

              addObserver();

            }
          }
        });
      }, false);
  }
} else if (!isDisableMUA) {
  chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      //console.log(items);
      var enableMUA = items.data;
      if (enableMUA != "disable") {
        convertTree(document.body);
        addObserver();
      }
    }
  });
}
