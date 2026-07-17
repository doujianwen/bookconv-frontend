# 迁移到其他电脑的完整步骤

## 前置条件

在新电脑上你需要：

1. **Multica Desktop App** — 已安装并登录
2. **Claude Code / Codex** — 已安装
3. **Git Bash** — Windows 上需要（脚本是 bash 写的）
4. **Python 3** — 用于 JSON 解析（`python3` 命令可用）

## ⚠️ 重要注意事项

**如果你的新电脑连接的是同一个 Multica workspace（同一个项目、同一个账号），直接按下面步骤操作即可，零额外配置。**

但如果 workspace 变了（换了账号、换了 workspace），需要手动更新模板中的 `project_id`：
- 在 `.multica-templates/issues/phase*.md` 里找到 `project_id` 字段
- 改为新 workspace 中对应项目的 ID（可以用 `multica issue list --output json` 查看）

---

## 操作步骤

### Step 1: 获取项目代码

```bash
git clone <your-repo-url>
cd 电子书格式转换站
```

或者直接把整个项目文件夹复制到新电脑。

### Step 2: 安装 Multica CLI

Multica Desktop App 安装后，CLI 在：
```
C:\Users\<你的用户名>\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin\multica.exe
```

把它加到 PATH（永久）：
```powershell
# 在 PowerShell (管理员) 中运行：
[Environment]::SetEnvironmentVariable(
    "PATH",
    "$([Environment]::GetEnvironmentVariable('PATH','User'));C:\Users\<你的用户名>\AppData\Local\Programs\@multicadesktop\resources\app.asar.unpacked\resources\bin",
    "User"
)
```

或者简单方法：打开 Multica Desktop App，它会自动注册 CLI。

### Step 3: 登录 Multica

```bash
multica login
```

按提示完成 OAuth 登录。

### Step 4: 运行检查脚本

```bash
bash scripts/setup-codex-multica-sync.sh
```

这个脚本会：
- 检查 multica CLI 是否在 PATH 中
- 检查是否已登录
- 检查 workspace 是否可达
- 验证项目文件是否齐全

全部 green 就可以用了。

### Step 5: 配置 Claude Code 权限

确保 `.claude/settings.json` 中有以下权限：

```json
{
  "permissions": {
    "allow": [
      "Bash(bash scripts/codex-multica-sync.sh *)"
    ]
  }
}
```

## 常见问题

### Q: `multica: command not found`
A: Multica Desktop App 没打开过。先打开一次 App，它会自动注册 CLI 到 PATH。

### Q: `not logged in`
A: 运行 `multica login` 重新认证。

### Q: `python3: command not found`
A: Python 没装或没加到 PATH。脚本用 python3 解析 JSON 输出。

### Q: 模板不在原来的 workspace 里
A: 见上方「重要注意事项」，workspace 变了才需要更新 `project_id`。同一个 workspace 无需任何改动。

## 一键迁移脚本（可选）

如果你想自动化整个迁移过程，可以创建一个打包脚本：

```bash
# 在源电脑上打包需要同步的文件
tar czf codex-multica-sync.tar.gz \
    scripts/codex-multica-sync.sh \
    scripts/setup-codex-multica-sync.sh \
    .multica-templates/issues/ \
    .claude/settings.json \
    docs/codex-multica-sync.md
```

然后把 `codex-multica-sync.tar.gz` 拷贝到新电脑解压即可。
