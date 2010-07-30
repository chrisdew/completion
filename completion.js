var EMPTY = "EMPTY";
var LIVE = "LIVE";
var FAILED = "FAILED";
var MATCHED = "MATCHED";

function Parser(con) {
	this.con = con;
	this.sub = false; //con(); //undefined;		// sub-parser
	this.state = EMPTY;
	this.closed = false;
}
Parser.prototype._create_sub_if_needed = function() {
	if (!this.sub) {
		this.sub = this.con();
		console.log(this.sub);
	}
}
Parser.prototype.push = function(c) {
	this._create_sub_if_needed();
	this.sub.push(c);
	this.state = this.sub.state;
	this.closed = this.sub.closed;
} 
Parser.prototype.completions = function(){
	this._create_sub_if_needed();
	return this.sub.completions();
}



/**
 * This higher level function takes a constructor and arguments
 * and returns a function, which when called will return the 
 * lazily constructed value.
 * 
 * All the arguments, except the first are passed to the constructor.
 * 
 * @param {Function} constructor
 */
function conthunktor(Constructor) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
         var Temp = function(){};
         Temp.prototype = Constructor.prototype;
         var inst = new Temp;
         var ret = Constructor.apply(inst, args);
         return Object(ret) === ret ? ret : inst;
    }
}
