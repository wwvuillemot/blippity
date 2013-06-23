class GamesController < ApplicationController
  
  before_filter :authenticate_user!
  
  def play
    @title = "welcome"
  end

end