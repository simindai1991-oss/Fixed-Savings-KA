# KA OWealth 本息分离（Interest Separation）需求说明

| 项 | 内容 |
|---|---|
| 来源事实陈述 | [KA OWealth 本息分离业务需求事实陈述](https://kcnjoswqqjwl.feishu.cn/wiki/FIehwDgGiiQUxskV7hkcI8Xjnbb) |
| 文档性质 | 基于事实陈述整理的可执行需求说明（非正式 PRD） |
| DEMO 路径 | `C:\Users\15021\Documents\OPay\Projects\fixed-special-ka-admin-demo` |
| 文档版本 | V0.3 |
| 更新日期 | 2026-09-10 |
| 计划版本 | 0910（原 0903） |

---

## 1. 背景与问题

### 1.1 现状

当前 OWealth 采用**复利（Compound Interest）**：

- 年化 **5% p.a.（税前）**
- 日利率：`(1 + 5%)^(1/365) - 1 ≈ 0.00013368`
- T 日基于 T-1 日终余额计息，T 日凌晨发放；发放利息在 T+1 日纳入计息本金
- 发息时同步扣减 **WHT（预扣税）**，商户实收税后利息
- 利息直接并入 OWealth Available Balance，与本金混同

### 1.2 商户四大痛点

1. **透明度不足**：大额余额下日利息难以察觉，质疑是否到账  
2. **信任下降**：本息混同无法核对利息金额  
3. **会计核算困难**：经营性资金（本金）与投资收益（利息）无法分开记账  
4. **再投资收益归属模糊**：难以区分本金收益 vs 利息再投资收益  

### 1.3 调研结论（摘要）

- 超 **40** 家商户明确提出利息分离需求  
- TL 预估使用率 **50%–90%**；北区约 **60%** 提出优化诉求  
- 商户普遍愿接受略低利率换隔离，前提：差异透明、可选、可切换  
- 最普遍提取偏好：利息先累积，商户自主决定何时转入余额/本金  

---

## 2. 关键决策（事实陈述已确认）

| 决策项 | 结论 |
|---|---|
| 计息模式（本次核心） | **Simple Interest（非复利）**：利息不入本金、不再生息 |
| 利率 | 复利 **5%** → 隔离单利 **4.87%**（税前） |
| 功能性质 | **可选**，非强制；有需求商户才开启 |
| 利息转移 | 商户手动 **Transfer to OWealth**（利息 → 本金账户） |
| 配置维度 | **商户维度**；开启后总部 + 全部分支机构同时生效 |
| 权限 | 仅 **Headquarter Admin** 可改；Branch Admin 不可改 |
| 计划版本 | **0910** |

> **DEMO 说明（V0.3）：** 利率已对齐 **4.87%**；转移按钮按产品约定保留文案 **Transfer to Principal**（事实陈述 TL 反馈原为 Transfer to OWealth）。

---

## 3. 三种利息处理模式

| 模式 | 处理方式 | 复利 | 利率 | 客群 |
|---|---|---|---|---|
| **模式一：复利（默认）** | 利息回理财账户，继续复利 | 是 | 5% p.a. 税前 | 全部 KA |
| **模式二：单利隔离（本次核心）** | 独立利息账户，不再生息，可转回本金 | 否 | **4.87%** p.a. 税前 | 有隔离需求商户 |
| **模式三：非利息** | 不产生利息 | 否 | N/A | 穆斯林等合规客群 |

说明：模式二与模式三为**独立配置项**；二者互斥/共存关系仍为待确认项（见第 8 节）。

---

## 4. 功能需求

### 4.1 Interest Settings（设置）

| ID | 需求 | 优先级 | DEMO |
|---|---|---|---|
| S-01 | Setting 模块提供利息模式配置入口 | P0 | ✅ |
| S-02 | 三种模式：复利 / 隔离单利 / 非利息 | P0 | ✅ |
| S-03 | Compound 5% / Simple Isolation 4.87% | P0 | ✅ |
| S-04 | 复利为系统默认推荐 | P0 | ✅ |
| S-05 | 仅总部管理员可改；分支不可改 | P0 | ❌ 未做权限模拟 |
| S-06 | 开启后总部+全部分支同时生效 | P0 | ❌ 文案提示，未做多机构演示 |
| S-07 | 利率差异原因需在页面清晰说明 | P1 | ✅ |

### 4.2 OWealth 资产展示（PC）

| ID | 需求 | 优先级 | DEMO |
|---|---|---|---|
| O-01 | 复利：单卡展示 OWealth，利率 5% | P0 | ✅ |
| O-02 | 隔离：Principal Account + Interest Account 分开展示 | P0 | ✅（文案接近） |
| O-03 | 本金统计**不含**隔离利息 | P0 | ✅ |
| O-04 | Interest 支持转本金（DEMO 文案：Transfer to Principal） | P0 | ✅ |
| O-05 | 可从本金或利息账户提取到 Balance | P1 | ⚠️ 利息侧仅 Transfer to Principal |
| O-06 | 利息隔离账户**不参与支付** | P0 | ⚠️ Interest 卡有文案提示，未做支付拦截演示 |
| O-07 | Balance 等对外展示：OWealth = **仅 Principal** | P0 | ❌ Balance 页未联动改造 |

### 4.3 交易明细

| ID | 需求 | 优先级 | DEMO |
|---|---|---|---|
| T-01 | 查询拆为两个 Tab：**Principal Account** / **Interest Account** | P0 | ✅ |
| T-02 | 两 Tab 各自独立维护 Before/After 余额 | P0 | ✅ |
| T-03 | Interest（日发息）流水只出现在 Interest Tab | P0 | ✅ |
| T-04 | 利息转本金：Principal Inflow + Interest Outflow | P0 | ✅ |
| T-05 | 交易类型 `Interest Transfer to Principal` | P0 | ✅ |

### 4.4 Statement 导出

| ID | 需求 | 优先级 | DEMO |
|---|---|---|---|
| E-01 | PDF 拆分（正式）/ DEMO 先 CSV 拆分 | P0 | ⚠️ DEMO 已实现 CSV 分账户下载 |
| E-02 | CSV 按账户维度可选导出 | P0 | ✅ |
| E-03 | 字段/签章与现网一致 | P0 | ⚠️ 含声明与 Summary 字段，无 PDF 签章 |
| E-04 | Account Summary 字段 | P0 | ✅ CSV 内含 |

现网 Statement 基准字段（事实陈述 §6.1）：

**Account Summary：** Branch Name / Summary Dates / Opening Balance / Closing Balance / Inflow Count / Outflow Count / Total Inflows / Total Outflows  

**Transaction Details：** Transaction Date / Type / Balance Before / Inflow / Outflow / Balance After  

**现有类型：** Interest / Payment Withdraw / Deposit  

### 4.5 账户与记账规则（研发约束）

| ID | 需求 | 优先级 | DEMO |
|---|---|---|---|
| A-01 | 开启隔离后自动开立 **Interest Isolation Account**（OWealth 产品侧内部账户） | P0 | ⚠️ 前端模拟双卡，无账户模型 |
| A-02 | Account Core **暂不开**独立实体账户 | P0 | N/A（DEMO） |
| A-03 | 隔离账户余额**不纳入计息本金** | P0 | ✅ Time Travel 逻辑按模式分流 |
| A-04 | 隔离账户余额**不纳入可支付余额** | P0 | ❌ |
| A-05 | 转移操作生成完整交易记录（Before / Amount / After） | P0 | ✅ |

### 4.6 移动端（本期范围，DEMO 未覆盖）

| ID | 需求 | 优先级 | DEMO |
|---|---|---|---|
| M-01 | SuperBapp OWealth 页本息分离展示 | P0 | ❌ 超出当前 PC DEMO |
| M-02 | 移动端交易记录双 Tab | P0 | ❌ |

---

## 5. 与当前 DEMO 对齐情况

### 5.1 已覆盖（可演示）

- Settings → 三种模式：Compound 5% / Isolation 4.87% / Non-Interest  
- OWealth 按模式切换单卡 / 双卡；Transfer to Principal  
- Detail 双 Tab（Principal / Interest）+ 日期筛选  
- 转本金双边流水；日息写入对应账户  
- CSV Statement 分账户下载（含 Account Summary）  
- Time Travel 计息分流（复利用日复利公式） 

### 5.2 仍待补

1. HQ Admin 权限 / 全分支生效演示  
2. Balance 页 OWealth = Principal only 联动  
3. PDF Statement + 签章  
4. SuperBapp 移动端  
5. 利息直提 Balance（可选后续）  

---

## 6. 验收要点（产品侧）

### Settings

- [ ] HQ Admin 可配置三种模式；Branch Admin 不可改  
- [ ] 开启隔离后，全部分支同步生效  
- [ ] 隔离模式明确展示 4.87%，并说明相对 5% 的原因  

### OWealth

- [ ] 隔离后本金与利息分开展示；本金不含利息  
- [ ] Transfer to OWealth 路径清晰  
- [ ] 隔离利息不可用于支付  

### 交易与 Statement

- [ ] Principal / Interest 双 Tab，余额独立  
- [ ] 日息仅在 Interest Tab；转本金双边记账  
- [ ] 可分别导出 Principal / Interest 的 PDF 与 CSV  
- [ ] Balance 页 OWealth 金额 = Principal only  

---

## 7. 业务价值（事实陈述）

1. 投资资金透明度与可视化  
2. 信任与信心提升  
3. 优化会计核算与对账  
4. 推动 OWealth AUM / 采用率  
5. 支持 KA 差异化竞争  

---

## 8. 风险与待确认（事实陈述 §8）

| 事项 | 建议责任方 | 节奏 |
|---|---|---|
| 利率下降沟通口径（避免被理解为“降息”） | 产品 + KA 业务 | PRD 评审前 |
| 非利息模式与隔离模式互斥关系 | 产品 + 合规 | 技术方案评审前 |
| WHT 在隔离账户的计提/扣减规则 | 产品 + 财务税务 | 技术方案评审前 |
| 历史利息是否追溯拆分 | 产品 + 数据/研发 | PRD 阶段 |
| 利息转本金后何时再计息（T+0 vs T+1） | 产品 + 研发 | PRD 阶段 |
| SuperBapp 改造页面清单 | 产品 + 移动端 | 迭代启动前 |

---

## 9. 术语

| 术语 | 定义 |
|---|---|
| OWealth | OPay 活期理财，面向 KA 余额增值 |
| Principal Account | 本金账户 |
| Interest Isolation Account | 利息隔离账户 |
| Superbalance | 商户在 OPay 资金账户统称 |
| WHT | 预扣税 |
| Compound / Simple Interest | 复利 / 单利 |

---

## 10. 修订记录

| 版本 | 日期 | 说明 |
|---|---|---|
| V0.1 | 2026-09-10 | 仅基于 DEMO 与会话整理的草稿 |
| V0.2 | 2026-09-10 | 对齐飞书事实陈述全文；修正利率 4.87%；补齐账户/流水/Statement/权限/待确认项；标注 DEMO Gap |
| V0.3 | 2026-09-10 | DEMO 对齐：4.87%、三模式、双 Tab 流水、双边转本金、CSV Statement；Transfer 文案保留 Transfer to Principal |
