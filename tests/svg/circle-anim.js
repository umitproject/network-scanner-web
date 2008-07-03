var tickInt = 25;
var PIon180 = Math.PI / 180;

$ = function(id){
  return document.getElementById(id);
}

function pos(x, y){
  this.x = Math.round(x);
  this.y = Math.round(y);
}

function Animation(id, path, steps){
  this.elem = document.getElementById(id);
  this.active = 0;
  this.timer = null;
  this.path = path;
  this.pathIdx = 0;
  this.numSteps = steps;
}

Animation.prototype = {
  start: function(){
    if(this.active) return;

    var saveThis = this;  /* create a closure */

    this.step();
    this.active = 1;
    
    //this.times = setInterval(function(){saveThis.step()}, tickInt);
    setInterval(function(){ var t = new Date(); alert(t)}, 2000)
  },

  stop: function(){
    if(!this.timer) return false;
    clearInterval(this.timer);
    this.active = 0;
  },

  step: function(){
    var nextPos = this.path.nextStep(this.pathIdx);
    
    this.moveTo(nextPos.x, nextPos.y);
    if((this.numSteps > 0) && (this.pathIdx >= this.numSteps)){
      this.stop();
    }else{
      this.pathIdx++;
    }
  },

  moveTo: function(x, y){
    this.elem.setAttribute("cx", x);
    this.elem.setAttribute("cy", y);
  } 
};


function Circle(initPos, radius, angle0, stepSize){
  this.rad = radius;
  this.startAngle = angle0;
  this.aStep = stepSize;
  this.cx = initPos.x - this.rad * Math.cos(angle0 * PIon180);
  this.cy = initPos.y - this.rad * Math.sin(angle0 * PIon180);
  this.currX = initPos.x;
  this.currY = initPos.y;
}

Circle.prototype = {
  nextStep: function(index){
    var angle = this.startAngle - index * this.aStep; // +ve angles cw, we want ccw
    
    this.currX = this.cx + this.rad * Math.cos(angle * PIon180);
    this.currY = this.cy + this.rad * Math.sin(angle * PIon180);
    return new pos(this.currX, this.currY);
  }
}