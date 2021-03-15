import React, {Component} from 'react';
import '../BFS/BFS.css'



var canvasObstacles = [{"p":-3, "j":-9, "s":-1}, {"p":-2, "j":-9, "s":-1}, {"p":-1, "j":-9, "s":-1}, {"p":0, "j":-9, "s":-1}, {"p":1, "j":-9, "s":-1}, {"p":2, "j":-9, "s":-1}, {"p":3, "j":-9, "s":-1}, {"p":4, "j":-9, "s":-1}, {"p":5, "j":-9, "s":-1}, {"p":6, "j":-9, "s":-1}, {"p":7, "j":-9, "s":-1},{"p":8, "j":-9, "s":-1}, {"p":9, "j":-9, "s":-1}, {"p":10, "j":-9, "s":-1}, {"p":11, "j":-9, "s":-1}, {"p":12, "j":-9, "s":-1}, {"p":13, "j":-9, "s":-1}, {"p":14, "j":-9, "s":-1}, {"p":15, "j":-9, "s":-1},  {"p":16, "j":-9, "s":-1},  {"p":17, "j":-9, "s":-1},  {"p":18, "j":-9, "s":-1}];









export default class BFS extends Component {
    constructor(props) {
    super(props);

    this.handleMouseMove = this.handleMouseMove.bind(this);
this.handleClick = this.handleClick.bind(this);
    this.state = {
        hexSize: 20,
        hexOrigin: { x: 300, y: 300},
        currentHex: { p: 0, j: 0, s: 0, x: 0, y: 0 },
        obstacles: canvasObstacles,
        playerPosition: {p: 0, j: 0, s: 0},
        cameFrom: {},
        hexPath: [],
        path: []
    }
    }

    componentWillMount (){
        let getHexParameters = this.getHexParameters();
this.setState({
    canvasSize: { canvasWidth: 800, canvasHeight: 600 },
    getHexParameters: getHexParameters
})
    }

