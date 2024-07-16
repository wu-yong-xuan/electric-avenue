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
    }
    distributePower(powerlines, r = 3){ //input a list of powerlines
        let powah = powerlines.filter(p => p.powered == true)
        let fringe = new MinPQ()
        let visited = []
        this.nodes.forEach(n=>fringe.push(n, 0))
        while (!fringe.isEmpty()) {
            let v = fringe.pop()
            if (v.priority == r) {continue}
            powah.forEach(p=> {
                if (p.node == v.item) {
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
    disconnectPL (pl) {
        let i = this.connectedPL.indexOf(pl)
        if (i!= -1) {
            this.connectedPL.splice(i,1)
            if (this.connectedPL.length == 0) {
                this.powered = false
            }
        }
    }
    connectPL (pl) {
        this.connectedPL.push(pl)
        this.powered = true
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

    display() {
        this.poly.display('#2d5425', false)
        if (this.occupied) {
            if (!this.powered) {
                this.poly.display('rgba(255,0,0,0.4)', false)
            } else {
                this.poly.display('rgba(0,0,255,0.4)', false)
            }
        } else {
            this.poly.display('rgba(255,255,255,.3)', false)
        }
        // text(this.id, this.polygon.centerBB.x, this.polygon.centerBB.y)
    }



}