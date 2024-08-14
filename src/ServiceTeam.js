class ServiceTeam {
    constructor(){
        this.station 
        this.enroute = false
        this.x
        this.y
    }

    joinStation(station) {
        this.station = station
        this.img = station.crewImg
    }

    async dispatch(dest, neighborhood) { //dest is a Pline
        if (dest instanceof PowerGenerator) {return}
        this.enroute = true
        let path = neighborhood.shortestPath(this.station.node, dest.node)
        for (let i = 1; i < path.length; i++) {
            for (let j = 0; j < 5; j++) {
                this.x = path[i-1].pos.x + j*(path[i].pos.x -path[i-1].pos.x) / 5
                this.y = path[i-1].pos.y + j*(path[i].pos.y -path[i-1].pos.y) / 5
                //this.display()
                await sleep(30)
            }
        } 
        await sleep(1000)
        dest.critical = false
        if (dest.edgein.some(e => e.powered)) {
            dest.powerOn()
            neighborhood.distributePowerAnim()
        }
        for (let i = path.length-1; i > 1; i--) {
            for (let j = 0; j < 5; j++) {
                this.x = path[i].pos.x + j*(-path[i].pos.x +path[i-1].pos.x) / 5
                this.y = path[i].pos.y + j*(-path[i].pos.y +path[i-1].pos.y) / 5
                //this.display()
                await sleep(30)
            }
        } 
        this.enroute=false
    }

    display() {
        image(this.img, this.x-10.5,this.y-10.5,21,21,0,0,this.img.width,this.img.height,'CONTAIN')
        //noStroke()
        //fill('grey')
        //circle(this.x, this.y, 10)
    }
}