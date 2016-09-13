function save(){
	var isuni = this.id=='unicode' ? true:false;
	chrome.storage.sync.set({'unicode':isuni},function(){
		if(isuni===true){
			document.getElementById('unicode').classList.add('active');
			document.getElementById('zawgyi').classList.remove('active');
		} else {
			document.getElementById('zawgyi').classList.add('active');
			document.getElementById('unicode').classList.remove('active');
		}
	});
}
function getActiveFunction(){
	chrome.storage.sync.get('unicode',function(a){
		// console.log(a.unicode);
		if(a.unicode!==undefined){
			if(a.unicode===true){
				document.getElementById('unicode').classList.add('active');
			} else {
				document.getElementById('zawgyi').classList.add('active');
			}			
		}
	});
}
document.addEventListener('DOMContentLoaded',getActiveFunction);
document.getElementById('zawgyi').addEventListener('click',save);
document.getElementById('unicode').addEventListener('click',save);