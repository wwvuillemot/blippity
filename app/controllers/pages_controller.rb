class PagesController < ApplicationController
  before_filter :authenticate_user!, :except => [:index]
  
  def index
    @title = "Welcome"
  end
  
end