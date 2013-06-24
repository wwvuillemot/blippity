var blipManager;

var BlipLight = (function (position_left, position_top, duration, distance, blip_width, blipManager) {
  this.position_left = position_left;
  this.position_top = position_top;
  this.duration = duration;
  this.distance = distance;
  this.blip_width = blip_width;
  this.blipManager = blipManager;

  this.animate = function(dom){
    this.blip = jQuery('<div/>', {
        class: 'blip',
        style: 'left: ' + this.position_left + 'px; top: ' + this.position_top + 'px; height: ' + blip_width + 'px; width: ' + blip_width + 'px',
        text: ''});
    dom.append(this.blip);
    self = this;
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
        self.blipManager.done();
      }
    );

  }
});

var BlipManager = ( function(maxNumberOfBlips) {
  this.maxNumberOfBlips = maxNumberOfBlips;
  this.numberOfBlips = 0;
  
  this.create = function(){
    if(this.running && (this.numberOfBlips <= this.maxNumberOfBlips))
    {
      this.numberOfBlips++;
      var distance = -1;
      var position_left = 0;
      var position_top = 0;
      var duration = 0;
      while(distance < 50)
      {
        position_left = $(window).width() * Math.random();
        position_top = $(window).height() * Math.random();
        duration = 10000 * Math.random();
        distance = $(window).height() - position_top - 58;        
      }
      blip_width = 30 * Math.random();
      var blipLight = new BlipLight(position_left, position_top, duration, distance, blip_width, this);
      blipLight.animate($('#wrap')); 
    }      
  };
  
  this.done = function(){
    this.numberOfBlips--;
    this.create();
  }
  
  this.pause = function(){
    this.setPause();
    this.setRunning(false);
  }
  
  this.setPause = function(){
    $('#blipManager').html("<i class='icon-play'></i>");
  }
  
  this.resume = function(){
    this.setResume();
    this.numberOfBlips = 0;    
    this.setRunning(true);
    this.init();  
  }
  
  this.setResume = function(){
    $('#blipManager').html("<i class='icon-pause'></i>");
  }
  
  this.init = function(){
    this.getRunning();
    this.setRunning(this.running);
    if(this.running){
      this.setResume();
      for(var blip = 1; blip <= this.maxNumberOfBlips; blip++)
      {
        this.create();    
      }    
    } else {
      this.setPause();
    }
  }
  
  this.setRunning = function(isRunning){
    this.running = isRunning;
    $.cookie("blipManagerRunning", isRunning);
  }

  this.getRunning = function(){
    this.running = $.cookie("blipManagerRunning") == 'true' ? true : false;
  }
  
});