var canvas = document.getElementById("myCanvas");
var width = canvas.scrollWidth;
var height = canvas.scrollHeight;
var ctx = canvas.getContext("2d");

var edgeSet = new Set();

const RADIUS = 7;
const SPACING = 30;

var mod = false;

var eIndex;
var firstSet = false;

var setNode = true;

canvas.onmousedown = function (e) {
    setNodes(e);
};

var edges = [];
var cordinates = [];
var deleteSet = new Set();

function drawLine(from, to, color='green', width=2) {
    var t1 = ctx.strokeStyle;
    var tw = ctx.lineWidth;
    
    ctx.beginPath();
    ctx.moveTo(cordinates[from].x, cordinates[from].y);
    ctx.lineTo(cordinates[to].x, cordinates[to].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    ctx.strokeStyle = t1;
    ctx.lineWidth = tw;
}

function drawCircle(x, y, fillColor='white', strokeColor='black', r=RADIUS) {
    var t1 = ctx.fillStyle;
    var t2 = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = t1;
    ctx.strokeStyle = t2;
}

function closestNode(e) {
    var cc = windowToCanvas(e.clientX, e.clientY);
    var x1 = cc.x, y1 = cc.y, index = 0;
    var minX = x1, minY = y1, min = Number.MAX_VALUE, i = 0;
    cordinates.forEach(function(cordinate) {
        var x2 = cordinate.x, y2 = cordinate.y;
        var dist = Math.sqrt(Math.pow((x2-x1), 2)+Math.pow((y2-y1), 2));
        if(min>dist) {
            index = i;
            min = dist;
            minX = x2;
            minY = y2;
        }
        i+=1;
    });
    return {x:minX, y:minY, index:index};
}

function setNodes(e) {
    var cc = windowToCanvas(e.clientX, e.clientY);
    var x = cc.x, y = cc.y;
    var closestDistance = checkDistance(x, y);
    if(closestDistance<SPACING) return;
    cordinates.push({x:x,y:y});
    drawCircle(x, y);
}

function setEdges(e) {
    if(!firstSet) {
        var cc = closestNode(e);
        eIndex = cc.index;
        drawCircle(cordinates[eIndex].x, cordinates[eIndex].y, 'yellow');
        firstSet = true;
    } else {
        var cc = closestNode(e);
        var index2 = cc.index;
        if(!edgeSet.has(eIndex+" "+index2) && !edgeSet.has(index2+" "+eIndex)) {
            drawLine(eIndex, index2);
            edges.push({node1:eIndex, node2:index2});
            edges.push({node2:eIndex, node1:index2});
            edgeSet.add(eIndex+" "+index2);
            edgeSet.add(index2+" "+eIndex);
        }
        drawCircle(cordinates[eIndex].x, cordinates[eIndex].y);
        drawCircle(cordinates[index2].x, cordinates[index2].y);
        firstSet = false;
    }
}

function clickToggle() {
    if(mod) {
        const modItems=[...document.getElementsByName('mod')]
        modItems.forEach(modItem => {
            modItem.innerHTML="Modify Graph (OFF)"
            modItem.classList.remove("btn-primary");
            modItem.classList.add("btn-danger");
            mod = false;
        })
    }
    if(cordinates.length==0 || !setNode) {
        canvas.onmousedown = function (e) {
            setNodes(e);
        };
        setNode = true;
        const setterItems=[...document.getElementsByName('setter')]
        setterItems.forEach(setterItem=>{
            setterItem.innerHTML="Add Edges";
        })
    } else {
        canvas.onmousedown = function (e) {
            setEdges(e);
        };
        setNode = false;
        const setterItems=[...document.getElementsByName('setter')]
        setterItems.forEach(setterItem=>{
            setterItem.innerHTML="Add Vertices";
        })
    }
}

function windowToCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return {x: x - bbox.left * (canvas.width  / bbox.width),
            y: y - bbox.top  * (canvas.height / bbox.height)
    };
}

function checkDistance(x1, y1) {
    var min =Number.MAX_VALUE;
    cordinates.forEach(function(cordinate) {
        var x2 = cordinate.x, y2 = cordinate.y;
        var dist = Math.sqrt(Math.pow((x2-x1), 2)+Math.pow((y2-y1), 2));
        if(min>dist) min = dist;
    });
    return min;
}

// removes the current graph and redraws it in th exact same place
// notused anywhere just written to test functionality
function renderGraph() {
    removeGraph();
    redrawGraph();
}

function removeGraph() {
    for(var i=0; i<cordinates.length; i++) {
        // if(!deleteSet.has(i))
        drawCircle(cordinates[i].x, cordinates[i].y, 'white', 'white', RADIUS+1);
    }
    for(var i=0; i<edges.length; i++) {
        drawLine(edges[i].node1, edges[i].node2, 'white', 4);
    }
}

function redrawGraph() {
    for(var i=0; i<edges.length; i++) {
        drawLine(edges[i].node1, edges[i].node2);
    }
    for(var i=0; i<cordinates.length; i++) {
        // if(!deleteSet.has(i))
        drawCircle(cordinates[i].x, cordinates[i].y);
    }
}

