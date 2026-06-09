# 后端笔记

## Node.js 错误处理模式

```js
async function handler(req, res, next) {
  try {
    const data = await service.getData(req.params.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
```

## 数据库索引设计原则

1. 频繁作为查询条件的字段建立索引
2. 避免对低基数字段（如性别、状态）单独建索引
3. 联合索引遵循最左前缀原则
