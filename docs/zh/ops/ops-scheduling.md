> **生产服务器说明（2026-08-05 更新）**：当前生产环境部署在 Vercel（无常驻进程），莹云 VPS（149.104.69.126）尚未部署应用。以下 crontab 方案待 VPS 部署后启用。
>
> VPS 状态：
> - IP: 149.104.69.126 | 实例ID: ecs-di00005bwn85
> - SSH 22 端口开放，但密钥未注入，需先在莹云控制台注入公钥
> - 端口 80 运行其他网站，3000 端口未监听
>
# 杩愯惀瀹¤璋冨害鏂规

> 2026-07-30 路 瑙ｅ喅 ai-audit.js 鏃犲畾鏃惰皟搴﹂棶棰?
## 涓€銆佺幇鐘惰瘖鏂?
| 缁勪欢 | 鏄惁瀹氭椂 | 璇存槑 |
|------|---------|------|
| `ai-audit.js`锛堣繍钀ュ璁★細鍗氬鏁?闃熷垪/鎴愬姛鐜?椋炰功鎺ㄩ€侊級 | 鉂?鏃犺皟搴?| 鏃ュ織闈犳墜鍔ㄨ窇锛屾湰鍦版棤 cron/schtasks |
| `weekly-audit.yml` | 鉁?姣忓懆鏃?21:30 | 浣嗚窇鐨勬槸**浠ｇ爜璐ㄩ噺瀹℃煡**锛坱sc/eslint锛夛紝涓嶆槸杩愯惀瀹¤锛泈ebhook 涔熶笉鍚岋紙`422e94ef`锛?|
| `audit.yml` | PR 瑙﹀彂 | CI 闂ㄧ锛岄潪瀹氭椂 |

缁撹锛?*杩愯惀瀹¤鑴氭湰娌℃湁浠讳綍瀹氭椂璋冨害**銆傝繖鏄?v2.1 闃舵涓€鐨勫緟淇」銆?
## 浜屻€佷负浠€涔堝湪鐢熶骇鏈嶅姟鍣ㄨ窇锛堣€岄潪 GitHub Actions锛?
`ai-audit.js` 瑕佺粰鐪熷疄鏁版嵁锛屽繀椤昏繛寰椾笂锛?- 鐢熶骇 Redis锛坄llen conversion:queue`锛夆€斺€?GitHub Actions runner 杩炰笉涓婄敓浜?Redis
- 鐢熶骇 app 鏃ュ織锛堢粺璁¤浆鎹㈡垚鍔熺巼锛夆€斺€?runner 璇讳笉鍒?
鎵€浠ュ湪 GitHub Actions runner 閲岃窇锛孮ueue 浼氭槸 `unknown`銆丼uccess rate 浼氭槸 `assumed`锛屽張鍥炲埌"缂烘暟鎹?銆?*蹇呴』鍦ㄧ敓浜ф湇鍔″櫒璺?*銆?
## 涓夈€佹帹鑽愭柟妗堬細鐢熶骇鏈嶅姟鍣?crontab

### 姝ラ 1锛氶厤缃涔?webhook

鐢熶骇鏈嶅姟鍣?`ebook-converter/.env` 鍔犱竴琛岋細
```
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/a7a8f44f-5a4b-4cd3-a8c9-2f9260512493
```
锛坉ocker-compose.yml 宸插姞鍗犱綅 `${FEISHU_WEBHOOK:-}`锛屼粠 .env 璇伙級

閲嶅惎 app 浣跨幆澧冨彉閲忕敓鏁堬細
```bash
cd <閮ㄧ讲鐩綍>/ebook-converter
docker compose up -d app
```

### 姝ラ 2锛氶厤缃?crontab

鐢熶骇鏈嶅姟鍣ㄦ墽琛?`crontab -e`锛屽姞锛?```cron
# 姣忓ぉ 08:00 璺戣繍钀ュ璁★紙鍖椾含鏃堕棿锛夛紝杈撳嚭閲嶅畾鍚戝埌瀹夸富鏈烘棩蹇?0 0 * * * cd <閮ㄧ讲鐩綍>/ebook-converter && docker compose exec -T app node /app/scripts/ai-audit.js >> /var/log/ops-audit.log 2>&1
```
> - `<閮ㄧ讲鐩綍>` 鎸夌敓浜у疄闄呰矾寰勬浛鎹?> - cron 鐢?UTC锛屽寳浜椂闂?08:00 = UTC 00:00
> - 鑴氭湰缁?Dockerfile `COPY . .` 宸叉墦杩涢暅鍍?`/app/scripts/ai-audit.js`
> - `REDIS_URL=redis://redis:6379` 鐢?docker-compose 閰嶅ソ锛屽鍣ㄥ唴鍙繛

