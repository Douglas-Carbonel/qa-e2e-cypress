const https = require('https')
const fs = require('fs')

const apiKey = process.env.QA4_API_KEY
if (!apiKey) {
    console.error('4QA: QA4_API_KEY não definida')
    process.exit(1)
}

const url = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-sync?api_key=' + apiKey

https.get(url, (res) => {
    let data = ''
    res.on('data', d => data += d)
    res.on('end', () => {
        try {
            const { titleMap } = JSON.parse(data)
            if (!titleMap) {
                console.error('4QA: resposta inválida —', data)
                process.exit(1)
            }
            fs.writeFileSync('qa4-scenarios.json', JSON.stringify(titleMap, null, 2), 'utf-8')
            console.log('4QA: sincronizados', Object.keys(titleMap).length, 'cenários')
        } catch (e) {
            console.error('4QA: erro ao processar resposta —', e.message)
            process.exit(1)
        }
    })
}).on('error', (e) => {
    console.error('4QA: erro de rede —', e.message)
    process.exit(1)
})