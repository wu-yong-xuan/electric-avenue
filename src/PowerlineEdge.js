// NOT SURE IF I WANT TO DO THIS OR JUST ADD IT TO THE NODE CLASS

class PowerlineEdge {
    constructor(start, end) {
        this.start = start
        this.end = end
        this.dst = dist(start.x, start.y, end.x, end.y)
        this.powered = start.powered
        start.addDest(end)
        end.addSrc(start)
        start.addOut(this)
        end.addIn(this)
        this.path
        this.len = this.dst
    }

    powerOn(){
        this.powered = true
        this.end.powerOn()
    }
    powerOff() {
        this.powered = false
        this.end.powerOff()
    }
    display(on = 'gold', off = 'fuchsia') {
        if (this.powered) {
            stroke(on)
            strokeWeight(3)
            dashedLine(this.end.x, this.end.y, this.start.x, this.start.y, [7, 7],(frameCount/6)%14)
        } else {
            stroke(off)
            strokeWeight(3)
            dashedLine(this.end.x, this.end.y, this.start.x, this.start.y, [7, 7],0)
        }
    }
    findPath(neighborhood) {
        this.path = neighborhood.shortestPath(this.start.node, this.end.node)
        let temp = 0
        for (let i = 1; i < this.path.length; i++) {
            temp += dist(this.path[i].pos.x, this.path[i].pos.y, this.path[i-1].pos.x, this.path[i-1].pos.y)
        }  
        this.len = temp
    }
    drawPath(neighborhood, on = 'gold', off = 'fuchsia') {
        if (this.start instanceof PowerGenerator) {
            this.display()
        } else if (this.powered) {
            neighborhood.displayPath(this.path, on ,[7,7],(frameCount/6)%14)
        } else {
            neighborhood.displayPath(this.path,off,[7,7],0)
        }
    }
    



} 

//<style> @keyframes dash { to { stroke-dashoffset: -1000; } } #marching-ants { stroke-dasharray: 5; stroke-dashoffset: 0; animation: dash 1s linear infinite; } </style>