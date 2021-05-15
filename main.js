const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),

      playTable = $('<div class="play-table">')[0];
Object.assign(playTable, {
    contextMenu: null,
    storedPiles: {},
    selectedCards: [],
    injectedStylesheet: {
        ...$("<style>"),
    
        setRules: function(selector, rules){
            $(this).html($(this).html().replace(new RegExp(escapeRegExp(selector) + " \\{.+\\}"), `${selector} {${$("<a>").css(rules).attr("style")}}`))
        }
    }
})

class ContextMenu {

    #$obj;
    #context;

    constructor(structure){
        if(!structure)
            throw new Error("New instances of ContextMenu require a parameter.");
        this.#$obj = $('<div class="context-menu">')
        this.#context = structure.context;
        this.#$obj
            .append(`<div class="context-menu-header">${structure.header}</div>`)
            .css({
                top: structure.top,
                left: structure.left
            })
        for(let s of structure.sections){
            this.#$obj.append("<hr />")
            let menu = $('<div class="context-menu-options"></div>'),
                self = this;
            for(let e of s.options){
                menu.append($(`<div class="option">${e.text}</div>`).click(function(){
                    e.callback(structure.context)
                    self.close()
                }))
            }
            this.#$obj.append(menu)
        }
        this.#$obj.appendTo(".overlay")
        this.#context.addClass("highlighted")
    }

    close(){
        this.#$obj.remove()
        playTable.selectedCards = [];
        $(".highlighted").removeClass("highlighted")
        playTable.contextMenu = null
    }
}

class CardArray extends Array {

    constructor(){
        super(...[...arguments].map(function(e){
            if("string" == typeof e && e.match(/^([2-9KQJA]|10)([SHCD])$/))
                return new Card(e);
            if(e instanceof Card)
                return e;
            throw new Error("Only objects of type Card can be in a CardArray.")
        }))
    }

    toPile(){
        return new Pile(this)
    }

    sort(){
        // Quick Sort, adapted from [https://gist.github.com/tamask/1080446]
        for(let p, v, x, y, i = 2, l = 0, r = this.length - 1, s = [l, r]; i > 0;){
            r = s[--i];
            l = s[--i];
            if(l < r){
                // partition
                x = l;
                y = r - 1;
                p = l;
                v = this[p];
                this[p] = this[r];
                while(true){
                    while(x <= y && null != this[x] && this[x].numID < v.numID)
                        x++;
                    while(x <= y && null != this[y] && this[y].numID >= v.numID)
                        y--;
                    if(x > y)
                        break;
                    [this[x], this[y]] = [this[y], this[x]]
                }
                this[r] = this[x];
                this[x] = v;
                // end
                s[i++] = l;
                s[i++] = x - 1;
                s[i++] = x + 1;
                s[i++] = r
            }
        }
    }

    toStringArray(){
        let arr = [];
        for(let e of this)
            arr.push(e+"");
        return arr
    }

    get topCard(){
        return this[this.length - 1]
    }
}

class Deck extends CardArray {

    constructor(){
        super()
        for(let s of ["S", "H", "C", "D"])
            for(let f of ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"])
                this.push(new Card(f+s));
    }

    shuffle(){
        // Fisher–Yates shuffle
        for (let i = this.length - 1; i > 0; i--){
            let j = Math.random()*52|0;
            [this[i], this[j]] = [this[j], this[i]];
        }
        /*
        // My shuffle; more thorough, takes longer (6000 x longer on average)
        let startingCardID = this[0].ID;
        this.push(this.shift())
        while(startingCardID != this[0].ID)
            this.splice(Math.random()*this.length|0, 0, this.shift());
        this.splice(Math.random()*this.length|0, 0, this.shift())
        */
    }
}

class Pile extends CardArray {

    #basePileID;

    constructor(arr){
        super()
        if(arr && arr instanceof Array){
            Pile.assign(this, arr)
        }
    }

