// 导入模块
const express = require("express");
// 导入body-parser
const bodyParser = require("body-parser");
// 导入fs模块
const fs = require("fs");
// 导入path模块
const path = require("path");
// 导入multer模块
const multer = require("multer");

const filePath = path.join(__dirname, "./data/hero.json");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    const type = file.originalname.split(".")[1];
    cb(null, file.fieldname + "-" + Date.now() + "." + type);
  }
});

var upload = multer({ storage: storage });

// 实例化路由对象
const app = express();

app.use(express.static("uploads"));

// 使用body-parser解析post的数据
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// 注册登录路由
app.post("/login", (req, res) => {
  // 接收username和password
  const { username, password } = req.body;
  // 判断是否正确
  if (username === "admin" && password === "123456") {
    // 若成功
    res.send({
      code: 200,
      msg: "登录成功"
    });
  } else {
    res.send({
      code: 400,
      msg: "用户名或密码错误"
    });
  }
});
// 获取英雄列表 无参数 get请求
app.get("/list", (req, res) => {
  // 读取hero.json中的数据
  
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.log("读取失败");
    } else {
      data = JSON.parse(data)
        .filter(v => {
          return !v.isDelete;
        })
        .map(({ id, name, skill, icon }) => {
          return {
            id,
            name,
            skill,
            icon
          };
        });
      // 读取成功，返回数据
      res.send({
        code: 200,
        msg: "获取成功",
        data: data
      });
    }
  });
});
// 新增英雄 有参数 有文件 post请求 参数类型为form-data
app.post("/add", upload.single("icon"), (req, res) => {
  // 获取参数
  const { name, skill } = req.body;
  const icon = req.file.path;

  // 保存
  
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.log("读取失败");
    } else {
      data = JSON.parse(data);
      // 添加新数据
      data.push({
        id: data.length + 1,
        name,
        skill,
        icon,
        isDelete: false
      });
      // 存入
      fs.writeFile(filePath, JSON.stringify(data), "utf-8", err => {
        if (err) {
          console.log(err);
        } else {
          res.send({
            code: 200,
            msg: "添加成功"
          });
        }
      });
    }
  });
});
// 根据传入的id删除英雄 有参数 get请求
app.get("/delete", (req, res) => {
  // 获取要删除的英雄id
  const heroId = req.query.id;
  console.log(heroId);
  
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const delData = JSON.parse(data).map(v => {
        if (v.id == heroId) {
          v.isDelete = true;
        }
        return {
          id: v.id,
          name: v.name,
          skill: v.skill,
          icon: v.icon,
          isDelete: v.isDelete
        };
      });
      console.log(delData);
      
      fs.writeFile(filePath, JSON.stringify(delData), "utf-8", err => {
        if (err) {
          console.log(err);
        } else {
          res.send("success");
        }
      });
    }
  });
});
// 根据id查询英雄 有参数 get请求
app.get("/search", (req, res) => {
  const heroId = req.query.id;

  

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const hero = JSON.parse(data).filter(v => {
        return !v.isDelete && v.id == heroId;
      });
      if (hero.length) {
        res.send({
          code: 200,
          msg: "查询成功",
          data: hero
        });
      } else {
        res.send({
          code: 400,
          msg: "参数错误"
        });
      }
    }
  });
});
// 编辑英雄 有参数 有文件 post请求 参数类型 form-data
app.post("/edit", upload.single("icon"), (req, res) => {
  const { id, name, skill } = req.body;
  const icon = req.file.path;

  
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const editHero = JSON.parse(data).filter(v => {
        return v.id == id;
      });
      if (editHero.length) {
        editHero[0].name = name;
        editHero[0].skill = skill;
        editHero[0].icon = icon;

        fs.writeFile(filePath, JSON.stringify(editHero), "utf-8", err => {
          if (err) {
            console.log(err);
          } else {
            res.send({
              code: 200,
              msg: "修改成功"
            });
          }
        });
      } else {
        res.send({
          code: 400,
          msg: "修改失败"
        });
      }
    }
  });
});
// 开启监听
app.listen(4399, () => {
  console.log("success");
});
