function ConnectOneHBDialog(){
	var COHBD=ConnectOneHBDialog;
	if(COHBD.currentCOHBD!=null){
		COHBD.currentCOHBD.closeDialog();
	}
	COHBD.currentCOHBD=this;
	this.width=COHBD.width;
	this.height=GuiElements.height/2;
	this.x=GuiElements.width/2-this.width/2;
	this.y=GuiElements.height/4;
	this.menuBnList=null;
	this.group=GuiElements.create.group(this.x,this.y);
	this.bgRect=this.makeBgRect();
	//this.menuBnList=this.makeMenuBnList();
	this.cancelBn=this.makeCancelBn();
	this.titleRect=this.createTitleRect();
	this.titleText=this.createTitleLabel();
	GuiElements.layers.dialog.appendChild(this.group);
	GuiElements.blockInteraction();
	var thisCOHBD =this;
	this.updateTimer = self.setInterval(function () { thisCOHBD.discoverHBs() }, COHBD.updateInterval);
	this.discoverHBs();
	this.visible = true;
}
ConnectOneHBDialog.setConstants=function(){
	var COHBD=ConnectOneHBDialog;
	COHBD.currentCOHBD=null;
	COHBD.updateInterval=500;

	COHBD.titleBarColor=Colors.lightGray;
	COHBD.titleBarFontC=Colors.white;
	COHBD.bgColor=Colors.black;
	COHBD.titleBarH=30;
	COHBD.width=300;
	COHBD.cancelBnWidth=100;
	COHBD.cancelBnHeight=MenuBnList.bnHeight;
	COHBD.bnMargin=5;

	COHBD.fontSize=16;
	COHBD.font="Arial";
	COHBD.fontWeight="normal";
	COHBD.charHeight=12;
};
ConnectOneHBDialog.prototype.makeBgRect=function(){
	var COHBD=ConnectOneHBDialog;
	var rectE=GuiElements.draw.rect(0,0,this.width,this.height,COHBD.bgColor);
	this.group.appendChild(rectE);
	return rectE;
};
ConnectOneHBDialog.prototype.makeMenuBnList=function(){
	var bnM=OpenDialog.bnMargin;
	var menuBnList=new MenuBnList(this.group,bnM,bnM+OpenDialog.titleBarH,bnM,OpenDialog.width-2*bnM);
	menuBnList.setMaxHeight(this.calcMaxHeight());
	for(var i=0;i<this.files.length-1;i++){
		this.addBnListOption(this.files[i],menuBnList);
	}
	menuBnList.show();
	return menuBnList;
};
ConnectOneHBDialog.prototype.makeCancelBn=function(){
	var COHBD=ConnectOneHBDialog;
	var width=COHBD.cancelBnWidth;
	var height=COHBD.cancelBnHeight;
	var x=COHBD.width/2-width/2;
	var y=this.height-height-COHBD.bnMargin;
	var cancelBn=new Button(x,y,width,height,this.group);
	cancelBn.addText("Cancel");
	var callbackFn=function(){
		callbackFn.dialog.closeDialog();
	};
	callbackFn.dialog=this;
	cancelBn.setCallbackFunction(callbackFn,true);
	return cancelBn;
};
ConnectOneHBDialog.prototype.createTitleRect=function(){
	var COHBD=ConnectOneHBDialog;
	var rect=GuiElements.draw.rect(0,0,COHBD.width,COHBD.titleBarH,COHBD.titleBarColor);
	this.group.appendChild(rect);
	return rect;
};
ConnectOneHBDialog.prototype.createTitleLabel=function(){
	var COHBD=ConnectOneHBDialog;
	var textE=GuiElements.draw.text(0,0,"Connect",COHBD.fontSize,COHBD.titleBarFontC,COHBD.font,COHBD.fontWeight);
	var x=COHBD.width/2-GuiElements.measure.textWidth(textE)/2;
	var y=COHBD.titleBarH/2+COHBD.charHeight/2;
	GuiElements.move.text(textE,x,y);
	this.group.appendChild(textE);
	return textE;
};
ConnectOneHBDialog.prototype.closeDialog=function(){
	this.group.remove();
	this.visible = false;
	if(this.menuBnList != null){
		this.menuBnList.hide();
	}
	this.menuBnList=null;
	GuiElements.unblockInteraction();
	ConnectOneHBDialog.currentCOHBD=null;
	this.updateTimer = window.clearInterval(this.updateTimer);
	HtmlServer.sendRequestWithCallback("hummingbird/stopDiscover");
};
ConnectOneHBDialog.prototype.discoverHBs=function(){
	var thisCOHBD=this;
	HtmlServer.sendRequestWithCallback("hummingbird/discover",function(response){
		var hBString=response;
		if(HummingbirdManager.allowVirtualHBs){
			//response+="\nVirtual HB";
			response=response.trim();
		}
		thisCOHBD.updateHBList(response);
	},function(){
		if(HummingbirdManager.allowVirtualHBs){
			thisCOHBD.updateHBList('[{"id":"Virtual HB1"},{"id":"Virtual HB2"}]');
		}
	});
};
ConnectOneHBDialog.prototype.updateHBList=function(newHBs){
	if(TouchReceiver.touchDown || !this.visible){
		return;
	}
	var hBArray = JSON.parse(newHBs);
	var COHBD=ConnectOneHBDialog;
	var oldScroll=0;
	if(this.menuBnList!=null){
		oldScroll=this.menuBnList.getScroll();
		this.menuBnList.hide();
	}
	var bnM=COHBD.bnMargin;
	//this.menuBnList=new MenuBnList(this.group,bnM,bnM+COHBD.titleBarH,bnM,this.width-bnM*2);
	this.menuBnList=new SmoothMenuBnList(this, this.group,bnM,bnM+COHBD.titleBarH,this.width-bnM*2);
	this.menuBnList.setMaxHeight(this.height-COHBD.titleBarH-COHBD.cancelBnHeight-COHBD.bnMargin*3);
	for(var i=0;i<hBArray.length;i++){
		this.addBnListOption(hBArray[i].name, hBArray[i].id);
	}

	this.menuBnList.show();
	this.menuBnList.setScroll(oldScroll);
};
ConnectOneHBDialog.prototype.addBnListOption=function(hBName, hBId){
	var COHBD=ConnectOneHBDialog;
	this.menuBnList.addOption(hBName,function(){
		COHBD.selectHB(hBName, hBId);
	});
};
ConnectOneHBDialog.selectHB=function(hBName, hBId){
	ConnectOneHBDialog.currentCOHBD.closeDialog();
	HummingbirdManager.connectOneHB(hBName, hBId);
};
ConnectOneHBDialog.prototype.relToAbsX = function(x){
	return x + this.x;
};
ConnectOneHBDialog.prototype.relToAbsY = function(y){
	return y + this.y;
};
/*

OpenDialog.prototype.addBnListOption=function(file,menuBnList){
	var dialog=this;
	menuBnList.addOption(file,function(){dialog.openFile(file)});
};


OpenDialog.prototype.updateGroupPosition=function(){
	var OD=OpenDialog;
	var x=GuiElements.width/2-OD.width/2;
	var y=GuiElements.height/2-this.height/2;
	GuiElements.move.group(this.group,x,y);
};

OpenDialog.prototype.openFile=function(fileName){
	SaveManager.open(fileName);
	this.closeDialog();
};
*/