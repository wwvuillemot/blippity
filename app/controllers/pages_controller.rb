class PagesController < ApplicationController
  
  def index
    @title = "welcome"
  end

  def about
    @title = "about"
  end
  
end