    add(card){
        if(card instanceof Card){
            if(this.topCard){
                $(card)
                    .css({
                        left: `calc(${this.topCard.style.left} + 14px)`,
                        top: this.topCard.style.top
                    })
                    .appendTo(".play-table")
            }
            this.push(card)
            if(this.length == 1){
                playTable.storedPiles[this.#basePileID = card.cardID] = this;
            }
            card.basePile = this.#basePileID
        } else {
            console.error("Only objects of type Card can be added to Piles.")
        }
    }

    static assign(pile, arr){
        for(let e of arr){
            pile.add(e)
        }
    }
}

class Card extends Image {

    #faceValue;
    #numValue;
    #suitName;
    #suitNum;
    #suitSymbol;
    #cardID;
    #basePile;
    moved;

    constructor(name = "AS", upright = 32){
        let ID = name.match(/^([2-9KQJA]|10)([SHCD])$/);
        if(!ID)
            throw new Error("Illegal card type");
        super()
        $(this).attr("card-id", this.#cardID = name)
        this.upright = upright;
        this.classList.add("card")
        this.src = `art/${name}.svg`;
        [this.#faceValue, this.#numValue] = (v => {
            switch(v){
                case "A":
                    return ["Ace", 1]
                case "K":
                    return ["King", 13]
                case "Q":
                    return ["Queen", 12]
                case "J":
                    return ["Jack", 11]
                default:
                    return [v, +v]
            }
        })(ID[1]);
        [this.#suitSymbol, this.#suitNum, this.#suitName] = (() => {
            switch(ID[2]){
                case "S":
                    return ["\u2664", 0, "Spades"];
                case "H":
                    return ["\u2665", 1, "Hearts"];
                case "C":
                    return ["\u2667", 2, "Clubs"];
                case "D":
                    return ["\u2666", 3, "Diamonds"]
            }
        })()
        this.onmouseover = function(e){
            e.preventDefault()
            $(this).addClass("hover")
        }
        this.onmouseout = function(e){
            e.preventDefault()
            $(this).removeClass("hover")
        }
        this.oncontextmenu = function(e){
            e.preventDefault()
            playTable.contextMenu?.close()
            playTable.contextMenu = new ContextMenu({
                header: this.#faceValue + " of " + this.#suitName,
                sections: [
                    {
                        options: [
                            {
                                text: "Do Something",
                                callback: function(context) {
                                    //doSomething(context)
                                }
                            },
                            {
                                text: "Do Something else",
                                callback: function(context) {
                                    //doSomething(context)
                                }
                            }
                        ]
                    }
                ],
                top: e.clientY,
                left: e.clientX,
                context: $(this)
            })
        }
        this.onmousedown = function(e){
            e.preventDefault()
            let oldX = this.offsetLeft + this.width/2,
                oldY = this.offsetTop + this.height/2,
                self = this,
                $self = $(this),
                pileID = this.pileID,
                pile = playTable.storedPiles[pileID];
            $self.removeClass("hover")
            document.onmouseup = function(e){
                e = e || window.event;
                e.preventDefault()
                document.onmouseup = document.onmousemove = null;
                $(".card").trigger("mouseout")
                $self.addClass("hover")
                if(pileID){
                    let L = pile.length;
                    $(`.card[pile=${pileID}]`).each(function(i){
                        $(this).css({
                            left: `calc(${(playTable.storedPiles[pileID][L/2|0].offsetLeft - (L+1)%2*7)*100 / document.body.offsetWidth}% + ${14*(i - (L-1)/2)}px)`, // [1]
                            top: self.offsetTop*100 / document.body.offsetHeight + "%"
                        })
                    })
                } else {
                    $self.css({
                        left: self.offsetLeft*100 / document.body.offsetWidth + "%",
                        top: self.offsetTop*100 / document.body.offsetHeight + "%"
                    })
                    let hoverCards = $(document.elementsFromPoint(e.clientX, e.clientY)).filter(".card").not(self),
                        pileCards = hoverCards.filter("[pile]");
                    if(pileCards.length){
                        pileCards[0].basePile.add(self)
                    } else if(hoverCards.length == 1){
                        $self
                            .css({
                                left: `calc(${hoverCards[0].style.left} + 14px)`,
                                top: hoverCards[0].style.top
                            })
                            .appendTo(".play-table")
                        new Pile([hoverCards[0], self])
                    }
                }
                if(!self.moved){
                    playTable.selectedCards.push(self)
                    $(self).addClass("highlighted")
                }
                self.moved = false
            };
            document.onmousemove = function(e){
                e.preventDefault()
                let hoverElements = $(document.elementsFromPoint(e.clientX, e.clientY)),
                    hoverCards = hoverElements.filter(".card"),
                    hand = hoverElements.filter(".hand");
                self.moved = true;
                if(pileID){
                    let L = pile.length;
                    $(`.card[pile=${pileID}]`).each(function(i){
                        $(this).css({
                            left: self.offsetLeft - oldX + e.clientX + 14*(i - (L-1)/2), // [1]
                            top: self.offsetTop - oldY + e.clientY
                        })
                    })
                } else {
                    $self.css({
                        left: self.offsetLeft - oldX + e.clientX,
                        top: self.offsetTop - oldY + e.clientY
                    })
                    if(hoverCards.length > 1){
                        hoverCards.addClass("hover")
                    } else {
                        $(".card").removeClass("hover")
                    }
                }
                oldX = self.offsetLeft + self.width/2;
                oldY = self.offsetTop + self.height/2;
            }
        }
    }

