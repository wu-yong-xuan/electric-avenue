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


function preload() {
  networkSettings = loadJSON("data/nws_decent.json")
}

function setup() {
  createCanvas(1024, 1024, P2D)
  width = 1024

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

}

function draw() {
  clear()
  background('#2d5425')
  river.display()
  neighborhood.display()
  network.display({ showNodes: true })

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
  if (dragging) {
    //draw()
    strokeWeight(3)
    stroke('black')
    line(selectedPL.x,selectedPL.y, mouseX, mouseY);
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
  if (key == 'r') {
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
    let pop = new Powerline(neighborhood.getNodeFromCoords(mouseX,mouseY,30))
    pop.powered = true
    neighborhood.addPLine(pop)
    neighborhood.distributePower()
    //draw()

  } else if (key == 'g') { //TEMPPPPPP
    let gen = new PowerGenerator(mouseX, mouseY)
    neighborhood.addPLine(gen)

  } else if (key == 'a') {
    neighborhood.blocks.forEach(b=>b.occupied=true)
    //draw()
  } else if (key == 'p') {
    pathfind+= 1
    pathfind = pathfind % 3
    if (pathfind == 0) {
      //draw()
      neighborhood.displayPath(neighborhood.shortestPath(n1, n2))
    } else if (pathfind == 1) {
      n1 = neighborhood.getBlockFromCoords(mouseX, mouseY, 30)
      if (n1 == null) {
        pathfind--
      } else {
        n1 = n1.mnwNodes[0]
        n1.highlight()
      }

    } else {
      n2 = neighborhood.getBlockFromCoords(mouseX, mouseY, 30)
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
  let block = neighborhood.getBlockFromCoords(mouseX, mouseY, 30)
  if (block != null) {
    selectedBlock = block
    selectedBlockID = neighborhood.getBlockID(block)
    drawUI()
  }
}
function mousePressed() {
  let pl = neighborhood.getPLineFromCoords(mouseX, mouseY, 30)
  if (pl != null) {
    selectedPL = pl
    dragging = true
  }
}
function mouseReleased() {
  if (dragging) {
    //draw()
    let n = neighborhood.getNodeFromCoords(mouseX,mouseY,30)
    if (n!=null) {
      let pop = new Powerline(n)
      let ple = new PowerlineEdge(selectedPL,pop)
      if (ple.dst > 10) {
        pop.powered = selectedPL.powered
        neighborhood.addPLine(pop)
        neighborhood.addPLineEdge(ple)
        neighborhood.distributePower()
      //draw()
      }
    }
  }
  dragging = false
}
// function mouseDragged() {
//   if (dragging) {
//     draw()
//     strokeWeight(3)
//     stroke('black')
//     line(selectedPL.x,selectedPL.y, mouseX, mouseY);
//   }
// }



