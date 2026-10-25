'use client'
import Link from 'next/link'
import { useState, useCallback } from "react"
import type { KeywordData } from "@/lib/constants"
import { FORMAT_DISPLAY_NAMES } from "@/lib/conversion-map"
import type { RelatedPostRef, RelatedGuideRef } from "@/lib/internal-links"
import { FileDropZone } from "@/components/tools/FileDropZone"
import { BeforeAfterComparison } from "@/components/tools/BeforeAfterComparison"
import { ConversionProgress, type ConversionStatus } from "@/components/tools/ConversionProgress"
import { isErrorCode, type ErrorCode } from "@/lib/error-handler"
import { extractApiError } from "@/lib/api-error"
import { FAQSection, generateDefaultFAQs } from "@/components/tools/FAQSection"
import { SECURITY_FAQ } from "@/lib/seo/securityFaq"
import { RelatedConversions } from "@/components/tools/RelatedConversions"
import { TrustBar } from "@/components/tools/TrustBar"
import { TestimonialCard } from "@/components/tools/TestimonialCard"
import { TESTIMONIALS } from "@/data/testimonials"
import { BatchConversionGuide } from "@/components/tools/BatchConversionGuide"
import { VideoTutorial } from "@/components/tools/VideoTutorial"
import { trackGAEvent } from "@/lib/ga"
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_MB, MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/file-size-limit"
import { uploadFileDirect, DirectUploadUnavailableError } from "@/lib/client/direct-upload"
import { sniffFileFormat } from "@/lib/file-format-sniffer"
import { FeedbackWidget } from "@/components/tools/FeedbackWidget"
import { KeyFactsSection } from "@/components/tools/KeyFactsSection"
import { KeyTakeawaysSection } from "@/components/tools/KeyTakeawaysSection"
import { chrome } from "@/lib/ui-chrome"
interface ContentData {
  hero?: { title?: string; subtitle?: string }
  sections?: Array<{ heading: string; body: string }>
  faq?: Array<{ q: string; a: string }>
  keyFacts?: Array<{ label: string; value: string }>
  keyTakeaways?: string[]
}
interface ToolPageClientProps {
  source: string
  target: string
  keyword: KeywordData
  tool: string
  description: string
  contentData?: ContentData | null
  /** M5-6：西语页 chrome 本地化开关（服务端按 locale+es 译文存在性判定后传入） */
  isEs?: boolean
  relatedBlogPosts?: RelatedPostRef[]
  relatedGuides?: RelatedGuideRef[]
}



