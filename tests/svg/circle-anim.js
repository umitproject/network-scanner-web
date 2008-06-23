var circleMove = {
  degress: 0,
  radius: 300,
  Rads: 0,
  timeId: 0,
  
  moveElement: function(element, newX, newY){
    e = $(element);
    e.css({'svg-cx': newX, 'svg-cy': newY});
  },
  
  calculateCoordinates: function(centerX, centerY){
    //if the degree variable is greater than 360, reset it
    if(circleMove.degrees > 360){
      circleMove.degrees = 1;
    }
    
    circleMove.degrees ++;
    circleMove.rads = circleMove.degreesToRadians(circleMove.degrees);
    var newX = (centerX - (circleMove.radius * Math.cos(circleMove.rads)));
    var newY = (centerY - (circleMove.radius * Math.sin(circleMove.rads)));
    return [newX, newY];
  },
  
  degreesToRadians: function(degrees){
    var pi = Math.PI;
    return (degrees * (pi/180));
  },
  
  circleElement: function(element, centerX, centerY, delayTime){
    var newCoordinates = circleMove.calculateCoordinates(centerX, centerY);
    circleMove.moveElement(element, newCoordinates[0], newCoordinates[1]);
  },
  
  init: function(element, centerX, centerY, delayTime){
    var theElement = null;
    theElement = $(element);
    
    //remove the looping on the element if it's already been set:
    clearInterval(circleMove.timeId);
    
    //starts the repetition.
    circleMove.timeID = setInterval(function(){
      circleMove.circleElement(theElement, centerX, centerY, delayTime);
    }, delayTime);
  }
};