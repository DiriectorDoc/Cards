const piles = {};

class Pile extends Array {

    #base;

    constructor(arr){
        super()
        if(arr && arr instanceof Array){
            this.assign(arr)
        }
    }

    add(card){
        if(card instanceof Card){
            this.push(card)
            if(this.length == 1){
                piles[this.#base = card.ID] = this
            }
            card.inPile = this.#base
        } else {
            console.error("Only objects of type Card can be added to Piles.")
        }
    }

    assign(arr){
        for(let e of arr){
            this.add(e)
        }
    }
}

class Card extends Image {

    #value;
    #suit;
    #ID;

    constructor(name = "AS", upright = 32){
        if(!name.match(/^[2-9KQJA][SHCD]$/))
            throw new Error("Illegal card type");
        super()
        this.#ID = name;
        this.upright = upright;
        this.classList.add("card")
        this.src = `cardImg/${name}.svg`;
        this.#value = (v => {
            switch(v){
                case "A":
                    return "Ace"
                case "K":
                    return "King"
                case "Q":
                    return "Queen"
                case "J":
                    return "Jack"
                default:
                    return v
            }
        })(name[0]);
        this.#suit = (s => {
            switch(s){
                case "S":
                    return "Spades";
                case "H":
                    return "Hearts";
                case "C":
                    return "Clubs";
                case "D":
                    return "Diamonds"
            }
        })(name[1])
        this.onmousedown = function(e){
            let oldX = this.offsetLeft + this.width/2,
                oldY = this.offsetTop + this.height/2,
                self = this,
                $self = $(this),
                pileID = this.inPile,
                pile = piles[pileID];
            e = e || window.event;
            e.preventDefault();
            document.onmouseup = function(){
                document.onmouseup = document.onmousemove = null;
                if(pileID){
                    let L = pile.length;
                    $(`.card[pile=${pileID}]`).each(function(i){
                        $(this).css({
                            left: `calc(${(piles[pileID][L/2|0].offsetLeft - ((L+1)%2*7))*100 / $self.parent()[0].offsetWidth}% + ${7*(2*i + L%2 + (L + 1)%2 - L)}px)`, // [1]
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
                            left: self.offsetLeft - oldX + e.clientX + 7*(2*i + L%2 + (L + 1)%2 - L), // [1]
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

    /**
     * @param {string} ID
     */
    set inPile(ID){
        $(this).attr("pile", ID)
    }
    get inPile(){
        return $(this).attr("pile")
    }

    get suit(){
        return this.#suit
    }

    get value(){
        return this.#value
    }

    get ID(){
        return this.#ID
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
There's probably a more simble calculation for this. I needed the values to
go like this:

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
func(i, L) = 7*(2*i + L%2 + (L + 1)%2 - L
{i|0 < i < L, i ϵ ℤ}

I have considered alternatives, like setting the first offset to -7*i and
then putting each card 14px to the right of the last, but when dropped, I
wanted the centre of origin to be the middle of the three cards in the line.

*/