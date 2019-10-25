var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser')
var mysql      = require('mysql');
var jwt        = require('jsonwebtoken');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'aa'
});
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(express.static('views'));
app.engine('html', require('express-art-template'))
app.get('/',function(req,res){
res.render('index.html');
})
app.post('/token',(req, res)=>{
        if(req!=""){
            let token = req.body.token; // 从body中获取token
            let secretOrPrivateKey="suiyi"; // 这是加密的key（密钥） 

            jwt.verify(token, secretOrPrivateKey, function (err, decode) {
                if (err) {  //  时间失效的时候/ 伪造的token          
                    res.send({'status':0});            
                } else {
                    res.send({'status':1});
                }
            })
        }else{
            res.send({'status':0});            
        }

})

app.post('/login',(req, res)=>{
    
  var sql = 'SELECT * from user where name="'+req.body.name+'"&&password="'+req.body.password+'"';
    console.log(sql)
    connection.query(sql, function (error, results, fields) {   
        if (error) throw error;
        console.log(results)
        if(results!=""){
            let content ={name:req.body.name}; // 要生成token的主题信息
            let secretOrPrivateKey="suiyi" // 这是加密的key（密钥） 
            let token = jwt.sign(content, secretOrPrivateKey, {
                    expiresIn: 60*60*1  // 1小时过期
                });
            let sqlSave = "update user set token='"+token+"'"+"where name='"+req.body.name+"'";
            console.log(sqlSave)
            connection.query(sqlSave, function (error, results, fields) {
                if (error) throw error;
            res.send({'status':1,'msg':'登陆成功','token':token})     //反给前台
            })
        }else{
            res.send({'status':0,'msg':'登录失败'});
        }
    })
})
app.post('/find2',function(req,res){
    console.log(req.body);
    var sql = "SELECT * from test where "
        if(req.body.application){
            sql+="application='"+ req.body.application+"'&&"
        }
        if(req.body.tag){
            sql+="tag='"+req.body.tag+"'&&"
        }

        if(req.body.timestamp){
            sql+="timestamp='"+req.body.timestamp+"'&&"
        }
        sql = sql.slice(0,sql.length-2)
        
        console.log(sql)
            connection.query(sql, function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);
            res.send(JSON.stringify(results));   
            
        })
    })
        app.delete('/delete/:id',function(req, res){ //Restful Delete方法,删除一个单一资源
        res.set({'Content-Type':'text/json','Encodeing':'utf8'});
        console.log(req.param('id'))
        var  sql = 'DELETE FROM test WHERE id='+ req.param('id');
        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
        res.send(JSON.stringify("ok"));   
        })
    })
    app.post('/update',function (req,res) {
        console.log(req.body);
        var sql="UPDATE test SET "
        if(req.body.application){
            sql+="application='"+ req.body.application+"',"
        }
        if(req.body.tag){
            sql+="tag='"+req.body.tag+"',"
        }
        if(req.body.timestamp){
            sql+="timestamp='"+req.body.timestamp+"',"
        }
        sql = sql.slice(0,sql.length-1)
        sql = sql+ "where id=" + req.body.id
        console.log(sql)
        connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.send(JSON.stringify("ok")); 
     
    });
    })
    app.post('/add',function (req,res) {
        console.log(req.body);
        var sql1="INSERT INTO test ("
        var sql2="VALUES ("
        if(req.body.application){
            sql1+="application,"
            sql2+="'"+req.body.application+"',"
        }
        if(req.body.tag){
            sql1+="tag,"
            sql2+="'"+req.body.tag+"',"
        }
        if(req.body.timestamp){
            sql1+="timestamp,"
            sql2+="'"+req.body.timestamp+"',"
        }
        sql1 = sql1.slice(0,sql1.length-1)
        sql2 = sql2.slice(0,sql2.length-1)
        sql1 = sql1+ ")"
        sql2 = sql2+ ")"
        sql = sql1 + sql2
        console.log(sql2)
        console.log(sql)
        connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.send(JSON.stringify("ok")); 
     
    });
    })
app.listen(3500,function(){
    console.log('web is running')
}) 
