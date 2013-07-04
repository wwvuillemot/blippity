class GamesController < ApplicationController
  
  before_filter :authenticate_user!
  
  def play
    @title = "play"
    @levels = Level.order('level asc')
  end
  
  def blips
    @title = "blips"
    @levels = Level.order('level asc')
  end
    
  def blops
    @title = "blops"
    @levels = Level.order('level asc')
  end

  def cocos
    @title = "cocos"
  end

  def ghost
    @title = "ghost"
  end

end