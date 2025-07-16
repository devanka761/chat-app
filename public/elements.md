# KIRIMIN MAIN ELEMENTS

## SIGN IN
```html
<div class="fuwi sign">
  <div class="card">
    <div class="title">
      <h1><img src="./assets/kirimin_icon.png" alt="Kirimin" width="50"/> KIRIMIN</h1>
    </div>
    <div class="language">
      <div class="btn btn-lang">Language<i class="fa-regular fa-chevron-down"></i></div>
    </div>
    <form class="form" action="/login" method="post">
      <div class="field">
        <div class="center note">
          <p>Login to continue</p>
        </div>
      </div>
      <div class="field">
        <div class="input">
          <div class="text">
            <p><label for="email">Email:</label></p>
          </div>
          <input type="email" name="email" id="email" autocomplete="email" placeholder="example@example.com" required/>
        </div>
        <div class="input">
          <div class="text">
            <p><label for="code">6 Digits Code</label></p>
            <div class="btn"><i class="fa-duotone fa-circle-question"></i></div>
          </div>
          <input type="number" class="code" name="code" id="code" min="0" max="999999" placeholder="------" required />
        </div>
      </div>
      <div class="field">
        <button type="submit">LOGIN</button>
      </div>
      <div class="field">
        <div class="oldschool">
          <p class="center"><a href="#old-provider">My previous login method was Google - GitHub - Facebook. <span>Can I still login with any of them?</span></a></p>
        </div>
      </div>
    </form>
  </div>
</div>
```

## PM
### PM - OUTER
```html
<div class="fuwi pm">
  <div class="appname"></div>
  <div class="nav"></div>
  <div class="chats"></div>
  <div class="content"></div>
</div>
```

### PM - APPNAME
```html
<div class="appname">
  <div class="title">KIRIMIN</div>
  <div class="actions">
    <div class="btn btn-find"><i class="fa-solid fa-magnifying-glass"></i></div>
    <div class="btn btn-settings"><i class="fa-solid fa-gear"></i></div>
  </div>
</div>
```

### PM - NAV
```html
<div class="nav">
  <div role="button" class="btn">
    <i class="fa-solid fa-comment"></i>
    <p>Chats</p>
  </div>
  <div role="button" class="btn">
    <i class="fa-solid fa-phone"></i>
    <p>Calls</p>
  </div>
</div>
```

