var BlipLight = (function (blipManager) {
  this.blipManager      = blipManager;
  
  this.animate = function(domNode, blipPositionLeft, blipPositionTop, blipDuration, blipDistance, blipWidth, blipLetter){    
    blipNode = jQuery('<div/>', {
        class: 'blip',
        style: 'left: ' + blipPositionLeft + 'px; top: ' + blipPositionTop + 'px; height: ' + blipWidth + 'px; width: ' + blipWidth + 'px;' + 'line-height: ' + blipWidth + 'px;',
        text: blipLetter });

    domNode.append(blipNode);
    self = this;
    // animate( end-conditions, duration in milliseconds, end-state call-back )
    blipNode.animate(
      {
        opacity: '=0.0',
        top:     '+=' + blipDistance,
        width:   'toggle',
        height:  'toggle',
      }, 
      blipDuration, 
      function() {
        $(this).remove();
        self.blipManager.done();
      }
    );
  };
    
});

var BlipManager = ( function(maxNumberOfBlips, domNodeParent) {
  var _maxNumberOfBlips         = maxNumberOfBlips;
  var _domNodeParent            = $(domNodeParent);
  
  // initial state
  var _numberOfBlips            = 0;
  var _running                  = false;
  
  // constraints for the blip of light  
  var _minimumLetterDuration    = 3000;
  var _minimumLetterWidth       = 30;
  var _minimumBlipWidth         = 1;
  var _maximumBlipWidth         = 40;
  var _minimumBlipDistance      = 100;
  var _maximumBlipDuration      = 10000;
  var _footerHeight             = 60;
  var _AInAscii                 = 65;
  var _emptyBlipCharacter       = '';
  var _lettersInAlphabet        = 26;
  
  // done - called by blip of light when its journey is done
  this.done = function(){
    _numberOfBlips--;
    this._create();
  }
  
  // pause - user calls to pause blips
  this.pause = function(){
    this._setPauseButton();
    this._setRunning(false);
  }
  
  // resume - user calls to resume blips
  this.resume = function(){
    this._setResumeButton();
    this._setRunning(true);
    this.init();  
  }
  
  // running - are blips running or not?
  this.isRunning = function(){
    return _running;
  }

  // start - start the blips; will honor the previous session's state
  this.init = function(){
    this._getRunning();
    this._setRunning(_running);
    if(_running){
      this._setResumeButton();
      for(var blip = _numberOfBlips; blip < _maxNumberOfBlips; blip++)
      {
        this._create();    
      }    
    } else {
      this._setPauseButton();
    }
  }

  // private methods
  
  // create - create a new blip of light
  this._create = function(){
    if(_running && (_numberOfBlips <= _maxNumberOfBlips))
    {
      _numberOfBlips++;
      var blipDistance      = -1;
      var blipPositionLeft  = 0;
      var blipPositionTop   = 0;
      var blipDuration      = 0;
      var blipLetter        = _emptyBlipCharacter;
      var blipWidth         = _minimumBlipWidth - 1;
      
      while(blipDistance < _minimumBlipDistance)
      {
        blipPositionLeft  = $(window).width() * Math.random();
        blipPositionTop   = $(window).height() * Math.random();
        blipDuration      = _maximumBlipDuration * Math.random();
        blipDistance      = $(window).height() - (blipPositionTop + _footerHeight);
        blipWidth         = _maximumBlipWidth * Math.random();
      }
      
      if(blipDuration >= _minimumLetterDuration && blipWidth >= _minimumLetterWidth ){
        ascii_code = _AInAscii + Math.floor(_lettersInAlphabet * Math.random());
        blipLetter = String.fromCharCode(ascii_code); 
      }
      
      blipLight = new BlipLight(this);
      blipLight.animate(_domNodeParent, blipPositionLeft, blipPositionTop, blipDuration, blipDistance, blipWidth, blipLetter);
    }      
  };  
  
  this._setPauseButton = function(){
    $('#blipManager').html("<i class='icon-play'></i>");
  }
  
  this._setResumeButton = function(){
    $('#blipManager').html("<i class='icon-pause'></i>");
  }  
  this._setRunning = function(isRunning){
    _running = isRunning;
    $.cookie("blipManagerRunning", isRunning);
  }

  this._getRunning = function(){
    _running = $.cookie("blipManagerRunning") == 'true' ? true : false;
  }
  
});