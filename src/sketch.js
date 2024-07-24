// <reference path="../node_modules/@types/p5/global.d.ts" />

let mnw
let network
let trimmedGraph
let river
let shapes = []
let neighborhood 
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


function preload() {
  networkSettings = loadJSON("data/nws_decent.json")
}

function setup() {
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

  

  createCanvas(1280, 640, P2D)
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

  generateShapes()
  generatePlots()

  clipper = new ClipperLib.Clipper();
  gamestate = new GameState(neighborhood, colors)

}

function draw() {
  clear()

  if (frameCount % 600 == 0) {
    gamestate.timestep()
  }
  const mouse = createVector(mouseX, mouseY);
  const relativeMouse = mouse.copy().sub(offset); //?????
  
  background(gamestate.bg)
  translate(offset.x, offset.y);
  scale(scalef)
  river.display(gamestate.riverColor)
  neighborhood.display()
  network.display({ showNodes: false })
  

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
  neighborhood.drawPL()
  if (dragging && tool == 'select') {
    //draw()
    strokeWeight(3)
    stroke('black')
    line(selectedPL.x,selectedPL.y, (mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef);
  }
  drawUI()

  
  
  // networkRules[NextToIntersection].debugDraw()
  // network.stats()   
  
  //noLoop()
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
  neighborhood = new Neighborhood(mnw, trimmedGraph, network)

  if (networkSettings.hasRiver) {
    shapes = shapes.filter(s => !geometric.polygonIntersectsPolygon(s.polygon.verts, river.poly))
  }
  shapes.forEach(s => {
    neighborhood.addBlock(new Block(s))
  })
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
  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  if (selectedBlockID != undefined) {
    text(`Block ID: ${selectedBlockID}`, 300,24)
    text(`Center Coords: ${Math.round(selectedBlock.center[0])}, ${Math.round(selectedBlock.center[1])}`,400,24)
    text(`Occupied?: ${selectedBlock.occupied}`, 570,24)
    text(`Powered?: ${selectedBlock.powered}`,700,24)
  }
  text(`Resources: ${gamestate.resource}`,800,24)
  text(`Projected Cost: ${pCost}`,1000,24)
  if (tool == 'confirm-PL') {
    text('press ENTER to confirm or ESC to cancel', 600,48)
    text(`Remaining Resouces: ${gamestate.resource-pCost}`, 1000,48)
  }
}

function keyPressed() {
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
  if (tool == 'confirm-PL') {
    if (keyCode === ENTER) {
      neighborhood.distributePower()
      gamestate.buyPL(ple.len)
      tool = 'select'
      pCost = 0
    } else if (keyCode === ESCAPE) {
      neighborhood.rmPLine(pop)
      neighborhood.rmPLineEdge(ple)
      tool = 'select'
      pCost = 0
  }
} else if (key == 'r') {
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
    let pop = new Powerline(neighborhood.getNodeFromCoords(mouseX+offset.x,mouseY+offset.y,30))
    pop.powered = true
    neighborhood.addPLine(pop)
    neighborhood.distributePower()
    //draw()

  } else if (key == 'g') { //TEMPPPPPP
    let gen = new PowerGenerator((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef)
    neighborhood.addPLine(gen)

  } else if (key == 'a') {
    neighborhood.blocks.forEach(b=>b.occupied=true)
    //draw()
  }else if (key == '1') {
    tool = 'pan'
    //draw()
  }else if (key == '2') {
    tool = 'select'
    //draw()
  } else if (key == 'p') {
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
  }
}

function mouseClicked() {
  let block = neighborhood.getBlockFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
  if (block != null && tool == 'select') {
    selectedBlock = block
    selectedBlockID = neighborhood.getBlockID(block)
    drawUI()
  }
}
function mousePressed() {
  let pl = neighborhood.getPLineFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef, 30)
  if (pl != null) {
    selectedPL = pl
    dragging = true
  }
  
}
function mouseReleased() {
  if (dragging) {
    //draw()
    if (tool == 'select') {
      let n = neighborhood.getNodeFromCoords((mouseX - offset.x) / scalef, (mouseY - offset.y) / scalef ,50)
      if (n!=null) {
        let _add = true
        if (neighborhood.pl.some(p => {
          if (p.node == n) {
            pop = p
            _add = false
            return true 
          }
        })) {
          if (pop instanceof Substation) {
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
          pop.powered = selectedPL.powered
          if (_add) {neighborhood.addPLine(pop)}
          neighborhood.addPLineEdge(ple)
          pCost = gamestate.powerlineCost(ple.len)
          if (pCost > gamestate.resource) {
            pCost = String(pCost) + '\nTOO EXPENSIVE'
            neighborhood.rmPLine(pop)
            neighborhood.rmPLineEdge(ple)
          } else {
            tool = 'confirm-PL'
          }

      //draw()
       }
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