### PM - CHATS LIST
```html
<div class="chats">
  <div class="search">
    <p>Find Random User</p>
    <div class="btn"><i class="fa-solid fa-play"></i> Start Now</div>
  </div>
  <div class="search">
    <form action="/uwu/search-user" class="form">
      <p><label for="search_input">Find By Username</label></p>
      <input type="text" name="search_input" id="search_input" placeholder="Type Here" />
      <button class="btn"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
    </form>
  </div>
  <div class="search">
    <input type="text" name="card-input" id="card-input" placeholder="Type Here" />
  </div>
  <div class="card-list">
    <div class="freq">
      <div class="note">
        <p>Friend Requests:</p>
      </div>
      <div class="card">
        <div class="left">
          <div class="img">
            <img src="./assets/user.jpg" alt="user" width="50"/>
          </div>
          <div class="detail">
            <div class="name"><p>Devanka</p></div>
            <div class="last">Aowkwk</div>
          </div>
        </div>
        <div class="right">
          <div class="btn"><i class="fa-light fa-user"></i></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="left">
        <div class="img">
          <img src="./assets/user.jpg" alt="user" width="50"/>
        </div>
        <div class="detail">
          <div class="name"><p>Devanka</p></div>
          <div class="last">Aowkwk</div>
        </div>
      </div>
      <div class="right">
        <div class="last">11/12/24</div>
        <div class="unread">7</div>
      </div>
    </div>
  </div>
  <div class="btn global-btn">
    <i class="fa-solid fa-earth-asia"></i> <span>Global Chat</span>
  </div>
</div>
```
### PM - EMPTY
```html
<div class="empty">
  <div class="title">
    <div class="img">
      <img src="./assets/kirimin_icon.png" alt="Kirimin" width="75" />
    </div>
    <h1>KIRIMIN</h1>
  </div>
  <div class="desc">
    <p>Select a chat to start messaging</p>
  </div>
</div>
```
### PM - CONTENT
```html
<div class="content">
  <div class="top">
    <div class="left">
      <div class="btn back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="user">
        <div class="img">
          <img src="./assets/user.jpg" alt="user" width="30" />
        </div>
        <div class="name"><p>Devanka</p></div>
      </div>
    </div>
    <div class="right">
      <div class="btn">
        <i class="fa-solid fa-video"></i>
      </div>
      <div class="btn">
        <i class="fa-solid fa-phone"></i>
      </div>
      <div class="btn">
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </div>
    </div>
  </div>
  <div class="mid">
    <div class="chatlist">
      <div class="card long">
        <div class="chp sender">
          <div class="name">Devanka</div>
        </div>
        <div class="chp embed">
          <div class="name">Bukan Devanka</div>
          <div class="msg">
            <p><i class="fa-solid fa-image"></i> Ini pesan yang dibalas</p>
          </div>
        </div>
        <div class="chp attach">
          <div class="img">
            <img src="./assets/fivem_wp.jpg" alt="image"/>
          </div>
          <div class="document">
            <p>ini_file_apa_ya.txt</p>
          </div>
        </div>
        <div class="chp vc outgoing"> <!-- missed, rejected, incoming, outgoing -->
          <div class="vc-icon"></div>
          <div class="vc-message">
            <p>Voice Call</p>
            <p>2 min</p>
          </div>
        </div>
        <div class="chp text">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis facere amet eius dicta! Quibusdam tenetur minus saepe cum, officia reiciendis nam soluta fugit ab laboriosam, reprehenderit quidem. Explicabo, voluptates ducimus!</p>
        </div>
        <div class="chp time">
          <p>11:12 11/12/2024</p>
        </div>
      </div>
      <div class="card me">
        <div class="chp sender">
          <div class="name">Devanka</div>
        </div>
        <div class="chp text">
          <p>lorem ipsum</p>
        </div>
        <div class="chp time">
          <p>11:12 11/12/2024</p>
        </div>
      </div>
      <div class="card">
        <div class="chp sender">
          <div class="name">Devanka</div>
        </div>
        <div class="chp attach">
          <div class="voice">
            <div class="control">
              <div class="btn"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="range">
              <input type="range" name="chat_range_id" id="chat_range_id">
            </div>
            <div class="duration">
              <p>00:00</p>
            </div>
          </div>
        </div>
        <div class="chp time">
          <p>11:12 11/12/2024</p>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="embed">
      <div class="box">
        <div class="left">
          <p>Devanka</p>
          <p>Lorem ipsum dol ...</p>
        </div>
        <div class="right">
          <div class="btn"><i class="fa-duotone fa-circle-x"></i></div>
        </div>
      </div>
    </div>
    <div class="attach">
      <div class="media">
        <div class="img">
          <img src="./assets/fivem_wp.jpg" alt="Image" />
        </div>
        <div class="name"><p>fivem_wp.jpg</p></div>
        <!-- <div class="document">
          <p>fivem_wp.jpg</p>
        </div> -->
      </div>
      <div class="close"><div class="btn"><i class="fa-duotone fa-circle-x"></i></div></div>
    </div>

    <div class="field">
      <div class="input">
        <div class="emoji">
          <div class="btn btn-emoji">
            <i class="fa-solid fa-face-smile"></i>
          </div>
        </div>
        <div class="textbox">
          <textarea name="content-input" id="content-input" placeholder="Type Here"></textarea>
        </div>
        <div class="actions">
          <div class="btn btn-attach">
            <i class="fa-solid fa-paperclip"></i>
          </div>
          <div class="btn btn-image">
            <i class="fa-solid fa-camera-retro"></i>
          </div>
        </div>
      </div>
      <div class="voice">
        <div class="btn btn-voice">
          <i class="fa-solid fa-microphone"></i>
        </div>
      </div>
    </div>
  </div>
  <div class="chatpop">
    <div class="box">
      <div class="chats"></div>
      <div class="actions trio">
        <div class="btn btn-reply"><i class="fa-solid fa-reply"></i> REPLY</div>
        <div class="btn btn-edit"><i class="fa-solid fa-pen-to-square"></i> EDIT</div>
        <div class="btn btn-delete"><i class="fa-solid fa-trash-can"></i> DELETE</div>
        <div class="btn btn-cancel"><i class="fa-solid fa-circle-x"></i> CANCEL</div>
      </div>
    </div>
  </div>
  <div class="vrecorder">
    <div class="box">
      <div class="timestamp">hh:mm:dd</div>
      <div class="actions record">
        <!-- <div class="recording">
          <div class="btn-spinning"></div>
          <div class="btn-stop"><i class="fa-solid fa-paper-plane-top"></i></div>
        </div> -->
        <div class="btn btn-start"><i class="fa-solid fa-microphone-lines"></i></div>
      </div>
      <div class="actions">
        <div class="btn btn-cancel cr"><i class="fa-solid fa-x"></i></div>
        <div class="btn btn-restart cy"><i class="fa-solid fa-rotate-left"></i></div>
      </div>
    </div>
  </div>
</div>
```

