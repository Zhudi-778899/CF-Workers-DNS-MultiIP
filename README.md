# CF-Workers-DNS-MultiIP
以下是一个可以部署到CloudFlare Workers上的JavaScript代码，它会自动将一个域名解析到多个IP地址。这个脚本会使用CloudFlare的API来管理DNS记录。

#环境变量配置说明
现在你可以通过设置以下环境变量来配置脚本：

变量名	必填	默认值	说明
API_TOKEN	是	无	CloudFlare API令牌(需要DNS编辑权限)
ZONE_ID	是	无	CloudFlare区域ID
DNS_RECORD_NAME	否	'example.com'	要管理的DNS记录名称(如"example.com"或"sub.example.com")
DNS_RECORD_TYPE	否	'A'	DNS记录类型(A或AAAA)
TTL	否	1	TTL时间(秒)，1是自动
PROXIED	否	'false'	是否通过CloudFlare CDN('true'或'false')
IP_ADDRESSES	否	'192.0.2.1,192.0.2.2'	逗号分隔的IP地址列表
AUTO_UPDATE	否	'true'	是否自动更新('true'或'false')
