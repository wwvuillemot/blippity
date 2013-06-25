Blippity::Application.routes.draw do
  resources :question_answers


  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }
  
  match '/play', :to => 'games#play'

  match '/about', :to => 'pages#about'
  root :to => 'pages#index'
end
