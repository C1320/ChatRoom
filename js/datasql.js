const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'rm-wz99r85cwf7sk18ge3o.mysql.rds.aliyuncs.com',
    user: 'userdata',
    password: '@Cyq1320zj',
    database: 'userdata'
});

connection.connect();

const insert_sql = 'INSERT INTO users(id,name,passwd) VALUES(?,?,?)',
        find_data = 'SELECT * FROM users';//数据查询
//添加函数
function insert(data) {
    const flag = find(data)//先查询用户数据是否存在
    let return_flag = false;
    if(flag) {
        connection.query(insert_sql,[data.userAccount,data.username,data.password],function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
            }
            console.log('添加成功！');
            return_flag = true
        });
    }
    return return_flag;
}
function find(data) {
   let count = 0//查找完成标志
    let jsonString = JSON.stringify(data)
    const jsonData = JSON.parse(jsonString)
    //查
    connection.query(find_data,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        // 遍历用户数据
        for (let i = 0; i < result.length; i++) {
            if (jsonData.userAccount === result[i]["id"] && jsonData.password === result[i]["passwd"]) {
                //验证成功返回用户数据信息
                console.log("成功")
                return {userid: result[i]["id"], username: result[i]["name"], userPwd: result[i]["passwd"]};
            }
            else {
                count += 1;
                if (count >= result.length) {
                    //验证失败
                    return '0';
                }
            }
        }
    });
    // //关闭connection
    // connection.end(function(err){
    //     if(err){
    //         console.log(err.toString());
    //         return;
    //     }
    //     console.log('[connection end] succeed!');
    // });
    }
    exports.find = find
    exports.insert = insert

