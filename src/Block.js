class Block {
    constructor(shape) {
        this.shape = shape
        this.poly = shape.polygon
        this.verts = this.poly.verts
        this.nodes = shape.nodes // nodes along perimeter
        this.edges = shape.edges // edges between perimeter nodes
        this.mnwEdges = shape.metaEdge
        this.mnwNodes = this.mnwEdges.map(e => e.start).flat()
        this.powered = false
        this.occupied = false
        this.center = geometric.polygonCentroid(this.verts)
        this.connectedPL = []
        this.area = geometric.polygonArea(this.verts)
        this.timeUnpowered = -1
        if (Math.random() < 0.35) {
            this.type = 'Industrial'
        } else {
            this.type = 'Residential'
        }
    }
    distributePower(powerlines, r = 3){ //input a list of powerlines
        let powah = powerlines.filter(p => p.powered == true && !(p instanceof Substation))
        let fringe = new MinPQ()
        let visited = []
        this.nodes.forEach(n=>fringe.push(n, 0))
        while (!fringe.isEmpty()) {
            let v = fringe.pop()
            if (v.priority == r) {continue}
            powah.forEach(p=> {
                if (p.node == v.item) {
                    this.occupied = true
                    this.powered = true
                    p.connectBlock(this)
                    this.connectedPL.push(p)
                }
            })
            visited.push(v.item);
            v.item.neighbors.forEach(n => {
                if (!visited.includes(n)) {
                    fringe.push(n, 1 + v.priority)
                }
            })
        }
    }
    async disconnectPL (pl) {
        let i = this.connectedPL.indexOf(pl)
        if (i!= -1) {
            this.connectedPL.splice(i,1)
            if (this.connectedPL.length == 0) {
                await sleep(Math.random()*1000)
                this.powered = false
                this.timeUnpowered = 0
            }
        }
    }
    async connectPL (pl) {
        this.connectedPL.push(pl)
        await sleep(Math.random()*1000)
        this.powered = true
        this.timeUnpowered = -1
    }
    decay() {
        if (this.powered == true) {
            this.timeUnpowered = -1
            return
        }
        if (this.timeUnpowered == -1 && this.powered == false == this.occupied == true) {
            this.timeUnpowered = 0
        }
        if (this.timeUnpowered == -1) {return}
        this.timeUnpowered++
        if (this.timeUnpowered >= 60) {
            this.occupied = false
            this.timeUnpowered = -1
        }
    }

    getClosestNode(x, y) {
        let closest = this.nodes[0]
        let min = dist(x,y,closest.pos.x,closest.pos.y)
        this.nodes.forEach(n=> {
            let dst = dist(x,y,n.pos.x,n.pos.y)
            if (dst < min) {
                min = dst
                closest = n
            }
        })
        return closest
    }

    display(res, ind, unoc) {
        //this.poly.display('#2d5425', false)
        if (this.type == 'Industrial') {
            if (this.occupied) {
                if (!this.powered) {
                    this.displayhelper(ind, true)
                } else {
                    this.displayhelper(ind, false)
                }
            } else {
                this.displayhelper(unoc, false)
            }
            return
        }
        if (this.occupied) {
            if (!this.powered) {
                this.displayhelper(res, true)
            } else {
                this.displayhelper(res, false)
            }
        } else {
            this.displayhelper(unoc, false)
        }
        // text(this.id, this.polygon.centerBB.x, this.polygon.centerBB.y)
    }


    displayhelper(col, ispattern) {
        if (ispattern) {
            patternAngle(PI/4)
            let colo = color(col)
            pattern(PTN.stripe(2))
            noStroke()
            beginShapePattern()
            // stroke('red')
            patternColors([colo, lerpColor(colo,color('black'),0.5)])
            this.verts.forEach(v => {
                vertexPattern(v[0], v[1])
            })
            endShapePattern()
        } else {
            noStroke()
            beginShape()
            // stroke('red')
            if (col != undefined) {
                fill(col)
            } else {
                fill(255, 228, 181, 128)
            }
            this.verts.forEach(v => {
                vertex(v[0], v[1])
            })
            endShape()
        }
    }


}