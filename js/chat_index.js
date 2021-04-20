window.onload =function () {
  //登录按钮
  const login = document.getElementById("button_login"),
  //注册按钮
   register = document.getElementById("button_register"),
  //获取登录界面焦点事件
   login_click = document.querySelector("#login_tab"),
  //获取注册界面焦点事件
   register_click = document.querySelector("#register_tab"),
  //获取登录界面焦点事件改变样式
   login_style = document.getElementById("login_tab"),
  //获取注册界面焦点事件改变样式
   register_style = document.getElementById("register_tab"),
  //登录窗口点击事件显示
   login_hid_show = document.getElementById("content_login"),
  //注册窗口点击事件显示
   register_hid_show = document.getElementById("content_register"),
   container_show = document.getElementById("container"),
   chat_content_show = document.getElementById("chat-content");
  let userid,//当前登录的用户
      userNickname,//用户昵称
      socket,
      register_login = 1;//当前登录界面还是注册页面
  register_click.addEventListener("click",register_show);
  login_click.addEventListener("click",login_show);
  //判断登录还是注册模式
  let login_register = 1;//1默认是登录，0表示注册
  //登录界面显示
  function login_show(){
    register_hid_show.style.display = "none";
    register_style.style.color = "#87CEFA";
    register_style.style.background = "rgba(0,0,0,0.6)";
    login_hid_show.style.display = "block";
    login_style.style.color = "white";
    login_style.style.background = "#00DD60";
    register_login=1
  }
  //注册界面点击显示
  function register_show() {
    login_hid_show.style.display = "none";
    login_style.style.color = "#87CEFA";
    login_style.style.background = "rgba(0,0,0,0.6)";
    register_hid_show.style.display = "block";
    register_style.style.color = "white";
    register_style.style.background = "#00DD60";
    register_login=0
  }
//后退按钮
  const prev = document.querySelector("#prev");
//前进按钮
  const next = document.querySelector("#next");
// 所有幻灯片
  const slides = document.querySelectorAll(".slide");
// 当前正在播放的幻灯片
  let currentIndex = 0;

// 是否自动播放
  const autoPlay = true;

// 播放方向，前进或后退
  const forward = false;
// 自动播放间隔，10秒
  const interval = 30000;
// 添加前进按钮事件处理函数
  next.addEventListener("click", handleNextClicked);
// 添加后退按钮事件处理函数
  prev.addEventListener("click", handlePrevClicked);

// 是否自动播放
  if (autoPlay) {
    setInterval(forward ? handleNextClicked : handlePrevClicked, interval);
  }

  function handleNextClicked() {
    //当前幻灯片
    let current = slides[currentIndex];
    // 去掉当前幻灯片的current属性
    current.classList.remove("current");

    //移动到下一张幻灯片，如果没有，则从第一张开始
    currentIndex++;
    if (currentIndex >= slides.length) {
      currentIndex = 0;
    }
    // 给下一张幻灯片加上current class
    slides[currentIndex].classList.add("current");
  }

  function handlePrevClicked() {
    //当前幻灯片
    let current = slides[currentIndex];
    // 去掉当前幻灯片的current属性
    current.classList.remove("current");

    //移动到上一张幻灯片，如果没有，则从最后一张开始
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = slides.length - 1;
    }
    // 给下一张幻灯片加上current class
    slides[currentIndex].classList.add("current");
  }
  document.onkeydown = shut_cut_login;
  function shut_cut_login(e) {/*绑定回车事件*/
    if(e.keyCode ===13){
      if(register_login===1){
        if(document.getElementById("button_login").style.display==="block")
        login_ok();
      }
      else if(register_login===0){
        if(document.getElementById("button_register").style.display==="block")
        register_ok()
      }
      else if(register_login===2) {
        if(!document.getElementById("sendMsg").disabled)
        sendSuccess()
      }
    }

  }
  //登录监听函数
  login.addEventListener("click",login_ok);
  function login_ok() {
    //账号密码获取
    const user = document.getElementById("username").value;
    const password = document.getElementById("passwd").value;
    login_register = 1;
    const data = {flags:login_register,
      userAccount:user,
      password:password,}
    execute(data);
  }
