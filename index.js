"use strict";
function $(selector) {
    return document.querySelector(selector);
}
const TABLE = jsx `<div id="table">`, HAND = jsx `<div id="hand">`, OVERLAY = jsx `<div id="overlay">`, PLAY_AREA = jsx `<div id="play-area">${TABLE}${HAND}${OVERLAY}</div>`, ACE = "ace", JACK = "jack", QUEEN = "queen", KING = "king", SPADES = "spades", HEARTS = "hearts", CLUBS = "clubs", DIAMONDS = "diamonds";
class Card {
    constructor(val, suit) {
        this._value = val;
        this._suit = suit;
        this.element = jsx `<div class="card" value="${this._value}" suit="${this._suit}">`;
        this.scale = 1;
        let onmousemove = (e) => {
            e.preventDefault();
            this.x = e.x;
            this.y = e.y;
        }, onmouseup = (e) => {
            e.preventDefault();
            document.removeEventListener("mousemove", onmousemove);
            document.removeEventListener("mouseup", onmouseup);
            this.x = e.x;
            this.y = e.y;
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
            this.x = e.x;
            this.y = e.y;
            document.addEventListener("mousemove", onmousemove);
            document.addEventListener("mouseup", onmouseup);
        });
    }
    set scale(val) {
        /* w = 2.5*32; h = 3.5*32 */
        if (this._scale !== val) {
            this._scale = val;
            let newWidth = val * 80, newHeight = val * 112;
            this.element.style.left = `${Math.max(0, Math.min((OVERLAY.clientWidth - newWidth) / OVERLAY.clientWidth, (this.x - newWidth / 2) / OVERLAY.clientWidth) * 100)}%`;
            this.element.style.top = `${Math.max(0, Math.min((OVERLAY.clientHeight - newHeight) / OVERLAY.clientHeight, (this.y - newHeight / 2) / OVERLAY.clientHeight) * 100)}%`;
            this.element.style.width = `${this.width = newWidth}px`;
            this.element.style.height = `${this.height = newHeight}px`;
        }
    }
    get scale() {
        return this._scale;
    }
    set x(px) {
        this.element.style.left = `${Math.max(0, Math.min((OVERLAY.clientWidth - this.width) / OVERLAY.clientWidth, (px - this.width / 2) / OVERLAY.clientWidth) * 100)}%`;
    }
    get x() {
        return this.element.offsetLeft + this.element.clientWidth / 2;
    }
    set y(px) {
        this.element.style.top = `${Math.max(0, Math.min((OVERLAY.clientHeight - this.height) / OVERLAY.clientHeight, (px - this.height / 2) / OVERLAY.clientHeight) * 100)}%`;
    }
    get y() {
        return this.element.offsetTop + this.element.clientHeight / 2;
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this.element.attributes.value.value = this._value = val;
    }
    get suit() {
        return this._suit;
    }
    set suit(suit) {
        this.element.attributes.suit.value = this._suit = suit;
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
const c = new Card(ACE, SPADES);
window.onload = () => {
    document.body.append(PLAY_AREA);
    OVERLAY.append(c.element);
};
