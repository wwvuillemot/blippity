class GamesController < ApplicationController
  
  before_filter :authenticate_user!
  
  def play
    @title = "welcome"
    @levels = Level.order('level asc')
  end

end