    componentDidMount (){
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
       
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;
        
        this.canvasInteraction.width = canvasWidth;
        this.canvasInteraction.height = canvasHeight;

        this.canvasView.width = canvasWidth;
        this.canvasView.height = canvasHeight;

        this.getCanvasPosition(this.canvasInteraction);
        this.drawHex(this.canvasInteraction, this.Point(this.state.playerPosition.x, this.state.playerPosition.y), 1, "black", "grey")
        this.drawHexes()
        this.drawObstacles();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.currentHex !== this.state.currentHex) {
            const { p, j, s, x, y } = nextState.currentHex;
            const { canvasWidth, canvasHeight } = this.state.canvasSize;
            const ctx = this.canvasInteraction.getContext("2d");
            ctx.clearRect(0,0, canvasWidth, canvasHeight);
            let currentDistanceLine = nextState.currentDistanceLine;
            for(let i = 0; i <= currentDistanceLine.length - 2; i++){
                if (i == 0){
                    this.drawHex(this.canvasInteraction, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "black", "blue", "blue");
                }
            else {
                this.drawHex(this.canvasInteraction, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "black", "black", "black");
            }
            }
            nextState.obstacles.map((l) => {
                const {p,j,s,x,y} = l;
                this.drawHex(this.canvasInteraction, this.Point(x,y), 1, "black", "black",)
            })

            this.drawHex(this.canvasInteraction, this.Point(x,y), 1, "black", "black" );
            return true;
        }
        return false;
    }

    getHexCornerCoord(center, i) {
    let angle_deg = 60 * i + 30;
    let angle_rad = Math.PI / 180 * angle_deg;
    let x = center.x + this.state.hexSize * Math.cos(angle_rad);
    let y = center.y + this.state.hexSize * Math.sin(angle_rad);
    return this.Point(x, y)
    }

    Point(x, y) {
        return {x: x, y: y}
    }

    drawHex(canvasID, center, lineWidth, lineColor, fillColor) {
        for( let i = 0; i <= 5; i++){
            let start = this.getHexCornerCoord(center, i);
            let end = this.getHexCornerCoord(center, i + 1);

            this.fillHex(canvasID, center, fillColor)

            this.drawLine(canvasID, start, end, lineWidth, lineColor);
        }
    }

    drawLine(canvasID, start, end, lineColor, lineWidth) {
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    drawHexes() {
        const { canvasWidth, canvasHeight} = this.state.canvasSize;
        const { hexWidth, hexHeight, vertDist, horizDist} = this.state.getHexParameters;
        const hexOrigin = this.state.hexOrigin;
        let pLeftSide = Math.round(hexOrigin.x/hexWidth) * 4;
        let pRightSide = Math.round(canvasWidth - hexOrigin.x) / hexWidth * 2;
        let jTopSide = Math.round(hexOrigin.y / (hexHeight/2));
        let jBottomSide = Math.round((canvasHeight - hexOrigin.y)/ (hexHeight/2));
        var hexPathMap = [];

        var q = 0;
        for(let j = 0; j <= jBottomSide; j++){
            if(j % 2 == 0 && j !== 0) {
                q++
            }
            for (let p = -pLeftSide; p <= pRightSide; p++) {
                const { x, y } = this.hexToPixel(this.Hex(p-q, j))
                if((x > hexWidth/2 && x < canvasWidth - hexWidth/2) && (y > hexHeight/2 && y < canvasHeight - hexHeight/2)) {
                    this.drawHex(this.canvasHex, this.Point(x,y), "black", 1, "grey");
                    
                    var bottomH = JSON.stringify(this.Hex(p-q, j, -(p-q) - j));
                    if(!this.state.obstacles.includes(bottomH)) {
                        hexPathMap.push(bottomH)
                    }
                }
            }
        }

        var n = 0;
        for(let j = -1; j >+ -jTopSide; j--){
            if(j % 2 !== 0){
                n++
            }
        

       
            for(let p = -pLeftSide; p <= pRightSide; p++){
                const { x, y} = this.hexToPixel(this.Hex(p+n, j))
                // let center = this.hexToPixel(this.Hex(p, j));
                if((x > hexWidth/2 && x < canvasWidth - hexWidth/2) && (y > hexHeight/2 && y < canvasHeight - hexHeight/2)){
                    this.drawHex(this.canvasHex, this.Point(x, y),  "black", 1, "grey");
           
                    var topH = JSON.stringify(this.Hex(p+n, j, -(p+n) - j));
                    if(!this.state.obstacles.includes(topH)) {
                        hexPathMap.push(topH)
                    }
                }   
            }          
        }

        hexPathMap = [].concat(hexPathMap);
        this.setState(
            {hexPathMap: hexPathMap},
            this.breadthFirstSearchCallback = () => this.breadthFirstSearch(this.state.playerPosition)
        )
    }

    hexToPixel(h){
    let hexOrigin = this.state.hexOrigin;
    let x = this.state.hexSize * Math.sqrt(3) * (h.p +  h.j/2) + hexOrigin.x;
    let y = this.state.hexSize * 3/2 * h.j + hexOrigin.y;
    return this.Point(x, y)
    }

Hex(p, j, s){
    return { p: p, j: j, s: s }
}

drawHexCoordinates(canvasID, center, h) {
    const ctx = canvasID.getContext("2d");
    ctx.fillText(h.p, center.x+5, center.y)
    ctx.fillText(h.j, center.x-3, center.y+15)
    ctx.fillText(h.s, center.x-15, center.y);
}

getHexParameters(){
    let hexHeight = this.state.hexSize * 2;
    let hexWidth = Math.sqrt(3)/2 * hexHeight;
    let vertDist = hexHeight * 3/4;
    let horizDist = hexWidth;
    return { hexWidth, hexHeight, vertDist, horizDist }
}

handleMouseMove(e) {
    const { left, right, top, bottom } = this.state.canvasPosition;
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const { hexWidth, hexHeight, vertDist, horizDist } = this.state.getHexParameters;
   
    let offsetX = e.pageX - left;
    let offsetY = e.pageY - top;

    const { p, j, s } = this.cubeRound(this.pixelToHex(this.Point(offsetX, offsetY)));
    const { x,y } = this.hexToPixel(this.Hex(p, j, s));
    
    let playerPosition = this.state.playerPosition;
    this.getDistanceLine(this.Hex(0,0,0), this.Hex(p, j, s))
    console.log(this.state.currentDistanceLine)

    if((x > hexWidth / 2 && x < canvasWidth - hexWidth / 2) && (y > hexHeight / 2 && y < canvasHeight - hexHeight / 2)){
        this.setState({
            currentHex: { p, j, s, x, y }
        })
    }
  
}

getCanvasPosition(canvasID) {
    let rect = canvasID.getBoundingClientRect();
    this.setState({
        canvasPosition: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    })
}

pixelToHex(p){
    let size = this.state.hexSize;
    let origin = this.state.hexOrigin;
    let q = ((p.x - origin.x) * Math.sqrt(3)/3 - (p.y - origin.y) /3) / size
    var r = (p.y - origin.y) * 2/3 / size
    return this.Hex(q, r, - q - r);
}

cubeRound(cube){
    var rx = Math.round(cube.p)
    var ry = Math.round(cube.j)
    var rz = Math.round(cube.s)

    var x_diff = Math.abs(rx - cube.p)
    var y_diff = Math.abs(ry - cube.j)
    var z_diff = Math.abs(rz - cube.s)

    if( x_diff > y_diff && x_diff > z_diff) {
        rx = -ry-rz
    }
    else if (y_diff > z_diff){
        ry = -rx-rz
    }
    else(
        rz = -rx-ry
    )
    return this.Hex(rx, ry, rz)
}

cubeDirections(direction) {
   const cubeDirections = [this.Hex(1, 0, -1), this.Hex(1, -1, 0), this.Hex(0, -1, 1), 
    this.Hex(-1, 0, 1), this.Hex(-1, 1, 0), this.Hex(0, 1, -1)];
    return cubeDirections[direction];
}

cubeAdd(a, b) {
    return this.Hex(a.p +b.p, a.j + b.j, a.s + b.s);
}

cubeSubstract(hexA, hexB) {
    return this.Hex(hexA.p - hexB.p, hexA.j - hexB.j, hexA.s - hexB.s);
}

getCubeNeighbor(h, direction) {
    return this.cubeAdd(h, this.cubeDirections(direction))
}

drawNeighbors(h) {
    for (let i =0; i <= 5; i++) {
        const {p, j, s} = this.getCubeNeighbor(this.Hex(h.p, h.j, h.s), i);
        const {x, y} = this.hexToPixel(this.Hex(p, j, s));
        this.drawHex(this.canvasInteraction, this.Point(x,y), "blue", 2)
    }
}

cubeDistance(hexA, hexB) {
    const { p, j, s } = this.cubeSubstract(hexA, hexB);
    return (Math.abs(p) + Math.abs(j) + Math.abs(s)) / 2;
}

linearInt(a, b, t){ 
    return (a + (b - a) * t)

}

cubeLinearInt(hexA, hexB, t){
    return this.Hex(this.linearInt(hexA.p, hexB.p, t), this.linearInt(hexA.j, hexB.j, t), this.linearInt(hexA.s, hexB.s, t))
}

getDistanceLine(hexA, hexB) {
    let dist = this.cubeDistance(hexA, hexB);
    var arr = [];
    for(let i = 0; i <= dist; i++) {
        let center = this.hexToPixel(this.cubeRound(this.cubeLinearInt(hexA, hexB, 1.0 / dist * i)));
        arr = [].concat(arr, center);
    }
    this.setState({
        currentDistanceLine: arr
    })
}

fillHex(canvasID, center, fillColor) {
    let c0 = this.getHexCornerCoord(center, 0);
    let c1 = this.getHexCornerCoord(center, 1);
    let c2 = this.getHexCornerCoord(center, 2);
    let c3 = this.getHexCornerCoord(center, 3);
    let c4 = this.getHexCornerCoord(center, 4);
    let c5 = this.getHexCornerCoord(center, 5);
    
    const ctx = canvasID.getContext("2d");

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.1;
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.lineTo(c5.x, c5.y);
    ctx.closePath();
    ctx.fill();
}

handleClick(){

}

drawObstacles(){
   this.state.obstacles.map((l) =>{
       
       const {p, j, s} = l;
       const {x, y} = this.hexToPixel(this.Hex(p,j,s));
       this.drawHex(this.canvasHex, this.Point(x,y), 1, "black", "black")
   })
}

getNeighbors(h) {
    var arr = [];
    for(let i =0; i <= 5; i++) {
        const { p, j, s} = this.getCubeNeighbor(this.Hex(h.p, h.j, h.s), i);
        arr.push(this.Hex(p, j, s));
    }
    return arr;
}

breadthFirstSearch(playerPosition) {
    var frontier = [playerPosition];
    var cameFrom = {};
    cameFrom[JSON.stringify(playerPosition)] = JSON.stringify(playerPosition);
    while (frontier.length != 0) {
        var current = frontier.shift();
        let arr = this.getNeighbors(current);
        arr.map((l) => {
            if(!cameFrom.hasOwnProperty(JSON.stringify(l)) && this.state.hexPathMap.includes(JSON.stringify(l))) {
                frontier.push(l);
                cameFrom[JSON.stringify(l)] = JSON.stringify(current);
            }
        })
    }
cameFrom = Object.assign({}, cameFrom);
    this.setState({
        cameFrom: cameFrom
    })
}


    render() {
        
        return (
            <div className='BFS'>
                <canvas ref={ canvasHex => this.canvasHex = canvasHex }></canvas>
                <canvas ref={ canvasCoordinates => this.canvasCoordinates = canvasCoordinates }></canvas>
                <canvas ref={canvasView => this.canvasView = canvasView}></canvas>
                <canvas ref={canvasInteraction => this.canvasInteraction = canvasInteraction} onMouseMove = {this.handleMouseMove}  onClick={this.handleClick}></canvas>
            </div>
        );
    }
}