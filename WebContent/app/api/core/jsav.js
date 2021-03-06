define(["core/Utils", "core/Animator", "core/CodeParser", "core/Defaults","core/Logger"], function (Utils, Animator, CodeParser, Defaults,Logger) {
    /**
     note jsav is kept as a global variable and is not included as a dependency in any of the modules
     jsav has to be require'd in the HTML file once for it to be defined globally
     * @type {{animatorMap: Array, currentCodeAnimationId: number, resolveAnimatorConfigs: resolveAnimatorConfigs, generateCodeAnimation: generateCodeAnimation, getAnimatorById: getAnimatorById, runCodeAndAnimate: runCodeAndAnimate, playCodeAnimation: playCodeAnimation, startAnimateLineExecution: startAnimateLineExecution, endAnimateLineExecution: endAnimateLineExecution}}
     */
    jsav = {
        animatorMap: [],
        currentCodeAnimationId: 0,

        resolveAnimatorConfigs: function (configs) {
            return Utils.overrideObject(Defaults, configs);
        },

        createAnimator : function(configs){
        	var animationId = this.currentCodeAnimationId;
        	var animatorConfigs = this.resolveAnimatorConfigs(configs);
        	
        	var animator = new Animator(animationId, animatorConfigs);// codeStatementLines, options
            animator.createStage();
             this.animatorMap[animationId] = animator;
             
             this.currentCodeAnimationId++;
             
             return animationId;
        },
        
        generateCodeAnimation: function (animationId, codeString) {
            
            var codeParser = new CodeParser(codeString, animationId);
            var codeStatementLines = codeParser.getCodeStatementLines();
            var animator = this.getAnimatorById(animationId);

            animator.createCodeAnimationGenerator(codeStatementLines);
            
            var modifiedCode = codeParser.getModifiedCode();
            this.runCodeAndAnimate(animationId, modifiedCode);
        },

        getAnimatorById: function (animationId) {
            return this.animatorMap[animationId];
        },

        runCodeAndAnimate: function (animationId, modifiedCode, callback) {
            Logger.info("Executing the code : " + modifiedCode);
            var animator = this.getAnimatorById(animationId);

            var head = document.head;

            var jsCodeScript = document.createElement("script");
            jsCodeScript.type = 'text/javascript';
            jsCodeScript.innerHTML = modifiedCode;

            head.appendChild(jsCodeScript);
            jsCodeScript.onload = callback;
        },

        playCodeAnimation: function (animationId) {
            var animator = this.animatorMap[animationId];
            animator.playCodeAnimation();
        },

        startAnimateLineExecution: function (statementNumber, animationId) {
            var animator = this.animatorMap[animationId];
            if (null == animator) {
                throw "Cannot Find the Animation with Id " + animationId;
            }

            animator.startAnimateLineExecution(statementNumber);
        },

        endAnimateLineExecution: function (statementNumber, animationId) {
            var animator = this.animatorMap[animationId];
            if (null == animator) {
                throw "Cannot Find the Animation with Id " + animationId;
            }

            animator.endAnimateLineExecution(statementNumber);
        }
    };

    return jsav;
});