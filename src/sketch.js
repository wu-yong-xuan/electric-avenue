// <reference path="../node_modules/@types/p5/global.d.ts" />
IMGDIR = '../data/img/'
SNDDIR = '../data/sound/'
let mnw
let network
let trimmedGraph
let river
let shapes = []
let neighborhood 
let cityData = []
let plots = []
let qtPlots
let clipper
let pathfind = 0
let n1, n2
let selectedBlock
let selectedBlockID
let dragging = false
let selectedPL
let tool = "select"
let scalef = 1.
let offset
let colors
let gamestate
let pCost = 0
let pop 
let ple
let gameOver = false
let info = ''
let desc = ''
let pos = [0,0]
let confirmFn
let cancelFn
let confimg = null
let confx, confy 
let annoyingconf = false
let loading = 2
let progress

function preload() {
  networkSettings = loadJSON("data/nws_decent.json")
  
  font = loadFont('../font/D-DINExp.otf')
  logo = loadImage(IMGDIR + 'TITLE.svg')
  boldfont = loadFont('../font/D-DINExp-Bold.otf')
  board = loadImage(IMGDIR + 'BACKBOARD.svg')
  bolt = loadImage(IMGDIR + 'BOLT.svg')
  repair = loadImage(IMGDIR + 'REPAIR.svg')
  pan = loadImage(IMGDIR + 'PAN.svg')
  help = loadImage(IMGDIR + 'HELP.svg')
  hydro = loadImage(IMGDIR + 'HYDRO.svg')
  service = loadImage(IMGDIR + 'SERVICE TRUCK.svg')
  confirmimg = loadImage(IMGDIR + 'HELP.svg')
  cancelimg = loadImage(IMGDIR + 'HELP.svg')
  powerDownSounds = []
  for (let i = 1; i <=3; i++) {
    powerDownSounds.push(loadSound(SNDDIR + '0'+i+'.mp3'))
  }
  repairSound = loadSound(SNDDIR + 'REPAIR.mp3')
}

function setup() {
  textFont(font)
  colors = new Map()
  colors.set('fall', {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-fall-color'), 
      river: getComputedStyle(document.documentElement).getPropertyValue('--river-fall-color')
    })
  colors.set('winter', {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-winter-color'), 
      river: getComputedStyle(document.documentElement).getPropertyValue('--river-winter-color')
    })
  colors.set('spring', {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-spring-color'), 
      river: getComputedStyle(document.documentElement).getPropertyValue('--river-spring-color')
    })
  colors.set('summer', {
      bg: getComputedStyle(document.documentElement).getPropertyValue('--main-bg-summer-color'), 
      river: getComputedStyle(document.documentElement).getPropertyValue('--river-summer-color')
    })
  colors.set('block', {
      on: getComputedStyle(document.documentElement).getPropertyValue('--block-powered'), 
      off: getComputedStyle(document.documentElement).getPropertyValue('--block-unpowered'),
      unoccupied: getComputedStyle(document.documentElement).getPropertyValue('--block-unoccupied')
  })
  colors.set('road', {
    color: getComputedStyle(document.documentElement).getPropertyValue('--road-color'), 
    transmission: getComputedStyle(document.documentElement).getPropertyValue('--transmission-line-color'),
    station: getComputedStyle(document.documentElement).getPropertyValue('--transmission-station-color')
  })
  colors.set('substation', {
    stable: getComputedStyle(document.documentElement).getPropertyValue('--substation-stable-color'), 
    crit: getComputedStyle(document.documentElement).getPropertyValue('--substation-crit-color'),
    fail: getComputedStyle(document.documentElement).getPropertyValue('--substation-fail-color')
  })
  

  //createCanvas(1280, 640, P2D)
  createCanvas(windowWidth, windowHeight)
  offset = createVector(0, -200);
  window.addEventListener("wheel", e => {
    const s = 1 - (e.deltaY / 1000);
    scalef *= s;
    const mouse = createVector(mouseX, mouseY);
    offset
      .sub(mouse)
      .mult(s)
      .add(mouse)

  }); 
  width = 1024
  height = 1024
  river = new River(width, height)
  network = new Network(width, height)

  networkRules.initialize()
  nodeStatuses.initialize()
  responseCurves.initialize(width, height)

  // print(responseCurves)

  generateNetwork()
  let graph = { nodes: network.nodes, edges: network.edges }

  neighborhood = generateShapes()
  generatePlots()

  clipper = new ClipperLib.Clipper();
  gamestate = new GameState(neighborhood, colors, powerDownSounds)

  // DELETE THIS LATER
  neighborhood.blocks.forEach(b=>{b.occupied=true; b.timeUnpowered = 0})
}

