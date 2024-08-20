class ServiceTeam {
    constructor(){
        this.station 
        this.enroute = false
        this.x
        this.y
        this.breakTime = 3
        this.compliments = ['Donuts!','Good job!','Happy neighbors!','Nice work!','Quick fix!']
    }

    joinStation(station) {
        this.station = station
        this.img = station.crewImg
    }

    async dispatch(dest, neighborhood, sound, gs, node = this.station.node) { //dest is a Pline
        if (dest instanceof PowerGenerator) {return}
        this.enroute = true
        this.breakTime--
        let path = neighborhood.shortestPath(node, dest.node)
        for (let i = 1; i < path.length; i++) {
            for (let j = 0; j < 5; j++) {
                this.x = path[i-1].pos.x + j*(path[i].pos.x -path[i-1].pos.x) / 5
                this.y = path[i-1].pos.y + j*(path[i].pos.y -path[i-1].pos.y) / 5
                //this.display()
                await sleep(30)
            }
        } 
        await sleep(1000)
        if (sound != null) {sound.play()}
        dest.critical = false
        gs.info = 'Line up:'
        gs.desc = getRandom(this.compliments)
        if (dest.edgein.some(e => e.powered)) {
            dest.powerOn()
            neighborhood.distributePowerAnim()
        }

        if (this.station.queue.length > 0 && this.breakTime>0) {
            let args = this.station.queue.shift()
            this.dispatch(args[0], args[1], args[2],gs, dest.node)
            return
        }
        if (node!= this.station.node) {
            path = neighborhood.shortestPath(dest.node, this.station.node)
        } else {
            path = path.reverse()
        }
        for (let i = 1; i < path.length; i++) {
            for (let j = 0; j < 5; j++) {
                this.x = path[i-1].pos.x + j*(path[i].pos.x -path[i-1].pos.x) / 5
                this.y = path[i-1].pos.y + j*(path[i].pos.y -path[i-1].pos.y) / 5
                //this.display()
                await sleep(30)
            }
        } 
        // for (let i = 0; i < path.length; i++) {
        //     for (let j = 0; j < 5; j++) {
        //         this.x = path[i].pos.x + j*(-path[i].pos.x +path[i-1].pos.x) / 5
        //         this.y = path[i].pos.y + j*(-path[i].pos.y +path[i-1].pos.y) / 5
        //         //this.display()
        //         await sleep(30)
        //     }
        // } 
        this.enroute=false
        this.breakTime = 3
        if (this.station.queue.length > 0) {
            let args = this.station.queue.shift()
            this.dispatch(args[0], args[1], args[2], gs, dest.node)
            return
        }
        this.station.teamsReady++
    }

    display() {
        image(this.img, this.x-10.5,this.y-10.5,21,21,0,0,this.img.width,this.img.height,'CONTAIN')
        //noStroke()
        //fill('grey')
        //circle(this.x, this.y, 10)
    }
}