### PM - PROFILE
```html
<div class="prof">
  <div class="top">
    <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
    <div class="sect-title">User Detail</div>
  </div>
  <div class="wall">
    <div class="chp img">
      <img src="./assets/user.jpg" alt="User" width="125" />
    </div>
    <div class="chp username"><p>rudi02</p></div>
    <div class="chp bio">
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt soluta velit explicabo temporibus et excepturi. Provident veritatis, sapiente, perferendis explicabo repudiandae quo, perspiciatis tenetur facilis consectetur aperiam culpa magni consequatur!</p>
    </div>
    <div class="chp actions">
      <div class="btn"><i class="fa-solid fa-comment-dots"></i><p>Open Chat</p></div>
      <div class="btn"><i class="fa-solid fa-phone"></i><p>Voice Call</p></div>
      <div class="btn"><i class="fa-solid fa-video"></i><p>Video Call</p></div>
    </div>
    <div class="chp options">
      <div class="btn sb"><i class="fa-solid fa-user-plus"></i> Add Friend</div>
      <div class="btn sg"><i class="fa-solid fa-user-check"></i> Accept Friend Request</div>
      <div class="btn sr"><i class="fa-solid fa-user-xmark"></i> Deny Friend Request</div>
      <div class="note sy">Your Friend Request Has Been Sent</div>
      <div class="btn sr"><i class="fa-solid fa-user-xmark"></i> Cancel Friend Request</div>
      <div class="btn sr"><i class="fa-solid fa-user-minus"></i> Unfriend</div>
    </div>
  </div>
</div>
```
### PM - ACCOUNT
```html
<div class="acc">
  <div class="top">
    <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
    <div class="sect-title">Settings</div>
  </div>
  <div class="wall">
    <div class="chp userphoto">
      <div class="outer-img">
        <img src="./assets/user.jpg" alt="user" width="150" />
        <div class="btn"><i class="fa-solid fa-pen-to-square"></i></div>
      </div>
    </div>
    <div class="chp userid">
      <div class="outer">
        <div class="chp-t">ID</div>
        <div class="chp-f"><p>761761</p></div>
      </div>
    </div>
    <div class="chp username">
      <div class="outer">
        <div class="chp-t">Username</div>
        <div class="chp-f"><p>@dvnkz_</p></div>
        <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
      </div>
    </div>
    <div class="chp userdisplayname">
      <div class="outer">
        <div class="chp-t">Display Name</div>
        <div class="chp-f"><p>Deva Krista Aranda</p></div>
        <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
      </div>
    </div>
    <div class="chp userbio">
      <div class="outer">
        <div class="chp-t">About</div>
        <div class="chp-f">
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestiae nisi odio id veniam reprehenderit earum praesentium animi quam, expedita similique?</p>
        </div>
        <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
      </div>
    </div>
    <div class="chp useremail">
      <div class="outer">
        <div class="chp-t">Email</div>
        <div class="chp-f"><p>contoh@example.com</p></div>
        <div class="chp-n"><p>*other user cannot see this information</p></div>
      </div>
    </div>
    <div class="chp userlang">
      <div class="outer">
        <div class="chp-t">Language</div>
        <div class="chp-f"><p>Bahasa Indonesia</p></div>
        <div class="chp-e btn-lang">Change Language <i class="fa-solid fa-chevron-down"></i></div>
      </div>
    </div>
    <div class="chp usersign">
      <p><a href="/auth/logout"><i class="fa-light fa-triangle-exclamation"></i> LOG OUT</a></p>
    </div>
  </div>
</div>
```
### PM - GROUP SETTING
```html
<div class="acc">
  <div class="top">
    <div class="btn"><i class="fa-solid fa-arrow-left"></i></div>
    <div class="sect-title">Groups</div>
  </div>
  <div class="wall">
    <div class="chp userphoto">
      <div class="outer-img">
        <img src="./assets/group.jpg" alt="user" width="150" />
        <div class="btn"><i class="fa-solid fa-pen-to-square"></i></div>
      </div>
    </div>
    <div class="chp groupname">
      <div class="outer">
        <div class="chp-t">Group Name</div>
        <div class="chp-f"><p>Deva Krista Aranda</p></div>
        <div class="chp-e"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
      </div>
    </div>
    <div class="chp groupid">
      <div class="outer">
        <div class="chp-t">Group ID</div>
        <div class="chp-f"><p>62989231</p></div>
      </div>
    </div>
    <div class="chp grouptype">
      <div class="outer">
        <div class="chp-t">Visibility</div>
        <div class="chp-f"><p>Private</p></div>
        <div class="chp-e btn-lang">Change Language <i class="fa-solid fa-chevron-down"></i></div>
      </div>
    </div>
    <div class="chp groupmember">
      <div class="outer">
        <div class="chp-t">Members</div>
        <div class="chp-u">
          <ul>
            <li>
              <div class="left">
                <img src="./assets/user.jpg" alt="user" width="30" />
                <p class="uname">username</p>
              </div>
              <div class="right">
                <div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div>
              </div>
            </li>
            <li>
              <div class="left">
                <img src="./assets/user.jpg" alt="user" width="30" />
                <p class="uname">username</p>
              </div>
              <div class="right">
                <div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div>
              </div>
            </li>
            <li>
              <div class="left">
                <img src="./assets/user.jpg" alt="user" width="30" />
                <p class="uname">username</p>
              </div>
              <div class="right">
                <div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div>
              </div>
            </li>
            <li>
              <div class="left">
                <img src="./assets/user.jpg" alt="user" width="30" />
                <p class="uname">username</p>
              </div>
              <div class="right">
                <div class="btn btn-kick"><i class="fa-solid fa-circle-x"></i></div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

### PM - POSTS
```html
<div class="posts">
  <div class="posttitle">
    <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
    <div class="title">POSTS</div>
    <div class="btn btn-filter"><i class="fa-solid fa-filter-list"></i></div>
  </div>
  <div class="postlist">
    <div class="card">
      <div class="spinner center"><i class="fa-duotone fa-spinner-third fa-spin"></i></div>
    </div>
    <div class="card liked">
      <div class="user">
        <div class="img">
          <img src="./assets/user.jpg" alt="user"/>
        </div>
        <div class="name">
          <div class="dname">Deva Krista Aranda <i class="B dev"></i> <i class="B mod"></i> <i class="B staff"></i> <i class="B verified"></i></div>
          <div class="uname">@dvnkz_</div>
        </div>
      </div>
      <div class="media">
        <img src="./assets/fivem_wp.jpg" alt="fivem"/>
      </div>
      <div class="statistics">
        <div class="btn btn-like">2</div>
        <div class="btn btn-comment">3</div>
      </div>
      <div class="text">
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse dolores aut, earum neque, reprehenderit dicta dolorem quod repudiandae quia saepe ex atque eum illo odio sit vitae ullam officiis architecto! Id et necessitatibus velit suscipit quibusdam, a quia repudiandae fugit quas debitis voluptatibus? Quae, veritatis cupiditate? Alias autem laborum cum.</p>
      </div>
      <div class="timestamp">11:12 11/12/24</div>
    </div>
    <div class="card">
      <div class="user">
        <div class="img">
          <img src="./assets/user.jpg" alt="user"/>
        </div>
        <div class="name">
          <div class="dname">Deva Krista Aranda<i class="B verified"></i></div>
          <div class="uname">@dvnkz_</div>
        </div>
      </div>
      <div class="media">
        <img src="./assets/fivem_wp.jpg" alt="fivem"/>
      </div>
      <div class="statistics">
        <div class="btn btn-like">2</div>
        <div class="btn btn-comment">3</div>
      </div>
      <div class="text">
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Esse dolores aut, earum neque, reprehenderit dicta dolorem quod repudiandae quia saepe ex atque eum illo odio sit vitae ullam officiis architecto! Id et necessitatibus velit suscipit quibusdam, a quia repudiandae fugit quas debitis voluptatibus? Quae, veritatis cupiditate? Alias autem laborum cum.</p>
      </div>
      <div class="timestamp">11:12 11/12/24</div>
    </div>
  </div>
  <div class="postactions">
    <div class="btn btn-create"><i class="fa-solid fa-plus"></i> Create Post</div>
  </div>
  <div class="postcomments">
    <div class="top">
      <div class="title">Comments</div>
      <div class="btn btn-close"><i class="fa-duotone fa-circle-minus"></i></div>
    </div>
    <div class="mid">
      <div class="card">
        <div class="photo">
          <img src="./assets/user.jpg" alt="user" width="50"/>
        </div>
        <div class="data">
          <div class="data-user">
            <span class="username">dvnkz_</span><span class="timestamp">5m</span>
          </div>
          <div class="data-text">
            <p>ow shit</p>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <form class="form" id="post-comment-form" action="/post/comment/add" method="post">
        <input type="text" name="post-comment-text" id="post-comment-text" autocomplete="off" class="input" placeholder="Type Here" />
        <button class="btn btn-post-send" id="post-comment-send"><i class="fa-solid fa-arrow-up"></i></button>
      </form>
    </div>
  </div>
