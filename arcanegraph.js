loggingMode = false;

DOUT = 0;
DIN = 1;
DIO = 2;
LADDEDGE = 0;
LADDVERTEX = 1;
LREMOVEEDGE = 2;
LREMOVEVERTEX = 3;
ξ = "ξ";
realityAlias = ξ;

function Edge(vertexA, vertexB, direction, weight=1) {
    this.A = vertexA;
    this.B = vertexB;
    this.direction = direction;
    this.weight = weight;

    if(direction == DIN || direction == DIO)
    {
        vertexB.pointsTo.add(vertexA);
        vertexA.pointedToBy.add(vertexB);
    }

    if(direction == DOUT || direction == DIO)
    {
        vertexA.pointsTo.add(vertexB);
        vertexB.pointedToBy.add(vertexA);
    }
}

function Symbol(symText) {
    this.symText = symText;

    this.getNumericalValue = function() {
        numValue = 0;

        if(this.symText.length == 0)
            return 0;

        for(let i = 0; i < this.symText.length; i++)
        {
            numValue += this.symText.charCodeAt(i);
        }

        console.log("got sym numeric value " + Math.round(numValue / this.symText.length));
        return Math.round(numValue / this.symText.length);
    }
} 

function Vertex(symbol) {
    this.pointsTo = new Set();
    this.pointedToBy = new Set();
    this.symbol = symbol;

}

LogStack = [];
logInit = 1;

function Log(logType, logString, vertexA, vertexB, direction=DIO, weight=1) {
    LogStack.push(this);
    this.log = logString;
    this.logType = logType;
    this.vertexA = vertexA;
    this.vertexB = vertexB;
    this.direction = direction;

    if(LogStack.length <= 1)
    {
        this.logState = 1;
        this.baseSymbol = vertexA.symbol.getNumericalValue();
        
        if(vertexB != null)
            this.baseSymbol = (this.baseSymbol + vertexB.symbol.getNumericalValue()) / 2;

        this.baseSymbol = Math.round(this.baseSymbol);
    }else
    {
        this.logState = LogStack[LogStack.length - 2].logState;
        console.log("got log state " + this.logState);
        this.logState = this.logState * (this.logState + 3);
        this.logState = this.logState % 1024;

        if(this.logState == 0)
        {
            this.logState = ++logInit;
        }

        this.baseSymbol = LogStack[LogStack.length - 2].baseSymbol;
        this.baseSymbol = (this.baseSymbol + this.vertexA.symbol.getNumericalValue()) / 2;

        if(vertexB !== null)
            this.baseSymbol = (this.baseSymbol + this.vertexB.symbol.getNumericalValue()) / 2;

        this.baseSymbol = Math.round(this.baseSymbol);
    }

    console.log("base symbol set to " + this.baseSymbol);

    this.hashValue = 0;

    switch(this.logType)
    {
        case LADDEDGE:
            this.hashValue = this.vertexA.symbol.getNumericalValue();
            this.hashValue = this.hashValue * this.vertexB.symbol.getNumericalValue();
            this.hashValue = this.hashValue * (direction + 1);
            this.hashValue = this.hashValue * (weight + 1);
            break;
        case LADDVERTEX:
            this.hashValue = this.vertexA.symbol.getNumericalValue();
            this.hashValue = (this.hashValue * this.logState);
            break;
        case LREMOVEEDGE:
            this.hashValue = this.vertexA.symbol.getNumericalValue();
            this.hashValue = (this.hashValue >= this.vertexB.symbol.getNumericalValue()) ? (this.hashValue / (this.vertexB.symbol.getNumericalValue())) : ((this.vertexB.symbol.getNumericalValue()) /  this.hashValue);
            this.hashValue = this.hashValue * (direction + 1);
            this.hashValue = this.hashValue * (weight + 1);
            break;
        case LREMOVEVERTEX:
            this.hashValue = this.vertexA.symbol.getNumericalValue();
            this.hashValue = this.hashValue - this.logState;
    }
    this.hashValue += this.logState;
    console.log("hash value set to " + this.hashValue);
}

Vertices = {};

function addEdge(vertexA, vertexB, direction=DOUT, weight=1) {
    let newEdge = new Edge(vertexA, vertexB, direction, weight);

    if(loggingMode)
        new Log(LADDEDGE, "add edge " + vertexA.symbol.symText + " " + vertexB.symbol.symText + " " + direction, vertexA, vertexB, direction, weight);
}

function addVertex(symbol) {
    let newVertex = new Vertex(symbol);
    Vertices[symbol.symText] = newVertex;

    console.log(newVertex);

    if(loggingMode)
        new Log(LADDVERTEX, "add vertex " + symbol.symText, newVertex, null, 0);
}

function removeEdge(vertexA, vertexB, direction) {
    if(direction == DIN || direction == DIO)
    {
        vertexB.pointsTo.delete(vertexA);
        vertexA.pointedToBy.delete(vertexB);
    }

    if(direction == DOUT || direction == DIO)
    {
        vertexA.pointsTo.delete(vertexB);
        vertexB.pointedToBy.delete(vertexA);
    }

    new Log(LREMOVEEDGE, "remove edge " + vertexA.symbol.symText + " " + vertexB.symbol.symText + " " + direction, vertexA, vertexB, direction);
}

function removeVertex(toRemove, autoResolveEdges = false) {
    if(toRemove.pointsTo.size != 0 || toRemove.pointedToBy.size != 0)
    {
        if(!autoResolveEdges)
        {
            console.log("Warning: Vertex is pointed to by existing edges. Please remove these, or pass true as the second argument of this function to auto resolve");
            return;
        }else
        {
            for(let item of toRemove.pointsTo)
            {
                removeEdge(toRemove, item, 1);
            }

            for(let item of toRemove.pointedToBy)
            {
                removeEdge(toRemove, item, 0);
            }
        }
    }

    if(loggingMode)
        new Log(LREMOVEVERTEX, "remove vertex " + toRemove.symText, newVertex, null, 0);

    delete Vertices[toRemove.symText];
}

function getSigil() {
    if(LogStack.length == 0)
        return "";

    outstring = String.fromCharCode(LogStack[LogStack.length - 1].baseSymbol);

    for(let i = 0; i < LogStack.length; i++)
    {
        outstring += String.fromCharCode((LogStack[i].hashValue % 98) + 768);
    }

    return outstring;
}