function setup() {
    createCanvas(600, 600);
}
let vertexes = [];
let edges = [];
let traversedEdges = [];
let selectedVertex = null;
let makingEdge = false;
let contract = false;
let edgeEnd;

function draw() {
    background(220);
    if (selectedVertex) {
        if (makingEdge) {
            let target = new p5.Vector(mouseX, mouseY);
            let found = false;
            let mousePos = target.copy();
            vertexes.forEach(v => {
                if (v.dist(mousePos) < 15) {
                    found = true;
                    target = v;
                }
            });
            if (found) {
                edgeEnd = target;
            }
            line(selectedVertex.x, selectedVertex.y, target.x, target.y);
        } else {
            selectedVertex.x = mouseX;
            selectedVertex.y = mouseY;
            edges.forEach(e => {
                if (e.start === selectedVertex || e.end === selectedVertex) {
                    e.control1 = e.start.copy().lerp(e.end, 0.25);
                    e.control2 = e.start.copy().lerp(e.end, 0.75);
                }
            })
        }
    }
    if (contract) {
        vertexes.forEach(v => {
            v.lerp(contract, 0.1);
        })
        edges.forEach(e => {
            if (traversedEdges.includes(e)) {
                e.control1 = e.start.copy().lerp(e.end, 0.25);
                e.control2 = e.start.copy().lerp(e.end, 0.75);
            }
        })
    }
    edges.forEach(e => {
        noFill();
        if (traversedEdges.includes(e)) {
            stroke(255, 0, 0);
        }
        beginShape();
        curveVertex(e.start.x, e.start.y);
        curveVertex(e.start.x, e.start.y);
        curveVertex(e.control1.x, e.control1.y);
        curveVertex(e.control2.x, e.control2.y);
        curveVertex(e.end.x, e.end.y);
        curveVertex(e.end.x, e.end.y);
        endShape();
        fill(255);
        stroke(0);
        if (!traversedEdges.includes(e) && traversedEdges.length > 0) {
            const num = edges.filter(e => !traversedEdges.includes(e)).indexOf(e) + 1;
            const textPos = e.control1.copy().lerp(e.control2, 0.5);
            textAlign(CENTER, CENTER);
            fill(0);
            text(num.toString(), textPos.x, textPos.y);
            fill(255);
        }
    });
    vertexes.forEach(v => {
        circle(v.x, v.y, 15);
    });
    if (traversedEdges.length > 0) {
        textAlign(LEFT);
        fill(0);
        text("Loop Count: " + edges.filter(e => !traversedEdges.includes(e)).length, 7.5, 15);
        fill(255);
    }
}

function mousePressed() {
    if (contract) {
        return;
    }
    const mousePos = new p5.Vector(mouseX, mouseY);
    let chosen = false;
    vertexes.forEach(v => {
        if (v.dist(mousePos) < 15) {
            chosen = true;
            selectedVertex = v;
        }
    });
    if (!chosen && !selectedVertex && (mouseButton !== RIGHT)) {
        vertexes.push(mousePos);
    }
    if (mouseButton === RIGHT && chosen) {
        makingEdge = true;
    }
}

function mouseReleased() {
    if (makingEdge && (selectedVertex !== edgeEnd)) {
        edges.push({
            start: selectedVertex,
            control1: selectedVertex.copy().lerp(edgeEnd, 0.25),
            control2: selectedVertex.copy().lerp(edgeEnd, 0.75),
            end: edgeEnd
        });
    }
    selectedVertex = null;
    makingEdge = false;
}

function keyPressed() {
    if (key === "a" && !contract) {
        if (edges.length > 0) {
            const centroid = new p5.Vector();
            vertexes.forEach(v => {
                centroid.add(v);
            });
            centroid.div(vertexes.length);
            let centerVertex = [...vertexes].sort((a, b) => a.dist(centroid) - b.dist(centroid))[0];
            let verticesReached = [centerVertex];
            let edgesReached = [];
            for (let i = 0; i < 100; i++) {
                console.log(verticesReached)
                edges.forEach(edge => {
                    if (verticesReached.includes(edge.start)) {
                        if (!verticesReached.includes(edge.end)) {
                            edgesReached.push(edge);
                            verticesReached.push(edge.end);
                        }
                    }
                    if (verticesReached.includes(edge.end)) {
                        if (!verticesReached.includes(edge.start)) {
                            edgesReached.push(edge);
                            verticesReached.push(edge.start);
                        }
                    }
                })
            }
            traversedEdges = edgesReached;
        }
    }
    if (key === "c" && traversedEdges.length > 0) {
        const centroid = new p5.Vector();
        vertexes.forEach(v => {
            centroid.add(v);
        });
        centroid.div(vertexes.length);
        contract = centroid;
    }
    if (key === "r") {
        vertexes = [];
        edges = [];
        traversedEdges = [];
        selectedVertex = null;
        makingEdge = false;
        contract = false;
        edgeEnd;
    }
    if (key === "k" && !contract) {
        vertexes.forEach(v => {
            let chance = 1 + edges.filter(e => e.start === v || e.end === v).length;
            vertexes.forEach(v2 => {
                if (v !== v2) {
                    if (!edges.some(e => (e.start === v && e.end === v2) ||
                            (e.end === v && e.start === v2))) {
                        if (Math.random() < 1 / chance) {
                            chance++;
                            edges.push({
                                start: v,
                                control1: v.copy().lerp(v2, 0.25),
                                control2: v.copy().lerp(v2, 0.75),
                                end: v2
                            });
                        }
                    }
                }
            })
        })
    }
    if (key === "l" && !contract) {
        for (let i = 0; i < 10; i++) {
            let pos;
            for (let i = 0; i < 100; i++) {
                pos = new p5.Vector(random(50, 550), random(50, 550));
                if (!vertexes.some(v => v.dist(pos) < 45)) {
                    break;
                }
            };
            vertexes.push(pos);
        }
    }
}