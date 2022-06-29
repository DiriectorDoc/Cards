declare function jsx(str: TemplateStringsArray, ...values:any[]): HTMLElement;

function $(selector: string){
	return document.querySelector(selector)
}

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

type Value = "ace"|2|3|4|5|6|7|8|9|10|"jack"|"queen"|"king";
type Suit = "spades"|"hearts"|"clubs"|"diamonds";

class Card {

	private _value: Value;
	private _suit: Suit;
	private _scale!: number;

	readonly element: HTMLElement

	constructor(val: Value, suit: Suit){
		this._value = val;
		this._suit = suit;
		this.element = jsx`<div class="card" value="${this._value}" suit="${this._suit}">`
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

	get value(): Value {
		return this._value
	}
	set value(val: Value){
		(this.element.attributes as any).value.value = this._value = val
	}
	get suit(): Suit {
		return this._suit
	}
	set suit(suit: Suit){
		(this.element.attributes as any).suit.value = this._suit = suit
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

const c = new Card(ACE, SPADES);

window.onload = () => {
	document.body.append(PLAY_AREA)
	CARDS.append(c.element)
	//CARDS.append(new Card(2, SPADES).element)
}