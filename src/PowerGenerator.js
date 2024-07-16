class PowerGenerator {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.powered = true
        this.capacity 
        this.output
        this.dest = []
        this.edgeout = []
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
        noStroke()
        fill('purple')
        circle(this.x, this.y, 20)
    }



} 