# 南京师范大学高寒生态系统CH4 CO2 H2O通量涡度测量系统 (JSZC-320000-SNZX-G2026-0117)

> 部署域名 (Host): [https://26-nj-flux-bid.softwarelink.net/](https://26-nj-flux-bid.softwarelink.net/)  
> 项目仓库 (Repo): [https://github.com/softwarelink-net/26-nj-flux-bid](https://github.com/softwarelink-net/26-nj-flux-bid)

![控制台预览](docs/assets/dashboard-preview.png)

---

## 部署与运行说明

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0
- Cloudflare Wrangler CLI >= 3.0.0

### 安装依赖
```bash
npm install
```

### 本地运行
```bash
# 启动前端本地开发服务器
npm run dev

# 启动本地 Cloudflare Worker 模拟环境
npx wrangler dev
```

### 演示账号一览
| 账号名称 | 登录账号 | 默认密码 | 角色权限 |
| :--- | :--- | :--- | :--- |
| 系统超管 | `admin` | `Admin@2026` | `ROLE_SUPER_ADMIN` (系统超级管理员) |
| 通量科学家 | `scientist` | `Flux@2026` | `ROLE_FLUX_SCIENTIST` (通量微气象专家) |
| 野外台站员 | `operator` | `Oper@2026` | `ROLE_STATION_OPERATOR` (野外运维工程师) |
| 决策研判长 | `leader` | `Leader@2026` | `ROLE_DECISION_MAKER` (决策研判领导) |

### 生产构建与部署到 Cloudflare
```bash
# 1. 前端生产构建打包
npm run build

# 2. 部署共享 Cloudflare Worker (allworld)
npm run deploy:worker

# 3. 同步前端静态构建产物至 R2 存储桶
npm run upload:r2
```

### 常用脚本一览
- `npm run dev`: 本地启动 Vite 开发服务
- `npm run build`: 前端生产构建并输出到 dist 目录
- `npm run lint`: 检查与修复 TypeScript / Vue 代码格式
- `npm run db:migrate`: 执行 Cloudflare D1 数据库结构迁移
- `npm run db:seed`: 注入高寒生态通量观测业务演示种子数据

### 目录结构
```text
26-nj-flux-bid/
├── docs/
│   └── assets/
│       └── dashboard-preview.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   └── GlobalStickyBanner.vue
│   │   └── layout/
│   ├── layouts/
│   │   ├── AuthLayout.vue
│   │   └── MainLayout.vue
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   ├── views/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── station-iot/
│   │   ├── calculation/
│   │   ├── qaqc/
│   │   └── system/
│   ├── App.vue
│   └── main.ts
├── worker/
│   ├── index.ts
│   ├── router.ts
│   └── handlers/
├── schema.sql
├── wrangler.toml
├── package.json
└── README.md
```

---

## 招标公告全文

### 1. 标题
高寒生态系统CH4 CO2 H2O通量涡度测量系统公开招标公告

### 2. 项目发包方
南京师范大学

### 3. 项目编号
JSZC-320000-SNZX-G2026-0117

### 4. 项目发布时间
2026-08-13 16:42

### 5. 关键词
南京师范大学, 通量涡度测量系统, 涡度相关系统, 温室气体通量监测, 高寒生态系统, JSZC-320000-SNZX-G2026-0117, 江苏政府采购

### 6. 摘要
南京师范大学公开招标高寒生态系统CH4/CO2/H2O通量涡度测量系统，预算金额180万元，采购内容为连续测定高寒生态系统CO2/CH4通量、显热通量和潜热通量及气象参数的仪器设备与软件系统。本项目接受进口产品投标，合同履行期限为120日历天，投标文件递交截止时间为2026年9月3日09:00。

### 7. 技术要点
- **高频多组分温室气体毫秒级流式采集**：支持 CH4、CO2、H2O 气体分析仪与三维超声风速计 10Hz~20Hz 连续观测与数据预处理。
- **微气象通量物理修正全流程流水线**：集成二维坐标旋转（2D Rotation）、WPL 密度修正、频谱衰减校正与超声虚温修正。
- **高寒极端环境低功耗自治与除霜联动**：提供野外太阳能电量预测、光学探头结冰智能识别与微环境加温控制。
- **信创国密脱敏与极简 Serverless 架构**：野外台站地理信息国密 SM4 动态脱敏，基于 Cloudflare Workers + D1 实现极简零运维与高弹性。

### 8. 技术创新性
- **高寒生态系统碳氮水循环数字孪生大屏**：实现生态净交换量（NEE）、总初级生产力（GPP）与生态系统呼吸（Re）的半小时尺度高精度实时反演。
- **通量观测全生命周期质量评估模型**：融合能量平衡闭合率检验与非稳态湍流自动剔除，保障气候科研数据国际级公信力。

---

## 免责声明

1. **数据来源与合规性**：本系统展示的所有招标信息、项目背景及采购需求均来源于公开招投标平台（如中国招标投标公共服务平台、中国建设银行龙集采平台等）。系统仅用于技术方案演示、架构原型验证与演示搭建，不涉及任何商业非法抓取或数据篡改。
2. **技术实现路径**：本系统前端基于 Vue 3 + Tailwind CSS 构建，后端基于 Cloudflare Workers 极简无服务器架构，数据存储采用 Cloudflare D1 关系型数据库，完整符合分布式高可用与银企对接安全标准。
3. **保密承诺**：开发团队严格遵守保密义务，系统内示例数据均经过伪化脱敏处理（Anonymized），不包含真实患者医疗健康信息（PHI）或建行敏感金融交易数据。
4. **知识产权与巧合声明**：本系统中涉及的商标、机构名称（中国建设银行、川北医学院附属医院等）归各自合法持有人所有。演示代码与系统架构若与实际投产系统存在相似之处，纯属技术通用设计之巧合。
5. **免责条款**：本演示系统不具备实际金融扣款功能，不承担因非授权使用、不可抗力或第三方平台接口变更所导致的任何法律责任与经济损失。
