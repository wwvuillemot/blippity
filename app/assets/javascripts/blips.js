var numberOfBlips = 0;
var maxNumberOfBlips = 100;
var BlipLight = (function (position_left, position_top, duration, distance, blip_width) {
  this.position_left = position_left;
  this.position_top = position_top;
  this.duration = duration;
  this.distance = distance;
  this.blip_width = blip_width;

  this.animate = function(dom){
    numberOfBlips += 1;
    this.blip = jQuery('<div/>', {
        class: 'blip',
        style: 'left: ' + this.position_left + 'px; top: ' + this.position_top + 'px; height: ' + blip_width + 'px; width: ' + blip_width + 'px',
        text: ''});
    dom.append(this.blip);
    this.blip.animate(
      {
        opacity: '=0.0',
        top: '+=' + this.distance,
        width: 'toggle',
        height: 'toggle',
      }, 
      this.duration, 
      function() {
        $(this).remove();
        numberOfBlips -= 1;
        blipManager();
      }
    );

  }
});

var blipManager = function(){
  if(numberOfBlips <= maxNumberOfBlips)
  {
    console.log(numberOfBlips);
    position_left = $(window).width() * Math.random();
    position_top = $(window).height() * Math.random();
    duration = 10000 * Math.random();
    distance = position_top + $(window).height() * Math.random();
    blip_width = 30 * Math.random();
    var blipLight = new BlipLight(position_left, position_top, duration, distance, blip_width);
    blipLight.animate($('#wrap')); 
  }  
}

$(document).ready( function() {
  for(var blip = 1; blip <= maxNumberOfBlips; blip++)
  {
    blipManager();    
  }
});