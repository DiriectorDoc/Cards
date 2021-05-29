const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),

      playTable = Object.assign($('<div class="play-table">')[0], {
          contextMenu: null,
          storedPiles: {},
          selectedCards: [],
          injectedStylesheet: Object.assign($("<style>")[0], {
              setRules: function(selector, rules){
                  let html = $(this).html();
                  if(html.match(new RegExp(escapeRegExp(selector) + " \\{.+\\}"))){

                  } else {
                      $(this).append(`${selector} {${$("<a>").css(rules).attr("style")}}`)
                  }
              }
          })
      }),
      
      SpecificError = class extends Error{};

function checkOptions(table, hand){
    /*
     * Legend:
     * 1-52 Card
         * 1    A♤
         * 2    2♤
         * 10   10♤
         * 11   J♤
         * 12   Q♤
         * 13   K♤
         * 14   A♥
         * 26   K♥
         * 27   A♧
         * 39   K♧
         * 40   A♦
         * 52   K♦
     * 91-3 `[` and `]` for determining start and stop of sub arrays
     * 101  The number 1
     * 102  The number 2
     * ...
     * 110  The number 10
     * 
     * Note:
     * Cards are modded (%) by 13.
     * As-Qs become 1-12 | Ks becomes 0
     */
    let playOptions = [];
    for(let i in hand){
        let cardArray = table.concat(hand[i]),
            buildOptions = [],
            handAfterPlay = [...hand]; handAfterPlay.splice(i, 1)
        /*
         * Added every card as a "pickup" option
         * Remove all face cards in the process
         */
        for(let i = 0; i < cardArray.length; i++){
            if(typeof cardArray[i] == "object"){
                buildOptions.push({building: cardArray[i][0] - 100, cards: cardArray[i].slice(1)})
                cardArray.splice(i--, 1)
                continue;
            }
            buildOptions.push({pickUp: cardArray[i]%13, card: cardArray[i]})
            if(cardArray[i]%13 > 10 || cardArray[i]%13 === 0){
                cardArray.splice(i--, 1)
            }
        }
    
        /*
         * All possible sums of 2 cards
         */
        for(let i = 0; i < cardArray.length - 1; i++)
            for(let j = 1 + i; j < cardArray.length; j++)
                if(cardArray[i]%13 + cardArray[j]%13 <= 10)
                    buildOptions.push({
                        building: cardArray[i]%13 + cardArray[j]%13,
                        cards: [cardArray[i], cardArray[j]]
                    });
        /*
         * All possible sums of 3 cards
         */
        for(let i = 0; i < cardArray.length - 2; i++)
            for(let j = 1 + i; j < cardArray.length - 1; j++)
                for(let k = 1 + j; k < cardArray.length; k++)
                    if(cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 <= 10)
                        buildOptions.push({
                            building: cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13,
                            cards: [cardArray[i], cardArray[j], cardArray[k]]
                        });
        /*
         * All possible sums of 4 cards
         * 4 is the maximum number of cards for all different card values
         * 5 cards or mor with all different cards would have a sum greter than 10
         */
        for(let i = 0; i < cardArray.length - 3; i++)
            for(let j = 1 + i; j < cardArray.length - 2; j++)
                for(let k = 1 + j; k < cardArray.length - 1; k++)
                    for(let l = 1 + k; l < cardArray.length; l++)
                        if(cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 <= 10)
                            buildOptions.push({
                                building: cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13,
                                cards: [cardArray[i], cardArray[j], cardArray[k], cardArray[l]]
                            });
        /*
         * All possible sums of 5 cards
         * Includes duplicate-valued cards
         */
        for(let i = 0; i < cardArray.length - 4; i++)
            for(let j = 1 + i; j < cardArray.length - 3; j++)
                for(let k = 1 + j; k < cardArray.length - 2; k++)
                    for(let l = 1 + k; l < cardArray.length - 1; l++)
                        for(let m = 1 + l; m < cardArray.length; m++)
                            if(cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 + cardArray[m]%13 <= 10)
                                buildOptions.push({
                                    building: cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 + cardArray[m]%13,
                                    cards: [cardArray[i], cardArray[j], cardArray[k], cardArray[l], cardArray[m]]
                                });
        /*
         * All possible sums of 6 cards
         * Includes duplicate-valued cards
         */
        for(let i = 0; i < cardArray.length - 5; i++)
            for(let j = 1 + i; j < cardArray.length - 4; j++)
                for(let k = 1 + j; k < cardArray.length - 3; k++)
                    for(let l = 1 + k; l < cardArray.length - 2; l++)
                        for(let m = 1 + l; m < cardArray.length - 1; m++)
                            for(let n = 1 + m; n < cardArray.length; n++)
                                if(cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 + cardArray[m]%13 + cardArray[n]%13 <= 10)
                                    buildOptions.push({
                                        building: cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 + cardArray[m]%13 + cardArray[n]%13,
                                        cards: [cardArray[i], cardArray[j], cardArray[k], cardArray[l], cardArray[m], cardArray[n]]
                                    });
        /*
         * All possible sums of 7 cards
         * Includes duplicate-valued cards
         */
        for(let i = 0; i < cardArray.length - 6; i++)
            for(let j = 1 + i; j < cardArray.length - 5; j++)
                for(let k = 1 + j; k < cardArray.length - 4; k++)
                    for(let l = 1 + k; l < cardArray.length - 3; l++)
                        for(let m = 1 + l; m < cardArray.length - 2; m++)
                            for(let n = 1 + m; n < cardArray.length - 1; n++)
                                for(let o = 1 + n; o < cardArray.length; o++)
                                    if(cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 + cardArray[m]%13 + cardArray[n]%13 + cardArray[o]%13 <= 10)
                                        buildOptions.push({
                                            building: cardArray[i]%13 + cardArray[j]%13 + cardArray[k]%13 + cardArray[l]%13 + cardArray[m]%13 + cardArray[n]%13 + cardArray[o]%13,
                                            cards: [cardArray[i], cardArray[j], cardArray[k], cardArray[l], cardArray[m], cardArray[n], cardArray[o]]
                                        });
    
        for(let j in handAfterPlay){
            for(let b of buildOptions){
                if(b.pickUp === handAfterPlay[j]%13 && b.card != hand[i]){
                    playOptions.push({collect: [b.card], with: handAfterPlay[j]})
                    continue
                }
                if(b.cards?.includes(hand[i]) && handAfterPlay.some(card => card%13 === b.building)){
                    playOptions.push({build: b.building, with: b.cards})
                    continue
                }
                if(b.building === handAfterPlay[j]%13){
                    playOptions.push({collect: b.cards, with: handAfterPlay[j]})
                    continue
                }
            }
        }
    }

    /*
     * All the options have been discovered
     * Now it's time to assess the cards in hand
     */

    /*for(let b of buildOptions){
        for(let h in hand){
            if(b.pickUp){
                if(b.pickUp === h){
                    playOptions.push({take: b.card, with: h})
                }
                continue;
            }
        }
    }*/
    return playOptions
}

