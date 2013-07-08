var resource_directory = "/ghost/res/";

var res_player         = resource_directory + "player.png";
var res_monster        = resource_directory + "monster.png";
var res_projectile     = resource_directory + "projectile.png";

var sounds_directory   = "/ghost/snd/";
  
var snd_bgMusic        = sounds_directory + "background-music.mp3";
var snd_bgMusicOgg     = sounds_directory + "background-music.ogg";
// var snd_bgMusicCaf     = sounds_directory + "background-music.caf";
 
var snd_shootEffect    = sounds_directory + "pew-pew-lei.mp3";
var snd_shootEffectOgg = sounds_directory + "pew-pew-lei.ogg";
var snd_shootEffectWav = sounds_directory + "pew-pew-lei.wav";

var g_resources = [
 
    {type:"image", src:res_player},
    {type:"image", src:res_monster},
    {type:"image", src:res_projectile},
    
    {type:"sound", src:snd_bgMusic},
    {type:"sound", src:snd_bgMusicOgg},
    // {type:"sound", src:snd_bgMusicCaf},
 
    {type:"sound", src:snd_shootEffect},
    {type:"sound", src:snd_shootEffectOgg},
    {type:"sound", src:snd_shootEffectWav},    
 
];
