class Substation {
    constructor(node) {
        this.node = node
        this.x = node.pos.x
        this.y = node.pos.y
        this.powered = false
        this.destinations = []
        this.sources = []
        this.edgein = []
        this.edgeout = []
        this.voltage 
    }
    addIn (edge) {
        this.edgein.push(edge)
    }
    addOut (edge) {
        this.edgeout.push(edge)
    }
    addDest(dest) {
        this.destinations.push(dest)
    }
    addSrc(src) {
        this.sources.push(src)
    }
    async powerOn() {
        if (!this.powered) {
            this.powered = true
            this.edgeout.forEach(e=> e.powered = true)
            if (this.destinations.length!=0) {
                await sleep (250)
                this.destinations.forEach(d=>d.powerOn())
            }
        }
    }
    async powerOff(){
        if (this.powered) {
            this.powered = false
            this.edgeout.forEach(e=> e.powered = false)
            if (this.destinations.length!=0) {
                await sleep (250)
                this.destinations.forEach(d=>d.powerOff())
            }
        }
    }
    display() {
        noStroke()
        fill('lavendar')
        circle(this.x, this.y, 10)
    }



} 