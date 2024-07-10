// NOT SURE IF I WANT TO DO THIS OR JUST ADD IT TO THE NODE CLASS

class PowerlineEdge {
    constructor(start, end) {
        this.start = start
        this.end = end
        this.y = node.pos.y
        this.powered = false
    }


    display() {
        noStroke()
        fill('cornflowerblue')
        circle(this.x, this.y, 10)
    }



} 

//<style> @keyframes dash { to { stroke-dashoffset: -1000; } } #marching-ants { stroke-dasharray: 5; stroke-dashoffset: 0; animation: dash 1s linear infinite; } </style>