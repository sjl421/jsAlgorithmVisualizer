/**
 * Created by nitiraj on 11/5/14.
 */
define(["core/Constants", "animds/InternalBinaryTree", "animds/TextRectAnimationObject","animds/PointerAnimationObject",
        "animds/AnimationObject", "core/Utils", "core/Logger", "core/Point", "core/AnimationEngine", "core/AnimationInput", "animds/AnimUtils"],
    function(Constants, InternalBinaryTree, TextRectAnimationObject, PointerAnimationObject, AnimationObject, Utils, Logger,
             Point, AnimationEngine, AnimationInput, AnimUtils){
	
	var binaryTreeVsInternalBinaryTreeMap = {};

	function getInternalBinaryTreeFor(binaryTree){
        if( Utils.isNullOrUndefined(binaryTree)){
            return null;
        }

	    var internalBinaryTree = binaryTreeVsInternalBinaryTreeMap[binaryTree.id];

        return internalBinaryTree;
	}
	
//	function putInternalBinaryTreeIntoMap(internalBinaryTree){
//		internalBinaryTreeMap[internalBinaryTree.id] = internalBinaryTree;
//	}

    function putBinaryVsInteralBinaryTreeMap(binaryTree, internalBinaryTree){
        binaryTreeVsInternalBinaryTreeMap[binaryTree.id] = internalBinaryTree;
    }
	
    function BinaryTreeAnimationObject(configs, layer, animationEngine, layoutManager, group){
        AnimationObject.call(this, "BinaryTreeAnimationObject", configs, layer, animationEngine, layoutManager );
        if( Utils.isNullOrUndefined(group)){
            this.group = new Kinetic.Group({
                draggable : true
            });
            this.originalGroup = this.group;
        }else {
            this.group = group;
        }

        this.height = this.getConfig(Constants.BINARY_TREE_BOX_HEIGHT);
        this.width = this.getConfig(Constants.BINARY_TREE_BOX_WIDTH);

        this.getConfigs()[Constants.RECT_WIDTH] = this.width;
        this.getConfigs()[Constants.RECT_HEIGHT] = this.height;

        this.internalBinaryTree = null;

        this.getLayer().add(this.group);
    }

    BinaryTreeAnimationObject.prototype = new AnimationObject();

    BinaryTreeAnimationObject.prototype.setGroup = function( group ){
        if( this.group != group ){
        	this.x = this.x + this.group.x() - group.x() ; 
            this.y = this.y + this.group.y() - group.y() ;
            this.group = group;
            this.rect.setGroup(group);
            this.rightPointer.setGroup(group);
            this.leftPointer.setGroup(group);
            if( !Utils.isNullOrUndefined(this.originalGroup) ){
                this.originalGroup.destroy();
                this.originalGroup = null;
            }
        }
    };

    BinaryTreeAnimationObject.prototype.setXY = function(x,y){
        this.x = x ;
        this.y = y ;

        this.draw();
    };

    BinaryTreeAnimationObject.prototype.getX = function(){
        return this.x;
    };

    BinaryTreeAnimationObject.prototype.getY = function(){
        return this.y;
    };

    /**
     * draws just this node
     */
    BinaryTreeAnimationObject.prototype.draw = function(){
        this.rect.setXY(this.x,this.y);

        this.rightPointer.setPoints(this.x + this.width, this.y + this.height, this.x + this.width, this.y + 2 * this.height);
        this.leftPointer.setPoints(this.x, this.y + this.height, this.x, this.y + 2 * this.height);
    };

    /**
     * Draws the whole tree not just this node.
     */
    BinaryTreeAnimationObject.prototype.drawTree = function(){
        // get the root
        var root = this.internalBinaryTree;
        var heightUp = 0 ;
        while( root.getParent() != null ){
            heightUp++;
            root = root.getParent();
        }

        var heightDown = this.internalBinaryTree.getHeight();
        var height = heightDown + heightUp ;

        var numberOfLeafNodes = Math.pow(2, height - 1); // assuming full binary tree
        var widthOfTree = (2 * numberOfLeafNodes -1 ) * this.width;

//        var x = root.getAnimNode().getX();
//        var y = root.getAnimNode().getY();
//
        var tempAnimationEngine = new AnimationEngine(this.getAnimationEngine().getUnitTime());
        var nodes = [];
        nodes.push(root);
        var group = root.getAnimNode().getGroup();

        Utils.inorder(root,function(binaryTree){
            binaryTree.getAnimNode().setGroup(group);
        });

        nodes.push("D"); // the delimiter for level
        var currNode = null;
        while(nodes.length != 0){
            currNode = nodes.shift();

            if( currNode === "D"){ // delimiter
                height--;
                numberOfLeafNodes = Math.pow(2, height - 1); // assuming full binary tree
                widthOfTree = (2 * numberOfLeafNodes -1 ) * this.width;
                if( nodes.length != 0 ){ // this was not last D
                    nodes.push("D"); // push delimiter for ending this level
                }
            }
            else{
                var currAnimNode = currNode.getAnimNode();
//                currAnimNode.setGroup(group);
                if( currNode.getLeft() ){
                    nodes.push(currNode.getLeft());
                    var animInput = new AnimationInput(null,
                        function(currNode,widthOfTree){
                            var currAnimNode = currNode.getAnimNode();
                            var leftAnimNode = currNode.getLeft().getAnimNode();
                            var rx = currAnimNode.getX() - widthOfTree/4 ;
                            var ry = currAnimNode.getY() + 2 * currAnimNode.height;

                            AnimUtils.animateObjectShift(leftAnimNode,rx,ry,leftAnimNode.getAnimationEngine().getUnitTime(),leftAnimNode.getLayer(),
                            ConnectJs.hitch(this,function(currAnimNode,leftAnimNode){
                                currAnimNode.leftPointer.pointHeadTo(leftAnimNode);
                                tempAnimationEngine.next();
                            },currAnimNode,leftAnimNode));
                        },[currNode,widthOfTree] );

                    tempAnimationEngine.push(animInput);
                }else{
                    var animInput = new AnimationInput(null,
                            function(currAnimNode){
                                AnimUtils.animatePointerHeadShift(currAnimNode.leftPointer,currAnimNode.getX(),currAnimNode.getY() + 2 * currAnimNode.height,currAnimNode.getAnimationEngine().getUnitTime(),currAnimNode.getLayer(),
                                    ConnectJs.hitch(null,function(){
                                        tempAnimationEngine.next();
                                    })
                                );
                            },[currAnimNode]);

                    tempAnimationEngine.push(animInput);
                }

                if( currNode.getRight() ){
                    nodes.push(currNode.getRight());
                    var animInput = new AnimationInput(null,
                        function (currNode, widthOfTree) {
                            var currAnimNode = currNode.getAnimNode();
                            var rightAnimNode = currNode.getRight().getAnimNode();
                            var lx = widthOfTree / 4 + currNode.getAnimNode().getX();
                            var ly = currNode.getAnimNode().getY() + 2 * currAnimNode.height;

                            AnimUtils.animateObjectShift(rightAnimNode, lx, ly, rightAnimNode.getAnimationEngine().getUnitTime(), rightAnimNode.getLayer(),
                                ConnectJs.hitch(this, function (currAnimNode, rightAnimNode) {
                                    currAnimNode.rightPointer.pointHeadTo(rightAnimNode);
                                    tempAnimationEngine.next();
                                }, currAnimNode, rightAnimNode));
                        }, [currNode, widthOfTree]);

                    tempAnimationEngine.push(animInput);
                }else{
                    var animInput = new AnimationInput(null,
                        function (currAnimNode) {
                            AnimUtils.animatePointerHeadShift(currAnimNode.rightPointer, currAnimNode.getX() + currAnimNode.width, currAnimNode.getY() + 2 * currAnimNode.height, currAnimNode.getAnimationEngine().getUnitTime(), currAnimNode.getLayer(),
                                ConnectJs.hitch(null, function () {
                                    tempAnimationEngine.next();
                                })
                            );
                        }, [currAnimNode]);
                    tempAnimationEngine.push(animInput);
                }
            }
        }

        var connectHandle = ConnectJs.connect(tempAnimationEngine,"animationCompleted",ConnectJs.hitch(this,function(){
            ConnectJs.disconnect(connectHandle);
            this.getLayer().draw();
            Logger.debug("Binary Tree draw completed");
            this.getAnimationEngine().next();
        }));

        tempAnimationEngine.start();
    };

    BinaryTreeAnimationObject.prototype.getRoot = function () {
        return this.rect.getRoot();
    };

    BinaryTreeAnimationObject.prototype.getPointTo = function (point) {
        return this.rect.getPointTo(point);
    };

    BinaryTreeAnimationObject.prototype.getGroup = function() {
        return this.group;
    };

        BinaryTreeAnimationObject.prototype.createObject = function( binaryTree, right,left,data){
        var iRight = null , iLeft = null ;

        this.data = data;
        this.x = this.getLayoutManager().getCenter().getX();
        this.y = this.getLayoutManager().getCenter().getY();

        this.getConfigs()["x"] = this.x ;
        this.getConfigs()["y"] = this.y ;
        this.getConfigs()["data"] = this.data;

        this.rect = new TextRectAnimationObject(this.getConfigs(), this.getLayer(), this.getGroup());

        var rightNodeConfigs = Utils.clone(this.getConfigs());
        rightNodeConfigs[Constants.ARROW_FROMX] = this.rect.getX() + this.width;
        rightNodeConfigs[Constants.ARROW_FROMY] = this.rect.getX() + this.height;
        rightNodeConfigs[Constants.ARROW_TOX] = this.rect.getX() + this.width ;
        rightNodeConfigs[Constants.ARROW_TOY] = this.rect.getX() + this.height + this.height;

        this.rightPointer = new PointerAnimationObject(rightNodeConfigs, this.getLayer(), this.getGroup());

        var leftNodeConfigs = Utils.clone(this.getConfigs());
        leftNodeConfigs[Constants.ARROW_FROMX] = this.rect.getX();
        leftNodeConfigs[Constants.ARROW_FROMY] = this.rect.getX() + this.height;
        leftNodeConfigs[Constants.ARROW_TOX] = this.rect.getX();
        leftNodeConfigs[Constants.ARROW_TOY] = this.rect.getX() + this.height + this.height;

        this.leftPointer = new PointerAnimationObject(leftNodeConfigs, this.getLayer(), this.getGroup());

        if( right != null ){
            iRight = getInternalBinaryTreeFor(right);
        }

        if( left != null ){
            iLeft = getInternalBinaryTreeFor(left);
        }

        var internalBinaryTree = new InternalBinaryTree(iLeft,iRight,data);
        internalBinaryTree.setAnimNode(this);

//        binaryTree.setInternalTree(internalBinaryTree);
//        putInternalBinaryTreeIntoMap(internalBinaryTree);
        putBinaryVsInteralBinaryTreeMap(binaryTree,internalBinaryTree);

         this.internalBinaryTree = internalBinaryTree;

        // craete new node for internalBinaryTree,
        this.getLayer().draw(); // this will print the current node
        var tempAnimationEngine = new AnimationEngine(this.getAnimationEngine().getUnitTime());
        // shift iLeft to left of this node
        if( !Utils.isNullOrUndefined( iLeft ) ){
            generateAnimationForLeftChild(this.internalBinaryTree,iLeft,tempAnimationEngine);
        }

            // shift iRight to right of this node
        if( !Utils.isNullOrUndefined(iRight) ){
            generateAnimationForRightChild(this.internalBinaryTree,iRight,tempAnimationEngine);
        }
        
        var connectHandler = ConnectJs.connect( tempAnimationEngine, "animationCompleted", ConnectJs.hitch(this, function(){
            ConnectJs.disconnect(connectHandler);
        	this.reAdjustTree();
        	this.getAnimationEngine().next();
        }));

        tempAnimationEngine.play();
    };

    function generateAnimationForLeftChild(parentTree,leftTree,animationEngine){
        Utils.inorder(leftTree,function(binaryTree){
            binaryTree.getAnimNode().setGroup(parentTree.getAnimNode().getGroup());
        });

        var animationInput = new AnimationInput(null,
            function(left,parentTree){
                var leftChildren = AnimUtils.getAllChildrenAnimNodesOfTree(left);
                var leftX = left.getAnimNode().getX();
                var leftY = left.getAnimNode().getY();
                var toX = parentTree.getAnimNode().getX() - 3 / 4 * parentTree.getAnimNode().width;
                var toY = parentTree.getAnimNode().getY() + 2 * parentTree.getAnimNode().height;
                var diffx = toX - leftX;
                var diffy = toY - leftY;

                AnimUtils.animateObjectArrayMove(leftChildren, diffx, diffy, parentTree.getAnimNode().getAnimationEngine().getUnitTime(), parentTree.getAnimNode().getLayer(),function(){
                    animationEngine.next();
                });
            },[leftTree,parentTree]
        );
        animationEngine.push(animationInput);
    }

    function generateAnimationForRightChild(parentTree,rightTree,animationEngine){
        Utils.inorder(rightTree,function(binaryTree){
            binaryTree.getAnimNode().setGroup(parentTree.getAnimNode().getGroup());
        });

        var animationInput = new AnimationInput(null,
            function(right,parentTree){
                var rightChildren = AnimUtils.getAllChildrenAnimNodesOfTree(right);
                var rightX = right.getAnimNode().getX();
                var rightY = right.getAnimNode().getY();
                var toX = parentTree.getAnimNode().getX() + 3/4 * parentTree.getAnimNode().width;
                var toY = parentTree.getAnimNode().getY() + 2 * parentTree.getAnimNode().height;
                var diffx = toX - rightX;
                var diffy = toY - rightY;

                AnimUtils.animateObjectArrayMove(rightChildren, diffx, diffy, parentTree.getAnimNode().getAnimationEngine().getUnitTime(), parentTree.getAnimNode().getLayer(),function(){
                    animationEngine.next();
                });
            },[rightTree,parentTree]
        );
        animationEngine.push(animationInput);
    }
    /**
     * Draws the whole tree not just this node.
     */
    BinaryTreeAnimationObject.prototype.reAdjustTree = function(){
        // get the root
        var root = this.internalBinaryTree;
        var heightUp = 0 ;
        while( root.getParent() != null ){
            heightUp++;
            root = root.getParent();
        }

        var heightDown = AnimUtils.getBinaryTreeHeight(this.internalBinaryTree);
        var height = heightDown + heightUp ;

        var numberOfLeafNodes = Math.pow(2, height - 1); // assuming full binary tree
        var widthOfTree = (2 * numberOfLeafNodes - 2 );

//        var x = root.getAnimNode().getX();
//        var y = root.getAnimNode().getY();

        var nodes = [];
        nodes.push(root);
        // create new group and so that each tree has its own group
        var group = new Kinetic.Group({
        	draggable:true
        });


        Utils.inorder(root,function(binaryTree){
            binaryTree.getAnimNode().setGroup(group);
        });
//        root.getAnimNode().getGroup();
        nodes.push("D"); // the delimiter for level
        var currNode = null;
        while(nodes.length != 0){
            currNode = nodes.shift();

            if( currNode === "D"){ // delimiter
                height--;
                numberOfLeafNodes = Math.pow(2, height - 1); // assuming full binary tree
                widthOfTree = (2 * numberOfLeafNodes - 2 );
                if( nodes.length != 0 ){ // this was not last D
                    nodes.push("D"); // push delemiter for ending this level
                }
            }
            else{
                var currAnimNode = currNode.getAnimNode();
//                currAnimNode.setGroup(group);
                if( currNode.getLeft() ){
                    nodes.push(currNode.getLeft());
                    var leftAnimNode = currNode.getLeft().getAnimNode();
                    var lx = currAnimNode.getX() - Math.ceil(widthOfTree/4) * currAnimNode.width ;
                    var ly = currAnimNode.getY() + 2 * this.height;
                    leftAnimNode.setXY(lx,ly);
                    currAnimNode.leftPointer.pointHeadTo(leftAnimNode);
                }else{
                    currAnimNode.leftPointer.setHeadPoint(new Point(currAnimNode.getX(),currAnimNode.getY() + 2 * currAnimNode.height));
                }

                if( currNode.getRight() ){
                    nodes.push(currNode.getRight());
                    var rightAnimNode = currNode.getRight().getAnimNode();
                    var rx = currNode.getAnimNode().getX() + Math.floor(widthOfTree/4) * currAnimNode.width + currAnimNode.width ;
                    var ry = currNode.getAnimNode().getY() + 2 * this.height;
                    rightAnimNode.setXY(rx,ry);
                    currAnimNode.rightPointer.pointHeadTo(rightAnimNode);
                }else{
                    currAnimNode.rightPointer.setHeadPoint(new Point(currAnimNode.getX() + currAnimNode.width,currAnimNode.getY() + 2 * currAnimNode.height));
                }
            }
        }

        root.getAnimNode().getLayer().add(group);
        root.getAnimNode().getLayer().draw();
        Logger.debug("Binary Tree draw completed");
    };

        BinaryTreeAnimationObject.prototype.toString = function (xdiff,ydiff) {
            return "BinaryTreeAnimationObject[ data=" + this.data + "]";
        };

        BinaryTreeAnimationObject.prototype.moveXY = function (xdiff,ydiff) {
            this.x += xdiff;
            this.y += ydiff;

            this.rect.moveXY(xdiff,ydiff);
            this.leftPointer.moveXY(xdiff,ydiff);
            this.rightPointer.moveXY(xdiff,ydiff);

        };
    BinaryTreeAnimationObject.prototype.getChildren = function(){
    	return [this.leftPointer, this.rightPointer,this.rect];
    };

        /**
         * @param binaryTree
         * @param point
         */
        function reGroupAndRelocateTree(binaryTree,point,animationEngine){
            // make a different group.
            var group = new Kinetic.Group({
                draggable:true
            });

            var animNode = binaryTree.getAnimNode();
            animNode.getLayer().add(group);

            Utils.inorder(binaryTree,function(tree){
               tree.getAnimNode().setGroup(group);
            });

            // move to tree to given point
            var animationInput = new AnimationInput(null, function(binaryTree,point){
                var animNode = binaryTree.getAnimNode();
                var diffx = point.getX() - animNode.getX() ;
                var diffy = point.getY() - animNode.getY() ;
                var children = AnimUtils.getAllChildrenAnimNodesOfTree(binaryTree);

                AnimUtils.animateObjectArrayMove(children,diffx, diffy,animNode.getAnimationEngine().getUnitTime(), animNode.getLayer(), function(){
                    animationEngine.next();
                });
            },[binaryTree,point]);

            animationEngine.push(animationInput);
        }

        BinaryTreeAnimationObject.prototype.setRight = function(right){
            var iRight = getInternalBinaryTreeFor(right);
            var oldRight = this.internalBinaryTree.setRight( iRight );

            var animationEngine = new AnimationEngine(this.getAnimationEngine().getUnitTime());
            // generate animation for breaking of trees
            if(!Utils.isNullOrUndefined(oldRight)){
               reGroupAndRelocateTree(oldRight,this.getLayoutManager().getCenter(),animationEngine);
            }

            if( !Utils.isNullOrUndefined(iRight) ){
                // generate animation for joining of trees
                generateAnimationForRightChild(this.internalBinaryTree,iRight,animationEngine);
            }

            var handle = ConnectJs.connect(animationEngine,"animationCompleted",ConnectJs.hitch(this,function(){
                ConnectJs.disconnect(handle);
                this.reAdjustTree();
                this.getAnimationEngine().next();
            }));

            animationEngine.play();
        };

        BinaryTreeAnimationObject.prototype.setLeft = function(left){
            var iLeft = getInternalBinaryTreeFor(left);
            var oldLeft = this.internalBinaryTree.setLeft( iLeft );

            var animationEngine = new AnimationEngine(this.getAnimationEngine().getUnitTime());
            // generate animation for breaking of trees
            if(!Utils.isNullOrUndefined(oldLeft)){
                reGroupAndRelocateTree(oldLeft,this.getLayoutManager().getCenter(),animationEngine);
            }

            if( !Utils.isNullOrUndefined(iLeft) ){
                // generate animation for joining of trees
                generateAnimationForLeftChild(this.internalBinaryTree,iLeft,animationEngine);
            }

            var handle = ConnectJs.connect(animationEngine,"animationCompleted",ConnectJs.hitch(this,function(){
                ConnectJs.disconnect(handle);
                this.reAdjustTree();
                this.getAnimationEngine().next();
            }));

            animationEngine.play();
        };

        BinaryTreeAnimationObject.prototype.setData = function(data){
            this.data = data;
            this.rect.setData(data);
            this.internalBinaryTree.setData(data);
        };


        return BinaryTreeAnimationObject;
});