class ContextMenu {

    #context;

    constructor(structure){
        if(!structure)
            throw new SpecificError("New instances of ContextMenu require a parameter.");
        this[0] = $('<div class="context-menu">')[0];
        this.length = 1;
        this.#context = structure.context;
        $(this)
            .append(`<div class="context-menu-header">${structure.header}</div>`)
            .css({
                top: structure.top,
                left: structure.left
            })
        for(let s of structure.sections){
            $(this).append("<hr />")
            let menu = $('<div class="context-menu-options"></div>'),
                self = this;
            for(let e of s.options){
                menu.append($(`<div class="option">${e.text}</div>`).click(function(){
                    e.callback(structure.context)
                    self.close()
                }))
            }
            $(this).append(menu)
        }
        $(this).appendTo(".overlay")
        this.#context.addClass("highlighted")
    }

    close(){
        $(this).remove()
        playTable.selectedCards = [];
        $(".highlighted").removeClass("highlighted")
        playTable.contextMenu = null
    }
}

class CardArray extends Array {

    constructor(){
        super(CardArray.arrayToCardArray(arguments))
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

    push(){
        super.push(CardArray.arrayToCardArray(arguments))
    }

    remove(card){
        card = new Card(card);
        for(let i in this)
            if(this[i].numID == card.numID)
                return this.splice(i, 1);
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

    get topCard(){
        return this[this.length - 1]
    }

    static arrayToCardArray(array){
        try {
            return [...(arguments.length > 1 ? arguments:array)].map(e => new Card(e))
        } catch(err){
            if(err instanceof SpecificError){
                throw new SpecificError("Illegal parameters")
            }
            throw err
        }
    }
}

class Deck extends CardArray {

    constructor(){
        super()
        for(let s of ["S", "H", "C", "D"])
            for(let f of ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"])
                this.push(new Card(f+s));
    }
}

class Pile extends CardArray {

    basePileID;

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
                playTable.storedPiles[this.basePileID = card.cardID] = this;
            }
            card.basePile = this.basePileID
        } else {
            console.error("Only objects of type Card can be added to Piles.")
        }
    }

    static assign(pile, arr){
        for(let e of arr){
            pile.add(e)
        }
    }

    build(value){
        return new BuildingPile(this, value)
    }
}

class BuildingPile extends Pile {
    constructor(arr, value){
        super(arr)
        this.building = value
    }

    /**
     * @param {number} value
     */
    set building(value){
        $(playTable.storedPiles[this.basePileID][0]).attr("building", value)
    }
    get building(){
        return $(playTable.storedPiles[this.basePileID][0]).attr("building")
    }
}

class Card extends Image {

    #faceValue;
    #suitName;
    #suitSymbol;
    #basePile;
    cardID;
    moved;
    numID;

    constructor(name = "AS", upright = 32){
        super()
        if(name instanceof Card){
            name = name.cardID
        } else if(typeof name == "number"){
            this.numID = name;
            name = ["K", "A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q"][name%13] + ["S", "H", "C", "D"][(name-1)/13|0]
        }
        let ID = name.match(/^([2-9KQJA]|10)([SHCD])$/);
        if(!ID)
            throw new SpecificError("Illegal card type");
        $(this).attr("card-id", this.cardID = name)
        this.upright = upright;
        this.classList.add("card")
        this.src = `art/${name}.svg`;
        let numValue, suitNum;
        [this.#faceValue, numValue] = (v => {
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
        [this.#suitSymbol, suitNum, this.#suitName] = (() => {
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
        this.numID ??= numValue + 13*suitNum;
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
    $(playTable).append(new CardArray(50, 11, 46, 41, 18, 1, 13, 17, 36, 31, 27, 20))
    $(".play-area").prepend(playTable)
    /*$(".hand").mouseenter(function(e){
        $(".card:active").appendTo(".hand")
    })
    .mouseout(function(e){
        $(".card:active").appendTo(playTable)
    })*/
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