# CF-Workers-DNS-MultiIP
以下是一个可以部署到CloudFlare Workers上的JavaScript代码，它会自动将一个域名解析到多个IP地址。这个脚本会使用CloudFlare的API来管理DNS记录。

#环境变量配置说明
现在你可以通过设置以下环境变量来配置脚本：

| 变量名         | 必填 | 示例值                     | 说明 |
|----------------|------|----------------------------|------|
| `API_TOKEN`    | 是   | `your_api_token_here`      | Cloudflare API 令牌（需 DNS 编辑权限） |
| `ZONE_ID`      | 是   | `your_zone_id_here`        | Cloudflare 区域 ID |
| `DNS_RECORD_NAME` | 否  | `sub.example.com`          | 要管理的 DNS 记录名称 |
| `DNS_RECORD_TYPE` | 否  | `A` 或 `AAAA`              | DNS 记录类型 |
| `IP_ADDRESSES` | 否   | `1.1.1.1,2.2.2.2,3.3.3.3` | 逗号分隔的 IP 地址列表 |
| `TTL`         | 否   | `300`                      | TTL 时间（秒），1 表示自动 |
| `PROXIED`     | 否   | `true` 或 `false`          | 是否通过 Cloudflare CDN 代理 |
| `AUTO_UPDATE` | 否   | `true` 或 `false`          | 是否自动更新 DNS 记录 |
