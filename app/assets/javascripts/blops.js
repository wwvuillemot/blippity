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
        $(this).addClass('clicked');
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

  // -------------------------------------------------------
  // START CLASS CONFIGURATION
  // -------------------------------------------------------
    
  var _blipManager              = this;
  var _level                    = $.cookie("blipLevel") != null ? $.cookie("blipLevel") : 1;
  var _lastevel                 = 3;
  var _startLevel               = 1;
  
  // per level points
  var _pointsPerLetterRight      = 20;
  var _pointsPerLetterWrong      = -10;
  var _pointsPerWordRight        = 40;
  var _pointsPerWordWrong        = -30;
  var _pointPerClear             = -20;

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
  
  var _question                 = '';
  var _answer                   = '';
  var _characters               = '';
  
  var _questionsAnswered        = 0;
  var _score                    = 0;
  var _total                    = 0;
  var _right                    = 0;
  var _wrong                    = 0;
      
  this.loadLevel = function(level){
    _level = level;
    if(_level > _lastevel){
      _level = _startLevel;
    }
    
    $.cookie("blipLevel", _level);
    $('#levels .level').removeClass('selected');
    $('#levels .level[data-level="' + _level + '"]' ).addClass('selected');
    
    _questionsAnswered = 0;
    $.ajax({
      dataType: "json",
      url: '/levels/' + _level + '.json',
      success: function(data){
        level_points = data;
        
        _pointsPerLetterRight      = level_points.points_per_letter_right;
        _pointsPerLetterWrong      = level_points.points_per_letter_wrong;
        _pointsPerWordRight        = level_points.points_per_word_right;
        _pointsPerWordWrong        = level_points.points_per_word_wrong;
        _pointPerClear             = level_points.points_per_clear;

        _questionsAnswered        = 0;
        _score                    = 0;
        _total                    = 0;
        _right                    = 0;
        _wrong                    = 0;
        
        $('#question').html(''); 
        $('#answer').html(''); 
        $('#level').html(_level); 
        $('#score').html(_score); 
        $('#right').html(_right); 
        $('#wrong').html(_wrong); 
        $('.blip').remove();
                        
        _blipManager._loadLevelQuestionAnswers(level);
      }
    });
  }
    
  this._loadLevelQuestionAnswers = function(level){
    _level = level;
    _questionsAnswered = 0;
    $.ajax({
      dataType: "json",
      url: '/levels/' + _level + '/question_answers.json',
      success: function(data){
        _question_answer_pairs = data;

        _total = _question_answer_pairs.length;
        $('#total').html(_total); 

        if(_question_answer_pairs.length > 0){
          _blipManager._setQuestionAnswer();
        }
        
        _blipManager._start();
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
    $('#levels .level').removeClass('selected');
    $(this).addClass('selected');
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
  
  this.loadLevel(_level);
  
  // -------------------------------------------------------
  // END CLASS CONFIGURATION
  // -------------------------------------------------------
  
  // -------------------------------------------------------
  // PUBLIC METHODS
  // -------------------------------------------------------

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
    this._start();  
  }
  
  // running - are blips running or not?
  this.toggle = function(){
    if(_running){
      this.pause();
    } else {
      this.resume();      
    }
  }
  
  this.erase = function(){
    $('#answer').html('');
    $('#status').html('&nbsp;');
    $('.blip').fadeOut(500).remove();
  }
  
  this.next = function(){
    this.nextQuestion();
    this._score(_pointsPerWordWrong);
    this._wrongAnswer();
    $('#answer').html('');
    $('#status').html('&nbsp;');
    $('.clicked').fadeOut(500).hide();    
  }
  
  this._setQuestionAnswer = function(){
    _question   = _question_answer_pairs[_questionsAnswered].question;
    _answer     = _question_answer_pairs[_questionsAnswered].answer;
    _characters = _answer.split('');
    $('#question').html(_question + '?');    
  }
  
  this.nextQuestion = function(){
    _questionsAnswered++;
    if(_questionsAnswered < _question_answer_pairs.length){
      this._setQuestionAnswer();
      $('#status').show().html('&nbsp');
      $('.clicked').fadeOut(500).remove();
      $('#answer').show().html('');
      $('#question').html(_question + '?');      
    }
    else
    {
      _questionsAnswered = 0;
      $('.clicked').fadeOut(500).remove();
      $('#answer').fadeOut(500).show();
      $('#controls').fadeOut(500);
      $('#status').fadeIn(1000).html("there aint no more.").delay(500).fadeOut(300).html('').show();
      $('#question').hide().fadeIn(3000).html('fin.');
      setTimeout( 
        function(){ 
          _blipManager.pause(); 
          _level++;
          _blipManager.loadLevel(_level); 
        }, 
        3500
      );
    }
  }  
  
  this.answer = function(letter){
    $('#answer').append(letter);
    player_answer = $('#answer').html();
    regex = RegExp('^' + player_answer + '.*$','i');
    if(player_answer == _answer){
      $('#status').show().html('yatzhee.');
      this._score(parseInt(_question_answer_pairs[_questionsAnswered].bonus));
      this._score(parseInt(_question_answer_pairs[_questionsAnswered].score));
      _right++;
      $('#right').html(_right);
      this.nextQuestion();
      return true;
    } else if(_answer.match(regex)){
      this._score(_pointsPerLetterRight);
      return true;
    } else {
      this._score(_pointsPerLetterWrong);
      $('#status').show().html('huh?');
      $('#status').delay(1000).fadeOut(1000).delay(10).show();      
      return false;
    }
  };

  // -------------------------------------------------------
  // PRIVATE METHODS
  // -------------------------------------------------------

  // start - start the blips; will honor the previous session's state
  this._start = function(){
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
        // determine the character to show
        // increasing reveal less and less
        probability_of_selecting_answer_character = (0.50 / _level);
        roll_of_dice = Math.random();
        if(probability_of_selecting_answer_character <= roll_of_dice ){
          player_answer = $('#answer').html();
          blipLetter = _characters[player_answer.length];
        }else{          
          ascii_code = _AInAscii + Math.floor(_lettersInAlphabet * Math.random());
          blipLetter = String.fromCharCode(ascii_code); 
        }
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