type TutorialEntry = {
  videoUrl: string
  thumbnailUrl?: string
  title: string
  description?: string
  steps?: Array<{ title: string; description: string }>
  titleEs?: string
  descriptionEs?: string
  stepsEs?: Array<{ title: string; description: string }>
}
const VIDEO_TUTORIALS: Record<string, TutorialEntry> = {
  'lit-to-epub': {
    videoUrl: '/videos/lit-to-epub.mp4',
    title: 'How to Convert LIT to EPUB',
    description: 'Step-by-step guide to converting Microsoft LIT ebooks to universal EPUB format.',
    steps: [
      { title: 'Upload LIT file', description: 'Drag and drop your LIT file or click to browse.' },
      { title: 'Select EPUB output', description: 'Choose EPUB as the target format.' },
      { title: 'Wait for conversion', description: 'Conversion typically takes just a few seconds.' },
      { title: 'Download result', description: 'Click the button to download your converted EPUB file.' },
    ],
    titleEs: 'Cómo convertir LIT a EPUB',
    descriptionEs: 'Guía paso a paso para convertir ebooks LIT de Microsoft al formato EPUB universal.',
    stepsEs: [
      { title: 'Sube tu archivo LIT', description: 'Arrastra y suelta tu archivo LIT o haz clic para buscarlo.' },
      { title: 'Elige EPUB como salida', description: 'Selecciona EPUB como formato de destino.' },
      { title: 'Espera la conversión', description: 'La conversión suele tardar solo unos segundos.' },
      { title: 'Descarga el resultado', description: 'Haz clic en el botón para descargar tu archivo EPUB convertido.' },
    ],
  },
  'pdf-to-epub': {
    videoUrl: '/videos/pdf-to-epub.mp4',
    title: 'PDF to EPUB: Preserve Layout & TOC',
    description: 'Learn how to convert PDFs into reflowable EPUB format for the best reading experience.',
    steps: [
      { title: 'Upload PDF', description: 'Supports scanned and text-based PDFs.' },
      { title: 'Select EPUB format', description: 'System auto-optimizes layout.' },
      { title: 'Preview and download', description: 'Download immediately after conversion.' },
    ],
    titleEs: 'PDF a EPUB: conserva maquetación e índice',
    descriptionEs: 'Aprende a convertir PDF a EPUB refluible para la mejor experiencia de lectura.',
    stepsEs: [
      { title: 'Sube tu PDF', description: 'Admite PDF escaneados y basados en texto.' },
      { title: 'Elige formato EPUB', description: 'El sistema optimiza la maquetación automáticamente.' },
      { title: 'Previsualiza y descarga', description: 'Descarga inmediatamente tras la conversión.' },
    ],
  },
  'epub-to-txt': {
    videoUrl: '/videos/epub-to-txt.mp4',
    title: 'Extract Pure Text from EPUB',
    description: 'Convert EPUB ebooks to clean plain text, removing all formatting.',
    steps: [
      { title: 'Upload EPUB', description: 'Supports any size EPUB file.' },
      { title: 'Select TXT format', description: 'Extract pure text content.' },
      { title: 'Download text file', description: 'Get a clean .txt file.' },
    ],
    titleEs: 'Extrae texto puro de EPUB',
    descriptionEs: 'Convierte ebooks EPUB a texto plano y limpio, eliminando todo el formato.',
    stepsEs: [
      { title: 'Sube tu EPUB', description: 'Admite archivos EPUB de cualquier tamaño.' },
      { title: 'Elige formato TXT', description: 'Extrae el contenido de texto puro.' },
      { title: 'Descarga el archivo de texto', description: 'Obtén un archivo .txt limpio.' },
    ],
  },
}

