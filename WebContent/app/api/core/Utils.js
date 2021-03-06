define(["core/Point","core/Logger"], function (Point,Logger) {

    var Utils = {
        clone: function (obj) {
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            var copy = null;
            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = this.clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        },
        /**
         * creates a copy of baseObject and override it with the properties of object
         * @param baseObject
         * @param object
         */
        overrideObject: function (baseObject, object) {
            var baseCopy = this.clone(baseObject);
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    baseCopy[key] = object[key];
                }
            }

            return baseCopy;
        },

//        findIntersectionPointOfLines: function (l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2) {
//            var y = (  l2x1 * l2y2 - l2x2 * l2y1 - l1x1 * l1y2 + l1x2 * l1y1 ) / (  ( l1x1 - l1x2 ) /  ( l1y1 - l1y2 ) - (l2x1 - l2x2) / ( l2y1 - l2y2 )  );
//            var x = ( l1x1 - l1x2 ) / ( l1y1 - l1y2 ) * y + l1x1 * l1y2 - l1x2 * l1y1;
//
//            return new Point(x, y);
//        },

        findIntersectionPointOfLines: function (l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2) {
            var y = null;
            var x = null;
            if (l1y1 == l1y2) { // theta = 90 degree
                y = l1y1;
                x = (l2x1 - l2x2) / (l2y1 - l2y2) * (y - l2y1) + l2x1;
            } else if (l2y1 == l2y2) { // theta = 90 degree
                y = l2y1;
                x = (l1x1 - l1x2) / (l1y1 - l1y2) * (y - l1y1) + l1x1;
            } else {
                var a = ( l1x1 - l1x2 ) / ( l1y1 - l1y2 );
                var b = (l2x1 - l2x2) / ( l2y1 - l2y2 );
                if (a == b) { // parallel lines
                    return null;
                }

                y = ( l1y1 * a - l2y1 * b + l2x1 - l1x1) / ( a - b );
                x = a * ( y - l1y1 ) + l1x1;
            }

            if (isNaN(x) || isNaN(y)) {
                return null;
            }

            return new Point(x, y);
        },

        findIntersectionPointOfLineAndSegment: function (lx1, ly1, lx2, ly2, sx1, sy1, sx2, sy2) {
            var point = this.findIntersectionPointOfLines(lx1, ly1, lx2, ly2, sx1, sy1, sx2, sy2);

            if( null == point ) return null; 
            
            if (( sx1 > sx2 && point.getX() <= sx1 && point.getX() >= sx2)
                || (sx2 > sx1 && point.getX() <= sx2 && point.getX() >= sx1 )
                ) {
                return point;
            }

            return null;
        },
        findIntersectionPointOfSegments: function (s1x1, s1y1, s1x2, s1y2, s2x1, s2y1, s2x2, s2y2) {
            var point = this.findIntersectionPointOfLines(s1x1, s1y1, s1x2, s1y2, s2x1, s2y1, s2x2, s2y2);

            Logger.debug("findIntersectionPointOfSegments : (s1x1, s1y1, s1x2, s1y2, s2x1, s2y1, s2x2, s2y2) = ("+ this.argumentsToString( arguments ) + ") : point = " + point);

            if( null == point ) return null;
            
           if( this.checkIfPointOnSegmentsWithDelta(s1x1, s1y1, s1x2, s1y2, s2x1, s2y1, s2x2, s2y2,point.getX(),point.getY(),1)){
               return point;
           }

            return null;
        },

        /**
         * supposing the point px,py is point of intersection of lines l1 and l2.
         * Checking if the point on the segment of lines defined by following points with in a region of +- errorDelta on the segment edges
         * @param s1x1
         * @param s1y1
         * @param s1x2
         * @param s1y2
         * @param s2x1
         * @param s2y1
         * @param s2x2
         * @param s2y2
         * @param px
         * @param py
         * @param errorDelta
         */
        checkIfPointOnSegmentsWithDelta : function(s1x1,s1y1,s1x2,s1y2,s2x1,s2y1,s2x2,s2y2,px,py,errorDelta){
            // extending the line segments by delta on the x axis
            var s1x1d,  s1x2d, s2x1d, s2x2d;
            if( s1x1 < s1x2 ){
                s1x1d = s1x1 - errorDelta;
                s1x2d = s1x2 + errorDelta;
            }else{
                s1x1d = s1x1 + errorDelta;
                s1x2d = s1x2 - errorDelta
            }

            if( s2x1 < s2x2 ){
                s2x1d = s2x1 - errorDelta;
                s2x2d = s2x2 + errorDelta;
            }else{
                s2x1d = s2x1 + errorDelta;
                s2x2d = s2x2 - errorDelta
            }

            return this.checkIfPointOnSegments(s1x1d,s1y1,s1x2d,s1y2,s2x1d,s2y1,s2x2d,s2y2,px,py);
        },

        /**
         * supposing the point px,py is point of intersection of lines l1 and l2.
         * Checking if the point lies on the segment of lines defined by following points
         * @param s1x1
         * @param s1y1
         * @param s1x2
         * @param s1y2
         * @param s2x1
         * @param s2y1
         * @param s2x2
         * @param s2y2
         * @param px
         * @param py
         * @returns {boolean}
         */
        checkIfPointOnSegments : function(s1x1,s1y1,s1x2,s1y2,s2x1,s2y1,s2x2,s2y2,px,py){
            if (( s2x1 >= s2x2 && px <= s2x1 && px >= s2x2)
                || (s2x2 >= s2x1 && px <= s2x2 && px >= s2x1 )
                ) {
                if (( s1x1 >= s1x2 && px <= s1x1 && px >= s1x2)
                    || (s1x2 >= s1x1 && px <= s1x2 && px >= s1x1 )){

                    return true;
                }
            }

            return false;
        },

        getPointsPositionWrtLine : function(lx1,ly1,lx2,ly2,px,py){
          var p;
//          if( ly1 - ly2 == 0 ){
//              p = py - ly1;
//          }
//          else if( py - ly1 == 0 ){
//              p = px - lx1;
//          } else {
//              p = (px - lx1) / (py - ly1) - (lx1 - lx2 ) / (ly1 - ly2 );
//          }

            p = px * (ly1 - ly2) - lx1 * (ly1 - ly2) - py * (lx1 - lx2) + ly1 * ( lx1 - lx2);
          Logger.debug("getPointsPositionWrtLine : (lx1,ly1,lx2,ly2,px,py) = ("+ this.argumentsToString( arguments ) + ") : p = " + p);

          if( p > 0 ){
              return 1;
          }else if( p < 0 ){
              return -1;
          } else{
              return 0;
          }
        },
        generate4CharUID: function () {
            return (Math.floor((1 + Math.random()) * 0x10000)).toString(16).substring(1);
        },
        generateId: function () {
            return this.generate4CharUID();
        },
        
        getHeaderCode: function( animationId ){
            var HEADER_CODE = "(function(){" +
            "animationId = " + animationId + ";\n" +
            "require([\"ds/Stack\", \"ds/LinkedList\",  \"ds/ArrayDS\",  \"ds/BinaryTree\", \"core/Logger\"],function(Stack,LinkedList, ArrayDS, BinaryTree, Logger){ \n";

            return HEADER_CODE;
        },

        getFooterCode: function(){
	        var FOOTER_CODE =  // "\njsav.playCodeAnimation(animationId);\n" +
	        "});" +
	        "})();";
	        return FOOTER_CODE;
        },

        argumentsToArray : function(args){
            var array = [];
            for(var i = 0 ; i< args.length ; i++){
                array.push(args[i]);
            }

            return array;
        },

        argumentsToString: function(args){
            return this.argumentsToArray(args).toString();
        },

        getTransitionPointsOnLine : function(x1,y1,x2,y2,numberOfPoints){
            var delta=1;
            var array = [];
            var i = 0;
            if( x1 == x2 ){
               delta = (y2 - y1)/(numberOfPoints + 1);
               for( i = 1 ; i <= numberOfPoints ; i++){
                   array.push(new Point(x1,y1 + delta*i));
               }
           } else {
               delta = (x2-x1)/(numberOfPoints +1);
                for(i = 1 ; i <= numberOfPoints ; i++ ){
                    var x = x1 + delta*i;
                    var y = (x - x1 )/(x1 - x2) * (y1 - y2) + y1;

                    array.push(new Point(x,y));
                }
           }

           return array;
        },

        /**
         * checks if the param property is null or undefined
         * @param param
         * @returns {boolean}
         */
        isNullOrUndefined : function( param ){
            if( typeof param === 'undefined' || param == null){
                return true;
            }

            return false;
        },

        inorder : function(binaryTree, visit){
            if( this.isNullOrUndefined(binaryTree) ){
                return;
            }

            this.inorder(binaryTree.getLeft(),visit);
            visit(binaryTree);
            this.inorder(binaryTree.getRight(),visit);
        },

        postorder : function(binaryTree, visit){
            if( this.isNullOrUndefined(binaryTree) ){
                return;
            }

            this.postorder(binaryTree.getLeft(),visit);
            this.postorder(binaryTree.getRight(),visit);
            visit(binaryTree);
        },

        preorder : function(binaryTree, visit){
            if( this.isNullOrUndefined(binaryTree) ){
                return;
            }

            visit(binaryTree);
            this.preorder(binaryTree.getLeft(),visit);
            this.preorder(binaryTree.getRight(),visit);
        }
    };

    return Utils;
});