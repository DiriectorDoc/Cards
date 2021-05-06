const storedPiles = {};

class Deck extends Array {

    constructor(){
        super()
        for(let s of ["S", "H", "C", "D"])
            for(let f of ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"])
                this.push(new Card(f+s));
    }

    toStringArray(){
        let arr = [];
        for(let e of this)
            arr.push(e+"");
        return arr
    }

    shuffle(){
        let startingCardID = this[0].ID;
        this.push(this.shift())
        while(startingCardID != this[0].ID)
            this.splice(Math.random()*this.length|0, 0, this.shift());
        this.splice(Math.random()*this.length|0, 0, this.shift())
    }
}

class Pile extends Array {

    #base;

    constructor(arr){
        super()
        if(arr && arr instanceof Array){
            Pile.assign(this, arr)
        }
    }

    add(card){
        if(card instanceof Card){
            this.push(card)
            if(this.length == 1){
                storedPiles[this.#base = card.ID] = this
            }
            card.pileID = this.#base
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
    #ID;

    constructor(name = "AS", upright = 32){
        let ID = name.match(/^([2-9KQJA]|10)([SHCD])$/);
        if(!ID)
            throw new Error("Illegal card type");
        super()
        $(this).attr("card-id", this.#ID = name)
        this.upright = upright;
        this.classList.add("card")
        this.src = `art/${name}.svg`;
        this.#faceValue = (v => {
            switch(v){
                case "A":
                    this.#numValue = 1;
                    return "Ace"
                case "K":
                    this.#numValue = 13;
                    return "King"
                case "Q":
                    this.#numValue = 12;
                    return "Queen"
                case "J":
                    this.#numValue = 11;
                    return "Jack"
                default:
                    return this.#numValue = +v
            }
        })(ID[1]);
        this.#suitName = (s => {
            switch(s){
                case "S":
                    this.#suitNum = 0
                    this.#suitSymbol = "\u2664";
                    return "Spades";
                case "H":
                    this.#suitNum = 1
                    this.#suitSymbol = "\u2665";
                    return "Hearts";
                case "C":
                    this.#suitNum = 2
                    this.#suitSymbol = "\u2667";
                    return "Clubs";
                case "D":
                    this.#suitNum = 3
                    this.#suitSymbol = "\u2666";
                    return "Diamonds"
            }
        })(ID[2])
        this.onmousedown = function(e){
            let oldX = this.offsetLeft + this.width/2,
                oldY = this.offsetTop + this.height/2,
                self = this,
                $self = $(this),
                pileID = this.pileID,
                pile = storedPiles[pileID];
            e = e || window.event;
            e.preventDefault();
            document.onmouseup = function(){
                document.onmouseup = document.onmousemove = null;
                if(pileID){
                    let L = pile.length;
                    $(`.card[pile=${pileID}]`).each(function(i){
                        $(this).css({
                            left: `calc(${(storedPiles[pileID][L/2|0].offsetLeft - (L+1)%2*7)*100 / $self.parent()[0].offsetWidth}% + ${14*(i - (L-1)/2)}px)`, // [1]
                            top: self.offsetTop*100 / $self.parent()[0].offsetHeight + "%"
                        })
                    })
                } else {
                    $self.css({
                        left: self.offsetLeft*100 / $self.parent()[0].offsetWidth + "%",
                        top: self.offsetTop*100 / $self.parent()[0].offsetHeight + "%"
                    })
                }
            };
            document.onmousemove = function(e){
                e = e || window.event;
                e.preventDefault();
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
     * @param {string} ID
     */
    set pileID(ID){
        $(this).attr("pile", ID)
    }
    get pileID(){
        return $(this).attr("pile")
    }

    get suitName(){
        return this.#suitName
    }

    /*get faceValue(){
        return this.#faceValue
    }*/

    get numValue(){
        return this.#numValue
    }

    get ID(){
        return this.#ID
    }

    get suitNum(){
        return this.#suitNum
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

const table = [];

$(function(){
    $(document.body).append(new Pile([new Card("KH"), new Card("QH"), new Card("JH")]))
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