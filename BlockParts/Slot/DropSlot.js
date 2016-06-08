function DropSlot(parent,snapType){
	if(snapType==null){
		snapType=Slot.snapTypes.none;
	}
	Slot.call(this,parent,Slot.inputTypes.drop,snapType,Slot.outputTypes.any);
	this.enteredData=null;
	this.text="";
	this.buildSlot();
	this.selected=false;
	this.optionsText=new Array();
	this.optionsData=new Array();
}
DropSlot.prototype = Object.create(Slot.prototype);
DropSlot.prototype.constructor = DropSlot;
DropSlot.prototype.addOption=function(displayText,data){
	this.optionsText.push(displayText);
	this.optionsData.push(data);
}
DropSlot.prototype.populateList=function(){//overrided by subclasses
	
}
DropSlot.prototype.buildSlot=function(){
	this.textH=BlockGraphics.valueText.charHeight;
	this.textW=0;
	this.bgE=this.generateBg();
	this.triE=this.generateTri();
	this.textE=this.generateText();
}
DropSlot.prototype.generateBg=function(){
	var bG=BlockGraphics.dropSlot;
	var bgE=GuiElements.create.rect(this.parent.group);
	GuiElements.update.color(bgE,bG.bg);
	GuiElements.update.opacity(bgE,bG.bgOpacity);
	TouchReceiver.addListenersSlot(bgE,this);
	return bgE;
}
DropSlot.prototype.generateTri=function(){
	var bG=BlockGraphics.dropSlot;
	var triE=GuiElements.create.path(this.parent.group);
	GuiElements.update.color(triE,bG.triFill);
	TouchReceiver.addListenersSlot(triE,this);
	return triE;
}
DropSlot.prototype.generateText=function(){ //Fix BG
	var bG=BlockGraphics.dropSlot;
	var obj=BlockGraphics.create.valueText("",this.parent.group);
	GuiElements.update.color(obj,bG.textFill);
	TouchReceiver.addListenersSlot(obj,this);
	return obj;
}
DropSlot.prototype.moveSlot=function(x,y){
	var bG=BlockGraphics.dropSlot;
	GuiElements.update.rect(this.bgE,x,y,this.width,this.height);
	var textX=x+bG.slotHMargin;
	var textY=y+this.textH/2+this.height/2;
	BlockGraphics.update.text(this.textE,textX,textY);
	var triX=x+this.width-bG.slotHMargin-bG.triW;
	var triY=y+this.height/2-bG.triH/2;
	GuiElements.update.triangle(this.triE,triX,triY,bG.triW,0-bG.triH);
}
DropSlot.prototype.hideSlot=function(){
	this.bgE.remove();
	this.textE.remove();
	this.triE.remove();
}
DropSlot.prototype.showSlot=function(){
	this.parent.group.appendChild(this.bgE);
	this.parent.group.appendChild(this.triE);
	this.parent.group.appendChild(this.textE);
}
DropSlot.prototype.changeText=function(text){
	this.text=text;
	GuiElements.update.text(this.textE,text);
	if(this.parent.stack!=null){
		this.parent.stack.updateDim();
	}
}
DropSlot.prototype.updateDimNR=function(){
	var bG=BlockGraphics.dropSlot;
	this.textW=GuiElements.measure.textWidth(this.textE);
	var width=this.textW+3*bG.slotHMargin+bG.triW;
	var height=bG.slotHeight;
	if(width<bG.slotWidth){
		width=bG.slotWidth;
	}
	this.width=width;
	this.height=height;
}
DropSlot.prototype.duplicate=function(parentCopy){
	var myCopy=new DropSlot(parentCopy,this.snapType);
	for(var i=0;i<this.optionsText.length;i++){
		myCopy.addOption(this.optionsText[i],this.optionsData[i]);
	}
	if(this.hasChild){
		myCopy.child=this.child.duplicate(0,0);
		myCopy.hasChild=true;
	}
	myCopy.enteredData=this.enteredData;
	myCopy.changeText(this.text);
	return myCopy;
}
DropSlot.prototype.highlight=function(){//Fix BG
	var isSlot=!this.hasChild;
	Highlighter.highlight(this.getAbsX(),this.getAbsY(),this.width,this.height,3,isSlot);
}
DropSlot.prototype.edit=function(){
	if(!this.selected){
		var x=this.getAbsX();
		var y=this.getAbsY();
		this.select();
		InputPad.resetPad();
		for(var i=0;i<this.optionsText.length;i++){
			InputPad.addOption(this.optionsText[i],this.optionsData[i]);
		}
		InputPad.showDropdown(this,x+this.width/2,y,y+this.height);
	}
}
DropSlot.prototype.select=function(){
	var bG=BlockGraphics.dropSlot;
	this.selected=true;
	GuiElements.update.color(this.bgE,bG.selectedBg);
	GuiElements.update.opacity(this.bgE,bG.selectedBgOpacity);
	GuiElements.update.color(this.triE,bG.selectedTriFill);
}
DropSlot.prototype.deselect=function(){
	var bG=BlockGraphics.dropSlot;
	this.selected=false;
	GuiElements.update.color(this.bgE,bG.bg);
	GuiElements.update.opacity(this.bgE,bG.bgOpacity);
	GuiElements.update.color(this.triE,bG.triFill);
}
DropSlot.prototype.textSummary=function(){
	if(this.hasChild){
		return "[...]";
	}
	else{
		if(this.enteredData==null){
			return "[ ]";
		}
		return this.enteredData.asString().getValue();
	}
}
DropSlot.prototype.saveSelectionData=function(text,data){
	if(this.selected){
		this.enteredData=data;
		this.changeText(text);
		this.deselect();
	}
}