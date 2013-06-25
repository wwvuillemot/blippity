var BlipLight = (function (blipManager) {
  this.blipManager      = blipManager;
  this.isClicked        = true;
  
  this.animate = function(domNode, blipPositionLeft, blipPositionTop, blipDuration, blipDistance, blipWidth, blipLetter){    
    blipNode = jQuery('<div/>', {
        class: 'blip',
        style: 'left: ' + blipPositionLeft + 'px; top: ' + blipPositionTop + 'px; height: ' + blipWidth + 'px; width: ' + blipWidth + 'px;' + 'line-height: ' + blipWidth + 'px;',
        text: blipLetter });

    self = this;

    if (blipLetter.length == 1)
    {
      var mouseLeave = null;
      blipNode.mouseenter(function(){
        if(mouseLeave){
          clearTimeout( mouseLeave );          
        }
        $(this).addClass('hovered');
        $(this).stop();
      });
      blipNode.mouseleave(function(){
        if(!this.isClicked){
          blip = this;
          mouseLeave = setTimeout(function () { 
            $(blip).removeClass('hovered');
            $(blip).fadeOut(500).remove();
          }, 500);          
        }      
      });
      blipNode.click(function(){
        this.isClicked = true;
        $(this).removeClass('hovered');
        $(this).addClass('selected');
        $(this).stop();
        self.blipManager.answer($(this).html());
      });
    }
    
    domNode.append(blipNode);
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
  var _questionsAnswered        = 0;
  var _score                    = 0;
  var _total                    = 0;
  var _right                    = 0;
  var _wrong                    = 0;
  var _blipManager              = this;
  
  var _pairs = [
      {  question: 'foo',
         answer: 'bar'
      },
      {  question: 'marco',
         answer: 'polo'
      },
    ];
    
  _total = _pairs.length;
  
  $('#score').html(_score); 
  $('#right').html(_right); 
  $('#wrong').html(_wrong); 
  $('#total').html(_total); 

  $('#erase').click(function(){
    $('#answer').html('');
    $('#status').html('&nbsp;');
    $('.selected').fadeOut(500).remove();
  });
  
  $('#next').click(function(){
    _blipManager.nextQuestion();
    _wrong++;
    _blipManager._score(_pointsPerWordWrong);
    $('#wrong').html(_wrong);
    $('#answer').html('');
    $('#status').html('&nbsp;');
    $('.selected').fadeOut(500).hide();
  });
  
  
  $('#question').html(_pairs[_questionsAnswered].question + '?');
  
  // initial state
  var _numberOfBlips            = 0;
  var _running                  = false;
  
  // constraints for the blip of light  
  var _minimumLetterDuration    = 5000;
  var _minimumLetterWidth       = 40;
  var _minimumBlipWidth         = 1;
  var _maximumBlipWidth         = 60;
  var _minimumBlipDistance      = 100;
  var _maximumBlipDuration      = 10000;
  var _footerHeight             = 60;
  var _AInAscii                 = 97;
  var _emptyBlipCharacter       = '';
  var _lettersInAlphabet        = 26;
  
  var _pointsPerLetterRight      = 20;
  var _pointsPerLetterWrong      = -10;
  var _pointsPerWordRight        = 40;
  var _pointsPerWordWrong        = -30;
  var _pointPerClear             = -20;
  
  // done - called by blip of light when its journey is done
  this.done = function(){
    _numberOfBlips--;
    this._create();
  }
  
  // pause - user calls to pause blips
  this.pause = function(){
    this._setPauseButton();
    this._setRunning(false);
    this._setControls();
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
    this._setControls();
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
  
  this.nextQuestion = function(){
    _questionsAnswered++;
    if(_questionsAnswered < _pairs.length){
      $('#status').show().html('&nbsp');
      $('.selected').fadeOut(500).remove();
      $('#answer').show().html('&nbsp;');
      $('#question').html(_pairs[_questionsAnswered].question + '?');      
    }
    else
    {
      _questionsAnswered = 0;
      $('#answer').fadeOut(500);
      $('#next').fadeOut(500);
      $('#erase').fadeOut(500);
      $('#status').fadeIn(1000).html("there aint no more.");
      $('#question').hide().fadeIn(5000).html('fin.');
      this.pause();
    }
  }  
  
  this.answer = function(letter){
    $('#answer').append(letter);
    answer = _pairs[_questionsAnswered].answer;
    player_answer = $('#answer').html();
    regex = RegExp(player_answer + '.*','i');
    if(player_answer == answer){
      $('#status').show().html('yatzhee.');
      this._score(_pointsPerWordRight);
      _right++;
      $('#right').html(_right);
      this.nextQuestion();
    } else if(answer.match(regex)){
      this._score(_pointsPerLetterRight);
    } else {
      this._score(_pointsPerLetterWrong);
      $('#status').show().html('huh?');
      $('#status').delay(1000).fadeOut(1000).delay(10).show();      
    }
  };
  
  this._right = function(){
    _right++;
    $('#right').html(_right);
  }
  this._score = function(incrementScore)
  {
    _score += incrementScore
    $('#score').html(_score);
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
  
  this._setControls = function(){
    if(_running){
      $('#controls').show();
    }
    else{
      $('#controls').hide();
    }
  }
  
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