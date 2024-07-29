// NOT SURE IF I WANT TO DO THIS OR JUST ADD IT TO THE NODE CLASS

class Powerline {
    constructor(node) {
        this.node = node
        this.x = node.pos.x
        this.y = node.pos.y
        this.powered = false
        this.destinations = []
        this.sources = []
        this.edgein = []
        this.edgeout = []
        this.connectedBlocks = []
        this.critical = false
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
    connectBlock(block) {
        this.connectedBlocks.push(block)
    }
    async powerOn() {
        if (!this.powered && !this.critical) {
            this.powered = true
            this.connectedBlocks.forEach(b => b.connectPL(this))
            this.edgeout.forEach(e=> e.powered = true)
            if (this.destinations.length!=0) {
                await sleep (250)
                this.destinations.forEach(d=>d.powerOn())
            }
        }
    }
    async powerOff(){
        if (this.powered && (!this.edgein.some(e=>e.powered) || this.critical)) {
            this.powered = false
            this.connectedBlocks.forEach(b => b.disconnectPL(this))
            this.edgeout.forEach(e=> e.powered = false)
            if (this.destinations.length!=0) {
                await sleep (250)
                this.destinations.forEach(d=>d.powerOff())
            }
        }
    }
    display() {
        noStroke()
        if (!this.critical) {
            fill('cornflowerblue')
        } else {
            fill('red')
        }
        circle(this.x, this.y, 10)
    }



} 