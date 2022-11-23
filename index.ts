declare function jsx(str: TemplateStringsArray, ...values:any[]): HTMLElement;

const $ = document.querySelector.bind(document);

const
	HAND = jsx`<div id="hand">`,
	TABLE = jsx`<div id="table">${HAND}</div>`,

	CARDS = jsx`<div id="cards">`,
	OVERLAY = jsx`<div id="overlay">`,
	DISPLAYS = jsx`<div id="displays">${CARDS}${OVERLAY}</div>`,

	PLAY_AREA = jsx`<div id="play-area">${TABLE}${DISPLAYS}</div>`,
	
	ACE = "ace",
	JACK = "jack",
	QUEEN = "queen",
	KING = "king",

	SPADES = "spades",
	HEARTS = "hearts",
	CLUBS = "clubs",
	DIAMONDS = "diamonds";

type NumberValue =  "ace"|2|3|4|5|6|7|8|9|10;
type FaceValue = "jack"|"queen"|"king";
type Value = NumberValue|FaceValue;

type Suit = "spades"|"hearts"|"clubs"|"diamonds";

interface WeakCard {
	value: Value,
	suit: Suit
}

class Card {

	readonly value: Value;
	readonly suit: Suit;

	constructor({ value, suit }: WeakCard){
		this.value = value;
		this.suit = suit;
	}

	seq({value, suit}: Card): boolean;
	seq({value, suit}: WeakCard): boolean {
		return this.value == value && this.suit == suit;
	}

	eq({value}: Card): boolean;
	eq({value}: {value: Value}): boolean {
		return this.value == value
	}

	lt({value}: Card): boolean;
	lt({value}: {value: Value}): boolean {
		return typeof this.value == typeof value ? this.value != KING && this.value < value : value != ACE && this.value == ACE
	}

	gt({value}: Card): boolean;
	gt({value}: {value: Value}): boolean {
		return typeof this.value == typeof value ? this.value != ACE && this.value > value : value != KING && this.value == KING
	}
}

class Group {
	cards: Card[] = [];

	moveCardToGroup(c: Card, p: Group): void {
		p.add(this.remove(c))
	}

	remove(c: Card): Card {
		return this.cards.splice(this.findIndex(c), 1)[0]
	}

	add(c: Card | Group): void {
		if(c instanceof Group){
			this.cards.push(...c.cards)
		} else {
			this.cards.push(c)
		}
	}

	findIndex(c: Card): number {
		return this.cards.findIndex(e => e.seq(c))
	}

	contains(c: Card): boolean {
		return this.findIndex(c) > -1
	}

	shuffle(): void {
		let i = this.cards.length, j;
		if(i == 0) return;
		while(--i){
			j = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
		}
	}

	static from(arr: Card[]): Group {
		const p = new Group;
		p.cards = arr;
		return p
	}

	/*duplicate(): Group {
		return Group.from(this.cards.map(e => new Card(e)))
	}

	sort(): this {
		this.cards.sort((a, b) => a.gt(b) ? 1 : a.lt(b) ? -1 : 0)
		return this
	}*/

	*[Symbol.iterator](){
		yield* this.cards
	}
}

class Build extends Group {

	private capture: NumberValue;

	constructor(cards: Card[], capture: NumberValue){
		super()
		this.cards = cards;
		this.capture = capture;
	}

	static validate(stack: Card[], capture: NumberValue): boolean {
		if(stack.length == 1 || stack.some(({value: v}) => v == JACK || v == QUEEN || v == KING)) return false;
		stack.sort((a, b) => a.lt(b) ? 1 : a.gt(b) ? -1 : 0)
		if(capture == ACE)
			return stack.every(({value}) => value == ACE);
		let indicies = [0, 1];
		while(stack.length > 0){
			if(stack[0].value > capture || indicies[indicies.length - 1] >= stack.length){
				return false
			}
			if(stack[0].value == capture){
				stack.shift()
				continue
			}
			let sum = indicies.map(i => +stack[i].value || 1).reduce((a, b) => a + b, 0);
			if(sum > capture){
				indicies[indicies.length - 1]++
			} else if(sum < capture){
				indicies.push(indicies[indicies.length - 1] + 1)
			} else {
				for(let i of indicies.reverse()){
					stack.splice(i, 1)
				}
				indicies = [0, 1]
			}
		}
		return true
	}

