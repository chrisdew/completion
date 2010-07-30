function literal(text) {
	return conthunktor(Literal, text);
}

function Literal(text) {
	this.text = text;
	this.match = "";
	this.state = EMPTY;
	this.closed = false;
	this.num_pushed = 0;
}

Literal.prototype.push = function(c) {
	this.num_pushed++;
	if (c === this.text[this.match.length]) {
		this.match = this.match + c;
		this.state = LIVE;
	} else {
		this.state = FAILED;
		this.closed = true;
	}
	console.log(this.match.length, this.text.length);
	if (this.match.length === this.text.length) {
		this.state = MATCHED;
		this.closed = true;
	}
}

Literal.prototype.completions = function() {
	if (this.state === LIVE || this.state === EMPTY) {
		return [this.text.slice(this.match.length)];
	} else {
		return [];
	}
}