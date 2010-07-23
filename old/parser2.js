var verb = function() {
    return new Any( new Literal("drop ")
                  , new Literal("take ")
				  , new Literal("get ")
				  , new Literal("give ")
				  , new Literal("light ")
				  , new Literal("extinguish ")
				  , new Literal("open ")
				  , new Literal("close ")
				  , new Literal("north ")
				  , new Literal("south ")
				  , new Literal("east ")
				  , new Literal("west ")
				  ) ;
}


var article = function() {
	return new Any( new Literal("a ")
				     , new Literal("an ")
                     , new Literal("the ")
				     , new Literal("some ")
                     ) ;
}

var noun = function() {
	return new Any( new Literal("torch ")
				  , new Literal("lamp ")
                  , new Literal("sword ")
				  , new Literal("cheese ")
				  , new Literal("box ")
				  , new Literal("boxes ")
                  ) ;
}

var pronoun = function() {
	return new Any( new Literal("it ")
				  , new Literal("him ")
                  , new Literal("her ")
				  , new Literal("them ")
                  ) ;
}

var adjective = function() {
	return new Any( new Literal("small ")
				  , new Literal("big ")
                  , new Literal("green ")
				  , new Literal("yellow ")
                  ) ;
}

var noun_clause = function() {
	return new Any( sequence( optional(article())
	                        , optional(adjective())
	                        , noun()
				                  )
	              , pronoun()
				        ) ;
}
					 
var command = function() {
	return sequence( verb()
	               , sequence(optional(noun_clause()))
	               ) ;
}




/*
var parser = any( sequence( literal('hello')
                          , optional(literal(' cruel'))
						  , any( literal(' world')
						       , literal(' womble')
							   )
						  )
                , literal('help')
		        ) ;

// shift character in
// output: list of valid input next literals
function any() { return new Any(arguments); }
function sequence() { return new Sequence(arguments); }
function optional() { return new Optional(arguments); }
*/

function getCloneOfObject(oldObject) {
    var tempClone = {};

    if (typeof(oldObject) == "object")
        for (prop in oldObject)
			if (oldObject[prop] === null) 
                tempClone[prop] = null;
            // for array use private method getCloneOfArray
            else if ((typeof(oldObject[prop]) == "object") &&
                            (oldObject[prop]).__isArray)
                tempClone[prop] = getCloneOfArray(oldObject[prop]);
            // for object make recursive call to getCloneOfObject
            else if (typeof(oldObject[prop]) == "object")
                tempClone[prop] = getCloneOfObject(oldObject[prop]);
            // normal (non-object type) members
            else
                tempClone[prop] = oldObject[prop];
    return tempClone;
}

//private method (to copy array of objects) - getCloneOfObject will use this internally
function getCloneOfArray(oldArray) {
    var tempClone = [];
    for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
        if (typeof(oldArray[arrIndex]) == "object")
            tempClone.push(getCloneOfObject(oldArray[arrIndex]));
        else
            tempClone.push(oldArray[arrIndex]);
    return tempClone;
}

function literal() { return new Literal(arguments[0]); }
function Literal(text) {
	this.text = text;
	console.log("this.text 0" + this.text);
	this.match = "";
	this.state = "empty";
	this.closed = false;
	this.num_pushed = 0;
}
Literal.prototype.push = function(c) {
	this.num_pushed++;
	if (c === this.text[this.match.length]) {
		this.match = this.match + c;
		this.state = "open";
	} else {
		this.state = "failed";
		this.closed = true;
	}
	console.log(this.match.length, this.text.length);
	if (this.match.length === this.text.length) {
		this.state = "matched";
		this.closed = true;
	}
}
Literal.prototype.completions = function() {
	if (this.state === "open" || this.state === "empty") {
		console.log("this.text " + this.text);
		return [this.text.slice(this.match.length)];
	} else {
		return [];
	}
}

