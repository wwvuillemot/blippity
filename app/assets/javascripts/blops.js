var BlipLight = (function (blopManager) {
  this.blopManager      = blopManager;
  this.isClicked        = true;
  
  this.animate = function(domNode, blopPositionLeft, blopPositionTop, blopDuration, blopDistance, blopWidth, blopLetter, blopLevel){    
    blopNode = jQuery('<div/>', {
        class: 'blop level' + blopLevel,
        style: 'left: ' + blopPositionLeft + 'px; top: ' + blopPositionTop + 'px; height: ' + blopWidth + 'px; width: ' + blopWidth + 'px; line-height: ' + (blopWidth-10) + 'px; font-size: ' + (blopWidth-15) + 'px;',
        text: blopLetter });
        

    self = this;

    if (blopLetter.length == 1)
    {
      var mouseLeave = null;
      blopNode.mouseenter(function(){
        if(mouseLeave){
          clearTimeout( mouseLeave );          
        }
        $(this).addClass('hovered');
        $(this).stop();
      });
      blopNode.mouseleave(function(){
        if(!this.isClicked){
          blop = this;
          mouseLeave = setTimeout(function () { 
            $(blop).removeClass('hovered');
            $(blop).fadeOut(500).remove();
          }, 500);          
        }      
      });
      blopNode.click(function(){
        this.isClicked = true;
        $(this).removeClass('hovered');
        $(this).addClass('clicked');
        $(this).stop();
        isRight = self.blopManager.answer($(this).html());
        if(isRight){
          $(this).addClass('right');
        } else {
          $(this).addClass('wrong');          
        }
      });
    }
    
    domNode.append(blopNode);
    // animate( end-conditions, duration in milliseconds, end-state call-back )
    blopNode.animate(
      {
        opacity: '=0.0',
        top:     '+=' + blopDistance,
        width:   'toggle',
        height:  'toggle',
        lineHeight: 'toggle',
        fontSize: 'toggle',
      }, 
      blopDuration, 
      function() {
        $(this).remove();
        self.blopManager.done();
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
    
  var _blopManager              = this;
  var _level                    = $.cookie("blopLevel") != null ? $.cookie("blopLevel") : 1;
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
  
  // constraints for the blop of light  
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
    
    $.cookie("blopLevel", _level);
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
        $('.blop').remove();
                        
        _blopManager._loadLevelQuestionAnswers(level);
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
          _blopManager._setQuestionAnswer();
        }
        
        _blopManager._start();
      }
    });
  }
    
  $('#erase').click(function(){
    _blopManager.erase();
  });
  
  $('#next').click(function(){
    this.next();
  });
  
  $('#levels .level').click(function(){
    $('#levels .level').removeClass('selected');
    $(this).addClass('selected');
    _blopManager.loadLevel($(this).data('level'));
  });
  
  $('body').keyup(function(e){
    if(e.keyCode == 39){
      _blopManager.next();
    }
    if(e.keyCode == 8){
      _blopManager.erase();
    }
    if(e.keyCode == 32){
      _blopManager.toggle();
    }
  });
  
  this.loadLevel(_level);
  
  // -------------------------------------------------------
  // END CLASS CONFIGURATION
  // -------------------------------------------------------
  
  // -------------------------------------------------------
  // PUBLIC METHODS
  // -------------------------------------------------------

  // done - called by blop of light when its journey is done
  this.done = function(){
    _numberOfBlips--;
    this._create();
  }
  
  // pause - user calls to pause blops
  this.pause = function(){
    this._setPauseButton();
    this._setRunning(false);
    this._setControls();
  }
  
  // resume - user calls to resume blops
  this.resume = function(){
    this._setResumeButton();
    this._setRunning(true);
    this._start();  
  }
  
  // running - are blops running or not?
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
    $('.blop').fadeOut(500).remove();
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
          _blopManager.pause(); 
          _level++;
          _blopManager.loadLevel(_level); 
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

  // start - start the blops; will honor the previous session's state
  this._start = function(){
    this._getRunning();
    this._setRunning(_running);
    this._setControls();
    if(_running){
      this._setResumeButton();
      for(var blop = _numberOfBlips; blop < _maxNumberOfBlips; blop++)
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
  
  // create - create a new blop of light
  this._create = function(){
    if(_running && (_numberOfBlips <= _maxNumberOfBlips))
    {
      _numberOfBlips++;
      var blopDistance      = -1;
      var blopPositionLeft  = 0;
      var blopPositionTop   = 0;
      var blopDuration      = 0;
      var blopLetter        = _emptyBlipCharacter;
      var blopWidth         = _minimumBlipWidth - 1;
      
      while(blopDistance < _minimumBlipDistance)
      {
        blopPositionLeft  = $(window).width() * Math.random();
        blopPositionTop   = $(window).height() * Math.random();
        blopDuration      = _maximumBlipDuration * Math.random();
        blopDistance      = $(window).height() - (blopPositionTop + _footerHeight);
        blopWidth         = _maximumBlipWidth * Math.random();
      }
      
      if(blopDuration >= _minimumLetterDuration && blopWidth >= _minimumLetterWidth ){
        // determine the character to show
        // increasing reveal less and less
        probability_of_selecting_answer_character = (0.50 / _level);
        roll_of_dice = Math.random();
        if(probability_of_selecting_answer_character <= roll_of_dice ){
          player_answer = $('#answer').html();
          blopLetter = _characters[player_answer.length];
        }else{          
          ascii_code = _AInAscii + Math.floor(_lettersInAlphabet * Math.random());
          blopLetter = String.fromCharCode(ascii_code); 
        }
      }
      
      blopLight = new BlipLight(this);
      blopLight.animate(_domNodeParent, blopPositionLeft, blopPositionTop, blopDuration, blopDistance, blopWidth, blopLetter, _level);
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
    $('#blopManager').html("<i class='icon-play'></i>");
    $('#blops').fadeOut(300);
    $('#levels').delay(300).fadeIn(300);
  }
  
  this._setResumeButton = function(){
    $('#blopManager').html("<i class='icon-pause'></i>");
    $('#levels').fadeOut(300);
    $('#blops').delay(300).fadeIn(300);
  }  
  this._setRunning = function(isRunning){
    _running = isRunning;
    $.cookie("blopManagerRunning", isRunning);
  }

  this._getRunning = function(){
    _running = $.cookie("blopManagerRunning") == 'true' ? true : false;
  }
  
});