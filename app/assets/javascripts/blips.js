var BlipLight = (function (blipManager) {
  this.blipManager      = blipManager;
  this.isClicked        = true;
  
  this.animate = function(domNode, blipPositionLeft, blipPositionTop, blipDuration, blipDistance, blipWidth, blipLetter){    
    blipNode = jQuery('<div/>', {
        class: 'blip',
        style: 'left: ' + blipPositionLeft + 'px; top: ' + blipPositionTop + 'px; height: ' + blipWidth + 'px; width: ' + blipWidth + 'px; line-height: ' + (blipWidth-10) + 'px; font-size: ' + (blipWidth-15) + 'px;',
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
        isRight = self.blipManager.answer($(this).html());
        if(isRight){
          $(this).addClass('right');
        } else {
          $(this).addClass('wrong');          
        }
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
        lineHeight: 'toggle',
        fontSize: 'toggle',
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
  var _level                    = 1;
  
  this.loadLevel = function(level){
    _level = level;
    _questionsAnswered = 0;
    $.ajax({
      dataType: "json",
      url: '/question_answers.json',
      data: {level: _level},
      success: function(data){
        _question_answer_pairs = data;
        _total = _question_answer_pairs.length;
        $('#level').html(_level); 
        $('#score').html(_score); 
        $('#right').html(_right); 
        $('#wrong').html(_wrong); 
        $('#total').html(_total); 
        if(_question_answer_pairs.length == 0){
          $('#question').html('');          
        } else {
          $('#question').html(_question_answer_pairs[_questionsAnswered].question + '?');                    
        }
        _blipManager.init();
      }
    });
  }
    
  $('#erase').click(function(){
    _blipManager.erase();
  });
  
  $('#next').click(function(){
    this.next();
  });
  
  $('#levels .level').click(function(){
    _blipManager.loadLevel($(this).data('level'));
  });
  
  $('body').keyup(function(e){
    if(e.keyCode == 39){
      _blipManager.next();
    }
    if(e.keyCode == 8){
      _blipManager.erase();
    }
    if(e.keyCode == 32){
      _blipManager.toggle();
    }
  });
  
  // initial state
  var _numberOfBlips            = 0;
  var _running                  = false;
  
  // constraints for the blip of light  
  var _minimumLetterDuration    = 5000;
  var _minimumLetterWidth       = 40;
  var _minimumBlipWidth         = 20;
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
  
  this.loadLevel(_level);
  
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
  this.toggle = function(){
    if(_running){
      this.pause();
    } else {
      this.resume();      
    }
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
  
  this.erase = function(){
    $('#answer').html('');
    $('#status').html('&nbsp;');
    $('.selected').fadeOut(500).remove();
  }
  
  this.next = function(){
    this.nextQuestion();
    this._score(_pointsPerWordWrong);
    this._wrongAnswer();
    $('#answer').html('');
    $('#status').html('&nbsp;');
    $('.selected').fadeOut(500).hide();    
  }
  
  this.nextQuestion = function(){
    _questionsAnswered++;
    if(_questionsAnswered < _question_answer_pairs.length){
      $('#status').show().html('&nbsp');
      $('.selected').fadeOut(500).remove();
      $('#answer').show().html('&nbsp;');
      $('#question').html(_question_answer_pairs[_questionsAnswered].question + '?');      
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
    answer = _question_answer_pairs[_questionsAnswered].answer;
    player_answer = $('#answer').html();
    regex = RegExp('^' + player_answer + '.*$','i');
    if(player_answer == answer){
      $('#status').show().html('yatzhee.');
      this._score(parseInt(_question_answer_pairs[_questionsAnswered].bonus));
      this._score(parseInt(_question_answer_pairs[_questionsAnswered].answer_score));
      _right++;
      $('#right').html(_right);
      this.nextQuestion();
      return true;
    } else if(answer.match(regex)){
      this._score(_pointsPerLetterRight);
      return true;
    } else {
      this._score(_pointsPerLetterWrong);
      $('#status').show().html('huh?');
      $('#status').delay(1000).fadeOut(1000).delay(10).show();      
      return false;
    }
  };
  
  this._wrongAnswer = function(){
    _wrong++;
    $('#wrong').html(_wrong);
  }
  
  this._rightAnswer = function(){
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
    $('#blips').fadeOut(300);
    $('#levels').delay(300).fadeIn(300);
  }
  
  this._setResumeButton = function(){
    $('#blipManager').html("<i class='icon-pause'></i>");
    $('#levels').fadeOut(300);
    $('#blips').delay(300).fadeIn(300);
  }  
  this._setRunning = function(isRunning){
    _running = isRunning;
    $.cookie("blipManagerRunning", isRunning);
  }

  this._getRunning = function(){
    _running = $.cookie("blipManagerRunning") == 'true' ? true : false;
  }
  
});