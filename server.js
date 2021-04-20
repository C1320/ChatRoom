let url = require("url"),
    http = require('http'),
    server = http.createServer(),
    path = require("path"),
    io = require('socket.io')(server),
    fs = require("fs"),
    mysql = require('mysql');
const insert_sql = 'INSERT INTO users(id,name,passwd) VALUES(?,?,?)',
    find_data = 'SELECT * FROM users';//数据查询
const connection = mysql.createConnection({
    host: 'rm-wz99r85cwf7sk18ge3o.mysql.rds.aliyuncs.com',
    user: 'userdata',
    password: '@Cyq1320zj',
    database: 'userdata'
});
const User_record = [],//记录用户登录记录
    PORT = 8080,
    room=0;//房间号
connection.connect();
let register = true //false账号存在，true可以注册
// //导入数据模块
// const user_data = require("./js/datasql")
server.on('request', (req, res) => {
    let pathname = __dirname + url.parse(req.url).pathname;
    if (path.extname(pathname)==="") {
        pathname+="/";
    }
    if (pathname.charAt(pathname.length-1)==="/"){
        pathname+="chat_index.html";
    }
    // console.log(pathname)
    fs.exists(pathname,function(exists){
        if(exists) {
            switch (path.extname(pathname)) {
                case ".html":
                    // res.writeHead(200, {"Content-Type": "text/html"});
                    break;
                case ".js":
                    // res.writeHead(200, {"Content-Type": "text/javascript"});
                    break;
                case ".css":
                    // res.writeHead(200, {"Content-Type": "text/css"});
                    break;
                case ".gif":
                    // res.writeHead(200, {"Content-Type": "image/gif"});
                    break;
                case ".jpg":
                    // res.writeHead(200, {"Content-Type": "image/jpeg"});
                    break;
                case ".png":
                    // res.writeHead(200, {"Content-Type": "image/png"});
                    break;
                case ".mp3":
                    // res.writeHead(200, {"Content-Type": "audio/mp3"});
                    break;
                default:
                // res.writeHead(200, {"Content-Type": "application/octet-stream"});
            }

            fs.readFile(pathname, function (err, data) {
                res.end(data);
            });
        }
    });
});
server.listen(PORT, () => {
    console.log('端口:'+PORT+'服务器已启动...');
});
//账号验证
function find(data,socket,flag) {
    let count = 0//查找完成标志
    //查
    connection.query(find_data,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        // 遍历用户数据
        for (let i = 0; i < result.length; i++) {
            if (data.userAccount === result[i]["id"] && data.password === result[i]["passwd"]) {
                //验证成功返回用户数据信息
                if(flag===1){
                    // 如果用户已经登录
                    const user = User_record.find(item => item.userid === data.userAccount)
                    if(user){
                        //用户已经登录
                        socket.emit("receive",2)
                    }
                    else {
                        //将登陆成功的用户加入到一个房间
                        socket.join(room)
                        User_record.push({userid: result[i]["id"], username: result[i]["name"]})//记录用户的用户名与昵称
                        //把用户的登录信息存储起来
                        socket.userAccount =result[i]["id"]
                        socket.username = result[i]["name"]
                        socket.emit("receive",{userid: result[i]["id"], username: result[i]["name"], userPwd: result[i]["passwd"]})
                    }
                }
            else {
                register=false//账号存在 不可以注册
                    insert(data,socket)
                }
            break;
            }
            else {
                count += 1;
                if (count >= result.length) {
                    if(flag===1){
                        //验证失败
                        socket.emit("receive",0)
                    }
                    else {
                        register=true//账号不存在 可以注册
                        insert(data,socket)
                    }

                }
            }
        }
    });
//    注册
}function insert(data,socket) {
        if(register){
            connection.query(insert_sql,[data.userAccount,data.username,data.password],function (err, result) {
                if(err){
                    console.log('[SELECT ERROR] - ',err.message);
                    return;
                }
                socket.emit("receive",1)
            });
        }
        else {
            socket.emit("receive",0)
        }
}
io.on('connection', (socket) => {
    socket.on("login_msg",function (data) {
        find(data,socket,data.flags)
    })
    socket.on("login_success",function (data) {
        socket.broadcast.to(room).emit("systemTip",data.msg)
    //    用户登录更新在线列表
        io.to(room).emit("userList",User_record)
        // console.log(User_record)
    })
    socket.on("sendMessage",function (data) {//将接收的消息发送给所有用户
        socket.broadcast.to(room).emit("getMessage",data)
    })
    //用户断开连接
    socket.on('disconnect', () => {
        const name = socket.username
        const idx = User_record.findIndex(item => item.username === socket.username)
        User_record.splice(idx, 1)
        socket.broadcast.to(room).emit("leave",name)//用户断开告诉所有在线用户
        //    用户离开更新在线列表
        io.to(room).emit("userList",User_record)
        // console.log("用户"+name+"断开连接");
    });
});