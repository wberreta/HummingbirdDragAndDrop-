/**
 * Created by Tom on 6/14/2017.
 */
function DeviceManager(deviceClass){
	this.deviceClass = deviceClass;
	this.connectedDevices = [];
	this.connectionStatus = 2;
	// 0 - At least 1 disconnected
	// 1 - Every device is OK
	// 2 - Nothing connected
	this.selectableDevices = 0;
}
DeviceManager.prototype.getDeviceCount = function() {
	return this.connectedDevices.length;
};
DeviceManager.prototype.getDevice = function(index){
	if(index >= this.getDeviceCount()) return null;
	return this.connectedDevices[index];
};
DeviceManager.prototype.setDevice = function(index, newDevice){
	DebugOptions.assert(index < this.getDeviceCount());
	this.connectedDevices[index].disconnect();
	newDevice.connect();
	this.connectedDevices[index] = newDevice;
	this.devicesChanged();
};
DeviceManager.prototype.removeDevice = function(index){
	this.connectedDevices[index].disconnect();
	this.connectedDevices.splice(index, 1);
	this.devicesChanged();
};
DeviceManager.prototype.appendDevice = function(newDevice){
	newDevice.connect();
	this.connectedDevices.push(newDevice);
	this.devicesChanged();
};
DeviceManager.prototype.setOneDevice = function(newDevice){
	for(let i = 0; i<this.connectedDevices.length; i++){
		this.connectedDevices[i].disconnect();
	}
	newDevice.connect();
	this.connectedDevices = [newDevice];
	this.devicesChanged();
};
DeviceManager.prototype.removeAllDevices = function(){
	this.connectedDevices.forEach(function(device){
		device.disconnect();
	});
	this.connectedDevices = [];
	this.devicesChanged();
};
DeviceManager.prototype.updateTotalStatus = function(){
	if(this.getDeviceCount() == 0){
		this.connectionStatus = 2;
		return;
	}
	var request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/totalStatus");
	var me = this;
	HtmlServer.sendRequestWithCallback(request.toString(), function(result){
		me.connectionStatus = parseInt(result);
		if (isNaN(me.connectionStatus)) {
			me.connectionStatus = 0;
		}
	});
};
DeviceManager.prototype.getTotalStatus = function(){
	return this.connectionStatus;
};
DeviceManager.prototype.updateSelectableDevices = function(){
	var oldCount=this.selectableDevices;
	var inUse=CodeManager.countDevicesInUse(this.deviceClass);
	var newCount=Math.max(this.getDeviceCount(), inUse);
	this.selectableDevices=newCount;
	if(newCount<=1&&oldCount>1){
		CodeManager.hideDeviceDropDowns(this.deviceClass);
	}
	else if(newCount>1&&oldCount<=1){
		CodeManager.showDeviceDropDowns(this.deviceClass);
	}
	BlockPalette.getCategory("robots").refreshGroup();
};
DeviceManager.prototype.getSelectableDeviceCount=function(){
	return this.selectableDevices;
};
DeviceManager.prototype.devicesChanged = function(){
	ConnectMultipleDialog.reloadDialog();
	this.updateSelectableDevices();
};
DeviceManager.prototype.discover = function(callbackFn, callbackErr){
	let request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/discover");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
};
DeviceManager.prototype.stopDiscover = function(callbackFn, callbackErr){
	let request = new HttpRequestBuilder(this.deviceClass.getDeviceTypeId() + "/stopDiscover");
	HtmlServer.sendRequestWithCallback(request.toString(), callbackFn, callbackErr);
};
DeviceManager.updateSelectableDevices = function(){
	Device.getTypeList().forEach(function(deviceType){
		deviceType.getManager().updateSelectableDevices();
	});
};