    /**
     * @param {number} factor
     */
    set upright(factor){
        this.width = 2.5 * factor;
        this.height = 3.5 * factor
    }

    get upright(){
        return this.width / 2.5
    }

    /**
     * @param {string} pileID
     */
    set basePile(pileID){
        $(this).attr("pile", pileID)
        this.#basePile = playTable.storedPiles[pileID]
    }
    get basePile(){
        return this.#basePile
    }

    get pileID(){
        return $(this).attr("pile")
    }

    get cardID(){
        return this.#cardID
    }

    get numID(){
        return this.#numValue + 13*this.#suitNum
    }

    toString(){
        return `[Card: ${(this.#faceValue[0] || this.#faceValue) + this.#suitSymbol}]`
    }
}

function noConsole(e){
    //(e.keyCode == 73 || e.keyCode == 123) && e.preventDefault()
    switch(e.keyCode){
        case 73:
        case 123:
            e.preventDefault()
    }
}


$(playTable)
    .click(function(e){
        e.preventDefault()
        if(!(e.target instanceof Card)){
            playTable.selectedCards = [];
            $(".highlighted").removeClass("highlighted")
        }
    })
    .on("mousedown", function(e){
        e.preventDefault()
        playTable.contextMenu?.close()
    })
    //.prepend('<img width="95" height="133" class="card-helper" />')

$(function(){
    $(playTable).append([new Card("KH"), new Card("QH"), new Card("JH")])
    $(playTable).append(new Pile([new Card("KS"), new Card("QS"), new Card("JS"), new Card("10S")]))
    $(".play-area").prepend(playTable)
    $(".hand").mouseenter(function(e){
        console.log($(".card:active").appendTo(".hand"))
    })
})


/*
---------Notes---------

------[1]------
I needed the values to go like this:

L1→           0
L2→        -7   7
L3→      -14  0   14
L4→    -21 -7   7   21
L5→  -28 -14  0  14   28

      ↑   ↑   ↑   ↑    ↑
      i0  i1  i2  i3   i4

Where L is the length of the Pile class and I is the card index.
(i0 starts at the leftmost value of each row)

I ended up with this:
func(i, L) = 14*(i - (L-1)/2)
{i|0 < i < L, i ϵ ℤ}

I have considered alternatives, like setting the first offset to -7*i and
then putting each card 14px to the right of the last, but when dropped, I
wanted the centre of origin to be the middle of the three cards in the line.

*/