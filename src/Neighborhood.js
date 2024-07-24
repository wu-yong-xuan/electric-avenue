class Neighborhood {
    constructor(mnw, trim, net) {
        this.blocks = []
        this.mnw = mnw
        this.trim = trim
        this.net = net
        this.pl = []
        this.plEdges = []
    }
    addBlock(block) {
        this.blocks.push(block)
    }

    //for all pow network obj, was originally for power lines hence the name but now repurposed to hold all
    //power network objects. 
    addPLine(pline) {
        this.pl.push(pline)
    }

    addPLineEdge(ple) {
        this.plEdges.push(ple)
        if (!(ple.start instanceof PowerGenerator)) {
            ple.findPath(this)
        }
    }
    rmPLine(pline) {
        let i = this.pl.indexOf(pline)
        if (i!= -1) {
            this.pl.splice(i,1)
        }
    }

    rmPLineEdge(ple) {
        let i = this.plEdges.indexOf(ple)
        if (i!= -1) {
            this.plEdges.splice(i,1)
        }
    }

    distributePower() {
        this.blocks.forEach(b=>b.distributePower(this.pl))
    }

    //implementation of dijkstras 
    //TODO: implment A*
    shortestPathMnw(start, stop) {
        let fringe = new MinPQ()
        let map = new Map()
        map.set(start, {prev: start, len:0})
        let visited = []
        fringe.push(start, 0);
         while (!fringe.isEmpty()) {
             let v = fringe.pop()
             if (v.item == stop) {
                let out = []
                let temp = stop
                out.splice(0, 0, temp);
                while (temp != start) {
                    temp = map.get(temp).prev
                    out.splice(0, 0, temp);
                }
                return out
            }
            visited.push(v.item);
            v.item.metaNeighbors.forEach(n => {
                 if (!visited.includes(n.node)) {
                     if (!map.has(n.node)) {
                        map.set(n.node, {prev:v.item, len:n.edge.length + v.priority})
                        fringe.push(n.node, n.edge.length + v.priority)
                     } else if (n.edge.length + v.priority < map.get(n.node).len) {
                        map.set(n.node, {prev:v.item, len:n.edge.length + v.priority})
                        fringe.push(n.node, n.edge.length + v.priority)
                     }
                 }
            })
        }
        return null
    }
    shortestPath(start, stop) {
        let fringe = new MinPQ()
        let map = new Map()
        map.set(start, {prev: start, len:0})
        let visited = []
        fringe.push(start, 0);
         while (!fringe.isEmpty()) {
             let v = fringe.pop()
             if (v.item == stop) {
                let out = []
                let temp = stop
                out.splice(0, 0, temp);
                while (temp != start) {
                    temp = map.get(temp).prev
                    out.splice(0, 0, temp);
                }
                return out
            }
            visited.push(v.item);
            v.item.neighbors.forEach(n => {
                 if (!visited.includes(n)) {
                    let dst = dist(n.pos.x,n.pos.y,v.item.pos.x,v.item.pos.y)
                     if (!map.has(n)) {
                        map.set(n, {prev:v.item, len:dst + v.priority})
                        fringe.push(n, dst + v.priority)
                     } else if (dst + v.priority < map.get(n).len) {
                        map.set(n, {prev:v.item, len:dst + v.priority})
                        fringe.push(n, dst + v.priority)
                     }
                 }
            })
        }
        return null
    }

    //path is a list of nodes from the metanetwork
    //each node has attribute metaneighbors
    displayMnwPath(path, color = 'purple') {
        let i = 0
        let off = 0
        path.forEach(n => {
            i++
            if (i<path.length) {
                let metaN = n.metaNeighbors.filter(mn => mn.node == path[i])[0]
                //metaN.edge.display('purple')       
                for (let j = 1; j < metaN.edge.verts.length; j++) {
                    metaN.edge.verts[j]
                    stroke(color)
                    strokeWeight(4)
                    line(metaN.edge.verts[j-1].pos.x, metaN.edge.verts[j-1].pos.y, metaN.edge.verts[j].pos.x, metaN.edge.verts[j].pos.y)
                }         
            }
            n.highlight()
        })
    }
    displayPath(path, color = 'purple', dash = [], offset = 0) {
        let off = 0
        stroke(color)
        strokeWeight(2)
        for (let i = 1; i < path.length; i++) {
            dashedLine(path[i].pos.x, path[i].pos.y, path[i-1].pos.x, path[i-1].pos.y, dash,off+offset)
            off += dist(path[i-1].pos.x, path[i-1].pos.y, path[i].pos.x, path[i].pos.y)
        }         
            
            
    }


    getBlockFromCoords(x,y, radius = 5) {
        let fringe = new MinPQ()
        this.blocks.forEach(block => {
            let dst = dist(x, y, block.center[0], block.center[1])
            if (dst <= radius) {
                fringe.push(block, dst)
            }
        })
        let out = fringe.pop()
        if (out == null) {return null}
        return out.item
    }
    getPLineFromCoords(x,y, radius = 5) {
        let fringe = new MinPQ()
        this.pl.forEach(p => {
            let dst = dist(x, y, p.x, p.y)
            if (dst <= radius) {
                fringe.push(p, dst)
            }
        })
        let out = fringe.pop()
        if (out == null) {return null}
        return out.item
    }
    getNodeFromCoords(x,y, radius = 5) {
        let block = this.getBlockFromCoords(x,y,radius)
        if (block == null) { return null    }
        let fringe = new MinPQ()
        block.nodes.forEach(n=>{
            let dst = dist(x, y, n.pos.x, n.pos.y)
            if (dst <= radius) {
                fringe.push(n, dst)
            }
        })
        let out = fringe.pop()
        if (out == null) {return null}
        return out.item
    }
    closestMetaNeighborFromNode(node, radius = 30) {
        let closestBlock = this.getBlockFromCoords(node.pos.x, node.pos.y, radius)
        let pqueue = new MinPQ()
        closestBlock.mnwNodes.forEach(n => pqueue.push(n, dist(n.pos.x,n.pos.y,node.pos.x, node.pos.y)))
        return pqueue.pop().item
    }

    getBlock(id) {
        return this.blocks[id]
    }

    getBlockID(block) {
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i] == block) {
                return i
            }
        }
        return null
    }

    display() {
        this.blocks.forEach(b => b.display())
    }

    drawPL() {
        this.pl.forEach(p=>p.display())
        this.plEdges.forEach(pe => pe.drawPath(this))
    }
}