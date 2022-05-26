"use strict";
function $(selector) {
    return document.querySelector(selector);
}
class Card {
    constructor(val, suit) {
        this._value = val;
        this._suit = suit;
    }
}
window.onload = () => {
    $("#overlay").append(jsx `<div class="card" value=2 suit="spades" style="height:112px;width:80px">`);
};