//注册监听函数
  register.addEventListener("click",register_ok);
  function register_ok() {
    //账号密码获取
    const register_user = document.getElementById("re-username").value;
    const register_password = document.getElementById("re-passwd").value;
    const ack_password = document.getElementById("re-ack_passwd").value;
    const register_name = document.getElementById("re-name").value;
    //1表示登录，0表示注册
    login_register=0;
    const data = {flags:login_register,
      username:register_name,
      userAccount:register_user,
      password:register_password,
      ack_password:ack_password,};
    execute(data);
  }
  //执行事件
  function execute(data) {
    //  验证登录或注册
    socket = io.connect()
    socket.emit("login_msg",data)
    socket.on("receive",function (data) {
      // if (data==='1'){
       handle(data)
      // }
    })
    socket.on("systemTip",function (data) {
      if(data!==null){//排除空连接
        $('.chat-bd').append(`
            <div class="message-box">
          <div class="system message">
              <div class="bubble_cont">系统提示：${data}上线啦</div>
          </div>
      </div>
      `)
        scrollIntoView ()
      }
    })
    socket.on("leave",function (data) {
        if(data!==null){
    $('.chat-bd').append(`
            <div class="message-box">
          <div class="system message">
              <div class="bubble_cont">系统提示：${data}已下线</div>
          </div>
      </div>

      `)
    scrollIntoView ()
  }
    })
    socket.on("getMessage",function (data) {
        //排除接收到自己的消息
        if(userNickname!==data.userNickname){
          $('.chat-bd').append(`
        <div class="message-box">
      <div class="other message">
        <img src="image/avatar07.jpg" alt="" class="avatar">
        <span id="otherTriangle"></span>
        <div class="user-nickname">${data.userNickname}</div>
              <div class="bubble_cont">${data.msg}</div>
        </div>
      </div>
    </div>
      `)
          scrollIntoView ()
        }
    })
    socket.on("userList",function (userList) {
      console.log(userList)
      $(".left-content #user-ul").html('');
      userList.forEach(userdata=>{//更新用户列表
        $(".left-content #user-ul").append(`
       <li class="user">
                <div class="user-list-photo">
                    <img src="image/avatar07.jpg" alt="" class="img avatar_url">
                </div>
                <!--              在线用户名-->
                <div class="user-list-name">
                    ${userdata.username}
                </div>
        </li>    
      `)
      })
      $(".left-content .online-header").html('')
      $(".left-content .online-header").append(`
            <span>在线(${userList.length})</span>
    `)
    })



  }
  //数据处理
  function handle(data){
    if(login_register===1){
      if (data===0){
        alert("账号不存在或密码不正确，请重试！")
      }
      else if(data===2){
        alert("该账号已被登录，请重试！")
      }
      else {
        register_login=2
        userid = data.userid;
        userNickname = data.username
        socket.emit("login_success",{msg: data.username})//告诉服务器登录成功
              container_show.style.display = "none";
              chat_content_show.style.display = "block";
              //向前端更新用户昵称
              $(".information .username span").html(data.username)
      }
    }
    else {
      if (data===0){
        alert("该账号已被注册！")
      }
      else {
        alert("注册成功!")
      }
    }
  }
  $(".sendMsg").click(function () {
      sendSuccess()
  })
  function sendSuccess() {
    //  获取发送内容
    const getSendMsg= document.getElementById("text").value
    socket.emit("sendMessage",{msg:getSendMsg,userNickname:userNickname})//将信息发送到服务器
    if(getSendMsg!==''){
      $('.chat-bd').append(`
    <div class="message-box">
      <div class="my message">
        <img src="image/avatar07.jpg" alt="" class="avatar">
        <span id="myTriangle"></span>
        <div class="bubble_cont">${getSendMsg}
        </div>
      </div>
    </div>
      `)
      document.getElementById("text").value=''
      document.getElementById("sendMsg").disabled=true;
      scrollIntoView ()
    }
  else {
    alert("提示：不能发送空内容！")
    }
  }
  // 当有消息时，将滑动到底部
  function scrollIntoView () {
    // 当前元素的底部滚动到可视区
    $('.chat-bd').children(':last').get(0).scrollIntoView(false)
  }
}