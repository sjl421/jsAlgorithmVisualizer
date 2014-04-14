function Animator(animationId, codeStatementLines, configs){
	this.animationId = animationId;
	this.codeStatementLines = codeStatementLines;
	this.configs = configs;
	this.animationEngine = new AnimationEngine(animationId);
	this.stage = null;
	this.layoutManager = null;
	this.codeAnimationGenerator = null ; //new CodeAnimationGenerator(this.animationId, codeStatementLines);
}

Animator.prototype.createStage = function() {
	var animatorRef = this;
	this.stage = new Kinetic.Stage({
		container : animatorRef.configs[jsav.STAGE_CONTAINERDIV],
		width : animatorRef.configs[jsav.STAGE_HEIGHT],
		height : animatorRef.configs[jsav.STAGE_WIDTH],
		opacity : animatorRef.configs[jsav.STAGE_OPACITY]
	});
//	this.stage.red(animatorRef.configs[jsav.STAGE_COLOR_RED]);
//	this.stage.blue (animatorRef.configs[jsav.STAGE_COLOR_BLUE]);
//	this.stage.green (animatorRef.configs[jsav.STAGE_COLOR_GREEN]);
//

	this.codeAnimationGenerator = new CodeAnimationGenerator(this.animationId, this.codeStatementLines);

	
	this.layoutManager = new LayoutManager(this.stage);
	this.layoutManager.getLayer().red(animatorRef.configs[jsav.STAGE_COLOR_RED]);
	this.layoutManager.getLayer().blue (animatorRef.configs[jsav.STAGE_COLOR_BLUE]);
	this.layoutManager.getLayer().green (animatorRef.configs[jsav.STAGE_COLOR_GREEN]);


},
	
Animator.prototype.getAnimationId = function(){
	return this.animationId;
};

Animator.prototype.playCodeAnimation = function(){
	this.animationEngine.start();
};

Animator.prototype.pauseCodeAnimation = function(){
	this.animationEngine.pause();
};

Animator.prototype.resumeCodeAnimation = function(){
	this.animationEngine.resume();
};

Animator.prototype.resetCodeAnimation = function(){
	this.animationEngine.reset();

	var layer = this.layoutManager.getLayer();
	layer.removeChildren();
	layer.clear();
	layer.draw();
};

Animator.prototype.endAnimateLineExecution = function(statementNumber){
	this.codeAnimationGenerator.generateEndCodeStatementAnimation(statementNumber);
};
	
Animator.prototype.startAnimateLineExecution = function( statementNumber ){
	this.codeAnimationGenerator.generateStartCodeStatementAnimation(statementNumber);
};

Animator.prototype.getAnimationEngine = function(){
	return this.animationEngine;
};

Animator.prototype.getLayoutManager = function(){
	return this.layoutManager; 
};

Animator.prototype.getConfigs = function(){
	return this.configs;
};