class Card extends Image {

    #value;
    #suit;

    constructor(name = "AS", upright = 32){
        super()
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
            let oldX,
                oldY,
                self = this;
            e = e || window.event;
            e.preventDefault();
            oldX = self.offsetLeft + self.width/2;
            oldY = self.offsetTop + self.height/2;
            document.onmouseup = function(){
                document.onmouseup = document.onmousemove = null;
            };
            document.onmousemove = function(e){
                e = e || window.event;
                e.preventDefault();
                $(self).css({
                    left: self.offsetLeft - oldX + e.clientX,
                    top: self.offsetTop - oldY + e.clientY
                })
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

    get suit(){
        return this.#suit
    }

    get value(){
        return this.#value
    }
}

$(function(){
    let card = new Card();
    $(document.body).append(card)
})