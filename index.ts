declare function jsx(str: TemplateStringsArray): HTMLElement;

function $(selector: string){
	return document.querySelector(selector)
}

const enum Value {
	ACE,
	JACK = 11,
	QUEEN = 12,
	KING = 13
}

const enum Suit {
	SPADES,
	HEARTS,
	CLUBS,
	DIAMONDS
}

class Card {

	private _value;
	private _suit;

	constructor(val: Value, suit: Suit){
		this._value = val;
		this._suit = suit;
	}
}

window.onload = () => {
	$("#overlay")!.append(jsx`<div class="card" value=2 suit="spades" style="height:112px;width:80px">`)
}