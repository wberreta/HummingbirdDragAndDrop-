/**
 * Created by Tom on 6/17/2017.
 */
function CallbackManager(){

}
CallbackManager.sounds = {};
CallbackManager.sounds.recordingEnded = function(){
	RecordingManager.interruptRecording();
	return false;
};
CallbackManager.sounds.permissionGranted = function(){
	RecordingManager.permissionGranted();
	return true;
};
CallbackManager.data = {};
CallbackManager.data.import = function(fileName){
	SaveManager.import(fileName);
	return true;
};
CallbackManager.dialog.promptResponded = function(cancelled, response){
	return false;
};
CallbackManager.dialog.choiceResponded = function(cancelled, firstSelected){
	return false;
};
CallbackManager.dialog.alertResponded = function(){
	return false;
};
CallbackManager.robot = {};
CallbackManager.robot.updateStatus = function(robotId, isConnected){
	return false;
};
CallbackManager.robot.discovered = function(robotList){
	return true;
};