// moving the nodes in the n/w around..very important method
var mX, mY, mIndex;
function modify() {
    if(!mod) {
        canvas.onmousedown = function(e) {
            var node = closestNode(e);
            mX = node.x, mY = node.y, mIndex = node.index;

            canvas.onmousemove = function(e) {
                var cordinate = windowToCanvas(e.clientX, e.clientY);
                var x = cordinate.x, y = cordinate.y;
                removeGraph();
                cordinates[mIndex] = {x:x, y:y};
                mX = x;
                mY = y;
                redrawGraph();
            }

            canvas.onmouseup = function(e) {
                canvas.onmousemove = null;
                canvas.onmouseup = null;
            }
        }
        const modItems=[...document.getElementsByName('mod')]
        modItems.forEach(modItem => {
            modItem.innerHTML="Modify Graph (ON)"
            modItem.classList.remove("btn-danger");
            modItem.classList.add("btn-success");
            mod = true;
        })
    }
    else {
        if(setNode) {
            canvas.onmousedown = function (e) {
                setNodes(e);
            };
        } else {
            canvas.onmousedown = function (e) {
                setEdges(e);
            };
        }
        const modItems=[...document.getElementsByName('mod')]
        modItems.forEach(modItem => {
            modItem.innerHTML="Modify Graph (OFF)"
            modItem.classList.remove("btn-success");
            modItem.classList.add("btn-danger");
            mod = false;
        })
    }
}

function display() {
    console.log(cordinates);
    console.log(edges);
    console.log(edgeSet);
}

function clearGraph() {
    removeGraph();
    edgeSet = new Set();
    edges = [];
    cordinates = [];
    renderGraph();
}

var temp;
function deleteNode() {
    const setterItems=[...document.getElementsByName('setter')]
    setterItems.forEach(setterItem=>{
        setterItem.disabled=true;
    })
    const modItems=[...document.getElementsByName('mod')]
    modItems.forEach(modItem=>{
        modItem.disabled=true;
    })
    const clearGraphItems=[...document.getElementsByName('clearGraph')]
    clearGraphItems.forEach(clearGraphItem=>{
        clearGraphItem.disabled=true;
    })

    if(mod) {
        modify();
    }

    temp = canvas.onmousedown;

    canvas.onmousedown = function(e) {
        var cc = closestNode(e);
        var delIndex = cc.index;

        removeGraph();

        deleteHelper(delIndex); // modify cordinates, edges, edgeSet.. 

        redrawGraph();

        canvas.onmousedown = temp;

        const setterItems=[...document.getElementsByName('setter')]
        setterItems.forEach(setterItem=>{
            setterItem.disabled=false;
        })
        const modItems=[...document.getElementsByName('mod')]
        modItems.forEach(modItem=>{
            modItem.disabled=false;
        })
        const clearGraphItems=[...document.getElementsByName('clearGraph')]
        clearGraphItems.forEach(clearGraphItem=>{
            clearGraphItem.disabled=false;
        })
    }
}

function deleteHelper(index) {
    // modify  edges and edgeSet
    for(var i=0; i<edges.length; ) {
        var edge = edges[i];
        if(edge.node1==index || edge.node2==index) {
            edges.splice(i, 1);// delete edge
            edgeSet.delete(edge.node1+" "+edge.node2);
            edgeSet.delete(edge.node2+" "+edge.node1);
        } 
        else {
            var isTainted = false;
            var n1 = edge.node1, n2 = edge.node2;
            if(edge.node1>index) {
                edges[i].node1-=1;
                isTainted = true;
            }
            if(edge.node2>index) {
                edges[i].node2-=1;
                isTainted = true;
            }
            if(isTainted) {
                edgeSet.delete(n1+" "+n2);
                edgeSet.delete(n2+" "+n1);
                edgeSet.add(edges[i].node1+" "+edges[i].node2);
                edgeSet.add(edges[i].node2+" "+edges[i].node1);
            }
            i+=1;
        }
    }
    //modify cordinates
    cordinates.splice(index, 1);
}

var deleteFirstSet = false;
var dIndex;
function deleteEdge() {
    const setterItems=[...document.getElementsByName('setter')]
    setterItems.forEach(setterItem=>{
        setterItem.disabled=true;
    })
    const modItems=[...document.getElementsByName('mod')]
    modItems.forEach(modItem=>{
        modItem.disabled=true;
    })
    const clearGraphItems=[...document.getElementsByName('clearGraph')]
    clearGraphItems.forEach(clearGraphItem=>{
        clearGraphItem.disabled=true;
    })

    if(mod) {
        modify();
    }

    temp = canvas.onmousedown;

    canvas.onmousedown = function(e) {
        // code goes here
        if(!deleteFirstSet) {
            var cc = closestNode(e);
            dIndex = cc.index;
            drawCircle(cordinates[dIndex].x, cordinates[dIndex].y, 'yellow');
            deleteFirstSet = true;
        } else {
            var cc = closestNode(e);
            var index2 = cc.index;
            if(edgeSet.has(dIndex+" "+index2)) {
                for(var i=0; i<edges.length; i++) {
                    var edge = edges[i];
                    if((edge.node1==index2 && edge.node2==dIndex) || (edge.node1==dIndex && edge.node2==index2)) {
                        edges.splice(i, 1);
                        i-=1;
                    }
                }
                edgeSet.delete(dIndex+" "+index2);
                edgeSet.delete(index2+" "+dIndex);
                drawLine(dIndex, index2, 'white', 4);
            }                   
            drawCircle(cordinates[dIndex].x, cordinates[dIndex].y);
            drawCircle(cordinates[index2].x, cordinates[index2].y);
            deleteFirstSet = false;

            canvas.onmousedown = temp;
            const setterItems=[...document.getElementsByName('setter')]
            setterItems.forEach(setterItem=>{
                setterItem.disabled=false;
            })
            const modItems=[...document.getElementsByName('mod')]
            modItems.forEach(modItem=>{
                modItem.disabled=false;
            })
            const clearGraphItems=[...document.getElementsByName('clearGraph')]
            clearGraphItems.forEach(clearGraphItem=>{
                clearGraphItem.disabled=false;
            })
        }
    }
}