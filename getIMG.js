async function getDataFromQR(url) {
  async function getFileInfo(uuid) {
    let a = await fetch('https://cmsapi-apse.seobuk.kr/v1/etc/seq/resource', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,zh-TW;q=0.5,zh;q=0.4',
        'content-type': 'application/json',
        priority: 'u=1, i',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://qr.seobuk.kr/',
      },
      body: `{\"uid\":\"${uuid}\",\"appUserId\":null}`,
      method: 'POST',
    })
    let data = await a.json()
    return data.content.fileInfo
  }
  const browserHeaders = {
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,zh-TW;q=0.5,zh;q=0.4',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'upgrade-insecure-requests': '1',
    // pass CloudFront
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  }
  try {
    const res1 = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: browserHeaders,
    })
    const redirectLocation = res1.headers.get('location')
    // console.log("redirectLocation:", redirectLocation);
    const urlObj = new URL(redirectLocation)
    const uParam = urlObj.searchParams.get('u')
    let data = await getFileInfo(uParam)
    // return (data);
    console.log('data:', data)
  } catch (err) {
    console.error('Lỗi:', err)
  }
}

getDataFromQR('https://qr.seobuk.kr/s/8ijZsg_')
