# KA 本息分离需求 PRD

| 项 | 内容 |
|---|---|
| 关联事实陈述 | [KA OWealth 本息分离业务需求事实陈述](https://kcnjoswqqjwl.feishu.cn/wiki/FIehwDgGiiQUxskV7hkcI8Xjnbb) |
| 参考 DEMO | https://kademo.desmond.ink/ |
| 计划版本 | 0910 |
| 文档形态 | 变更说明型（以 DEMO / 界面 Diff 为主轴） |

---

## 1. 修订记录

| 时间 | 版本号 | 修订人 | 修订内容 |
|------|--------|--------|----------|
| 2026-09-10 | V1.0 | 戴思敏 | 创建 |
| 2026-09-11 | V1.2 | 戴思敏 | 按变更说明型重写：贴合 DEMO；Interest Accrual 与 OWealth Interest Isolation 解耦；校验路径解耦；补 Branch OWealth |

---

## 2. 需求背景

### 2.1 项目背景

当前 KA OWealth 采用复利模式，利息直接并入 OWealth Available Balance，与本金混同。

调研超 **40** 家商户明确提出利息分离需求；TL 预估使用率 **50%–90%**。商户普遍愿以略低利率换隔离，前提是差异透明、可选、可切换。

### 2.2 业务目标

1. 提供可选的 **OWealth Interest Isolation（单利隔离）**，使本金与利息分账户核算与展示  
2. 统一 **对外 / 可支付余额 = Principal only**，Interest 不可支付、不再生息  
3. 完成 KA Settings 配置能力（与全局计息开关解耦）、全分支生效与切换校验，保障资金与配置安全  

### 2.3 模式对比（调整前 vs 调整后）

| 维度 | 调整前（现网默认） | 调整后（可选 Isolation） | 备注 |
|------|-------------------|--------------------------|------|
| 计息方式 | Compound | Simple（非复利） | Isolation 为可选，非强制 |
| 税前年化 | 5% p.a. | **4.87% p.a.** | 差额约 **13 bps**，因放弃利息再投资，**非降息口径**；计算过程本身无额外变化 |
| 利息入账 | 并入 OWealth 本金 | 入 **Interest Isolation Account** | 不生息 |
| 对外可用余额 | OWealth 合计（本息混同） | **仅 Principal** | 交易可用同口径 |
| 利息使用 | 已在本金内可支付 | 需 **Transfer to Principal** 后使用 | 默认全额转移 |

> 配置说明：是否计息（Interest Accrual）与是否隔离（OWealth Interest Isolation）为**两项独立配置**，详见第 5 章；Non-Interest 不放入上表对比。

---

## 3. 需求范围

| 需求 | 简要说明 |
|------|----------|
| 【H5】KA MD 理财界面调整 | 本息隔离下 OWealth / Summary / Branch OWealth 资产展示调整；流水支持按本金、利息账户单独导出 |
| 【服务端】本息隔离模式支持 | 开启隔离后开立产品侧内部利息账户；发息入隔离户；新增 Transfer to Principal |
| 【服务端】对外余额口径 | 对外 OWealth / 可支付余额仅 Principal；内部 / KA MD 可返回本息拆分 |
| 【服务端】Statement 分账户生成 | Principal / Interest 分别出 CSV、PDF |
| 【KA】Interest Setting 配置页 | 改造 Settings：全局 Interest Accrual + OWealth Interest Isolation（仅 OWealth） |

---

## 4. 需求详细说明

参考 DEMO：https://kademo.desmond.ink/

### 4.1 KA MD 理财界面调整

#### 4.1.1 OWealth 主界面

（截图位）

| 状态 | 说明 |
|------|------|
| 线上状态 — 复利模式 | 现网单卡 + 利息信息布局 |
| 新方案 — 复利模式 | 排版调整后的 Compound |
| 新方案 — 本息分离模式 | Principal / Interest 双卡 + 双 Tab |
| 新方案 — 禁用利息状态 | Interest Accrual = Off |

主要调整点如下：

- 页面排版结构调整：昨日利息、累计利息卡片放到右侧  
- **开启 OWealth Interest Isolation 时**  
  - 左侧 OWealth 余额卡拆成两个子卡：`Principal Account`、`Interest Account`  
  - Principal 利率展示为 **4.87% p.a.**  
  - 支持 **Transfer to Principal**：将 Interest 余额转入 Principal（本期默认全额）  
  - Details 改为双 Tab：`Principal Account` / `Interest Account`，各自支持导出 CSV、PDF  
- **Interest Accrual = Off（Non-Interest）时**：不计息展示；不要求先清空 Interest 余额（与关隔离校验解耦）

#### 4.1.2 Summary 界面

（截图位）

| 状态 | 说明 |
|------|------|
| 线上状态 — 复利模式 | 现网 Total Assets |
| 新方案 — 复利模式 | 排版 / 文案对齐新方案 |
| 新方案 — 本息分离模式 | OWealth 本息拆分展示 |
| 新方案 — 禁用利息状态 | 不计息下的 Summary |

主要调整点如下：

- **开启隔离时**，Total Assets (Saving) 中 OWealth 展示改为拆分口径，例如：  
  `OWealth: ₦5.2M (Principal 4.5M, Interest 687.3K)`  
- 需要接口分别返回 OWealth **本金余额**与 **利息余额**

#### 4.1.3 Branch OWealth 界面

（截图位）

| 状态 | 说明 |
|------|------|
| 线上状态 — 复利模式 | 列表单列 OWealth Balance |
| 新方案 — 复利模式 | 仍为单列 OWealth Balance |
| 新方案 — 本息分离模式 | 拆成两列 |

主要调整点如下：

- **开启隔离时**，分支列表资产由单列 `OWealth Balance` 拆为两列：  
  - `OWealth Principal`  
  - `Interest Account`  
- 未开启隔离时，保持单列 `OWealth Balance`  
- View 进入对应分支 OWealth 详情（标题形如 `OWealth-{Branch Name}`）

---

### 4.2 服务端本息隔离模式支持

#### 4.2.1 利息隔离账户开立规则

- **开立时机**：总部管理员在 KA Settings 将 **OWealth Interest Isolation** 从 Off 切换为 On 并提交保存后，为当前商户（总部及所有分支）开通隔离能力。  
- **账户开立流程**  
  1. 校验是否已存在 Interest Isolation Account；已存在则跳过开立  
  2. 开立成功后，记录 Isolation 配置为 ON  
  3. 自生效时间戳的**下一个计息日**起，按单利隔离计息并发放  
- **异常**：开立失败则配置回滚为 OFF（已开立账户不注销）；前端弹窗报错

#### 4.2.2 每日发息流程改造

开启隔离后：

- 计息本金**仅**统计 Principal Account 日终余额  
- Interest Isolation Account 余额**不计入**可计息本金  
- 税前年化 **4.87% p.a.**，日利率按现网单利规则（`4.87% / 365`）  
- 税后利息入 Interest Isolation Account（WHT 口径沿用现网，本期不单列改造说明）

#### 4.2.3 Transfer to Principal 交易处理

- **触发**：KA MD 点击 `Transfer to Principal`，本期默认**全额**转入 Principal  
- **业务交易类型**：`Interest Transfer to Principal`  
- **双边流水**

| 账户侧 | Transaction Type | Direction | 金额字段 |
|--------|------------------|-----------|----------|
| Interest Account | Interest Transfer to Principal | Outflow | Outflow = 转移金额 |
| Principal Account | Interest Transfer to Principal | Inflow | Inflow = 转移金额 |

两侧均记录 Balance Before / After。

#### 4.2.4 余额查询场景

| 展示 / 查询场景 | 开启本息分离后 |
|-----------------|----------------|
| OWealth 余额查询（对外） | 返回 Principal |
| 可支付余额查询 | 返回 Principal |
| 总资产查询（对外） | 返回 Principal（OWealth 部分） |
| OWealth 余额查询（内部 / KA MD） | 返回 principal + interest 拆分结构 |

---

### 4.3 Statement 分账户生成

#### 4.3.1 PDF

| 账户 | 文件命名 |
|------|----------|
| Principal Account | `{FileID}_OWealthPrincipalAccountDetailsPdf.pdf` |
| Interest Account | `{FileID}_OWealthInterestAccountDetailsPdf.pdf` |

文件内容结构与现有 OWealth Transaction Statements 保持一致，按账户分别导出。

#### 4.3.2 CSV

| 账户 | 文件命名 |
|------|----------|
| Principal Account | `{FileID}_OWealthPrincipalAccountDetailsCsv.csv` |
| Interest Account | `{FileID}_OWealthInterestAccountDetailsCsv.csv` |

> 命名以服务端现网约定为准；DEMO 中导出标题为 `Transaction Statements - Principal Account` / `Interest Account`。

---

## 5. Interest Setting 配置页（KA 前端）

（截图位：Settings → Interest Setting）

仅**总部管理员**可操作；保存后对**总部及所有分支**生效。配置项为两项，**相互解耦**：

### 5.1 Interest Accrual（是否计息）

| 选项 | 说明 |
|------|------|
| Interest Enabled（默认） | OWealth 与 Fixed Savings 均计息；OWealth 的计息形态由下方 Isolation 决定 |
| Interest Disabled（Non-Interest） | OWealth 与 Fixed **均不再新增利息**；合规客群（如伊斯兰金融） |

- 作用范围：**全局理财计息**，不只 OWealth  
- **切换到 Non-Interest 不校验** Interest Account 余额  

### 5.2 OWealth Interest Isolation

| 选项 | 利率 | 说明 |
|------|------|------|
| Off — Compound Interest（推荐） | 5% p.a.（pre-tax） | 利息入本金并继续生息 |
| On — OWealth Interest Isolation（Simple） | 4.87% p.a.（pre-tax） | 利息入隔离账户、不再生息；可 Transfer to Principal |

- 作用范围：**仅 OWealth**，不涉及 Fixed Savings  
- 仅在 Interest Accrual = Enabled 时可配置  
- **关闭 Isolation（回到 Compound）时**：若任一分支 Interest Account 余额 \(> ₦0\)，整单拒绝，提示先在 OWealth 执行 Transfer to Principal  

拦截文案（英文）：

```
标题：Cannot turn off Interest Isolation
正文：Interest Account still has a balance. Please transfer Interest to Principal on the OWealth page before turning off Interest Isolation.
```

提交敏感变更需 **PIN** 校验（沿用现网 KA 约定）。

---

## 附录：与上一版文档的刻意差异（便于评审）

| 点 | 本版做法 |
|----|----------|
| 章节 | 无独立长流程图 / 埋点 / 灰度 / Native 占位（未点名不写） |
| 配置模型 | Accrual × Isolation 解耦，非三选一 |
| 校验 | 仅关 Isolation 看利息余额；切非息不看 |
| 界面 | 以 DEMO 页面 Diff 为主，含 Branch OWealth |
| 背景 | 不展开未变更的日利率/WHT 长推导 |