function draw() {
  clear()
  if (loading == 2) {
    loadCity()
    return
  }else if (loading == 1) {
    background('Grey')
    stroke(0)
    strokeWeight(1)
    fill(0);
    textAlign(CENTER, CENTER)
    textSize(24);
    text(progress, windowWidth/2, windowHeight/2)
    return
  } 
  if (frameCount % 1 == 0) {
    gamestate.timestep(async function(){
      for (let _ = 0; _<5; _++) {
        network.iterate(); 
        await sleep(100)
      } 
      let tempneighborhood = cityData.shift()
      if (neighborhood == undefined) {
        neighborhood = tempneighborhood
      } else {
        neighborhood.iterate(tempneighborhood)
      }
    })
  }
  if (gamestate.resource < -20000) {
    gameover()
    return
  }
  const mouse = createVector(mouseX, mouseY);
  //const relativeMouse = mouse.copy().sub(offset); //?????
  
  background(gamestate.bg)
  translate(offset.x, offset.y);
  scale(scalef)
  river.display(gamestate.riverColor)
  neighborhood.display(gamestate.colorScheme.get('block').on, gamestate.colorScheme.get('block').off, gamestate.colorScheme.get('block').unoccupied)
  network.display({ showNodes: false }, gamestate.colorScheme.get('road').color)
  

  // mnw.display()
  // trimmedGraph.display()  
  
  //shapes.forEach(s => s.display())
  

  // connectOuterDeadEnds()

  //let points = network.nodes.map(n => n.asPoint())
  //let hull = geometric.polygonHull(points)
  //let p = new Polygon(hull)
  // p.display()

  // qtPlots.each(qt => qt.plot.display())

  if (networkSettings.showCurves) {
    responseCurves.display()
  }
  neighborhood.drawPL(gamestate.colorScheme.get('road').transmission)
  if (dragging) { 
    if  (tool == 'select'){
      //draw()
      strokeWeight(3)
      stroke('black')
      line(selectedPL.x,selectedPL.y, (mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef);
    } else if (tool == 'repair') {
      image(repair, ((mouseX - offset.x) / scalef)-10.5, ((mouseY - offset.y) / scalef)-10.5, 21, 21, 0, 0, repair.width, repair.height, 'CONTAIN')
    } else if (tool == 'build') {
      image(hydro, ((mouseX - offset.x) / scalef)-10.5, ((mouseY - offset.y) / scalef)-10.5, 21, 21, 0, 0, repair.width, repair.height, 'CONTAIN')
    }
  }
  drawUI()

  
  
  // networkRules[NextToIntersection].debugDraw()
  // network.stats()   
  
  //noLoop()
}

async function loadCity() {
  loading = 1
  for (let i = 0; i < 12; i++) {
    network.iterate();
    network.iterate();
    network.iterate();
    network.iterate();
    network.iterate();
    progress = "LOADING "+ (i+1) + '/12'
    await sleep(100)
    cityData.push(generateShapes())
  }
  loading = 0
  generateNetwork()
}

function connectOuterDeadEnds() {
  let ends = network.nodes.filter(n => {
    return n.status == ActiveEnd &&
      shapes.filter(s => geometric.pointInPolygon(n.asPoint(), s.polygon.verts)).length == 0
  })

  let x = ends.reduce((total, node) => total + node.pos.x, 0) / ends.length
  let y = ends.reduce((total, node) => total + node.pos.y, 0) / ends.length
  let avarage = new Node(createVector(x, y))
  // circle(avarage.pos.x, avarage.pos.y, 15, 15)
  let sorted = sortNodesClockwise(avarage, ends).neighbors.map(n => n.node)
  sorted.forEach((n, i) => {
    if (i > 0) {
      let prev = sorted[i - 1]
      stroke('purple')
      textSize(10)
      // text(i, n.pos.x, n.pos.y )
      line(n.pos.x, n.pos.y, prev.pos.x, prev.pos.y)
      // line(n.pos.x, n.pos.y, avarage.pos.x, avarage.pos.y)
    }
    if (i == 0) {
      let prev = sorted[sorted.length - 1]
      stroke('purple')
      textSize(10)
      // text(i, n.pos.x, n.pos.y )
      line(n.pos.x, n.pos.y, prev.pos.x, prev.pos.y)
    }
  })
}

function generatePlots() {
  let graph = { nodes: network.nodes, edges: network.edges }
  qtPlots = new Quadtree({
    width: this.width,
    height: this.height,
    maxElements: 100
  })

  graph.edges.forEach(edge => {
    // let edge = graph.edges[176]
    let pos = edge.getPointOn(.5)
    let angle = edge.getAngle()
    let p1 = new Plot(pos, angle, edge.length)
    let p2 = new Plot(pos, angle + radians(180), edge.length)
    p1.id = edge.id
    p2.id = edge.id
    qtPlots.push(p1.asQuadTreeObject())
    qtPlots.push(p2.asQuadTreeObject())
  })
}

function generateShapes() {
  trimmedGraph = []
  shapes = []
  let graph = { nodes: network.nodes, edges: network.edges }
  print("network graph | " , graph)
  let detect = "shape detection"
  console.time(detect)
  let result = detectClosedShapes(graph)
  console.timeEnd(detect)
  trimmedGraph = result.trimmedGraph
  mnw = result.metaNetwork
  shapes = result.shapes
  let tempneighborhood = new Neighborhood(mnw, trimmedGraph, network) 

  if (networkSettings.hasRiver) {
    shapes = shapes.filter(s => !geometric.polygonIntersectsPolygon(s.polygon.verts, river.poly))
  }
  shapes.forEach(s => {
    tempneighborhood.addBlock(new Block(s))
  })
  return tempneighborhood
}



function generateNetwork() {
  var ticks = ((new Date().getTime() * 10000) + 621355968000000000);
  let seed = networkSettings.hasRandomSeed ?
    random(1, ticks) : networkSettings.seed

  randomSeed(seed)
  console.log("generating seed: " + seed)

  if (networkSettings.hasRiver) {
    river.generate()
  }
  let gen = "network generation"
  console.time(gen)
  network.generate()
  console.timeEnd(gen)
}

function drawUI() {
  scale(1/scalef)
  translate(-offset.x, -offset.y);
  stroke(0)
  strokeWeight(0)
  textSize(12);
  textAlign(LEFT, CENTER);
  
  image(board, 46, 83)
  image(logo,61,23)//, 61 + logo.width/3, 43 + logo.height/3, 0, 0, logo.width, logo.height, 'CONTAIN')
  
  fill(0);
  textFont(boldfont)
  textAlign(RIGHT, CENTER)
  text('Date:', 176,170)
  text('Income: ', 176, 190 )
  text('Cost: ', 176, 210)
  text('Money: ', 176, 230)
  text(gamestate.info, 176, 250)
  fill(255)
  textAlign(LEFT,CENTER)
  text(gamestate.date, 184,170)
  if (gamestate.income < 0) {
    fill(colors.get('block').off)
    text(gamestate.income, 184, 190 )
    fill(255)
  } else {
    text('$'+gamestate.income, 184, 190 )
  }
  
  text('-$'+gamestate.cost, 184, 210)
  text('$'+gamestate.resource, 184, 230)
  text(gamestate.desc, 184, 250)
  textFont(font)

  image(bolt, 29, windowHeight-114, 84, 84, 0, 0, bolt.width, bolt.height, 'CONTAIN')
  image(repair, 112+29, windowHeight-114, 84, 84, 0, 0, repair.width, repair.height, 'CONTAIN')
  image(pan, 112*2 + 29, windowHeight-114, 84, 84, 0, 0, pan.width, pan.height, 'CONTAIN')
  image(help, 112*3 + 29, windowHeight-114, 84, 84, 0, 0, help.width, help.height, 'CONTAIN')

/*
  if (selectedBlockID != undefined) {
    text(`Block ID: ${selectedBlockID}`, 300,24)
    text(`Center Coords: ${Math.round(selectedBlock.center[0])}, ${Math.round(selectedBlock.center[1])}`,400,24)
    text(`Occupied?: ${selectedBlock.occupied}`, 570,24)
    text(`Powered?: ${selectedBlock.powered}`,700,24)
  }
  text(`Resources: ${gamestate.resource}`,800,24)
  text(`Projected Cost: ${pCost}`,1000,24)
  */
  if (tool == 'confirm' ) {
    confx = pos[0]*scalef +  offset.x
    confy =  pos[1] * scalef + offset.y
    if (confimg != null) {
      annoyingconf = true
      image(confimg, confx-10.5*scalef, confy-10.5*scalef, 21*scalef, 21*scalef, 0, 0, confimg.width, confimg.height, 'CONTAIN')
      image(confirmimg,  confx - 12.5 - 10.5, confy-10.5 + 4 + 21*scalef, 21, 21, 0, 0, confirmimg.width, confirmimg.height, 'CONTAIN')
      image(cancelimg,  confx  + 12.5 - 10.5, confy-10.5 + 4 + 21*scalef, 21, 21, 0, 0, cancelimg.width, cancelimg.height, 'CONTAIN')
    } else {
      annoyingconf = false
      image(confirmimg,  confx-10.5 - 12.5 , confy-10.5 + 25 , 21, 21, 0, 0, confirmimg.width, confirmimg.height, 'CONTAIN')
      image(cancelimg,  confx -10.5 + 12.5 , confy-10.5 + 25 , 21, 21, 0, 0, cancelimg.width, cancelimg.height, 'CONTAIN')
    }
   // text('press ENTER to confirm or ESC to cancel', 61,320)
   // text(`Remaining Resouces: ${gamestate.resource-pCost}`, 61,340)
    
  }

  /*
  // TEMPORARY
  text('Press G to place a generator (only 1)', 1000, 72)
  text('Press H to place a service station (only 1)', 1000, 96)
  text('Press 1 to switch to pan mode', 1000, 120)
  text('Press 2 to switch to build mode', 1000, 144)
  text('Press 3 to switch to repair mode', 1000, 168)
  text('Help', 1000, 192)
  stroke(1)
  strokeWeight(1)
  stroke(255)
  line(1000, 198, 1028, 198)
  */

}

function gameover() {
  clear()
  gameOver = true
  gamestate.active = false
  background('white')
  // scale(1/scalef)
  // translate(-offset.x, -offset.y);
  stroke(0)
  strokeWeight(1)
  fill('Grey');
  textSize(24);
  textAlign(LEFT, CENTER);
  text('GAME OVER - you went bankrupt', 600,96)
  text('reload the page to try again', 600,144)
  noLoop()
}

function keyPressed() {
  if (gameOver) {
    return
  }
  if (key == ' ') {
    network.iterate()
    loop()
  }
  if (key == 's') {
    saveJSON(networkSettings, "networkSettings.json")
  }
  if (key == 'q') {
    save('roads.svg')
  }
}

function keyReleased() {
  if (gameOver) {
    return
  }
  
  /*if (tool == 'confirm-PL') {
    if (keyCode === ENTER) {
      neighborhood.distributePowerAnim()
      gamestate.buyPL(ple.len, pop)
      if (pop.powered) {pop.powerOn()}
      tool = 'select'
      pCost = 0
    } else if (keyCode === ESCAPE) {
      if (pop.sources.length + pop.destinations.length <= 2) {neighborhood.rmPLine(pop)}
      neighborhood.rmPLineEdge(ple)
      tool = 'select'
      pCost = 0
  }
} else if (tool = 'confirm-Gen') {
  if (keyCode === ENTER) {
    gamestate.addGen(pos[0],pos[1],hydro)
    gamestate.startClock()
    tool = 'select'
    pCost = 0
  } else if (keyCode === ESCAPE) {
    tool = 'select'
    pCost = 0
}

} else if (tool = 'confirm-Rep') {
  if (keyCode === ENTER) {
    let station = new ServiceStation(n, repair, service)
        neighborhood.addStation(station)
        station.addCrew(new ServiceTeam())
    tool = 'select'
    pCost = 0
  } else if (keyCode === ESCAPE) {
    tool = 'select'
    pCost = 0
} 
}*/
/*else if (key == 'r') {
    generateNetwork()
    generateShapes()
    loop()
  } else if (key == 'i') {
    network.iterate()
    generateShapes()
    generatePlots()
    loop()
  } else if (key == 'e') {
    if (selectedBlock != null) {
      selectedBlock.powered = !selectedBlock.powered
      selectedBlock.display(showNodes=true)
      network.display({ showNodes: true })
      drawUI()
    }
   } else if (key == 'o') {
    if (selectedBlock != null) {
      selectedBlock.occupied = !selectedBlock.occupied
      selectedBlock.display(showNodes=true)
      network.display({ showNodes: true })
      drawUI()
    } 
  } else if (key == 'l') { //TEMPPPPPP
    let pop = new Powerline(neighborhood.getNodeFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef ,50))
    pop.powered = true
    neighborhood.addPLine(pop)
    neighborhood.distributePower()
    //draw()

  } else if (key == 'g') { //TEMPPPPPP
    if (deletethis > 0) {
      gamestate.addGen((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef)
      deletethis--
      gamestate.startClock()
    }

  } else if (key == 'h') { //TEMPPPPPP
    if (deletee>0) {
      let n = neighborhood.getNodeFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef ,50)
      if (n!= null) {
        let station = new ServiceStation(n)
        neighborhood.addStation(station)
        station.addCrew(new ServiceTeam())
        deletee--
      }
      
    }

  } else if (key == 'a') {
    neighborhood.blocks.forEach(b=>b.occupied=true)
    //draw()
  } else if (key == '1') {
    tool = 'pan'
    //draw()
  }else if (key == '2') {
    tool = 'select'
    //draw()
  }else if (key == '3') {
    tool = 'repair'
    //draw()
  }*/
     /*else if (key == 'p') {
    pathfind+= 1
    pathfind = pathfind % 3
    if (pathfind == 0) {
      //draw()
      neighborhood.displayMnwPath(neighborhood.shortestPathMnw(n1, n2))
    } else if (pathfind == 1) {
      n1 = neighborhood.getBlockFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
      if (n1 == null) {
        pathfind--
      } else {
        n1 = n1.mnwNodes[0]
        n1.highlight()
      }

    } else {
      n2 = neighborhood.getBlockFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
      if (n2 == null) {
        pathfind--
      } else {
        n2 = n2.mnwNodes[0]
        n2.highlight()
      }
    }
  } */
}

function mouseClicked() {
  if (gameOver) {
    return
  }
  if (tool == 'confirm') {
    if (annoyingconf == false) {
      if (dist(mouseX, mouseY, confx-12.5, confy+25) < 10.5) {
        confirmFn()
        confimg=null
      } else if (dist(mouseX, mouseY, confx+ 12.5, confy+25) < 10.5) {
        cancelFn()
        confimg=null
      }
    } else if (annoyingconf == true) {
      if (dist(mouseX, mouseY, confx - 12.5 , confy + 4 + 21*scalef) < 10.5) {
        confirmFn()
        confimg=null
      } else if (dist(mouseX, mouseY,confx + 12.5 , confy +4 + 21*scalef) < 10.5) {
        cancelFn()
        confimg=null
      }
    }
   }
  if (dist(mouseX, mouseY, 112*0+29+42, windowHeight-114+42) < 42) {
    tool = 'build'
  } else if (dist(mouseX, mouseY, 112*1+29+42, windowHeight-114+42) < 42) {
    tool = 'select'
  } else if (dist(mouseX, mouseY, 112*2+29+42, windowHeight-114+42) < 42) {
    tool = 'pan'
  } else if (dist(mouseX, mouseY, 112*3+29+42, windowHeight-114+42) < 42) {
    window.open("help.html");
  }
  let block = neighborhood.getBlockFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
  // if (block != null && tool == 'select') {
  //   selectedBlock = block
  //   selectedBlockID = neighborhood.getBlockID(block)
  //   drawUI()
  // }
  let pl = neighborhood.getPLineFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
  // if (pl != null && tool == 'repair') {
  //   neighborhood.stations[0].dispatchCrew(pl, neighborhood)
  // }
  // if (mouseY >= 192 && mouseY <= 200 && mouseX >= 1000 && mouseX <= 1030){ 
  //   //range accounting for text length
  //   window.open("https://docs.google.com/document/d/1f3yd-Af01pex1mGWwMqOJTgXaB0rzDGvLS7OhefFbFM/edit");
  // }
}
function mousePressed() {
  if (gameOver || tool == 'confirm') {
    return
  }
  let pl = neighborhood.getPLineFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
  if (pl != null) {
    selectedPL = pl
    dragging = true
  } else if ((dist(mouseX, mouseY, 112*1+29+42, windowHeight-114+42) < 42)) {
    dragging = true
    tool = 'repair'
  } else if ((dist(mouseX, mouseY, 112*0+29+42, windowHeight-114+42) < 42)) {
    dragging = true
    tool = 'build'
  }
}
function mouseReleased() {
  if (gameOver) {
    return
  }
  if (dragging) {
    //draw()
    if (tool == 'select' && !(selectedPL instanceof ServiceStation)) {
      let n = neighborhood.getNodeFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef ,50)
      if (n!=null) {
        let _add = true
        if (neighborhood.stations.some(s => 
          (dist(s.x,s.y,(mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef) < 10)
        )) { 
          dragging = false
          return
        }
        if (neighborhood.pl.some(p => {
          if (p.node == n) {
            pop = p
            _add = false
            return true 
          }
        })) {
          if (pop instanceof Substation || selectedPL instanceof PowerGenerator) {
            dragging = false  
            return
          }
        } else if (selectedPL instanceof PowerGenerator) {
          pop = new Substation(n)
        } else {
          pop = new Powerline(n)
        }
        ple = new PowerlineEdge(selectedPL,pop)
        if (ple.dst > 10) {
          if (_add) {
            neighborhood.addPLine(pop)
            pop.powered = selectedPL.powered
          }
          neighborhood.addPLineEdge(ple)
          pCost = gamestate.powerlineCost(ple.len)
          if (pCost > gamestate.resource) {
            //pCost = String(pCost) + '\nTOO EXPENSIVE'
            gamestate.info = 'insufficient funds'
            gamestate.desc = '$'+pCost
            if (_add) { 
              neighborhood.rmPLine(pop)
            }
            neighborhood.rmPLineEdge(ple)
          } else {
            confimg = null
            pos = [pop.x,pop.y]
            tool = 'confirm'
            confirmFn = function() { 
              neighborhood.distributePowerAnim()
              gamestate.buyPL(ple.len, pop)
              if (pop.powered) {pop.powerOn()}
              tool = 'select'
              pCost = 0
            }
            cancelFn = function() {
              if (pop.sources.length + pop.destinations.length <= 1) {neighborhood.rmPLine(pop)}
              neighborhood.rmPLineEdge(ple)
              tool = 'select'
              pCost = 0
          }
           
          }

      //draw()
       }
      } 
    } else if (tool == 'select' && (selectedPL instanceof ServiceStation)) {
        let plee = neighborhood.getPLineFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef ,20)
        if (plee != null) {
          selectedPL.dispatchCrew(plee, neighborhood, repairSound, gamestate)
        }
    } else if (tool == 'build') {
      if (gamestate.resource > 4000) {
        
        if (gamestate.numGens != 0) { pCost = 4000}
        pos = [(mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef]
        confimg = hydro
        confirmFn = function() {
          gamestate.addGen(pos[0],pos[1],hydro)
          gamestate.startClock()
          tool = 'select'
          pCost = 0
        } 
        cancelFn = function() {
          tool = 'select'
          pCost = 0
        }
        tool = 'confirm'
      } else {
        gamestate.info = ''
        tool = 'select'
        pCost = 0
        gamestate.desc = 'insufficient funds'
      }
    } else if (tool = 'repair') {
      if (gamestate.resource > 3000) { 
        let n = neighborhood.getNodeFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef ,50)
        if (n!= null) {
          pos = [n.pos.x, n.pos.y]
          confimg = repair
          tool = 'confirm'
          pCost=3000
        }
        confirmFn = function() { 
          let station = new ServiceStation(n, repair, service)
          gamestate.addStation(station)
          station.addCrew(new ServiceTeam())      
          tool = 'select'
          pCost = 0
        } 
        cancelFn = function() {
          tool = 'select'
          pCost = 0
        }
      } else {
        gamestate.info = ''
        gamestate.desc = 'insufficient funds'
        tool = 'select'
        pCost = 0
      }
    }
  }
  dragging = false
}
function mouseDragged() {
  if (tool == 'pan') {
    offset.x -= pmouseX - mouseX;
    offset.y -= pmouseY - mouseY;
    draw()
  }
//   if (dragging) {
//     draw()
//     strokeWeight(3)
//     stroke('black')
//     line(selectedPL.x,selectedPL.y, mouseX, mouseY);
//   }
 }
 function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

 



