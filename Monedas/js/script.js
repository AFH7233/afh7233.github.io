class Coin{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    collide(other){
        let xDiff = (this.x-other.x) ;
        let yDiff = (this.y-other.y) ;
        let distance = Math.sqrt(xDiff*xDiff + yDiff * yDiff);

        if(distance < 20){
            return true;
        }
        return false;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2, true); 
        ctx.stroke();
    }
}

class QuadTree{
    constructor(x,y,size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.children = [];
        this.coins = [];
        this.isLeaf = true;
        this.isRoot = false;
    }

    addCoin(coin){
        let left = this.x - (this.size/2) - 10;
        let right = this.x + (this.size/2) + 10;
        let up = this.y - (this.size/2) - 10;
        let down = this.y + (this.size/2) + 10;
        if((left < coin.x && coin.x < right && up < coin.y && coin.y < down)){
            if( this.isLeaf){
                this.coins.push(coin);
                if(this.size > 80 && this.coins.length > 3){
                    this.createChildren();
                    for(let i=0; i < this.coins.length; i++){
                        let element = this.coins[i];
                        for(let j=0; j < this.children.length; j++){
                            let child = this.children[j];
                            child.addCoin(element);
                        }  
                    }
                    this.coins = [];
                }                
            } else {
                for(let i=0; i < this.children.length; i++){
                    let child = this.children[i];
                    child.addCoin(coin);
                }                
            }
        }
    }

    collide(coin){
        let left = this.x - (this.size/2) - 10;
        let right = this.x + (this.size/2) + 10;
        let up = this.y - (this.size/2) - 10;
        let down = this.y + (this.size/2) + 10;
        if((left < coin.x && coin.x < right && up < coin.y && coin.y < down)){
            if( this.isLeaf){
                for(let i=0; i < this.coins.length; i++){
                    let other = this.coins[i];
                    if(other.collide(coin)){
                        return true;
                    }
                }
                return false;
            } else {
                let collide = false;
                for(let i=0; i < this.children.length; i++){
                    let child = this.children[i];
                    collide |= child.collide(coin);
                }                
                return collide;
            }
        } else {
            return false;
        }

    }

    createChildren(){
        this.isLeaf = false;
        this.children[0] = new QuadTree(this.x-this.size/4.0,this.y-this.size/4.0,this.size/2.0);
        this.children[1] = new QuadTree(this.x+this.size/4.0,this.y-this.size/4.0,this.size/2.0);
        this.children[2] = new QuadTree(this.x-this.size/4.0,this.y+this.size/4.0,this.size/2.0);
        this.children[3] = new QuadTree(this.x+this.size/4.0,this.y+this.size/4.0,this.size/2.0);
    }

    draw(ctx){
        let left = this.x - this.size/2;
        let right = this.x + this.size/2;
        let up = this.y - this.size/2;
        let down = this.y + this.size/2;
        ctx.strokeRect(left, up, this.size, this.size);
        if(!this.isLeaf){
            for(let i=0; i < this.children.length; i++){
                let child = this.children[i];
                child.draw(ctx);
            }   
        }

    }


}


function main(){
    let canvas;
    let ctx;
    let coinList = [];
    canvas = document.getElementById('lienzo');
    ctx = canvas.getContext('2d');
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.strokeRect(0, 0, window.innerHeight, window.innerHeight);
    let tree = new QuadTree(window.innerHeight/2,window.innerHeight/2,window.innerHeight);

    canvas.addEventListener('click', function(event){
        addCoinTree(event, ctx, tree);
    })

}

function addCoin(event, ctx, coinList){
    let x = event.offsetX;
    let y = event.offsetY;
    let coin = new Coin(x,y);
    for(let i=0; i < coinList.length; i++){
        let other = coinList[i];
        if(other.collide(coin)){
            return;
        }
    }
    coinList.push(coin);
    coin.draw(ctx);
    
}

function addCoinTree(event, ctx, tree){
    let x = event.offsetX;
    let y = event.offsetY;

    let coin = new Coin(x,y);
    if(isInsideSquare(tree.size, coin) && !tree.collide(coin)){
        tree.addCoin(coin);
        coin.draw(ctx);
        tree.draw(ctx);
    }

}

function isInsideSquare(size, coin){
    let left = 0 + 10;
    let right = size - 10;
    let up = 0 + 10;
    let down = size - 10;   
    return (left < coin.x && coin.x < right && up < coin.y && coin.y < down);
}