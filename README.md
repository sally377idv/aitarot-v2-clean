# AI塔罗-心灵奇旅

一个基于React + TypeScript + Vite构建的专业塔罗牌占卜Web应用，结合AI技术为用户提供专业的心灵指引服务。

## ✨ 功能特性

- ?? **专业塔罗牌系统** - 包含78张标准塔罗牌，正逆位解读
- 🤖 **AI深度解读** - 集成DeepSeek API，提供专业的塔罗牌阵分析
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 💭 **冥想引导** - 提问前的冥想提示，帮助用户平静心情
- 🔍 **多维度解读** - 结论、分析、建议三部分结构化输出
- 💬 **追问功能** - 基于原牌阵的持续对话，深度解答疑问
- 🌟 **奇迹见证** - 正能量鼓励特效，提升用户体验
- 📊 **数据追踪** - 用户行为分析和会话记录

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```
应用将在 `http://localhost:3000` 启动

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── TarotCard.tsx          # 塔罗牌展示组件
│   └── TarotCardDeck.tsx      # 牌组抽牌组件
├── pages/               # 页面组件
│   ├── HomePage.tsx           # 主页面（提问）
│   ├── DrawResultPage.tsx     # 抽牌结果页
│   ├── InterpretationPage.tsx # AI解读页
│   └── FollowUpPage.tsx       # 追问页面
├── services/            # 服务层
│   ├── aiService.ts           # AI接口服务
│   ├── tarotService.ts        # 塔罗牌业务逻辑
│   └── sessionService.ts      # 会话管理
├── data/               # 静态数据
│   └── tarotCards.json        # 塔罗牌数据文件
├── types/              # TypeScript类型定义
│   └── index.ts               # 全局类型定义
└── styles/             # 样式文件
    └── globals.css            # 全局样式和Tailwind配置
```

## 🃏 使用方法

### 四步占卜流程

1. **提出问题** - 在主页输入你想咨询的问题
2. **抽取牌阵** - 系统随机抽取三张塔罗牌
3. **AI解读** - 获得专业的牌阵分析和建议
4. **追问咨询** - 针对解读结果继续提问

### 功能说明

**主页功能：**
- 冥想引导：动态显示心灵平静提示
- 问题输入：支持中文字符，最多200字
- 智能验证：自动检测问题有效性

**抽牌页面：**
- 随机抽牌：三张塔罗牌组成的牌阵
- 正逆位显示：自动判断牌的正逆位置
- 牌阵解释：说明三张牌的代表意义

**解读页面：**
- AI分析：结合用户问题和牌阵深度解读
- 结构化输出：结论、分析、建议三部分
- 字符限制：确保解读简洁明了

**追问页面：**
- 上下文保持：结合原牌阵进行持续对话
- 奇迹见证：正能量鼓励效果
- 无限追问：支持多次连续性咨询

## 🔧 技术栈

### 前端框架
- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具

### 样式和交互
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Zustand** - 状态管理

### AI集成
- **DeepSeek API** - AI解读服务
- 智能提示词模板
- 错误降级处理

## 🔌 API配置

应用需要配置DeepSeek API密钥才能使用完整的AI功能：

1. 申请DeepSeek API密钥
2. 在 `src/services/aiService.ts` 中替换 `DEEPSEEK_API_KEY`
3. 或通过环境变量配置

**降级方案：**
如果API不可用，系统会自动使用预设的解读模板，保持基本功能可用。

## 🧪 测试

```bash
# 运行测试
npm test

# 启动测试UI
npm run test:ui
```

## 📱 响应式设计

应用采用移动端优先设计，支持：
- 手机端：320px+
- 平板端：768px+
- 桌面端：1024px+

## 🔒 数据隐私

- 所有数据保存在本地浏览器存储
- 用户身份使用匿名标识
- 不收集个人敏感信息

## 📦 部署

### Vercel部署
```bash
npm install -g vercel
vercel --prod
```

### Netlify部署
```bash
npm run build
# 上传 dist/ 目录到Netlify
```

### 静态服务器
```bash
npm run build
# 部署 dist/ 目录到任意静态服务器
```

## 🐛 故障排除

### 常见问题

1. **API密钥错误**
   - 检查 `aiService.ts` 中的API密钥配置
   - 确保网络连接正常

2. **样式显示异常**
   - 确认Tailwind CSS是否正确加载
   - 检查浏览器兼容性

3. **抽牌失败**
   - 检查塔罗牌数据文件路径
   - 验证JSON格式是否正确

## 👥 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 📄 许可证

MIT License

## 🤝 联系方式

如有问题或建议，欢迎联系项目维护者。

---

**AI塔罗-心灵奇旅 - 用科技连接心灵与智慧** ✨