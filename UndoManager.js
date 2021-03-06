/**
 * The UndoManager is a static class that keeps a stack (as in the data structure) or recently deleted BlockStacks
 * so they can be undeleted.  It can be assigned an undo button, which it will then enable/disable as necessary.
 * The UndoManager stores the deleted BlockStacks as XML nodes.
 */
function UndoManager() {
	const UM = UndoManager;
	UM.undoButton = null;
	UM.undoStack = [];
	UM.undoLimit = 20;
}

/**
 * Assigns a button to the UndoManager, which automatically enables/disables the button and adds the appropriate
 * callback functions
 * @param {Button} button
 */
UndoManager.setUndoButton = function(button) {
	const UM = UndoManager;
	UM.undoButton = button;
	UM.undoButton.setCallbackFunction(UndoManager.undoDelete, true);
	UM.updateButtonEnabled();
};

/**
 * Deletes a BlockStack and adds it to the undo stack.  If the stack is larger than the limit, the last item it removed.
 * @param stack
 */
UndoManager.deleteStack = function(stack) {
	const UM = UndoManager;
	const doc = XmlWriter.newDoc("undoData");
	const stackData = stack.createXml(doc);
	stack.remove();
	UM.undoStack.push(stackData);
	while(UM.undoStack.length > UM.undoLimit) {
		UM.undoStack.shift();
	}
	UM.updateButtonEnabled();
};

/**
 * Pops an item from the stack and rebuilds it, placing it in the corner of the canvas
 */
UndoManager.undoDelete = function(){
	const UM = UndoManager;
	if(UM.undoStack.length === 0) return;
	let success = false;
	while (!success) {
		const stackData = UM.undoStack.pop();
		success = success || TabManager.undoDelete(stackData);
	}
	UM.updateButtonEnabled();
	SaveManager.markEdited();
};

/**
 * Updates the enabled/disabled state of the undo button based in if the stack is empty
 */
UndoManager.updateButtonEnabled = function(){
	const UM = UndoManager;
	if(UM.undoButton == null) return;
	if(UM.undoStack.length > 0) {
		UM.undoButton.enable();
	} else {
		UM.undoButton.disable();
	}
};

/**
 * Deletes the undo stack (for when a program is closed/opened)
 */
UndoManager.clearUndos = function() {
	const UM = UndoManager;
	UM.undoStack = [];
	UM.updateButtonEnabled();
};