function Any() {
	this.children = Array.prototype.slice.call(arguments);
	this.match = "";
	this.state = "empty";
	this.closed = false;
	this.num_pushed = 0;
	
	for (var i in this.children) {
		if ( this.children[i].num_pushed === this.num_pushed
		  || ( this.children[i].num_pushed === 0 
		    && this.open_children() === 0
			 )
		   ) {
			if (this.children[i].state === "matched") {
				this.state = "matched";
			}
		}
	}
}
Any.prototype.open_children = function () {
	var count = 0;
	for (var i in this.children) {
		console.log(this.children[i]);
		if (this.children[i].closed === false) {
			count++;
			console.log("open");
		} else {
			console.log("closed");
		}
	}
	console.log("num_children == " + this.children.length);
	console.log("open_children == " + count);
	return count;
}
Any.prototype.push = function(c) {
	this.num_pushed++;
	this.state = "open";
	
	var old_oc = this.open_children();
	for (var i in this.children) {
		if (!this.children[i].closed) {
			this.children[i].push(c);
		}
	}
	
	for (var i in this.children) {
		if ( this.children[i].num_pushed === this.num_pushed
		  || ( this.children[i].num_pushed === 0
		    && this.open_children() === 0
			 )
		   ) {
			if (this.children[i].state === "matched") {
				this.state = "matched";
			}
		}
	}

	/*
	this.closed = true;	
	this.open_children();
	for (var i in this.children) {
		console.log("closed? ", this.children[i].closed);
		if (!this.children[i].closed) {
			this.closed = false;
		}
	}
	*/
	if (this.open_children() === 0) {
		this.closed = true;
	}
	
	
	/*	<-- change this condition to allow open children which match

	if (this.open_children() === 0) {
		this.state = "failed";
		for (var i in this.children) {
			if ( this.children[i].state === "matched"
			  && this.children[i].num_pushed === this.num_pushed
			   ) {
				tvar parser = sequence()his.state = "matched";
			}
		}
		this.closed = true;
	}
	*/
}
Any.prototype.completions = function() {
	if (this.state === "open" || this.state === "empty" || this.state === "matched") {
		var arr = [];
		for (var i in this.children) {
			//console.log("child " + i + ": " + this.children[i].completions());
			if (this.children[i].closed) {
				continue;
			}
			var completions = this.children[i].completions();
			for (var j in completions) {
				arr.push(completions[j]);
			}
		}
		return arr;
	} else {
		return [];
	}
}

function Then(first, second) {
	this.first = first;
	this.second = second;
	this.match = "";
	this.state = "empty";
	this.closed = false;
	this.num_pushed = 0;
}
Then.prototype.push = function(c){
	this.num_pushed++;
	this.state = "open";
	
	if (!this.first.closed && !(this.first.state === "matched")) {
		this.first.push(c);
		if (this.first.state === "failed") {
			this.closed = true;
			this.state = "failed";
		}
	} else {
		if (!this.second.closed) {
			this.second.push(c);
			if (this.second.state === "failed") {
				this.closed = true;
				this.state = "failed";
			}
		} else {
			alert("big error")
		}
	}
	if (this.second.closed) {
		if (this.second.state === "matched") {
			this.state = "matched";
			this.closed = true;
		}
	}
	
}
Then.prototype.completions = function(){
	if (!this.first.closed && !(this.first.state === "matched")) {
		return this.first.completions();
	} else {
		return this.second.completions();
	}				
}

function GreedyThen(first, second) {
	this.first = first;
	this.second = second;
	this.match = "";
	this.state = "empty";
	this.closed = false;
	this.num_pushed = 0;
}
GreedyThen.prototype.push = function(c){
	this.num_pushed++;
	this.state = "open";
	
	if (!this.first.closed) {
		this.first.push(c);
		if (this.first.state === "failed") {
			this.closed = true;
			this.state = "failed";
		}
	} else {
		if (!this.second.closed) {
			this.second.push(c);
			if (this.second.state === "failed") {
				this.closed = true;
				this.state = "failed";
			}
		} else {
			alert("big error")
		}
	}
	if (this.second.closed) {
		if (this.second.state === "matched") {
			this.state = "matched";
			this.closed = true;
		}
	}
	
}
GreedyThen.prototype.completions = function(){
	if (!this.first.closed) {
		return this.first.completions();
	} else {
		return this.second.completions();
	}				
}

function sequence() {
  if (arguments.length < 1) {
    // error
    alert("error0");
  }
  var ars = Array.prototype.slice.call(arguments);
  console.log(ars);
  if (ars.length === 1) {
    //alert("debug1");
    return ars[0];
  }
  if (ars.length > 1) {
    //alert("debug2");
    var shift_ars = ars.slice(1);
	
    return new Any( new GreedyThen(ars[0], sequence.apply(null, shift_ars))
                  , new Then(ars[0], sequence.apply(null, shift_ars))
                  ) ;
  }
}

function Empty() {
	this.match = "";
	this.state = "matched";
	this.closed = true;
	this.num_pushed = 0;
}

function optional(arg) {
  return new Any(arg, new Empty());
}
