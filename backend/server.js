const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// 导入路由
const blogsRouter = require('./routes/blogs');
const diariesRouter = require('./routes/diaries');
const crawlerRouter = require('./routes/crawler');
const searchRouter = require('./routes/search');

// 使用路由
app.use('/api/blogs', blogsRouter);
app.use('/api/diaries', diariesRouter);
app.use('/api/crawler', crawlerRouter);
app.use('/api/search', searchRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ message: 'Zhelong Backend API', version: '1.0' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 导出app（Vercel需要）
module.exports = app;

// 本地开发用
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
