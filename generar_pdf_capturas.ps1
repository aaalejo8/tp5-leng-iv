param([switch]$ConservarCapturas)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$temp = Join-Path $root '.capturas_pdf_tmp'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$output = Join-Path $root 'Capturas_codigo_Header_Footer_Blob.pdf'

if (-not (Test-Path -LiteralPath $chrome)) {
  throw 'No se encontro Google Chrome para generar las capturas y el PDF.'
}

New-Item -ItemType Directory -Path $temp -Force | Out-Null

function Html([string]$value) {
  return [System.Net.WebUtility]::HtmlEncode($value)
}

function Crear-Captura {
  param(
    [string]$Nombre,
    [string]$Archivo,
    [int[]]$Rangos
  )

  $path = Join-Path $root $Archivo
  $lines = @(Get-Content -LiteralPath $path -Encoding UTF8)
  $rows = [System.Collections.Generic.List[string]]::new()
  for ($index = 0; $index -lt $Rangos.Length; $index += 2) {
    if ($rows.Count -gt 0) {
      $rows.Add('<div class="ellipsis">  ···  líneas intermedias omitidas  ···</div>')
    }
    for ($number = $Rangos[$index]; $number -le $Rangos[$index + 1]; $number++) {
      $code = Html $lines[$number - 1]
      $code = [regex]::Replace($code, '\b(import|from|function|return|const|new|async|await|if|export|default)\b', '<span class="keyword">$1</span>')
      $rows.Add('<div class="line"><span class="number">' + $number + '</span><span class="source">' + $code + '</span></div>')
    }
  }

  $height = 100 + ($rows.Count * 25)
  $page = @"
<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;width:900px;height:${height}px;overflow:hidden}
body{background:#0d1117;color:#e6edf3;font-family:Consolas,'Cascadia Code',monospace}
.editor{margin:0;width:900px;height:${height}px;background:#0d1117;border:1px solid #30363d}
.bar{height:48px;display:flex;align-items:center;gap:12px;padding:0 21px;background:#161b22;border-bottom:1px solid #30363d;font:14px Arial,sans-serif;color:#c9d1d9}
.dots{letter-spacing:5px;color:#f78166}.filename{margin-left:12px;font-weight:600}
.body{padding:18px 0 20px}.line{height:25px;display:flex;align-items:center;white-space:pre;font-size:15px;line-height:25px}
.number{flex:0 0 54px;padding-right:14px;text-align:right;color:#6e7681;user-select:none}.source{white-space:pre;color:#e6edf3}
.keyword{color:#ff7b72;font-weight:600}.ellipsis{height:25px;padding-left:55px;color:#8b949e;font-size:13px;line-height:25px}
</style></head><body><div class="editor"><div class="bar"><span class="dots">●●●</span><span class="filename">$(Html $Archivo)</span></div><div class="body">$($rows -join "`n")</div></div></body></html>
"@

  $htmlPath = Join-Path $temp "$Nombre.html"
  $pngPath = Join-Path $temp "$Nombre.png"
  [System.IO.File]::WriteAllText($htmlPath, $page, [System.Text.UTF8Encoding]::new($false))
  $uri = [System.Uri]::new($htmlPath).AbsoluteUri
  $profile = Join-Path $temp "chrome_$Nombre"
  $ErrorActionPreference = 'Continue'
  & $chrome --headless --disable-gpu --no-sandbox --disable-extensions --hide-scrollbars --force-device-scale-factor=1 --window-size="900,$height" --user-data-dir="$profile" --screenshot="$pngPath" "$uri" 2>$null | Out-Null
  $ErrorActionPreference = 'Stop'
  if (-not (Test-Path -LiteralPath $pngPath)) {
    throw "No se pudo generar la captura $Nombre."
  }
  return 'data:image/png;base64,' + [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($pngPath))
}

function Bloque-Captura([string]$src, [string]$caption) {
  return '<figure><img src="' + $src + '" alt="' + (Html $caption) + '"><figcaption>' + (Html $caption) + '</figcaption></figure>'
}

$header = Crear-Captura 'header' 'src/components/Header.js' @(1, 14)
$headerCss = Crear-Captura 'header_css' 'src/App.css' @(7, 19, 27, 35)
$footer = Crear-Captura 'footer' 'src/components/Footer.js' @(1, 11)
$footerCss = Crear-Captura 'footer_css' 'src/App.css' @(92, 101, 113, 116)
$blob = Crear-Captura 'blob' 'src/App.js' @(6, 21)
$download = Crear-Captura 'download' 'src/App.js' @(23, 40)
$slice = Crear-Captura 'slice' 'src/App.js' @(42, 58)
$integration = Crear-Captura 'integration' 'src/App.js' @(60, 88)

$pages = @(
  '<section class="page"><div class="kicker">LENGUAJES IV · REACT</div><h1>Header</h1><p class="intro">El componente muestra la materia y el número de trabajo práctico dentro de un encabezado semántico. <code>App.js</code> lo incorpora con <code>&lt;Header /&gt;</code>.</p>' + (Bloque-Captura $header 'Componente Header: estructura y contenido.') + (Bloque-Captura $headerCss 'Estilos del encabezado: contenedor, tipografía y borde inferior.') + '<div class="page-number">01 / 06</div></section>',
  '<section class="page"><div class="kicker">LENGUAJES IV · REACT</div><h1>Footer</h1><p class="intro">El pie de página está separado en su propio componente. Los estilos definen el borde superior, la alineación y el ajuste para pantallas pequeñas.</p>' + (Bloque-Captura $footer 'Componente Footer: estructura y texto.') + (Bloque-Captura $footerCss 'Estilos del pie y adaptación a pantallas de hasta 540 px.') + '<div class="page-number">02 / 06</div></section>',
  '<section class="page"><div class="kicker">LENGUAJES IV · REACT</div><h1>Creación del Blob</h1><p class="intro"><code>crearBlob</code> construye un archivo de texto en memoria a partir de <code>TEXTO_ARCHIVO</code>, lo guarda en el estado y muestra su tipo y tamaño.</p>' + (Bloque-Captura $blob 'App.js: estado, texto de origen y creación del Blob.') + '<div class="callout"><strong>Secuencia:</strong> texto → <code>new Blob(...)</code> → estado de React → mensajes de resultado.</div><div class="page-number">03 / 06</div></section>',
  '<section class="page"><div class="kicker">LENGUAJES IV · REACT</div><h1>Descarga del Blob</h1><p class="intro">Se comprueba que exista un Blob, se crea una URL temporal y se dispara la descarga mediante un enlace con el nombre <code>archivo.txt</code>. Después se libera la URL.</p>' + (Bloque-Captura $download 'App.js: URL temporal, enlace de descarga y liberación de recursos.') + '<div class="callout"><strong>API usada:</strong> <code>URL.createObjectURL</code> y <code>URL.revokeObjectURL</code>.</div><div class="page-number">04 / 06</div></section>',
  '<section class="page"><div class="kicker">LENGUAJES IV · REACT</div><h1>Recorte con slice()</h1><p class="intro">La función obtiene los primeros 20 bytes del Blob, lee su contenido como texto y muestra el tamaño original, el tamaño de la porción y el resultado.</p>' + (Bloque-Captura $slice 'App.js: creación y lectura de una porción del Blob.') + '<div class="callout"><strong>Detalle:</strong> <code>slice(inicio, fin, tipo)</code> crea un nuevo Blob sin modificar el original.</div><div class="page-number">05 / 06</div></section>',
  '<section class="page"><div class="kicker">LENGUAJES IV · REACT</div><h1>Integración en la interfaz</h1><p class="intro">El componente principal presenta el header, los tres botones que ejecutan las funciones del Blob, el área de mensajes y el footer.</p>' + (Bloque-Captura $integration 'App.js: composición de componentes y acciones disponibles.') + '<div class="page-number">06 / 06</div></section>'
)

$report = @"
<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Capturas de código — Header, Footer y Blob</title><style>
@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#dce5e0;color:#12211b;font-family:Arial,Helvetica,sans-serif}
.page{position:relative;width:210mm;height:297mm;overflow:hidden;background:#fafcfb;padding:12mm 17mm;break-after:page;page-break-after:always}
.page:last-child{break-after:auto;page-break-after:auto}.kicker{font-size:10pt;letter-spacing:2.3px;font-weight:700;color:#26804b;margin-bottom:4mm}
h1{font-size:27pt;line-height:1.1;margin:0 0 5mm;color:#173a29}.intro{font-size:11pt;line-height:1.5;margin:0 0 4mm;color:#41564a}
figure{margin:0 0 3mm}figure img{display:block;width:100%;height:auto;border:1px solid #d8e1dc;border-radius:5px}figcaption{font-size:9pt;color:#63756b;margin:2mm 0 0}
code{font-family:Consolas,monospace;font-size:.95em;color:#125d37}.callout{margin-top:8mm;padding:5mm 6mm;border-left:4px solid #35a561;background:#eaf5ed;font-size:10.5pt;line-height:1.5;color:#284635}
.page-number{position:absolute;bottom:10mm;right:17mm;font-size:9pt;color:#778c7e}
</style></head><body>$($pages -join "`n")</body></html>
"@

$reportPath = Join-Path $temp 'informe.html'
[System.IO.File]::WriteAllText($reportPath, $report, [System.Text.UTF8Encoding]::new($false))
$reportUri = [System.Uri]::new($reportPath).AbsoluteUri
$pdfProfile = Join-Path $temp 'chrome_pdf'
if (Test-Path -LiteralPath $output) {
  Remove-Item -LiteralPath $output -Force
}
$ErrorActionPreference = 'Continue'
& $chrome --headless --disable-gpu --no-sandbox --disable-extensions --no-pdf-header-footer --user-data-dir="$pdfProfile" --print-to-pdf="$output" "$reportUri" 2>$null | Out-Null
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $output)) {
  throw 'No se pudo generar el PDF.'
}

if (-not $ConservarCapturas) {
  Remove-Item -LiteralPath $temp -Recurse -Force
}

Write-Output $output
