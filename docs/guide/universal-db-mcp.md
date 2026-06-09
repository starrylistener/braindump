# Tarzan Mes - Universal DB MCP 使用指南

> 本文档只介绍 **Tarzan Mes 定制版** 的增量功能。原版功能（数据库连接、查询、Schema 获取等）请参考 [universal-db-mcp 原版文档](https://github.com/Anarkh-Lee/universal-db-mcp)。

---

## 关于本项目

**Tarzan Mes - Universal DB MCP** 是基于开源项目 [universal-db-mcp](https://github.com/Anarkh-Lee/universal-db-mcp) 的**定制化开发版本**。

在原版强大的数据库连接能力之上，我们针对 **Hzero 平台** 的业务场景进行了深度定制，新增了 `insert_exception_data` 工具，用于错误码及多语言提示信息的自动化维护。

**致谢友链：**
- 原版仓库：[https://github.com/Anarkh-Lee/universal-db-mcp](https://github.com/Anarkh-Lee/universal-db-mcp)
- 定制仓库：[https://github.com/starrylistener/universal-db-mcp-mes](https://github.com/starrylistener/universal-db-mcp-mes)

**定制版 vs 原版的差异：**

| 功能 | 原版 | 定制版 (Tarzan Mes) |
|------|------|---------------------|
| 数据库连接 | 17 种数据库 | 17 种数据库 |
| MCP 工具 | 9 个 | **10 个**（新增 `insert_exception_data`） |
| Hzero 错误码维护 | 不支持 | **支持** |
| 多语言错误信息 | 不支持 | **支持** |

---

## 目录

- [安装方式](#安装方式)
- [新增 MCP 工具](#新增-mcp-工具)
- [定制功能：Hzero 错误码维护](#定制功能hzero-错误码维护)
- [新增参数参考](#新增参数参考)
- [相关文档](#相关文档)

---

## 安装方式

1. **下载 .tgz 包**

```bash
curl -LO https://github.com/starrylistener/universal-db-mcp-mes/releases/download/mes-0.0.3/universal-db-mcp-mes-mes-0.0.3.tgz
```

2. **全局安装**

```bash
npm install -g https://github.com/starrylistener/universal-db-mcp-mes/releases/download/mes-0.0.3/universal-db-mcp-mes-mes-0.0.3.tgz
```

3. **验证安装**

```bash
universal-db-mcp-mes --version
universal-db-mcp-mes --help
```

---

## 新增 MCP 工具

定制版在原有 9 个工具基础上，新增 **1 个工具**：

| 工具名 | 功能 | 所需权限 |
|--------|------|----------|
| `insert_exception_data` | 向 Hzero 平台注册新的错误码及其多语言提示信息 | `insert`（至少 `readwrite` 模式） |

原版工具（`execute_query`、`get_schema`、`get_table_info`、`get_enum_values`、`get_sample_data`、`clear_cache`、`connect_database`、`disconnect_database`、`get_connection_status`）的使用方式请参考 [原版文档](https://github.com/Anarkh-Lee/universal-db-mcp)。

---

## 定制功能：Hzero 错误码维护

这是 **Tarzan Mes 定制版** 的核心扩展功能。

### 功能概述

当用户在对话中描述以下业务场景时，AI 会自动调用 `insert_exception_data` 工具：

- "总结本次新增功能点中错误信息，并调用`insert_exception_data`进行插入"

### 工作流程

1. 用户描述业务报错场景
2. AI 生成候选 `MESSAGE_CODE`（格式：`模块名.模块描述_递增编号`，如 `HME.WORKING_PART_NEW_044`）
3. AI 展示候选编码和各语言翻译，**必须征得用户确认**后再调用工具
4. 工具自动完成：
   - 批量从 `mt_sys_sequence` 生成唯一 `MESSAGE_ID`（带 `FOR UPDATE` 锁防并发冲突）
   - 向主表 `mt_error_message` 批量插入
   - 向多语言表 `mt_error_message_tl` 批量插入
   - 自动填充租户 ID、审计字段、初始标识
   - 失败自动回滚事务

### MCP stdio 配置示例

```json
{
  "mcpServers": {
    "hzero-db": {
      "command": "universal-db-mcp-mes",
      "args": [
        "--type", "mysql",
        "--host", "localhost",
        "--port", "3306",
        "--user", "root",
        "--password", "your_password",
        "--database", "hzero_platform",
        "--permission-mode", "readwrite",
        "--error-table", "mt_error_message",
        "--error-tl-table", "mt_error_message_tl",
        "--error-seq-name", "mt_error_message_s",
        "--error-locales", "zh_CN,en_US",
        "--error-seq-suffix", "001"
      ]
    }
  }
}
```

**注意：** `--permission-mode` 不能是 `safe`（默认），因为 `insert_exception_data` 需要 `insert` 权限。

### HTTP API 调用

```bash
curl -X POST http://localhost:3000/api/insert-exception-data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{
    "sessionId": "abc123",
    "data": [
      {
        "MESSAGE_CODE": "HME.WORKING_PART_NEW_044",
        "MESSAGE": ["连接超时", "Connection timeout"]
      }
    ]
  }'
```

### 多语言传入规则

- `MESSAGE` 传字符串数组，长度必须等于 `--error-locales` 配置的语言数量
- 数组顺序严格对应 `--error-locales` 的顺序
- 示例：`--error-locales zh_CN,en_US` 时，`MESSAGE` 应为 `["连接超时", "Connection timeout"]`
- 仅当用户明确表示"只用中文"或"所有语言相同"时，才可传单个字符串

### MESSAGE_CODE 生成规则

- **格式**：`模块名.模块描述_递增编号`（全大写）
- **示例**：`HME.WORKING_PART_NEW_044`
  - `HME` = 模块名
  - `WORKING_PART_NEW` = 模块描述（单词间下划线连接）
  - `044` = 递增编号
- AI 会根据业务上下文生成 2-3 个候选编码供用户选择

---

## 新增参数参考

### 命令行参数

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `--error-table` | 是 | - | 错误码主表名（如 `mt_error_message`） |
| `--error-tl-table` | 是 | - | 多语言表名（如 `mt_error_message_tl`） |
| `--error-seq-name` | 否 | `mt_error_message_s` | 序列表中的 NAME 字段值 |
| `--error-seq-suffix` | 否 | `001` | MESSAGE_ID 的后缀 |
| `--error-locales` | 否 | `zh_CN,en_US` | 支持的语言列表，逗号分隔 |
| `--error-database` | 否 | - | 表所在的数据库 / schema |

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ERROR_TABLE` | - | Hzero 错误码主表名 |
| `ERROR_TL_TABLE` | - | Hzero 错误码多语言表名 |
| `ERROR_SEQ_NAME` | `mt_error_message_s` | 序列表 NAME 值 |
| `ERROR_SEQ_SUFFIX` | `001` | 序列 ID 后缀 |
| `ERROR_LOCALES` | `zh_CN,en_US` | 支持的语言列表 |
| `ERROR_DATABASE` | - | 错误信息表所在数据库 / schema |
| `ERROR_MULTILANG` | `false` | 多语言开关 |

---

## 相关文档

- [universal-db-mcp 原版仓库](https://github.com/Anarkh-Lee/universal-db-mcp) — 原版功能完整文档
- [定制版 README（中文）](https://github.com/starrylistener/universal-db-mcp-mes/blob/main/README.zh-CN.md)
- [定制版仓库](https://github.com/starrylistener/universal-db-mcp-mes)