</div>
```

### PM - POST CREATION
```html
<div class="createpost pmb">
  <div class="posttitle">
    <div class="title">POSTS</div>
  </div>
  <div class="postcontainer">
    <div class="btn btn-change-img">
      <i class="fa-solid fa-image"></i> Change Image
    </div>
    <div class="post-img-preview">
      <img src="./assets/fivem_wp.jpg" alt="postcreate"/>
    </div>
    <div class="post-text-preview">
      <textarea name="post-text" id="post-text" placeholder="Say Something"></textarea>
    </div>
  </div>
  <div class="postactions">
    <div class="btn btn-cancel-post"><i class="fa-solid fa-xmark"></i> Cancel</div>
    <div class="btn btn-submit-post">Share Now <i class="fa-solid fa-arrow-up"></i></div>
  </div>
</div>
```

## CALLS
```html
<div class="call">
  <div class="background">
    <div class="profpic">
      <img src="./assets/user.jpg" alt="user" width="100"/>
    </div>
  </div>
  <div class="top">
    <div class="detail">
      <div class="btn btn-minimize"><i class="fa-solid fa-chevron-down fa-fw"></i></div>
      <div class="caller">
        <div class="displayname">Deva Krista Aranda</div>
        <div class="user">
          <span class="username">@dvnkz_</span>
          <span class="ts">0:02</span>
        </div>
      </div>
    </div>
    <div class="act-info">
      <div class="card">
        <i class="fa-duotone fa-microphone-slash"></i> <span>dvnkz_ muted</span>
      </div>
      <div class="card">
        <i class="fa-duotone fa-volume-slash"></i> <span>dvnkz_ deafen</span>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="act-list">
      <div class="call-act">
        <div class="btn btn-deafen active">
          <i class="fa-solid fa-volume fa-fw"></i>
        </div>
        <div class="btn btn-mute active">
          <i class="fa-solid fa-microphone fa-fw"></i>
        </div>
        <div class="btn btn-video active">
          <i class="fa-solid fa-video fa-fw"></i>
        </div>
      </div>
      <div class="call-act">
        <div class="btn btn-hangup">
          <i class="fa-solid fa-phone-hangup fa-fw"></i>
        </div>
      </div>
    </div>
  </div>
</div>
```