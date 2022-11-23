"use strict";
const $ = document.querySelector.bind(document);
const HAND = jsx `<div id="hand">`, TABLE = jsx `<div id="table">${HAND}</div>`, CARDS = jsx `<div id="cards">`, OVERLAY = jsx `<div id="overlay">`, DISPLAYS = jsx `<div id="displays">${CARDS}${OVERLAY}</div>`, PLAY_AREA = jsx `<div id="play-area">${TABLE}${DISPLAYS}</div>`, ACE = "ace", JACK = "jack", QUEEN = "queen", KING = "king", SPADES = "spades", HEARTS = "hearts", CLUBS = "clubs", DIAMONDS = "diamonds";
class Card {
    constructor({ value, suit }) {
        this.value = value;
        this.suit = suit;
    }
    seq({ value, suit }) {
        return this.value == value && this.suit == suit;
    }
    eq({ value }) {
        return this.value == value;
    }
    lt({ value }) {
        return typeof this.value == typeof value ? this.value != KING && this.value < value : value != ACE && this.value == ACE;
    }
    gt({ value }) {
        return typeof this.value == typeof value ? this.value != ACE && this.value > value : value != KING && this.value == KING;
    }
}
class Group {
    constructor() {
        this.cards = [];
    }
    moveCardToPile(c, p) {
        p.add(this.remove(c));
    }
    remove(c) {
        return this.cards.splice(this.findIndex(c), 1)[0];
    }
    add(c) {
        if (c instanceof Group) {
            this.cards.push(...c.cards);
        }
        else {
            this.cards.push(c);
        }
    }
    findIndex(c) {
        return this.cards.findIndex(e => e.seq(c));
    }
    contains(c) {
        return this.findIndex(c) > -1;
    }
    shuffle() {
        let i = this.cards.length, j;
        if (i == 0)
            return;
        while (--i) {
            j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    static from(arr) {
        const p = new Group;
        p.cards = arr;
        return p;
    }
    duplicate() {
        return Group.from(this.cards.map(e => new Card(e)));
    }
    sort() {
        this.cards.sort((a, b) => a.gt(b) ? 1 : a.lt(b) ? -1 : 0);
        return this;
    }
    *[Symbol.iterator]() {
        yield* this.cards;
    }
}
class Building extends Group {
    constructor(cards, tag) {
        super();
        this.cards = cards;
        this.tag = tag;
    }
    validate() {
        const stack = [...this.duplicate()];
        if (stack.length == 1 || stack.some(({ value: v }) => v == JACK || v == QUEEN || v == KING))
            return false;
        stack.sort((a, b) => a.lt(b) ? 1 : a.gt(b) ? -1 : 0);
        if (this.tag == ACE) {
            return stack.every(c => c.value == ACE);
        }
        let indicies = [0, 1];
        while (stack.length > 0) {
            if (stack[0].value > this.tag || indicies[indicies.length - 1] >= stack.length) {
                return false;
            }
            if (stack[0].value == this.tag) {
                stack.shift();
                continue;
            }
            let sum = indicies.map(i => +stack[i].value || 1).reduce((a, b) => a + b, 0);
            if (sum > this.tag) {
                indicies[indicies.length - 1]++;
            }
            else if (sum < this.tag) {
                indicies.push(indicies[indicies.length - 1] + 1);
            }
            else {
                for (let i of indicies.reverse()) {
                    stack.splice(i, 1);
                }
                indicies = [0, 1];
            }
        }
        return true;
    }
}
var MoveType;
(function (MoveType) {
    MoveType[MoveType["BURN"] = 0] = "BURN";
    MoveType[MoveType["BUILD"] = 1] = "BUILD";
    MoveType[MoveType["COLLECT"] = 2] = "COLLECT";
})(MoveType || (MoveType = {}));
class Move {
}
class CardElement {
    constructor({ value, suit }) {
        this.element = jsx `<div class="card" value="${value}" suit="${suit}">`;
        this.scale = 1;
        let onmousemove = (e) => {
            e.preventDefault();
            this.x = Math.max(0, Math.min(e.x - this.width / 2, CARDS.clientWidth - this.width));
            this.y = Math.max(0, Math.min(e.y - this.height / 2, CARDS.clientHeight - this.height));
        }, onmouseup = (e) => {
            e.preventDefault();
            document.removeEventListener("mousemove", onmousemove);
            document.removeEventListener("mouseup", onmouseup);
            this.x = `${Math.max(0, Math.min((CARDS.clientWidth - this.width) / CARDS.clientWidth, (e.x - this.width / 2) / CARDS.clientWidth) * 100)}%`;
            this.y = `${Math.max(0, Math.min((CARDS.clientHeight - this.height) / CARDS.clientHeight, (e.y - this.height / 2) / CARDS.clientHeight) * 100)}%`;
            if (this.y > TABLE.clientHeight - 160) {
                this.element.classList.add("glide");
                this.scale = 1.5;
                setTimeout(() => this.element.classList.remove("glide"), 300);
            }
            else {
                this.element.classList.add("glide");
                this.scale = 1;
                setTimeout(() => this.element.classList.remove("glide"), 300);
            }
        };
        this.element.addEventListener("mousedown", (e) => {
            e.preventDefault();
            document.addEventListener("mousemove", onmousemove);
            document.addEventListener("mouseup", onmouseup);
        });
    }
    set scale(val) {
        /* w = 2.5*32; h = 3.5*32 */
        if (this._scale !== val) {
            this._scale = val;
            let newWidth = val * 80, newHeight = val * 112;
            this.x = `${Math.max(0, Math.min((CARDS.clientWidth - newWidth) / CARDS.clientWidth, (this.x - newWidth / 2) / CARDS.clientWidth) * 100)}%`;
            this.y = `${Math.max(0, Math.min((CARDS.clientHeight - newHeight) / CARDS.clientHeight, (this.y - newHeight / 2) / CARDS.clientHeight) * 100)}%`;
        }
    }
    get scale() {
        return this._scale;
    }
    set x(px) {
        this.element.style.left = typeof px === "number" ? `${px}px` : px;
    }
    get x() {
        return this.element.offsetLeft + this.element.clientWidth / 2;
    }
    set y(px) {
        this.element.style.top = typeof px === "number" ? `${px}px` : px;
    }
    get y() {
        return this.element.offsetTop + this.element.clientHeight / 2;
    }
    get width() {
        return this.element.clientWidth;
    }
    set width(val) {
        this.element.style.width = `${val}px`;
    }
    get height() {
        return this.element.clientHeight;
    }
    set height(val) {
        this.element.style.height = `${val}px`;
    }
}
const DECK = (DECK => {
    for (let s of [SPADES, HEARTS, CLUBS, DIAMONDS])
        for (let f of [ACE, 2, 3, 4, 5, 6, 7, 8, 9, 10, JACK, QUEEN, KING])
            DECK.add(new Card({ value: f, suit: s }));
    return DECK;
})(new Group);
window.onload = () => {
    document.body.append(PLAY_AREA);
};