### 姝ラ 3锛氶獙璇?
鎵嬪姩璺戜竴娆＄‘璁ゅ叏閾捐矾锛?```bash
cd <閮ㄧ讲鐩綍>/ebook-converter
docker compose exec -T app node /app/scripts/ai-audit.js
```
棰勬湡杈撳嚭锛?- `Blog posts: 7`锛堢湡瀹烇級
- `Queue size: <鐪熷疄鏁板瓧>`锛堣繛寰椾笂 Redis锛屼笉鍐嶆槸 unknown锛?- `Success rate: 95% (鍋囪鍊硷紝鏃犳棩蹇?` 鈥斺€?寰呬换鍔?锛堢粨鏋勫寲鏃ュ織锛夊畬鎴愬悗鍙樼湡瀹炵粺璁?- 椋炰功缇ゆ敹鍒板璁℃秷鎭?
## 鍥涖€佸閫夋柟妗堬細GitHub Actions 瀹氭椂 SSH

鑻ヤ笉鎯冲姩鐢熶骇 crontab锛屽彲鍔?workflow 瀹氭椂 SSH 杩涚敓浜ц窇锛?```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 姣忓ぉ UTC 00:00
jobs:
  ops-audit:
    runs-on: ubuntu-latest
    steps:
      - name: SSH 璺戣繍钀ュ璁?        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: cd <閮ㄧ讲鐩綍>/ebook-converter && docker compose exec -T app node /app/scripts/ai-audit.js
```
闇€鍦?GitHub Secrets 閰?`PROD_HOST`/`PROD_USER`/`PROD_SSH_KEY`銆傛瘮 crontab 閲嶏紝**涓嶆帹鑽?*锛岄櫎闈炲凡鏈?SSH 鍩哄缓銆?
## 浜斻€佹敞鎰忎簨椤?
1. **鏃ュ織鎸佷箙鍖?*锛歚ai-audit.js` 鎶婃棩蹇楀啓鍦ㄥ鍣ㄥ唴 `/logs/ai-operation.txt`锛屽鍣ㄩ噸鍚細涓€備絾椋炰功宸叉帹閫侊紝鏃犵銆傚闇€鎸佷箙鍖栧巻鍙叉棩蹇楋紝缁?docker-compose 鍔?`logs` volume 鎸傝浇銆?2. **閫€鍑虹爜**锛氬綋鍓?`warning` 鐘舵€侀€€鍑虹爜璇箟寰呮槑纭紙瑙?v2.1 鏂规绗節鑺傦級銆傝嫢 cron 渚濊禆閫€鍑虹爜鍙戝け璐ュ憡璀︼紝寤鸿 `warning=0`銆乣critical=1`銆?3. **缁撴瀯鍖栨棩蹇椾緷璧?*锛氭垚鍔熺巼鐩墠鏄?`assumed`锛岄渶瀹屾垚浠诲姟8锛坬ueue.ts 鍐欑粨鏋勫寲杞崲鏃ュ織锛夊悗鎵嶅彉鐪熷疄銆?
## 鍏€佹墽琛屾竻鍗?
- [ ] 鐢熶骇鏈嶅姟鍣?`.env` 閰?`FEISHU_WEBHOOK`锛宍docker compose up -d app`
- [ ] 鐢熶骇鏈嶅姟鍣?`crontab -e` 鍔犳瘡鏃ュ璁′换鍔?- [ ] 鎵嬪姩璺戜竴娆￠獙璇侊紙Blog=7銆丵ueue=鐪熷疄銆侀涔︽敹鍒帮級
- [ ] 锛堜换鍔?瀹屾垚鍚庯級楠岃瘉 Success rate 鍙樼湡瀹炵粺璁?