function AnimationEngine(){
	/**
	 *  Type AnimationInput Array
	 */
	this.animationInputArray = [];

	/**
	 *  Type Integer for currentIndex of execution
	 */
	this.currentIndex = -1;
	
	this.isStarted = false;
}

/**
 * push AnimationInput to be executed.
 */
AnimationEngine.prototype.push = function(animationInput){
	this.animationInputArray.push(animationInput);
};

/**
 * Starts the animation if not already started and animationInputArray is not empty.
 */
AnimationEngine.prototype.start = function(){
	if( this.animationInputArray.length != 0 && this.currentIndex == -1 ){
		this.currentIndex = 0;
		this.isStarted = true;
		Logger.log("AnimationEngine : start : Complete List of Executions : " + this.animationInputArray);
		
		var animObj = this.animationInputArray[this.currentIndex];
		animObj.func.apply(animObj.object, animObj.params);
	}else{
		Logger.log("no animationInput or not the start of animation.");
	}
};

/**
 * Executes the next animation
 */
AnimationEngine.prototype.next = function(){
	if( isStarted ){
	if( this.currentIndex < this.animationInputArray.length - 1 ){
		this.currentIndex++;
		var animObj = this.animationInputArray[this.currentIndex];
		Logger.log("AnimationEngine.next : executing : " + animObj);
		
		animObj.func.apply(animObj.object, animObj.params);
		return true;
	}else{
		Logger.log("Animation completed.");
		return false;
	}
	}
};

AnimationEngine.prototype.reset = function(){
	this.currentIndex = -1 ;
	this.isStarted = false; // stops any old animation
};