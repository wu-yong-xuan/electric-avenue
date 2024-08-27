class GameState {
    constructor(n, c, s, r = 100000, cost = this.cost1, income = this.income2) {
        this.neighborhood = n
        this.season = 'fall'  
        this.colorScheme = c
        this.bg = c.get(this.season).bg
        this.riverColor = c.get(this.season).river
        this.resource = r
        this.costfn = cost
        this.incomefn = income
        this.step = 0
        this.activeArea = 0
        this.industrialArea = 0
        this.residentialArea = 0
        this.offlineArea = 0
        this.load = 0
        this.cyclesPerStep = 60
        this.startupTime = 30 * this.cyclesPerStep
        this.active = false
        this.numGens = 0
        this.next = 'winter'
        this.mm = 9
        this.yyyy = 1981
        this.date = '09/1981'
        this.income = 0
        this.cost = 0
        this.info = ''
        this.desc = ''
        this.pDownSounds = s
        this.failRandom = ['Pole Down', 'Overload', 'Fallen Tree']
        this.failHuman = ['Vandalism', 'Mylar Balloon']
    }

    startClock() {
        this.active = true
    }
    incrementDate() {
        this.mm++
        if (this.mm>12) {
            this.mm = 0
            this.yyyy++
        }
        this.date = this.mm.toString() + "/" + this.yyyy.toString()
        if (this.mm < 10) {
            this.date = "0" + this.date
        }
    }

    changeSeason(season) {
        this.season = season
        this.bg = this.colorScheme.get(this.season).bg
        this.riverColor = this.colorScheme.get(this.season).river
    }
    nextSeason(curr) {
        switch(curr) {
        case 'fall':
            this.changeSeason('winter')
            this.next = 'spring'
            break
        case 'winter':
            this.changeSeason('spring')
            this.next = 'summer'
            break
        case 'spring':
            this.changeSeason('summer')
            this.next = 'fall'
            break
        case 'summer':
            this.changeSeason('fall')
            this.next = 'winter'
            break
        }
    }
    cost1() {
        if (this.startupTime>0) {
            this.startupTime -= 1
        } else {
            this.cost = Math.round(250 * this.neighborhood.pl.length / this.cyclesPerStep) + Math.round((this.numGens-1) * 2000 / this.cyclesPerStep / 2) +  Math.round((this.neighborhood.stations.length-1) * 2000 / this.cyclesPerStep / 2)
            this.resource -= Math.round(250 * this.neighborhood.pl.length / this.cyclesPerStep) //load
            this.resource -= Math.round((this.numGens-1) * 2000 / this.cyclesPerStep / 2)
            this.resource -= Math.round((this.neighborhood.stations.length-1) * 2000 / this.cyclesPerStep / 2)
            if (this.neighborhood.stations.length == 0) {
                this.cost -= Math.round((this.neighborhood.stations.length-1) * 2000 / this.cyclesPerStep / 2) 
                this.resource+= Math.round((this.neighborhood.stations.length-1) * 2000 / this.cyclesPerStep / 2)
            }
        }
    }
    calcArea() {
        this.activeArea = 0
        this.offlineArea = 0
        this.industrialArea = 0
        this.residentialArea = 0
        this.neighborhood.blocks.forEach(b => {
            if (b.occupied && b.powered) {
                this.activeArea += b.area
                if (b.type == 'Industrial') {
                    this.industrialArea += b.area 
                } else {
                    this.residentialArea += b.area
                }
            } else if (!b.occupied) {
                this.offlineArea += b.area
            }
        })
        this.activeArea = Math.round(this.activeArea)
        this.offlineArea = Math.round(this.offlineArea)
    }
    income1() {
        this.resource += Math.round(this.activeArea/8/this.cyclesPerStep)
        this.income = Math.round(this.activeArea/8/this.cyclesPerStep) - this.cost
    }
    income2() {
        let num = Math.round(5*this.industrialArea * this.residentialArea /(this.industrialArea + this.residentialArea+1) /8 / this.cyclesPerStep)
        this.resource += num
        this.income = num //- this.cost
    }

    buyPL(length, pl) {
        this.resource -= this.powerlineCost(length)
        pl.active = true
    }

    addGen(x, y, img) {
        this.numGens++
        if (this.numGens > 1) {
            this.resource -= 4000
        }
        let gen = new PowerGenerator(x, y, img)
        this.neighborhood.addPLine(gen)
    }
    addStation(station) {
        this.resource-=3000
        this.neighborhood.addStation(station)
    }
    powerlineCost(length) {
        return Math.round(10000 + length*50)
    }   

    calculateLoad() {
        this.load = this.activeArea / this.numGens
        this.load *= 1.25
    }
    failure() {
        let r = Math.random()
        let idx = -1
        if (r < this.load / 1000000 / this.cyclesPerStep) {
            print(this.load, r)
            print(this.load/1000000)
            idx = neighborhood.randomFailure(getRandom(this.pDownSounds))
            this.desc = getRandom(this.failRandom)
        }
        if (r < this.offlineArea / 1000000 / this.cyclesPerStep) {
            print(this.load, r)
            print(this.load/1000000)
            idx = neighborhood.randomFailure(getRandom(this.pDownSounds))
            this.desc = getRandom(this.failHuman)
        }
        if (idx != -1) {
            this.info = "Line " + idx + ' Down:' 
            //this.desc = "Line Down"
        }
    }


    async timestep(iteratenet){
        if(this.active) {
            this.step++
            this.calcArea()
            this.calculateLoad()
            this.costfn()
            this.incomefn()
            this.failure()
            if (this.season=='summer' || this.season=='winter') {
                this.failure()
            }
            if (this.step % (20*this.cyclesPerStep)==0) {
                this.incrementDate()
            }
            if (this.step% (60*this.cyclesPerStep) == 0) {
                this.nextSeason(this.season)
                iteratenet()
            } else if (this.step% (60*this.cyclesPerStep) >= 40*this.cyclesPerStep) {
                let c1 = this.colorScheme.get(this.season)
                let c2 = this.colorScheme.get(this.next)
                this.bg = lerpColor(color(c1.bg), color(c2.bg), (this.step% (60*this.cyclesPerStep) - 40*this.cyclesPerStep) / (20*this.cyclesPerStep) )
                this.riverColor = lerpColor(color(c1.river), color(c2.river), (this.step% (60*this.cyclesPerStep) - 40*this.cyclesPerStep) / (20*this.cyclesPerStep ))
            }
            if (this.step % this.cyclesPerStep == 0) {
                this.neighborhood.blocks.forEach(b=> b.decay())
            }
        }
    }





} 
