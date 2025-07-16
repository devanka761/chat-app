# KIRIMIN PROPERTIES

## MODAL
```html
<div class="modal">
  <div class="box">
    <div class="icons">
      <i class="fa-duotone fa-circle-exclamation"></i>
    </div>
    <div class="messages">
      <p><label for="prompt-field">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione, officia.</label></p>
      <input type="text" name="prompt-field" id="prompt-field" autocomplete="off" maxlength="300" placeholder="Tulis di sini" />
    </div>
    <div class="actions">
      <div class="btn btn-cancel" role="button">BATAL</div>
      <div class="btn btn-ok" role="button">OK</div>
    </div>
  </div>
</div>
```

## LOADING
```html
<div class="loading">
  <div class="box">
    <div class="spinner">
      <i class="fa-solid fa-spinner"></i>
    </div>
    <p>LOADING</p>
  </div>
</div>
```

## NOTIP
```html
<div class="notip g y r rb">
  <div class="detail">
    <div class="icon">
      <i class="fa-solid fa-comment-dots"></i>
      <img src="./assets/user.jpg" alt="user" width="44"/>
    </div>
    <div class="text">
      <div class="top">Rudi02</div>
      <div class="bottom">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero, nemo?</div>
    </div>
  </div>
  <div class="close">
    <div class="btn"><i class="fa-solid fa-x"></i></div>
  </div>
</div>
```

## CALLNOTIP
```html
<div class="callnotip ignored">
  <div class="box">
    <div class="caller">
      <div class="img">
        <img src="./assets/user.jpg" alt="user"/>
      </div>
      <div class="name">
        <div class="displayname">Display Name</div>
        <div class="username">@username</div>
      </div>
    </div>
    <div class="calltype fa-bounce" style="--fa-animation-duration:4s">
      <p><i class="fa-solid fa-video fa-shake" style="--fa-animation-duration:2s"></i> <span>Incoming Video Call</span></p>
    </div>
    <div class="callactions">
      <div class="btn btn-decline"><i class="fa-solid fa-phone-hangup fa-fw"></i> Decline</div>
      <div class="btn btn-answer"><i class="fa-solid fa-phone fa-fw"></i> Answer</div>
    </div>
    <div class="callaction">
      <div class="btn btn-ignore">Ignore</div>
    </div>
  </div>
</div>
```