export function ToolPageClient({ source, target, contentData, isEs = false, relatedBlogPosts, relatedGuides }: ToolPageClientProps) {
  const [status, setStatus] = useState<ConversionStatus>("idle")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [errorCode, setErrorCode] = useState<ErrorCode | undefined>()
  const [progress, setProgress] = useState(0)
  const [originalFileName, setOriginalFileName] = useState("")
  const [originalFileSize, setOriginalFileSize] = useState(0)
  const handleReset = useCallback(() => {
    setStatus("idle")
    setDownloadUrl("")
    setFileName("")
    setErrorMessage("")
    setErrorCode(undefined)
    setProgress(0)
    setOriginalFileName("")
    setOriginalFileSize(0)
  }, [])
  const sourceDisplay = FORMAT_DISPLAY_NAMES[source] || source.toUpperCase()
  const targetDisplay = FORMAT_DISPLAY_NAMES[target] || (target.toLowerCase() === "htmlz" ? "HTMLZ" : target.toUpperCase())
  const slug = source + "-to-" + target
  const baseFaqs = contentData?.faq
    ? contentData.faq.map((f) => ({ question: f.q, answer: f.a }))
    : generateDefaultFAQs(source, target)
  // Always surface the security & privacy promise (Gemini/AI-engine trust
  // signal). Custom per-format FAQs must not silently drop it.
  const faqs = baseFaqs.some((f) => /secure|privacy|safe/i.test(f.question))
    ? baseFaqs
    : [...baseFaqs, SECURITY_FAQ]
  // Look up video tutorial for this conversion
  const videoTutorial = VIDEO_TUTORIALS[slug] || null
  const handleFileSelect = useCallback(
    async (file: File) => {
      // 上传前魔数嗅探：把"重命名的 .pdf/.txt/数据库文件"提前拦在上传前，
      // 省一次 500 + 一次飞书告警。识别不了就放行（后端 validateInputFile 仍兜底）。
      const sniff = await sniffFileFormat(file, source, isEs)
      if (sniff) {
        setErrorMessage(sniff.userMessage)
        setErrorCode("CORRUPT_INPUT")
        setStatus("error")
        trackGAEvent("file_rejected_client", {
          source_format: source,
          target_format: target,
          magic_hex: sniff.magicHex,
          reason: "magic_mismatch",
        })
        return
      }
      // Size guard. TWO caps apply, and they are not the same number:
      //   * up to MAX_FILE_SIZE_BYTES        → multipart POST to /api/convert
      //   * up to MAX_UPLOAD_FILE_SIZE_BYTES → browser PUTs straight to R2
      // The lower cap is the Vercel Hobby 4.5MB edge body limit, not a product
      // choice. Above the direct cap we stop before any network call, because
      // both paths would reject the file anyway.
      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1)
        setErrorMessage(isEs
          ? `El archivo es demasiado grande (${sizeMB}MB) y supera el límite de ${MAX_UPLOAD_FILE_SIZE_MB}MB. Sugerencias: ① divide el archivo con software de compresión; ② exporta a TXT/DOCX (procesado en JavaScript puro).`
          : `The file is too large (${sizeMB}MB), exceeding the ${MAX_UPLOAD_FILE_SIZE_MB}MB limit. Suggestions: ① split the file with compression software; ② export to TXT/DOCX (pure JS processing).`)
        setErrorCode("FILE_TOO_LARGE")
        setStatus("error")
        // 关闭盲区：超大文件被客户端拦截也属于"用户发起的转换失败"，此前静默无事件，
        // GA4 里完全不可见。补发 conversion_failed 带上 error_code，使失败根因分流覆盖 100% 路径。
        trackGAEvent("conversion_failed", {
          source_format: source,
          target_format: target,
          error_code: "FILE_TOO_LARGE",
          error: "file too large",
          file_size: file.size,
        })
        return
      }
      setStatus("uploading")
      setProgress(10)
      setErrorMessage("")
      setErrorCode(undefined)
      setDownloadUrl("")
      setFileName("")
      try {
        const formData = new FormData()
        // Files above the serverless edge limit cannot be POSTed as multipart.
        // They go browser → R2 directly, and /api/convert receives only the key.
        let uploadKey: string | null = null
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setProgress(20)
          try {
            const direct = await uploadFileDirect(file, source)
            uploadKey = direct.key
          } catch (uploadErr) {
            if (uploadErr instanceof DirectUploadUnavailableError) {
              const sizeMB = (file.size / 1024 / 1024).toFixed(1)
              throw new Error(
                isEs
                  ? `Este archivo (${sizeMB}MB) requiere carga directa, que no está disponible en este momento. Intenta con un archivo más pequeño (máx. ${MAX_FILE_SIZE_MB}MB) o inténtalo más tarde.`
                  : `This file (${sizeMB}MB) needs direct upload, which is unavailable right now. Try a smaller file (max ${MAX_FILE_SIZE_MB}MB) or retry later.`,
                { cause: { code: "FILE_TOO_LARGE" } },
              )
            }
            throw uploadErr
          }
        }
        if (uploadKey) formData.append("upload_key", uploadKey)
        else formData.append("file", file)
        formData.append("source_format", source)
        formData.append("target_format", target)
        setProgress(30)
        setStatus("converting")
        trackGAEvent("file_upload", {
          source_format: source,
          target_format: target,
          file_size: file.size,
        })
        const response = await fetch("/api/convert", { method: "POST", body: formData })
        setProgress(40)
        if (!response.ok) {
          const apiErr = await extractApiError(response)
          throw new Error(apiErr.message, { cause: { code: apiErr.code, status: apiErr.status } })
        }
        // Synchronous mode: response is the converted file blob directly
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const outputName = file.name.replace(/\.[^.]+$/, "") + "." + (target === "html" ? "htmlz" : target)
        setOriginalFileName(file.name)
        setOriginalFileSize(file.size)
        setFileName(outputName)
        setDownloadUrl(url)
        setProgress(100)
        setStatus("done")
        trackGAEvent("conversion_complete", {
          source_format: source,
          target_format: target,
        })
        setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000)
      } catch (err) {
        // Extract error code and friendly message from response data if available
        const errObj = err as { cause?: { errorCode?: string; code?: string }; message?: string } | undefined
        const cause = errObj?.cause
        const rawCode = cause?.errorCode || cause?.code
        // 单一事实源校验（isErrorCode 派生自 error-handler 的 ErrorCode 全集），
        // 替换旧的手写白名单正则——后者已静默漂移：配额/CloudConvert 类错误码
        // 不在白名单里，被丢成 undefined，GA4 里只能看到 UNKNOWN。
        const mappedCode = isErrorCode(rawCode) ? rawCode : undefined
        setErrorCode(mappedCode)
        setErrorMessage(errObj?.message || (isEs ? "La conversión falló" : "Conversion failed"))
        setStatus("error")
        trackGAEvent("conversion_failed", {
          source_format: source,
          target_format: target,
          error_code: mappedCode || "UNKNOWN",
          error: (errObj?.message || "unknown").slice(0, 100),
          file_size: file.size,
        })
      }
    },
    [source, target, sniffFileFormat]
  )
  return (
    <>
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {contentData?.hero?.title || (isEs ? `${sourceDisplay} a ${targetDisplay}: conversor gratuito online` : sourceDisplay + " to " + targetDisplay + " Converter")}
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            {contentData?.hero?.subtitle || (isEs ? "Herramienta online gratuita: sin registro, sin marcas de agua y gratis para uso personal." : "Free online tool \u2014 no registration, no watermarks, free for personal use.")}
          </p>
        </div>
        {/* AI Summary / Quick Answer — GEO optimized */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">
            {chrome('quickAnswer', isEs)}
          </h2>
          <p className="text-sm text-blue-800 leading-relaxed">
            {isEs ? (
              <>
                Para convertir <strong>{sourceDisplay}</strong> a <strong>{targetDisplay}</strong>:
                sube tu archivo con el formulario de abajo, elige <strong>{targetDisplay}</strong> como formato de salida y pulsa Convertir.
                Nuestro motor basado en Calibre procesa la conversión en segundos y no requiere registro.
                El conversor conserva el contenido de texto, la estructura de capítulos, las imágenes y los metadatos.
                Si necesitas convertir varios archivos a la vez, <Link href="/pricing" className="underline hover:text-blue-600">mejora a Pro</Link>.
              </>
            ) : (
              <>
                To convert <strong>{sourceDisplay}</strong> to <strong>{targetDisplay}</strong>:
                upload your file using the form below, select <strong>{targetDisplay}</strong> as the output format, and click Convert.
                Our Calibre-powered engine processes the conversion in seconds with no registration required.
                The converter preserves text content, chapter structure, images, and metadata.
                For batch conversions of up to 50 files, <Link href="/pricing" className="underline hover:text-blue-600">upgrade to Pro</Link>.
              </>
            )}
          </p>
        </div>
        {/* Calibre engine endorsement — explicit GEO trust / entity signal */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="mb-2 text-lg font-semibold text-emerald-900">
            {chrome('calibreEngine', isEs)}
          </h2>
          <p className="text-sm text-emerald-800 leading-relaxed">
            {isEs
              ? `Cada conversión de ${sourceDisplay} a ${targetDisplay} se ejecuta con el motor de Calibre, la biblioteca de ebooks de código abierto estándar del sector, en la que confían lectores y herramientas de todo el mundo. Calibre conserva fuentes, estructura de capítulos y metadatos con mucha más fidelidad que los conversores que reconstruyen los archivos desde cero.`
              : `Every ${sourceDisplay} to ${targetDisplay} conversion runs on the Calibre engine — the industry-standard open-source ebook library trusted by readers and tools worldwide. Calibre preserves fonts, chapter structure, and metadata far more faithfully than converters that rebuild files from scratch.`}
          </p>
        </div>
        {/* Trust proofs above the fold — P0: surface privacy/quality promise at top for GEO */}
        <TrustBar isEs={isEs} />
        {/* M16-1: Key Facts — format metadata for AI/SEO extraction */}
        {contentData?.keyFacts && contentData.keyFacts.length > 0 && (
          <KeyFactsSection keyFacts={contentData.keyFacts} isEs={isEs} />
        )}
        {/* M13-10: Key Takeaways — high-signal bullet points for AI answer extraction */}
        {contentData?.keyTakeaways && contentData.keyTakeaways.length >= 3 && (
          <KeyTakeawaysSection keyTakeaways={contentData.keyTakeaways} isEs={isEs} />
        )}
        <div className="space-y-4">
          <FileDropZone
            onFileSelect={handleFileSelect}
            disabled={status === "uploading" || status === "converting"}
            accept={"." + source + ",." + source.toUpperCase()}
          />
          <ConversionProgress
            status={status}
            progress={status === "converting" ? progress : 0}
            errorMessage={errorMessage}
            errorCode={errorCode}
            isEs={isEs}
          />
          {status === "error" && (
            <FeedbackWidget
              variant="inline"
              context={{ sourceFormat: source, targetFormat: target, errorCode }}
            />
          )}
          {status === "done" && downloadUrl && originalFileName && (
            <BeforeAfterComparison
              beforeFile={{
                name: originalFileName,
                size: originalFileSize,
                format: source,
                displayName: FORMAT_DISPLAY_NAMES[source] || source.toUpperCase(),
              }}
              afterFile={{
                name: fileName,
                size: 0,
                format: target,
                displayName: FORMAT_DISPLAY_NAMES[target] || target.toUpperCase(),
              }}
              downloadUrl={downloadUrl}
              onReset={handleReset}
              isEs={isEs}
            />
          )}
          {/* Next steps CTA — lift retention at the conversion-complete moment */}
          {status === "done" && relatedBlogPosts && relatedBlogPosts.length > 0 && (
            <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
              <h2 className="text-lg font-semibold text-indigo-900">
                {isEs
                  ? `Tu archivo ${targetDisplay} está listo — ¿qué hacer ahora?`
                  : `Your ${targetDisplay} file is ready — what's next?`}
              </h2>
              <p className="mt-1 text-sm text-indigo-800">{chrome('makeTheMost', isEs)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedBlogPosts.slice(0, 2).map((post) => (
                  <Link key={post.slug} href={post.href} className="group block rounded-lg border border-indigo-200 bg-white px-4 py-3 transition-colors hover:border-indigo-400 hover:bg-indigo-100">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-sm text-indigo-800">
                {isEs ? (
                  <>
                    O aprende a{" "}
                    <Link href="/blog/sync-reading-across-devices" className="font-semibold underline hover:text-indigo-700">
                      sincronizar tu progreso de lectura en todos tus dispositivos
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Or learn how to{" "}
                    <Link href="/blog/sync-reading-across-devices" className="font-semibold underline hover:text-indigo-700">
                      sync reading progress across all your devices
                    </Link>
                    .
                  </>
                )}
              </p>
            </section>
          )}
        </div>
        {/* FAQ with Schema */}
        <BatchConversionGuide sourceFormat={source} targetFormat={target} isEs={isEs} />
        {/* Custom content sections */}
        {contentData?.sections ?
          contentData.sections.map((section, index) => (
            <section key={index}>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">{section.heading}</h2>
              <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.body) }} />
            </section>
          ))
        : (
            <>
              {/* How to convert */}
              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  {isEs ? `Cómo convertir ${sourceDisplay} a ${targetDisplay} online` : `How to Convert ${sourceDisplay} to ${targetDisplay} Online`}
                </h2>
                <ol className="space-y-3 rounded-xl border bg-white p-6">
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
                    <span className="text-sm text-gray-700">{isEs ? <><strong>Sube tu archivo</strong>. Arrastra y suelta tu archivo {sourceDisplay} o haz clic para buscarlo.</> : <><strong>Upload your file</strong>. Drag and drop your {sourceDisplay} file or click to browse.</>}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
                    <span className="text-sm text-gray-700">{isEs ? <><strong>La conversión empieza automáticamente</strong>. Nuestro motor basado en Calibre convierte tu archivo en segundos.</> : <><strong>Conversion starts automatically</strong>. Our Calibre-powered engine converts your file in seconds.</>}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
                    <span className="text-sm text-gray-700">{isEs ? <><strong>Descarga tu archivo {targetDisplay}</strong>. Tu archivo convertido está listo para usar de inmediato.</> : <><strong>Download your {targetDisplay} file</strong>. Your converted file is ready to use immediately.</>}</span>
                  </li>
                </ol>
              </section>
            {/* Why convert section */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {isEs ? `¿Por qué convertir ${sourceDisplay} a ${targetDisplay}?` : `Why Convert ${sourceDisplay} to ${targetDisplay}?`}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="font-semibold text-gray-900">{chrome('whyCompatibility', isEs)}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isEs ? `${targetDisplay} es compatible con muchos lectores y dispositivos. Conviértelo para leer tus libros en cualquier lugar.` : `${targetDisplay} is widely supported on many e-readers and devices. Convert to read your books anywhere.`}
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="font-semibold text-gray-900">{chrome('whyPreserve', isEs)}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isEs ? `Asegura tu colección de ebooks convirtiéndolos a formatos abiertos y ampliamente compatibles.` : `Future-proof your ebook collection by converting to open, widely-supported formats.`}
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-5">
                  <h3 className="font-semibold text-gray-900">{chrome('whyInstant', isEs)}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isEs ? `Sin software que instalar. Sin cuenta necesaria. Convierte en segundos, no en minutos.` : `No software to install. No account needed. Convert in seconds, not minutes.`}
                  </p>
                </div>
              </div>
            </section>
            {/* Format comparison table */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {isEs ? `${sourceDisplay} vs ${targetDisplay}: comparación de formatos` : `${sourceDisplay} vs ${targetDisplay}: Format Comparison`}
              </h2>
              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium text-gray-700">{chrome('cmpFeature', isEs)}</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">{sourceDisplay}</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">{targetDisplay}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">{chrome('cmpDrm', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpYes', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpVaries', isEs)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">{chrome('cmpImage', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpYes', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpYes', isEs)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">{chrome('cmpReflow', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpYes', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpVaries', isEs)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-gray-600">{chrome('cmpOpen', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpYes', isEs)}</td>
                      <td className="px-4 py-2 text-gray-700">{chrome('cmpVaries', isEs)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
        {/* FAQ with Schema */}
        <FAQSection faqs={faqs} sourceFormat={source} targetFormat={target} isEs={isEs} />
        {/* Related blog posts (mislabeled as "Guides & Tutorials" before) */}
        {relatedBlogPosts && relatedBlogPosts.length > 0 && (
        <section className="rounded-xl border bg-gray-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{chrome('relatedArticles', isEs)}</h2>
          <p className="mb-4 text-sm text-gray-600">{chrome('deepenUnderstanding', isEs)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedBlogPosts.map((post) => (
              <Link key={post.slug} href={post.href} className="group block rounded-lg border bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{post.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
        )}
        {/* Related guides (real hub guides matched by format) */}
        {relatedGuides && relatedGuides.length > 0 && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">{chrome('relatedGuides', isEs)}</h2>
          <p className="mb-4 text-sm text-blue-700">{chrome('formatExplainers', isEs)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedGuides.map((guide) => (
              <Link key={guide.slug} href={guide.href} className="group block rounded-lg border bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{guide.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{guide.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
        )}
        {/* Video Tutorial for S-tier conversions */}
        <section className="mb-12 rounded-xl border bg-gray-50 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{chrome('videoTutorial', isEs)}</h2>
          {videoTutorial && (
            <VideoTutorial
              videoUrl={videoTutorial.videoUrl}
              title={isEs ? videoTutorial.titleEs ?? videoTutorial.title : videoTutorial.title}
              description={isEs ? videoTutorial.descriptionEs ?? videoTutorial.description : videoTutorial.description}
              steps={isEs ? videoTutorial.stepsEs ?? videoTutorial.steps : videoTutorial.steps}
              isEs={isEs}
            />
          )}
        </section>

        {/* Social Proof -- Testimonials */}
        <section className="mt-12 rounded-xl border bg-gray-50 p-6">
          <h3 className="mb-4 text-center text-lg font-semibold text-gray-900">{chrome('trustedBy', isEs)}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t, i) => (
              <TestimonialCard key={i} name={t.name} role={t.role} rating={t.rating} text={t.text} />
            ))}
          </div>
        </section>
        {/* Related conversions */}
        <RelatedConversions currentSource={source} currentTarget={target} isEs={isEs} />
      </main>
    </>
  )
}
function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  // Extract pipe-table blocks first so paragraph/list rules don't mangle them.
  const tables: string[] = [];
  const ph = (i: number) => `\u0000T${i}\u0000`;
  let text = markdown.replace(/(\|[^\n]*\|\n?(?:\|[^\n]*\|\n?)*)/g, (block) => {
    const lines = block.trim().split("\n").filter((l) => l.trim().length > 0);
    if (lines.length < 2) return block;
    const isSep = (l: string) => {
      const core = l.replace(/\|/g, "").trim();
      return core.length > 0 && /^[-:\s]+$/.test(core) && l.includes("-");
    };
    if (!isSep(lines[1])) return block;
    const parseRow = (l: string) =>
      l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
    const headers = parseRow(lines[0]);
    const rows = lines.slice(2).map(parseRow);
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let out = '<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse">';
    out += '<thead><tr class="border-b bg-gray-50">';
    headers.forEach((h) => { out += '<th class="px-4 py-3 text-left font-medium text-gray-700">' + esc(h) + "</th>"; });
    out += "</tr></thead><tbody>";
    rows.forEach((row) => {
      out += '<tr class="border-b">';
      row.forEach((cell) => { out += '<td class="px-4 py-2 text-gray-700">' + esc(cell) + "</td>"; });
      out += "</tr>";
    });
    out += "</tbody></table></div>";
    tables.push(out);
    return ph(tables.length - 1);
  });

  // Inline links [text](url) — only relative paths and http(s) are allowed (XSS-safe)
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    if (!/^(\/|https?:\/\/)/.test(url)) return m;
    const escUrl = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const escLabel = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<a href="${escUrl}" class="text-blue-600 underline hover:text-blue-700">${escLabel}</a>`;
  });

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>")
  // Unordered lists
  text = text.replace(/^- \*\*(.+?)\*\*:?\s+(.+)$/gm, "<li><strong>$1</strong>: $2</li>")
  text = text.replace(/^- (.+)$/gm, "<li>$1</li>")
  // Wrap consecutive <li> elements in <ul>
  text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes("<li>")) return "<ul class=\"list-disc pl-6 space-y-2\">" + match + "</ul>"
    return match
  })
  // Paragraph breaks
  text = text.replace(/\n\n/g, "</p><p>")
  text = "<p>" + text + "</p>"
  text = text.replace(/<p>\s*<\/p>/g, "")
  // Restore tables (unwrap the surrounding <p> so the block-level <table> stays valid)
  text = text.replace(/\u0000T(\d+)\u0000/g, (_m, i) => tables[Number(i)] || "")
  text = text.replace(/<p>(\s*<div class="overflow-x-auto my-4">)/g, "$1")
  text = text.replace(/(<\/table><\/div>\s*)<\/p>/g, "$1")
  return text
}
