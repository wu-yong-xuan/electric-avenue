// NOT SURE IF I WANT TO DO THIS OR JUST ADD IT TO THE NODE CLASS

class Powerline {
    constructor(node) {
        this.node = node
        this.x = node.pos.x
        this.y = node.pos.y
        this.powered = false
    }


    display() {
        noStroke()
        fill('cornflowerblue')
        circle(this.x, this.y, 10)
    }



} 