chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      //console.log(items);
      var enableMUA = items.data;
      if(enableMUA == "disable") {
        document.getElementById('muaonoffswitch').checked = false;
      } else {
        document.getElementById('muaonoffswitch').checked = true;
      }
    } 
});

function enableNow() {
  chrome.browserAction.setIcon({path:"icon19.png"});
  chrome.browserAction.setBadgeText({text: "On"});
  chrome.browserAction.setBadgeBackgroundColor({color: "#34A7C1"});
  chrome.storage.sync.set({ "data" : "enable" }, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error.");
    }
  });
}

function disableNow() {
  chrome.browserAction.setIcon({path:"icon_disabled.png"});
  chrome.browserAction.setBadgeText({text: "Off"});
  chrome.browserAction.setBadgeBackgroundColor({color: "#ea2839"});
  chrome.storage.sync.set({ "data" : "disable" }, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error.");
    }
  });
}


function exit() {
  window.close();
}

function switchNow() {
  //alert(document.getElementById('muaonoffswitch').checked);
  if(document.getElementById('muaonoffswitch').checked == true) {
    enableNow();
  } else {
    disableNow();
  }
}

    var canvas, ctx, bMouseIsDown = false, iLastX, iLastY, maxWidth, lineHeight, x, y, $imgs, $convert;

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        text = WordSegmentor(text);

        var words = text.split(/\u200B/g);
        
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + '\u200B';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
        y += lineHeight;
        return y;
    }

    var imageObj = new Image();
    imageObj.onload = function() {
        xx = canvas.width - 100 ;
        yy = canvas.height - 9;
        ctx.drawImage(imageObj, xx, yy, 100, 9);
    };

    function init () {
        canvas = document.getElementById('cvs');
        maxWidth = 320;
        lineHeight = 25;
        x = (canvas.width - maxWidth) / 2;
        y = lineHeight;
        ctx = canvas.getContext('2d');
        $fillText = document.getElementById('fillText');
        //$convert = document.getElementById('convert');
        $imgs = document.getElementById('imgs');
        bind();
       // draw();
    }
    function bind () {
/*        
        canvas.onmousedown = function(e) {
            bMouseIsDown = true;
            iLastX = e.clientX - canvas.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
            iLastY = e.clientY - canvas.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
        }
        canvas.onmouseup = function() {
            bMouseIsDown = false;
            iLastX = -1;
            iLastY = -1;
        }
        canvas.onmousemove = function(e) {
            if (bMouseIsDown) {
                var iX = e.clientX - canvas.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
                var iY = e.clientY - canvas.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
                ctx.strokeStyle = 'red';
                ctx.moveTo(iLastX, iLastY);
                ctx.lineTo(iX, iY);
                ctx.stroke();
                iLastX = iX;
                iLastY = iY;
            }
        };
*/
        var text=document.getElementById('myTextarea');
        chrome.storage.sync.get("textboxval_mua",function(a){
            if(a.textboxval_mua!==undefined){
              text.value=a.textboxval_mua;
            }
        });
        text.onkeypress=function(e){
          //console.log(text.value);
          // console.log(e.which);
          chrome.storage.sync.set({"textboxval_mua":text.value+String.fromCharCode(e.which)});
        };
        $fillText.onclick = function (e) {
          if (document.getElementById('myTextarea').value=="") {
            var text = "ဒီဂျစ်တယ်ခေတ်တွင် နိုင်ငံတကာသုံးစံနှုန်းများကို သုံးစွဲခြင်းဖြင့် ဘာသာစကားများကို ထိန်းသိမ်းကာကွယ်ပါ။";
          } else {
            var text = document.getElementById('myTextarea').value;
          };
            ctx.font = '13pt Myanmar3';
            canvas.height = wrapText(ctx, text, x, y, maxWidth, lineHeight);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.font = '13pt Myanmar3';
            //ctx.fillText(document.getElementById('myTextarea').value, 100, 120);
            imageObj.src = 'mua.png';
            wrapText(ctx, text, x, y, maxWidth, lineHeight);
            $imgs.innerHTML = "";
            $imgs.appendChild(Canvas2Image.convertToImage(canvas, canvas.width, canvas.height, "png"));
            chrome.storage.sync.set({"textboxval_mua":""});
        }

    }
    function draw () {
        canvas.height = 300;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //ctx.fillStyle = '#000000';
        //ctx.fillText(document.getElementById('myTextarea').value, 100, 120);
    }

    function WordSegmentor(input) 
		{
		var output = input;

		output = output.replace(/(\u0020)(\u0020)?(\u0020)?(\u0020)?(\u0020)?(\u0020)?(\u0020)?/g, "\u200C\u200C");
		output = output.replace(/([\u1000-\u109F])(\u200C)?([\u1000-\u1021\u1023-\u1027\u1029\u102A\u104C\u104D\u104F])/g, "$1\u200B$3");
		output = output.replace(/([\u1000-\u109F])(\u200C)?([\u1000-\u1021\u1023-\u1027\u1029\u102A\u104C\u104D\u104F])/g, "$1\u200B$3");
		output = output.replace(/(\u1039)(\u200B)?(\u200B)?(\u200B)?(\u200B)?/g, "$1");
		output = output.replace(/([\u104A\u104B])/g, "\u200B$1");
		output = output.replace(/([\u1000-\u109F])([^\u1000-\u109F])/g, "$1\u200B$2");
		output = output.replace(/([^\u1000-\u109F])([\u1000-\u109F])/g, "$1\u200B$2");
		output = output.replace(/(\u0020)?(\u200B)(\u200B)?(\u200B)?(\u200B)?(\u0020)?(\u200B)?/g, "$2");
		output = output.replace(/\u200B([\u1000-\u1021])(\u1037)?([\u1039\u103A])/g, "$1$2$3");
		output = output.replace(/(\u200C)(\u200C)?/g, "\u0020");

		return output;
	}
    

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('close').addEventListener('click', exit);
  document.getElementById('muaonoffswitch').addEventListener('click', switchNow);
 // document.getElementById('fillText').addEventListener('click', init22);
  init();
});