// Converte dist-artifact/index.html no corpo de página que o Artifact espera:
// sem doctype/html/head/body, com <title> e estilos no topo.
// O JS embutido pode conter "<head>"/"<body>" em strings, por isso o recorte
// usa a primeira <head> e as últimas </head>, <body> e </body>.
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist-artifact/index.html', 'utf8')
const head = html.slice(html.indexOf('<head>') + 6, html.lastIndexOf('</head>'))
const body = html.slice(html.lastIndexOf('<body>') + 6, html.lastIndexOf('</body>'))
const title = head.match(/<title>[\s\S]*?<\/title>/)[0]
const rest = head.replace(title, '').replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '')
writeFileSync('dist-artifact/meu-editor.html', `${title}\n${rest.trim()}\n${body.trim()}\n`)
