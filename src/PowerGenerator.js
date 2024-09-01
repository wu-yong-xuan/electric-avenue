class PowerGenerator {
    constructor(x, y, img, type) {
        this.x = x
        this.y = y
        this.active = true
        this.type = type
        this.critical = false //unused??
        this.powered = true
        this.capacity 
        this.output
        this.dest = []
        this.edgeout = []
        this.img = img
    }
    addOut(e) {
        this.edgeout.push(e)
    }
    addDest(d) {
        this.dest.push(d)
    }
    async powerOn() {
        if (!this.powered) {
            this.powered = true
            this.edgeout.forEach(e=> e.powered = true)
            if (this.dest.length!=0) {
                await sleep (250)
                this.dest.forEach(d=>d.powerOn())
            }
        }
    }
    async powerOff(){
        if (this.powered) {
            this.powered = false
            this.edgeout.forEach(e=> e.powered = false)
            if (this.dest.length!=0) {
                await sleep (250)
                this.dest.forEach(d=>d.powerOff())
            }
        }
    }
    display() { 
        if (!this.active) {this.powered = false}
        image(this.img, this.x-10.5,this.y-10.5, 21,21,0,0,this.img.width,this.img.height,'CONTAIN')
        //noStroke()
        //fill('purple')
        //circle(this.x, this.y, 20)
    }



} 