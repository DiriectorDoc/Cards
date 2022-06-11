declare function jsx(str: TemplateStringsArray, ...values:any[]): HTMLElement;

function $(selector: string){
	return document.querySelector(selector)
}

const
	TABLE = jsx`<div id="table">`,
	HAND = jsx`<div id="hand">`,
	OVERLAY = jsx`<div id="overlay">`,
	PLAY_AREA = jsx`<div id="play-area">${TABLE}${HAND}${OVERLAY}</div>`,
	
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
				this.x = e.x;
				this.y = e.y;
			},
			onmouseup = (e: MouseEvent) => {
				e.preventDefault()
				document.removeEventListener("mousemove", onmousemove)
				document.removeEventListener("mouseup", onmouseup)
				this.x = e.x;
				this.y = e.y;
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
			this.x = e.x;
			this.y = e.y;
			document.addEventListener("mousemove", onmousemove)
			document.addEventListener("mouseup", onmouseup)
		})
	}

	set scale(val: number){
		/* w = 2.5*32; h = 3.5*32 */
		if(this._scale !== val){
			this._scale = val;
			let newWidth = val*80, newHeight = val*112;
			this.element.style.left = `${Math.max(0, Math.min((OVERLAY.clientWidth-newWidth)/OVERLAY.clientWidth, (this.x-newWidth/2)/OVERLAY.clientWidth)*100)}%`;
			this.element.style.top = `${Math.max(0, Math.min((OVERLAY.clientHeight-newHeight)/OVERLAY.clientHeight, (this.y-newHeight/2)/OVERLAY.clientHeight)*100)}%`;
			this.element.style.width = `${this.width = newWidth}px`;
			this.element.style.height = `${this.height = newHeight}px`;
		}
	}
	get scale(){
		return this._scale
	}

	set x(px: number){
		this.element.style.left = `${Math.max(0, Math.min((OVERLAY.clientWidth-this.width)/OVERLAY.clientWidth, (px-this.width/2)/OVERLAY.clientWidth)*100)}%`
	}
	get x(){
		return this.element.offsetLeft + this.element.clientWidth/2
	}
	set y(px: number){
		this.element.style.top = `${Math.max(0, Math.min((OVERLAY.clientHeight-this.height)/OVERLAY.clientHeight, (px-this.height/2)/OVERLAY.clientHeight)*100)}%`
	}
	get y(){
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
	OVERLAY.append(c.element)
}