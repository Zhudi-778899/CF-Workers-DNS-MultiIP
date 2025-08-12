// CloudFlare Worker脚本 - 自动多IP解析(使用环境变量配置)

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 从环境变量获取配置
  const config = {
    apiToken: API_TOKEN, // 必须的环境变量
    zoneId: ZONE_ID,     // 必须的环境变量
    dnsRecordName: DNS_RECORD_NAME || 'example.com',
    dnsRecordType: DNS_RECORD_TYPE || 'A',
    ttl: TTL ? parseInt(TTL) : 1,
    proxied: PROXIED ? PROXIED.toLowerCase() === 'true' : false,
    ipAddresses: IP_ADDRESSES ? IP_ADDRESSES.split(',') : ['192.0.2.1', '192.0.2.2'],
    autoUpdate: AUTO_UPDATE ? AUTO_UPDATE.toLowerCase() === 'true' : true
  }

  // 验证必要配置
  if (!config.apiToken || !config.zoneId) {
    return new Response('缺少必要配置: API_TOKEN和ZONE_ID必须设置', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  // 如果不是自动更新模式，需要手动触发
  if (!config.autoUpdate && new URL(request.url).pathname !== '/update-dns') {
    return new Response('DNS自动更新未启用，请访问/update-dns手动触发', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
  
  try {
    // 获取现有记录
    const existingRecords = await getExistingDnsRecords(config)
    
    // 删除不需要的记录
    await deleteUnwantedRecords(config, existingRecords)
    
    // 添加缺失的记录
    await addMissingRecords(config, existingRecords)
    
    return new Response('DNS记录更新成功\n\n当前配置:\n' + 
      `域名: ${config.dnsRecordName}\n` +
      `类型: ${config.dnsRecordType}\n` +
      `IP列表: ${config.ipAddresses.join(', ')}\n` +
      `TTL: ${config.ttl}\n` +
      `代理: ${config.proxied ? '是' : '否'}`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      }
    )
  } catch (error) {
    return new Response(`DNS记录更新失败: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

// 获取现有的DNS记录
async function getExistingDnsRecords(config) {
  const url = `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records?type=${config.dnsRecordType}&name=${config.dnsRecordName}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(`获取DNS记录失败: ${JSON.stringify(data.errors)}`)
  }
  
  return data.result
}

// 删除不需要的记录
async function deleteUnwantedRecords(config, existingRecords) {
  const recordsToDelete = existingRecords.filter(record => 
    !config.ipAddresses.includes(record.content)
  )
  
  for (const record of recordsToDelete) {
    const url = `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records/${record.id}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`删除DNS记录失败: ${JSON.stringify(data.errors)}`)
    }
  }
}

// 添加缺失的记录
async function addMissingRecords(config, existingRecords) {
  const existingIps = existingRecords.map(record => record.content)
  const ipsToAdd = config.ipAddresses.filter(ip => !existingIps.includes(ip))
  
  for (const ip of ipsToAdd) {
    const url = `https://api.cloudflare.com/client/v4/zones/${config.zoneId}/dns_records`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: config.dnsRecordType,
        name: config.dnsRecordName,
        content: ip,
        ttl: config.ttl,
        proxied: config.proxied
      })
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`添加DNS记录失败: ${JSON.stringify(data.errors)}`)
    }
  }
}