	changeTag(p: Player, c: Card, t: NumberValue){
		if(Build.validate([c, ...this], t)){
			p.hand.moveCardToGroup(c, this)
		} else {
			throw "Cannot do that"
		}
	}

	mergeGroup(g: Group){
		if(!g.cards.some(({value: v}) => v == JACK || v == QUEEN || v == KING) && (this.capture == "ace" && g.cards.every(({value}) => value == ACE)) || g.cards.map(({value}) => value as number).reduce((a,b) => a+b, 0)){
			this.cards.push(...g.cards)
		}
	}
}

class Player {
	hand = new Group;
	pile = new Group;

};

enum MoveType {
	BURN,
	BUILD,
	CAPTURE
}
class Move {

	constructor(move: MoveType.BUILD, p: Player, c: Card, group1: Group, group2: Group);
	constructor(move: MoveType.CAPTURE, p: Player, c: Card, group: Group);
	constructor(move: MoveType.BURN, p: Player, c: Card);
	constructor(move: MoveType, p: Player, c: Card, group1?: Group, group2?: Group){
		
	}
}

class CardElement {
	private _scale!: number;

	readonly element: HTMLElement

	constructor({value, suit}: Card){
		this.element = jsx`<div class="card" value="${value}" suit="${suit}">`
		this.scale = 1;

		let onmousemove = (e: MouseEvent) => {
				e.preventDefault()
				this.x = Math.max(0, Math.min(e.x-this.width/2, CARDS.clientWidth-this.width));
				this.y = Math.max(0, Math.min(e.y-this.height/2, CARDS.clientHeight-this.height));
			},
			onmouseup = (e: MouseEvent) => {
				e.preventDefault()
				document.removeEventListener("mousemove", onmousemove)
				document.removeEventListener("mouseup", onmouseup)
				this.x = `${Math.max(0, Math.min((CARDS.clientWidth-this.width)/CARDS.clientWidth, (e.x-this.width/2)/CARDS.clientWidth)*100)}%`;
				this.y = `${Math.max(0, Math.min((CARDS.clientHeight-this.height)/CARDS.clientHeight, (e.y-this.height/2)/CARDS.clientHeight)*100)}%`;
				if(this.y > TABLE.clientHeight - 160){
					this.element.classList.add("glide")
					this.scale = 1.5;
					setTimeout(() => this.element.classList.remove("glide"), 300)
				} else {
					this.element.classList.add("glide")
					this.scale = 1;
					setTimeout(() => this.element.classList.remove("glide"), 300)
				}
			};

		this.element.addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault()
			document.addEventListener("mousemove", onmousemove)
			document.addEventListener("mouseup", onmouseup)
		})
	}

	set scale(val: number){
		/* w = 2.5*32; h = 3.5*32 */
		if(this._scale !== val){
			this._scale = val;
			let newWidth = val*80, newHeight = val*112;
			this.x = `${Math.max(0, Math.min((CARDS.clientWidth-newWidth)/CARDS.clientWidth, (this.x-newWidth/2)/CARDS.clientWidth)*100)}%`;
			this.y = `${Math.max(0, Math.min((CARDS.clientHeight-newHeight)/CARDS.clientHeight, (this.y-newHeight/2)/CARDS.clientHeight)*100)}%`;
		}
	}
	get scale(){
		return this._scale
	}

	set x(px: number | string){
		this.element.style.left = typeof px === "number" ? `${px}px` : px
	}
	get x(): number {
		return this.element.offsetLeft + this.element.clientWidth/2
	}
	set y(px: number | string){
		this.element.style.top = typeof px === "number" ? `${px}px` : px
	}
	get y(): number {
		return this.element.offsetTop + this.element.clientHeight/2
	}

	get width(){
		return this.element.clientWidth
	}
	set width(val: number){
		this.element.style.width = `${val}px`;
	}
	get height(){
		return this.element.clientHeight
	}
	set height(val: number){
		this.element.style.height = `${val}px`;
	}
}

const DECK = (DECK => {
	for(let s of [SPADES, HEARTS, CLUBS, DIAMONDS] as Suit[])
		for(let f of [ACE, 2, 3, 4, 5, 6, 7, 8, 9, 10, JACK, QUEEN, KING] as Value[])
			DECK.add(new Card({ value: f, suit: s }));
	return DECK;
})(new Group)

window.onload = () => {
	document.body.append(PLAY_AREA)
}